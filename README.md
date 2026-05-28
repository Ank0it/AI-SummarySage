# Gistly ✨📝

What if your notes wrote themselves? Turn walls of text into “aha!” moments with a tap. Gistly uses Google’s Gemini to shape ideas into summaries that feel tailor-made — formal, funny, poetic, and everything in between.

## Why You’ll Love It

- 🎯 Summaries in your style:
  - Formal for reports
  - Casual for quick reads
  - Bullet Points for crisp clarity
  - Funny for fun brain fuel
  - Poetic for vibes
  - Gen-Z for max sauce
- 🎤 Speak it: Record audio, get instant transcriptions
- 📁 Drop files: PDF, DOC/DOCX, or TXT — just upload
- 🔊 Hear it: Text-to-speech for on-the-go listening
- 💬 Share fast: One-tap WhatsApp sharing
- 🌓 Feel right: Dark mode that respects your focus

## Quickstart

1) Clone the repo
```bash
git clone https://github.com/Ank0it/Gistly.git
cd Gistly
```
2) Install dependencies
```bash
npm install
```
3) Run the development server
```bash
npm run dev
```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

## Docker Deployment

Build the production image:

```bash
docker build -t gistly .
```

Run the container locally:

```bash
docker run --rm -p 9002:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here \
  -e CLERK_SECRET_KEY=your_secret_key_here \
  -e GOOGLE_GENAI_API_KEY=your_key_here \
  gistly
```

Use Docker Compose for local production testing:

```bash
docker compose up --build
```

For Docker and AWS App Runner, set these environment variables on the host or service:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `GOOGLE_GENAI_API_KEY`

The Clerk publishable key is safe to expose to the client, but it still needs to be available to the app at runtime. The Docker image does not bake in any Clerk or Gemini secrets.

For AWS App Runner, set all three variables in the service environment. The app listens on port `3000` inside the container. The in-memory rate limiter is scoped to each container instance.

## AWS App Runner Deployment

This repo includes a GitHub Actions workflow that builds the Docker image in GitHub Actions, pushes it to Amazon ECR, and can trigger an AWS App Runner deployment.

Create these GitHub repository variables:

- `AWS_REGION`: `ap-south-1`
- `ECR_REPOSITORY`: `gistly`

Create these GitHub repository secrets:

- `AWS_ROLE_ARN`: IAM role ARN trusted by GitHub OIDC for this repository
- `APP_RUNNER_SERVICE_ARN`: App Runner service ARN, optional until the service exists

AWS resources to create before the first deploy:

- ECR private repository: `gistly`
- IAM role for GitHub Actions with permission to push to ECR and start App Runner deployments
- App Runner service using the ECR image after the first workflow push

Configure App Runner with container port `3000`, health check path `/`, and `GOOGLE_GENAI_API_KEY` as a service environment variable.

If you enable Clerk authentication, App Runner also needs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` configured on the service. Make sure the publishable key is available when the app runs so the client bundle can initialize Clerk correctly.

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.



---

Made with ❤️ by [Ank0it](https://github.com/Ank0it)


