"use client";

import {UserButton, useUser} from '@clerk/nextjs';
import {Textarea} from '@/components/ui/textarea';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {cn} from '@/lib/utils';
import {getDocumentContent, DocumentContent} from '@/services/document-loader';
import {transcribeAudio} from '@/services/speech-to-text';
import {toast} from '@/hooks/use-toast';
import {FileText, Mic, Play, Share2} from 'lucide-react';
import {Input} from '@/components/ui/input';

const summaryStyles = [
  'Formal',
  'Casual',
  'Bullet Points',
  'Funny',
  'Poetic',
  'Gen-Z',
] as const;

function GistlyIcon({className = ''}: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 3.75h7.75L18.25 7.25V20.25H7z" />
      <path d="M14.75 3.75v3.5h3.5" />
      <path d="M9.25 10.25h5.5" />
      <path d="M9.25 13.25h4.1" />
      <path d="M9.25 16.25h2.7" />
      <path d="M17.25 10.2l.42 1.08 1.08.42-1.08.42-.42 1.08-.42-1.08-1.08-.42 1.08-.42z" />
    </svg>
  );
}

export default function Home() {
  const {user} = useUser();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [style, setStyle] = useState<typeof summaryStyles[number]>(summaryStyles[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isSummaryResponse = (value: unknown): value is { summary: string } => {
    return typeof value === 'object' && value !== null && typeof (value as { summary?: unknown }).summary === 'string';
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style }),
      });

      const responseBody = await res.json().catch(() => null) as { summary?: unknown; error?: unknown } | null;

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: 'Sign in required',
            description: 'Please sign in to generate summaries.',
            variant: 'destructive',
          });
          return;
        }

        if (res.status === 429) {
          toast({
            title: 'Rate limit exceeded',
            description: 'You have generated 5 summaries within 1 hour. Please try after 1 hour.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Error',
          description: typeof responseBody?.error === 'string' && responseBody.error.trim().length > 0
            ? responseBody.error
            : 'Failed to summarize text.',
          variant: 'destructive',
        });
        return;
      }

      const summaryResult = isSummaryResponse(responseBody) ? responseBody : null;

      if (!summaryResult) {
        throw new Error('Failed to summarize text.');
      }

      let formattedSummary = summaryResult.summary;
      if (style === 'Bullet Points') {
        formattedSummary = summaryResult.summary
          .split('\n')
          .map((item: string) => item.trim())
          .filter((item: string) => item !== '')
          .map((item: string) => `• ${item}`)
          .join('\n');
      }
      setSummary(formattedSummary);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to summarize text.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    try {
      const file = e.target.files?.[0];
      if (file) {
        const documentContent: DocumentContent = await getDocumentContent(file);
        setText(documentContent.text);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to read file.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioRecord = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', async () => {
          const audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
          setIsLoading(true);
          try {
            const transcription = await transcribeAudio(audioBlob);
            setText(transcription.text);
          } catch (error: any) {
            toast({
              title: 'Error',
              description: error.message || 'Failed to transcribe audio.',
              variant: 'destructive',
            });
          } finally {
            setIsLoading(false);
            // Stop all tracks to prevent indefinite recording
            stream.getTracks().forEach(track => track.stop());
          }
        });

        mediaRecorder.start();
        toast({
          title: 'Recording...',
          description: 'Speak now, recording in progress.',
        });

        setTimeout(() => {
          mediaRecorder.stop();
          toast({
            title: 'Recording stopped',
            description: 'Audio transcription in progress.',
          });
        }, 5000); // Stop after 5 seconds
      }).catch(error => {
        toast({
          title: 'Error',
          description: 'Microphone access denied.',
          variant: 'destructive',
        });
      });
    } else {
      toast({
        title: 'Error',
        description: 'Media devices not supported.',
        variant: 'destructive',
      });
    }
  };

  const handleTextToSpeech = async () => {
    const trimmedSummary = summary.trim();

    if (!trimmedSummary) {
      toast({
        title: 'Error',
        description: 'No summary available to speak.',
        variant: 'destructive',
      });
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      toast({
        title: 'Error',
        description: 'Text-to-speech is not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (window.speechSynthesis.speaking || isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmedSummary);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (error: any) {
      setIsSpeaking(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to speak summary.',
        variant: 'destructive',
      });
    }
  };

 const handleWhatsAppShare = () => {
    const textToShare = summary || 'No summary available.';
    const whatsappMessage = encodeURIComponent(textToShare);
    const whatsappURL = `https://wa.me/?text=${whatsappMessage}`;

    // Open the WhatsApp share link and check if it was blocked by a popup blocker
    const popup = window.open(whatsappURL, '_blank');

    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      // Popup blocked
      toast({
        title: 'Error',
        description: 'Popup blocked! Please allow popups for this site to use the share function.',
        variant: 'destructive',
      });
    } else {
      // Popup opened successfully
      console.log('WhatsApp share popup opened.');
      // Optionally, you can close the popup after a short delay if desired
      // setTimeout(() => popup.close(), 5000);
    }
  };


  return (
    <div className={cn(
      'flex flex-col min-h-screen bg-background text-foreground transition-colors',
      isDarkMode ? 'dark' : ''
    )}>
      <div className="container mx-auto p-4 flex-1">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background text-foreground shadow-sm">
              <GistlyIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gistly</h1>
            {user ? (
              <p className="text-sm text-muted-foreground">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Signed in'}
              </p>
            ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <UserButton />
            ) : (
              <Button asChild variant="outline" size="sm">
                <a href="/sign-in">Sign in</a>
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end mb-2">
          <Label htmlFor="dark-mode" className="mr-2">Dark Mode</Label>
          <Switch
            id="dark-mode"
            checked={isDarkMode}
            onCheckedChange={(checked) => setIsDarkMode(checked)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Text Input */}
          <Card>
            <CardHeader>
              <CardTitle>Enter Text to Summarize</CardTitle>
              <CardDescription>Paste text, or speak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="mr-2 h-4 w-4"/>
                  Upload File
                </Button>
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAudioRecord}
                >
                  <Mic className="mr-2 h-4 w-4"/>
                  Speak
                </Button>
              </div>
              <Textarea
                placeholder="Paste your text here..."
                className="w-full"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Style</CardTitle>
              <CardDescription>Choose the style of the summary</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => setStyle(value as typeof summaryStyles[number])} defaultValue={style}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a style"/>
                </SelectTrigger>
                <SelectContent>
                  {summaryStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="mt-4 w-full"
                onClick={handleSummarize}
                disabled={isLoading}
              >
                {isLoading ? 'Summarizing...' : 'Summarize'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Summary Display */}
        {summary && (
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <CardTitle>Summary</CardTitle>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleTextToSpeech}
                  disabled={isLoading}
                  aria-pressed={isSpeaking}
                  title={isSpeaking ? 'Stop speaking summary' : 'Speak summary'}
                >
                  <Play className="h-4 w-4"/>
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleWhatsAppShare}
                  disabled={isLoading}
                >
                  <Share2 className="h-4 w-4"/>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line break-words">{summary}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
