'use client';

import {Textarea} from '@/components/ui/textarea';
import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {summarizeText} from '@/ai/flows/styled-summarization';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {cn} from '@/lib/utils';
import {getDocumentContent, DocumentContent} from '@/services/document-loader';
import {transcribeAudio} from '@/services/speech-to-text';
import {synthesizeSpeech} from '@/services/text-to-speech';
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

export default function Home() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [style, setStyle] = useState(summaryStyles[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const summaryResult = await summarizeText({text: text, style: style});
      let formattedSummary = summaryResult.summary;
      if (style === 'Bullet Points') {
        formattedSummary = summaryResult.summary.split('\n').map(item => item.trim()).filter(item => item !== '').map(item => `• ${item}`).join('\n');
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
    if (!summary) {
      toast({
        title: 'Error',
        description: 'No summary available to speak.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const speech = await synthesizeSpeech(summary);
      const url = URL.createObjectURL(speech.audio);
      setAudioUrl(url);
      // Play audio automatically
      if (audioRef.current) {
        const audioElement = audioRef.current;
        // Remove previous listener if exists
        audioElement.removeEventListener('loadeddata', handleLoadedData);
        
        // Handle loaded data
        function handleLoadedData() {
          audioElement.play().catch((e) => {
            console.error("Playback failed:", e);
            toast({
              title: 'Error',
              description: 'Automatic playback failed, please try again.',
              variant: 'destructive',
            });
          });
        }
        audioElement.addEventListener('loadeddata', handleLoadedData);
        audioRef.current.src = url;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to synthesize speech.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

 const handleWhatsAppShare = () => {
    const textToShare = 'Hello World';
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
        <h1 className="text-2xl font-bold mb-4">AI SummarySage</h1>

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
              <Select onValueChange={setStyle} defaultValue={style}>
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
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p style={{ whiteSpace: 'pre-line' }}>{summary}</p>
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleTextToSpeech}
                  disabled={isLoading}
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
              {audioUrl && (
                <audio ref={audioRef} src={audioUrl} controls className="w-full mt-4"/>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
