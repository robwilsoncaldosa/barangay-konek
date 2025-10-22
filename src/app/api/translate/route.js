import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL ||'gemini-2.5-flash';

export async function POST(req) {
    try {
        const { text, targetLang } = await req.json();
        if (!text || !targetLang)
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

        const model = genAI.getGenerativeModel({ model: MODEL });

        const prompt = `
You are a professional translator. Translate the following text into ${targetLang}.
Do NOT include explanations, examples, or multiple versions.
Output ONLY one natural, fluent paragraph in ${targetLang}.
---
${text}
`;

        const result = await model.generateContent(prompt);
        const raw = result?.response?.text()?.trim() || '';

        const cleaned = raw
            .replace(/\*\*/g, '')
            .replace(/Option\s*\d+[:.)-]/gi, '')
            .replace(/-{2,}/g, '')
            .replace(/Here are.*?:/gi, '')
            .replace(/(\n|\r)+/g, ' ')
            .trim();

        return NextResponse.json({ translatedText: cleaned || text });
    } catch (error) {
        console.error('Translation API error:', error);
        return NextResponse.json({ translatedText: text }, { status: 200 });
    }
}
