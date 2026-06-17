import React, { useState } from 'react';
import { ArrowLeft, Clock, Timer, Trophy, Check, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function PostRaceQuiz() {
  const [raceInput, setRaceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  
  const [quizData, setQuizData] = useState<any>(null);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const handleGenerate = async () => {
    if (!raceInput.trim()) return;
    setLoading(true);
    setError(null);
    setIsApiKeyError(false);
    
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ race: raceInput.trim() })
      });
      
      if (res.status === 503) {
        setIsApiKeyError(true);
        setError("The Post-Race Quiz needs an Anthropic API key.");
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed");
      }
      
      const data = await res.json();
      setQuizData(data);
    } catch (e) {
      setError("Couldn't generate quiz — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === q.ans) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentIdx < quizData.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswered(null);
    } else {
      setGameOver(true);
    }
  };

  if (!quizData && !loading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">Enter a recent race to generate an AI-powered trivia quiz based on actual events that occurred during the grand prix.</p>
        <div className="flex space-x-2">
          <Input 
            value={raceInput}
            onChange={(e) => setRaceInput(e.target.value)}
            placeholder="e.g. Monaco Grand Prix 2025"
            className="bg-secondary/50 border-border"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            autoFocus
          />
          <Button onClick={handleGenerate} disabled={!raceInput.trim()} className="font-bold px-6">Generate &rarr;</Button>
        </div>
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm flex items-start space-x-3 mt-4">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">{error}</p>
              {isApiKeyError && (
                <p className="mt-1 opacity-80">Add ANTHROPIC_API_KEY to your Replit Secrets to enable this feature.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <div className="text-center space-y-2">
          <p className="font-bold text-lg">Generating your quiz…</p>
          <p className="text-muted-foreground text-sm">Searching {raceInput} results and writing 6 questions.</p>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in py-8">
        <Trophy className="w-16 h-16 text-[#1565c0]" />
        <h2 className="text-4xl font-black">{score} / {quizData.questions.length}</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Quiz completed for {quizData.race}!
        </p>
        <Button onClick={() => setQuizData(null)} size="lg" className="font-bold tracking-widest mt-4 bg-[#1565c0] hover:bg-[#1565c0]/80">NEW QUIZ</Button>
      </div>
    );
  }

  const q = quizData.questions[currentIdx];

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground uppercase">
          <span>{quizData.race}</span>
          <span>{score} PT{score !== 1 ? 'S' : ''}</span>
        </div>
        <Progress value={((currentIdx) / quizData.questions.length) * 100} className="h-1 bg-secondary rounded-none [&>div]:bg-[#1565c0]" />
      </div>

      <div className="text-xl md:text-2xl font-bold leading-tight py-4">
        {q.q}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.opts.map((opt: string, idx: number) => {
          let stateClass = "bg-secondary hover:bg-secondary/80 text-foreground border-transparent";
          if (answered !== null) {
            if (idx === q.ans) stateClass = "bg-green-600 hover:bg-green-600 text-white border-green-500";
            else if (idx === answered) stateClass = "bg-red-600 hover:bg-red-600 text-white border-red-500";
            else stateClass = "bg-secondary/50 text-muted-foreground border-transparent opacity-50";
          }
          
          return (
            <Button
              key={idx}
              variant="outline"
              className={`h-auto min-h-16 py-3 px-4 justify-start text-left whitespace-normal border-2 transition-all ${stateClass}`}
              onClick={() => handleAnswer(idx)}
              disabled={answered !== null}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-black/20 text-xs font-bold font-mono">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{opt}</span>
              </div>
            </Button>
          );
        })}
      </div>

      {answered !== null && (
        <div className="mt-6 p-4 bg-secondary/50 border border-border rounded-lg animate-in slide-in-from-bottom-2">
          <p className="text-sm font-medium mb-4">{q.fact}</p>
          <Button onClick={nextQuestion} className="w-full font-bold tracking-widest bg-[#1565c0] hover:bg-[#1565c0]/80">
            {currentIdx < quizData.questions.length - 1 ? "NEXT QUESTION" : "FINISH"}
          </Button>
        </div>
      )}
    </div>
  );
}
