import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/config/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = null, guestId = null, message } = body;
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    // Use the server.js Supabase client
    const supabase = supabaseServer;

    // 📨 Save user message (using mRequest table as a workaround for now)
    // Note: This is a temporary solution - chatbot_messages table needs to be added to the database
    // await supabase.from('chatbot_messages').insert({
    //   user_id: userId,
    //   guest_id: guestId,
    //   role: 'user',
    //   message,
    // });

    // ⚙️ Intent detection
    const text = message.toLowerCase();
    let intent = 'general';
    if (/\b(status|where|track|check)\b/.test(text)) intent = 'check_status';
    else if (/\b(request|apply|requesting|need)\b/.test(text)) intent = 'request_doc';
    else if (/\b(verify|verification|blockchain|tx)\b/.test(text)) intent = 'verify_doc';

    // 📄 Related document lookup (using mRequest table instead of documents)
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

    // 💬 Fetch conversation history (commented out since chatbot_messages table doesn't exist)
    // const { data: history } = await supabase
    //   .from('chatbot_messages')
    //   .select('role, message')
    //   .or(userId ? `user_id.eq.${userId}` : guestId ? `guest_id.eq.${guestId}` : 'false')
    //   .order('created_at', { ascending: false })
    //   .limit(6);

    const history: { role: string; message: string }[] = []; // Temporary empty array
    const conversation = (history || [])
      .reverse()
      .map((m) => `${m.role?.toUpperCase()}: ${m.message}`)
      .join('\n');

    // 🧠 System prompt
const systemPrompt = `
You are Barangay Konek Assistant — a helpful barangay chatbot.
Always reply in clear, friendly ENGLISH by default.
Keep responses 1–3 short paragraphs only.
At the end, append a JSON line like:
{"intent":"check_status","action":"show_status","suggestions":["Download Certificate","Contact Barangay Office"]}
`;


    const prompt = `${systemPrompt}\n[DOCUMENT_CONTEXT]\n${docContext}\n\nConversation:\n${conversation}\nUSER: ${message}`;

    // 🤖 Call Gemini
    const model = genAI.getGenerativeModel({ model: MODEL });

    const timeout = (ms: number) =>
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms));

    const result = await Promise.race([model.generateContent(prompt), timeout(15000)]);
    const replyText = (result as { response: { text: () => string } }).response.text();

    // 🧹 Remove trailing JSON metadata from reply
    const cleanedReply = replyText.replace(/\{[\s\S]*\}$/, '').trim();

    // 💾 Save assistant reply (commented out since chatbot_messages table doesn't exist)
    // await supabase.from('chatbot_messages').insert({
    //   user_id: userId,
    //   guest_id: guestId,
    //   role: 'assistant',
    //   message: cleanedReply,
    // });

    // 🔍 Parse JSON separately for front-end suggestions
    let parsed = null;
    try {
      const jsonMatch = replyText.match(/\{[\s\S]*\}$/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = null;
    }

    // ✅ Return cleaned text only
    return NextResponse.json({ reply: cleanedReply, parsed, intent });
  } catch (err) {
    console.error('Chat route error', err);
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
