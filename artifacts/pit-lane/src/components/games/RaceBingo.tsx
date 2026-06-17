import React, { useState } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SQUARES = ["Safety car deployed","DRS enabled","Sub 2s pit stop","Radio complaint","Overtake on lap 1","Virtual safety car","Fastest lap attempt","Spin on track","Rain starts","Team orders given","Tyre failure","Penalty given","FREE","Crash at turn 1","Early chequered flag","Driver swears","Podium surprise","Engine issue","Purple sector","Mechanical DNF","Wet tyres used","Pit lane speeding","Gap under 1s","Comeback drive","Dramatic last lap"];
const WINS = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];

export function RaceBingo() {
  const [ticked, setTicked] = useState<Set<number>>(new Set([12])); // 12 is FREE

  const toggle = (i: number) => {
    if (i === 12) return;
    const next = new Set(ticked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setTicked(next);
  };

  const reset = () => setTicked(new Set([12]));

  const winningLines = WINS.filter(line => line.every(i => ticked.has(i)));
  const hasWon = winningLines.length > 0;
  const winningSquares = new Set(winningLines.flat());

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
        <span>{ticked.size - 1} Ticked</span>
        {hasWon && <span className="text-primary animate-pulse flex items-center gap-1"><Trophy className="w-4 h-4"/> BINGO</span>}
        <button onClick={reset} className="flex items-center gap-1 hover:text-foreground transition-colors"><RefreshCw className="w-4 h-4"/> Reset</button>
      </div>

      <div className="grid grid-cols-5 gap-1 md:gap-2">
        {SQUARES.map((sq, i) => {
          const isTicked = ticked.has(i);
          const isWinning = winningSquares.has(i);
          const isFree = i === 12;

          let bg = "bg-secondary hover:bg-secondary/80 text-muted-foreground";
          if (isWinning) {
            bg = "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(225,6,0,0.5)] scale-105 z-10 transition-transform duration-300";
          } else if (isTicked || isFree) {
            bg = "bg-primary/20 text-foreground border-primary/30";
          }

          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`aspect-square p-1 rounded font-bold text-[9px] md:text-xs leading-tight flex items-center justify-center text-center border border-transparent transition-all overflow-hidden ${bg}`}
              disabled={isFree}
            >
              {sq}
            </button>
          );
        })}
      </div>
    </div>
  );
}
