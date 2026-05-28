import {SignUp} from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Gistly</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create an account to generate summaries.</p>
        </div>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </div>
    </main>
  );
}