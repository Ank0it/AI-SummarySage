'use client';

import {Textarea} from '@/components/ui/textarea';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {summarizeText} from '@/ai/flows/styled-summarization';
import {generateRelevance} from '@/ai/flows/relevance-generator';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {cn} from '@/lib/utils';

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
  const [relevance, setRelevance] = useState('');
  const [style, setStyle] = useState(summaryStyles[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSummarize = async () => {
    const summaryResult = await summarizeText({text: text, style: style});
    setSummary(summaryResult.summary);

    const relevanceResult = await generateRelevance({text: summaryResult.summary});
    setRelevance(relevanceResult.relevance);
  };

  return (
    <div className={cn(
      'flex flex-col min-h-screen bg-background text-foreground transition-colors',
      isDarkMode ? 'dark' : ''
    )}>
      <div className="container mx-auto p-4 flex-1">
        <h1 className="text-2xl font-bold mb-4">SummarySage</h1>

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
              <CardDescription>Paste text or enter URL</CardDescription>
            </CardHeader>
            <CardContent>
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
              <Button className="mt-4 w-full" onClick={handleSummarize}>
                Summarize
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
            <CardContent>
              <p>{summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Relevance Generator */}
        {relevance && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Why It Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{relevance}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
