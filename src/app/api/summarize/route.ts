import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { summarizeText } from '@/ai/flows/styled-summarization';
import { rateLimitRequest } from '@/lib/rate-limit';

const summaryStyles = ['Formal', 'Casual', 'Bullet Points', 'Funny', 'Poetic', 'Gen-Z'] as const;

function isSummaryStyle(value: unknown): value is typeof summaryStyles[number] {
  return typeof value === 'string' && summaryStyles.includes(value as typeof summaryStyles[number]);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: 'Please sign in to generate summaries.' }, { status: 401 });
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const text = typeof body === 'object' && body !== null ? (body as { text?: unknown }).text : undefined;
    const style = typeof body === 'object' && body !== null ? (body as { style?: unknown }).style : undefined;

    if (typeof text !== 'string' || text.trim().length === 0) {
      return Response.json({ error: 'Text must be a non-empty string.' }, { status: 400 });
    }

    if (!isSummaryStyle(style)) {
      return Response.json({ error: 'Style must be one of Formal, Casual, Bullet Points, Funny, Poetic, Gen-Z.' }, { status: 400 });
    }

    const rateLimit = rateLimitRequest(req.headers, { identifier: userId });
    const rateLimitHeaders = {
      'Retry-After': String(rateLimit.retryAfter),
      'X-RateLimit-Limit': String(rateLimit.limit),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
    };

    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'You have generated 5 summaries within 1 hour. Please try after 1 hour.' },
        { status: 429, headers: rateLimitHeaders },
      );
    }

    const result = await summarizeText({ text: text.trim(), style });
    return Response.json(result, { status: 200, headers: rateLimitHeaders });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
