import React, { useState, useEffect, useRef } from 'react';
import { Clock, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  {q:"Name 10 drivers with the most race wins all time",answers:["Hamilton","Schumacher","Verstappen","Vettel","Prost","Senna","Alonso","Mansell","Clark","Stewart"],hint:"Think legends from every era of F1"},
  {q:"Name 10 countries that have hosted a Formula 1 Grand Prix",answers:["UK","Italy","Germany","France","USA","Brazil","Japan","Spain","Belgium","Australia","Monaco","Canada","Hungary","Austria","Netherlands","Singapore","Bahrain"],hint:"Over 30 countries have hosted races across F1 history"},
  {q:"Name 10 F1 World Champions from any era",answers:["Hamilton","Schumacher","Vettel","Senna","Prost","Lauda","Stewart","Clark","Fangio","Verstappen","Rosberg","Button","Raikkonen","Hill","Mansell","Piquet"],hint:"There have been around 34 different world champions"},
  {q:"Name 10 circuits currently on the F1 calendar",answers:["Bahrain","Jeddah","Melbourne","Suzuka","Shanghai","Miami","Imola","Monaco","Montreal","Barcelona","Spielberg","Silverstone","Budapest","Spa","Zandvoort","Monza","Baku","Singapore","Austin","Mexico City","Sao Paulo","Las Vegas","Lusail","Abu Dhabi"],hint:"There are 24 race weekends in a modern season"}
];

export function Tenabell() {
  const [mode, setMode] = useState<"select" | "timed" | "relaxed" | "over">("select");
  const [cat, setCat] = useState(() => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [found, setFound] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [revealed, setRevealed] = useState(false);
  
  useEffect(() => {
    if (mode === "timed" && timeLeft > 0 && found.length < 10) {
      const t = setInterval(() => setTimeLeft(l => l - 1), 1000);
      return () => clearInterval(t);
    } else if (mode === "timed" && timeLeft === 0) {
      setMode("over");
      setRevealed(true);
    }
  }, [mode, timeLeft, found.length]);

  const checkAns = () => {
    if (!inputVal.trim()) return;
    const guess = inputVal.toLowerCase().trim();
    
    // Check if valid
    const match = cat.answers.find(a => {
      if (found.includes(a)) return false;
      const target = a.toLowerCase();
      return guess === target || (guess.includes(target) && target.length >= 4) || (target.includes(guess) && guess.length >= 3);
    });

    if (match) {
      const newFound = [...found, match];
      setFound(newFound);
      setInputVal("");
      if (newFound.length === 10) {
        setMode("over");
        setRevealed(true);
      }
    } else {
      setInputVal("");
    }
  };

  if (mode === "select") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-black">10 CATEGORY ANSWERS</h2>
          <p className="text-muted-foreground text-sm max-w-sm">Test your F1 knowledge. Choose your difficulty.</p>
        </div>
        <div className="flex flex-col w-full max-w-xs space-y-3">
          <Button onClick={() => setMode("timed")} size="lg" className="font-bold tracking-widest bg-[#e65100] hover:bg-[#e65100]/80 border-none h-14">
            <Clock className="mr-2 w-5 h-5"/> 2 MINUTE TIMER
          </Button>
          <Button onClick={() => setMode("relaxed")} size="lg" variant="outline" className="font-bold tracking-widest border-border text-foreground h-14 bg-secondary">
            RELAXED (NO TIMER)
          </Button>
        </div>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const slots = Array.from({length: 10}).map((_, i) => {
    const item = found[i] || (revealed ? cat.answers.filter(a => !found.includes(a))[i - found.length] : null);
    return { item, isFound: i < found.length };
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {found.length} / 10 FOUND
        </div>
        {mode === "timed" && (
          <div className={`font-mono text-xl font-bold flex items-center gap-2 ${timeLeft <= 30 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
            <Clock className="w-5 h-5" />
            {timeStr}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-bold leading-tight">{cat.q}</h2>
        <p className="text-sm text-muted-foreground italic">Hint: {cat.hint}</p>
      </div>

      {mode !== "over" && (
        <div className="flex space-x-2">
          <Input 
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkAns()}
            placeholder="Type answer..."
            className="bg-secondary/50 font-bold uppercase"
            autoFocus
          />
          <Button onClick={checkAns} className="bg-[#e65100] hover:bg-[#e65100]/80">Submit</Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot, i) => {
          let bg = "bg-secondary/30 text-muted-foreground border-transparent";
          if (slot.item) {
            if (slot.isFound) bg = "bg-green-600/20 text-green-500 border-green-600/30 font-bold";
            else bg = "bg-destructive/20 text-destructive border-destructive/30";
          }
          return (
            <div key={i} className={`h-12 rounded border flex items-center px-4 ${bg}`}>
              <span className="w-6 text-xs opacity-50 font-mono">{i + 1}.</span>
              <span className="truncate">{slot.item || "???"}</span>
            </div>
          );
        })}
      </div>

      {mode !== "over" && (
        <Button variant="ghost" onClick={() => { setRevealed(true); setMode("over"); }} className="text-muted-foreground mx-auto text-xs w-fit mt-4">
          GIVE UP & REVEAL
        </Button>
      )}

      {mode === "over" && (
        <div className="text-center p-6 bg-secondary rounded-lg animate-in slide-in-from-bottom-4 mt-6">
          <p className="font-bold text-lg mb-2">
            {found.length === 10 ? "Perfect 10!" : found.length >= 6 ? "Solid effort!" : "Keep watching."}
          </p>
          <Button onClick={() => window.location.reload()} className="bg-[#e65100] hover:bg-[#e65100]/80 mt-2 font-bold tracking-widest px-8">
            PLAY AGAIN
          </Button>
        </div>
      )}
    </div>
  );
}
