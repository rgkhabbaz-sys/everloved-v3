
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    if (!process.env.ELEVENLABS_API_KEY) {
        return NextResponse.json(
            { error: 'ELEVENLABS_API_KEY is not set' },
            { status: 503 }
        );
    }

    try {
        const { message, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json(); // Default to 'Rachel'

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text: message,
                    model_id: "eleven_monolingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API Error:', errorText);
            return NextResponse.json(
                { error: `ElevenLabs Error: ${errorText}` },
                { status: response.status }
            );
        }

        // Return audio stream
        // We convert to ArrayBuffer to send it back cleanly (or blob)
        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });

    } catch (error) {
        console.error('Error generating speech:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
