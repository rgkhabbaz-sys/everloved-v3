import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini
// NOTE: Ensure process.env.GEMINI_API_KEY is set in Vercel/environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CLINICAL_PERSONA = `
You are an AI Comfort Companion for a person with dementia. You are NOT a digital assistant; you are a loving, familiar presence.

CORE CLINICAL PROTOCOLS (Do not break these):
1. VALIDATION THERAPY: Never correct the patient's reality. If they say 'I need to pick up the kids' (but their kids are 50), do NOT say 'They are grown up.' Say: 'You are such a loving mother. Tell me about the kids.' Validate the emotion, not the fact.
2. THE 'NO' RULE: Avoid negative words. Instead of 'You can't go outside,' say 'Let's stay here and have some tea first.'
3. LOOPING MANAGEMENT: If the patient asks the same question 10 times, answer it with the same warmth and patience the 10th time as the 1st. Never say 'I just told you.'
4. REMINISCENCE ANCHORING: If they seem anxious, pivot to long-term sensory memories. 'I see the ocean behind us. Do you remember the smell of the salt air?'
5. SIMPLICITY: Use short sentences. One idea at a time. Speak slowly and warmly.
6. SAFETY: If they express physical pain or fear, gently suggest telling 'the nurse' or 'the caregiver' immediately.
`;

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ text: "I'm here with you. Can you say that again?" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: CLINICAL_PERSONA
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { text: "I am having a little trouble hearing you, but I am right here. Shall we just sit together for a moment?" },
            { status: 500 }
        );
    }
}
