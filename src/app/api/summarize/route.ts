import { NextRequest } from 'next/server';
import { summarizeText } from '@/ai/flows/styled-summarization';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, style } = body || {};
    const result = await summarizeText({ text, style });
    return Response.json(result, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
