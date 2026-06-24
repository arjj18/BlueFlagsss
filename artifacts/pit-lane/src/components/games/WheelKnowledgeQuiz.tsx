import { useState } from 'react';
import { GeneralQuiz } from './GeneralQuiz';
import { PostRaceQuiz } from './PostRaceQuiz';
import { Brain, Cpu } from 'lucide-react';

type Mode = null | "general" | "ai";

export function WheelKnowledgeQuiz() {
  const [mode, setMode] = useState<Mode>(null);

  if (mode === "general") return <GeneralQuiz />;
  if (mode === "ai") return <PostRaceQuiz />;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Two ways to test your F1 knowledge — pick your challenge:
      </p>

      <button
        onClick={() => setMode("general")}
        className="group flex items-start gap-4 text-left rounded-xl border border-border/50 bg-secondary/20 hover:border-[#2e7d32]/50 hover:bg-[#2e7d32]/5 p-4 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-[#2e7d32]/15 flex items-center justify-center shrink-0 mt-0.5">
          <Brain className="w-5 h-5 text-[#2e7d32]" />
        </div>
        <div>
          <h3 className="font-black text-base text-white group-hover:text-[#2e7d32] transition-colors mb-1">General Quiz</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            10 random questions spanning every era of Formula 1 history. Classics, drivers, records — all of it.
          </p>
        </div>
      </button>

      <button
        onClick={() => setMode("ai")}
        className="group flex items-start gap-4 text-left rounded-xl border border-border/50 bg-secondary/20 hover:border-[#1565c0]/50 hover:bg-[#1565c0]/5 p-4 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-[#1565c0]/15 flex items-center justify-center shrink-0 mt-0.5">
          <Cpu className="w-5 h-5 text-[#1565c0]" />
        </div>
        <div>
          <h3 className="font-black text-base text-white group-hover:text-[#1565c0] transition-colors mb-1">AI Race Quiz</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pick any race, get 5 dynamically generated trivia questions about it. Powered by AI — different every time.
          </p>
        </div>
      </button>
    </div>
  );
}
