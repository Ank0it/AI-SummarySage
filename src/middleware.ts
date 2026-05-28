import {NextResponse} from 'next/server';
import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isSummarizeApiRoute = createRouteMatcher(['/api/summarize(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  if (isSummarizeApiRoute(req)) {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({error: 'Please sign in to generate summaries.'}, {status: 401});
    }

    return;
  }

  await auth.protect();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/api/:path*'],
};