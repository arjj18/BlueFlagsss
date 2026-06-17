import React, { useState } from 'react';
import { ArrowLeft, Clock, Timer, Trophy, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function GeneralQuiz() {
  const [questions, setQuestions] = useState(() => {
    const raw = [
      {q:"Which driver has the most F1 World Championships?",opts:["Michael Schumacher","Lewis Hamilton","Sebastian Vettel","Ayrton Senna"],ans:1,fact:"Hamilton and Schumacher share the record with 7 titles each."},
      {q:"What does DRS stand for?",opts:["Dynamic Race Speed","Drag Reduction System","Dual Rear Spoiler","Direct Racing System"],ans:1,fact:"DRS opens a flap in the rear wing to reduce drag on straights."},
      {q:"Which circuit is nicknamed the Cathedral of Speed?",opts:["Monaco","Spa","Monza","Silverstone"],ans:2,fact:"Monza in Italy is famous for its high-speed layout and passionate tifosi fans."},
      {q:"How many points does a race winner receive?",opts:["20","25","30","15"],ans:1,fact:"The current points system has awarded 25 points for a win since 2010."},
      {q:"Which team has won the most Constructors' Championships?",opts:["McLaren","Mercedes","Williams","Ferrari"],ans:3,fact:"Ferrari leads with 16 Constructors' Championships."},
      {q:"What colour flag signals a race has been stopped?",opts:["Yellow","Blue","Red","Black"],ans:2,fact:"A red flag means the race is immediately neutralised."},
      {q:"Which driver is nicknamed The Iceman?",opts:["Nico Rosberg","Alain Prost","Kimi Räikkönen","Jenson Button"],ans:2,fact:"Räikkönen earned the nickname for his cool, unemotional demeanour."},
      {q:"How many cars start a Formula 1 race?",opts:["16","18","20","22"],ans:2,fact:"10 teams × 2 drivers = 20 cars on the starting grid."},
      {q:"Which country hosts the Suzuka circuit?",opts:["South Korea","China","Singapore","Japan"],ans:3,fact:"Suzuka is in Japan's Mie Prefecture."},
      {q:"What does a blue flag signal to a driver?",opts:["Caution ahead","Let a faster car pass","Pit stop required","Rain is coming"],ans:1,fact:"A blue flag tells a driver they're about to be lapped and must let the faster car through."}
    ];
    return raw.sort(() => Math.random() - 0.5);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const q = questions[currentIdx];

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === q.ans) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswered(null);
    } else {
      setGameOver(true);
    }
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in py-8">
        <Trophy className="w-16 h-16 text-primary" />
        <h2 className="text-4xl font-black">{score} / {questions.length}</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          {score >= 8 ? "Championship material! Excellent F1 knowledge." : score >= 5 ? "Solid points finish. You know your stuff." : "A DNF this time. Keep watching the races!"}
        </p>
        <Button onClick={() => window.location.reload()} size="lg" className="font-bold tracking-widest mt-4">PLAY AGAIN</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>QUESTION {currentIdx + 1}/{questions.length}</span>
          <span>SCORE: {score}</span>
        </div>
        <Progress value={((currentIdx) / questions.length) * 100} className="h-2 rounded-none bg-secondary" />
      </div>

      <div className="text-xl md:text-2xl font-bold leading-tight py-4">
        {q.q}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.opts.map((opt, idx) => {
          let stateClass = "bg-secondary hover:bg-secondary/80 text-foreground border-transparent";
          if (answered !== null) {
            if (idx === q.ans) stateClass = "bg-green-600 hover:bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]";
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
          <Button onClick={nextQuestion} className="w-full font-bold tracking-widest">
            {currentIdx < questions.length - 1 ? "NEXT QUESTION" : "FINISH"}
          </Button>
        </div>
      )}
    </div>
  );
}
