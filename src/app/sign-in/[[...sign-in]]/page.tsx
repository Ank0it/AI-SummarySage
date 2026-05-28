import {SignIn} from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Gistly</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to generate summaries.</p>
        </div>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </div>
    </main>
  );
}