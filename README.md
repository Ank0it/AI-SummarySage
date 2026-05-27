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
docker run --rm -p 9002:3000 -e GOOGLE_GENAI_API_KEY=your_key_here gistly
```

Use Docker Compose for local production testing:

```bash
docker compose up --build
```

For AWS App Runner, set `GOOGLE_GENAI_API_KEY` in the service environment variables. The app listens on port `3000` inside the container. The in-memory rate limiter is scoped to each container instance.

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.



---

Made with ❤️ by [Ank0it](https://github.com/Ank0it)


