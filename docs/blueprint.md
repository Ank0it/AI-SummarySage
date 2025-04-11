# **App Name**: SummarySage

## Core Features:

- Text Input: Allows the user to paste text into a text area to be summarized.
- Styled Summarization: Allow the user to choose from a set of styles (Formal, Casual, Bullet Points, Funny, Poetic, Gen-Z) and use an AI tool to generate the summary in that style.
- Relevance Generator: Generate an additional section explaining why the summarized text is important or relevant, using AI.
- Summary Display: Displays the AI generated summary to the user.
- Dark Mode: Implements a dark mode toggle.

## Style Guidelines:

- Primary color: Clean white or light gray for a modern feel.
- Secondary color: Muted blue or teal for accents and highlights.
- Accent: Purple (#A020F0) for interactive elements.
- Clean, simple layout with clear sections for input, style selection, and summary display.
- Use a set of simple, consistent icons for different text styles.
- Subtle fade-in animations for generated summaries.

## Original User Request:
Build a full-stack React + Tailwind + Firebase AI Text Summarization web app with the following features:

Text Summarization with Style Selection:

User pastes text.

Choose tone/style: Formal, Casual, Bullet Points, Funny, Poetic, Gen-Z.

Display AI-generated summary in the selected style.

Visual Summary Generator:

Convert summaries into infographics, mind maps, or flowcharts using any visualization library (e.g., Mermaid.js or D3).

Multilingual Support:

Input and summary should support multiple languages.

Option to summarize in a different output language.

Voice Input & Audio Summary:

Allow users to use mic to speak text.

Transcribe and summarize the spoken input.

Use Text-to-Speech (TTS) API to play the summary aloud.

“Why It Matters” Feature:

Generate an additional section explaining why the text is important or relevant.

File & URL Summarization:

Accept text via:
a. PDF or DOC file upload
b. YouTube video link (extract captions & summarize)
c. Web page URL (extract main content)

Flashcards & Quiz Mode:

From the summary, generate Flashcards (front/back format) and a few quiz questions (MCQs).

Save them in Firebase Firestore for user account.

Authentication & Dashboard:

Firebase Auth (Email/Google login).

Dashboard with history of summaries, downloads, and flashcards.

Option to delete/edit previous summaries.

Dark Mode + Responsive UI:

Fully responsive layout with light/dark mode toggle.

Tailwind CSS for styling.

Firebase Backend:

Use Firebase Firestore for storing summaries, flashcards, and user history.

Firebase Storage for audio and file uploads.

Firebase Functions (optional) for backend processing.
  