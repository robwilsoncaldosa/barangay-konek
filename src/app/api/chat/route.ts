import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/config/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { barangayKonekDictionary } from '@/lib/chatbot/dictionary';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = null, guestId = null, message } = body;
    if (!message)
      return NextResponse.json({ error: 'Message required' }, { status: 400 });

    // Save user message
    await supabaseServer.from('chatbot_messages').insert({
      user_id: userId,
      guest_id: guestId,
      role: 'user',
      message,
    });

    // Intent detection
    const text = message.toLowerCase();
    let intent = 'general';
    if (/\b(status|where|track|check)\b/.test(text)) intent = 'check_status';
    else if (/\b(request|apply|requesting|need)\b/.test(text)) intent = 'request_doc';
    else if (/\b(verify|verification|blockchain|tx)\b/.test(text)) intent = 'verify_doc';

    // Language detection (simple heuristic)
    let language = 'english';
    if (/\b(unsa|asa|kinsa|ganahan|kay|mao|ra|gyud|lagi)\b/i.test(text)) {
      language = 'bisaya';
    } else if (/\b(ano|paano|saan|kailan|naman|po|ako|ikaw|gusto|salamat)\b/i.test(text)) {
      language = 'tagalog';
    }

    // Related document lookup
    let docContext = 'No related documents found.';
    if (intent === 'check_status' || intent === 'verify_doc') {
      const { data: docs } = await supabase
        .from('mRequest')
        .select('id, document_type, status, tx_hash, created_at')
        .eq('resident_id', userId || 0)
        .order('created_at', { ascending: false })
        .limit(5);

      if (docs?.length) {
        docContext = docs
          .map(
            (d) =>
              `- ${d.document_type}: status=${d.status || 'pending'}${
                d.tx_hash ? ` verification=${d.tx_hash}` : ''
              }`
          )
          .join('\n');
      }
    }

    // Fetch conversation history
    const { data: history } = await supabaseServer
      .from('chatbot_messages')
      .select('role, message')
      .or(userId ? `user_id.eq.${userId}` : guestId ? `guest_id.eq.${guestId}` : 'false')
      .order('created_at', { ascending: false })
      .limit(6);

    const history: { role: string; message: string }[] = []; // Temporary empty array
    const conversation = (history || [])
      .reverse()
      .map((m) => `${m.role?.toUpperCase()}: ${m.message}`)
      .join('\n');

    // Check if this is the first chat
    const isFirstMessage = !history || history.length <= 1;

    // System prompt
    const systemPrompt = `
You are the Barangay Konek Assistant — an AI chatbot that helps users with Barangay Konek services and FAQs.

If this is the first user message, start with an English greeting:
"Hello! 👋 How can I help you today?"
Otherwise, skip the greeting and go straight to the main response.

Always respond in the same language as the user’s message:
- If the user writes in English, reply in English.
- If the user writes in Tagalog, reply in natural Tagalog.
- If the user writes in Bisaya, reply in fluent Bisaya.

Be polite, concise (1–3 short paragraphs), and easy to understand.
If the user’s question is unrelated to Barangay Konek, politely say that it’s outside your current scope.

Use this project dictionary for accurate context:
---
${barangayKonekDictionary}
---

At the end, append a JSON line like:
{"intent":"${intent}","action":"show_status","suggestions":["Download Certificate","Contact Barangay Office"]}
`;

    const prompt = `${systemPrompt}
[DOCUMENT_CONTEXT]
${docContext}

[IS_FIRST_MESSAGE]: ${isFirstMessage}
Conversation:
${conversation}

USER: ${message}`;

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: MODEL });

    const timeout = (ms: number) =>
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms));

    const result = await Promise.race([model.generateContent(prompt), timeout(15000)]);
    const replyText = (result as { response: { text: () => string } }).response.text();

    // Remove trailing JSON metadata from reply
    const cleanedReply = replyText.replace(/\{[\s\S]*\}$/, '').trim();

    // Save assistant reply (cleaned)
    await supabaseServer.from('chatbot_messages').insert({
      user_id: userId,
      guest_id: guestId,
      role: 'assistant',
      message: cleanedReply,
    });

    // Parse JSON separately for frontend suggestions
    let parsed = null;
    try {
      const jsonMatch = replyText.match(/\{[\s\S]*\}$/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = null;
    }

    return NextResponse.json({
      reply: cleanedReply,
      parsed,
      intent,
      language,
      greeted: isFirstMessage,
    });
  } catch (err) {
    console.error('Chat route error', err);
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
