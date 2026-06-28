import { useState } from 'react';
import { Lock } from 'lucide-react';
import { GeneralQuiz } from './GeneralQuiz';
import { PostRaceQuiz } from './PostRaceQuiz';

type View = 'home' | 'preview' | 'review' | 'general';

// ── Day-based availability ───────────────────────────────────────────────────
// getDay(): Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6

function getDay() {
  return new Date().getDay();
}

function isPreviewQuizAvailable() {
  const day = getDay();
  return day === 4 || day === 5 || day === 6; // Thursday–Saturday
}

function getPreviewUnlockMessage() {
  const daysUntilThursday = [4, 3, 2, 1, 0, 6, 5][getDay()];
  if (daysUntilThursday === 0) return 'Available today!';
  if (daysUntilThursday === 1) return 'Unlocks tomorrow — Thursday';
  return `Unlocks in ${daysUntilThursday} days on Thursday`;
}

function isReviewQuizAvailable() {
  const day = getDay();
  return day === 2 || day === 3; // Tuesday–Wednesday
}

function getReviewUnlockMessage() {
  const daysUntilTuesday = [2, 1, 0, 6, 5, 4, 3][getDay()];
  if (daysUntilTuesday === 0) return 'Available today!';
  if (daysUntilTuesday === 1) return 'Unlocks tomorrow — Tuesday';
  return `Unlocks in ${daysUntilTuesday} days on Tuesday`;
}

// ── Card ─────────────────────────────────────────────────────────────────────

type CardProps = {
  emoji: string;
  title: string;
  schedule: string;
  desc: string;
  unlockMsg: string;
  available: boolean;
  accent: string;
  iconBg: string;
  hoverCls: string;
  onClick: () => void;
};

function QuizModeCard({
  emoji, title, schedule, desc, unlockMsg, available, accent, iconBg, hoverCls, onClick,
}: CardProps) {
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0 ${iconBg}`}>
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-black text-base text-white truncate">{title}</h3>
            {!available && <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: accent }}>
            {schedule}
          </p>
        </div>
      </div>
      <p className={`text-sm leading-relaxed mt-2.5 ${available ? 'text-muted-foreground' : 'text-muted-foreground/70 font-medium'}`}>
        {available ? desc : `🔒 ${unlockMsg}`}
      </p>
    </>
  );

  if (!available) {
    return (
      <div className="rounded-xl border border-border/40 bg-secondary/10 p-4 opacity-60 cursor-not-allowed select-none">
        {inner}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-border/50 bg-secondary/20 p-4 transition-all active:scale-[0.99] ${hoverCls}`}
    >
      {inner}
    </button>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function WheelKnowledgeQuiz() {
  const [view, setView] = useState<View>('home');
  const [devUnlock, setDevUnlock] = useState(false);

  if (view === 'general') return <GeneralQuiz />;
  if (view === 'preview') return <PostRaceQuiz initialMode="preview" onPlayGeneral={() => setView('general')} />;
  if (view === 'review') return <PostRaceQuiz initialMode="review" onPlayGeneral={() => setView('general')} />;

  const previewOpen = devUnlock || isPreviewQuizAvailable();
  const reviewOpen = devUnlock || isReviewQuizAvailable();

  return (
    <div className="flex flex-col gap-4">
      {/* Weekly schedule */}
      <div className="bg-[#1a1a1a] rounded-[10px] py-3 px-4 text-xs">
        <div className="text-[10px] font-bold text-[#666] tracking-[0.12em] uppercase mb-2.5">Quiz Schedule</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground/70">Thursday — Saturday</span>
            <span className="font-semibold text-[#1565c0]">🔭 Preview Quiz</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground/70">Tuesday — Wednesday</span>
            <span className="font-semibold text-[#e10600]">🏁 Review Quiz</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground/70">Any time</span>
            <span className="font-semibold text-[#2e7d32]">❓ General Quiz</span>
          </div>
        </div>
      </div>

      {/* Mode cards */}
      <QuizModeCard
        emoji="🔭"
        title="Preview Quiz"
        schedule="Thursday — Saturday"
        desc="Circuit history, records and famous moments from this weekend's track. AI-generated."
        unlockMsg={getPreviewUnlockMessage()}
        available={previewOpen}
        accent="#1565c0"
        iconBg="bg-[#1565c0]/15"
        hoverCls="hover:border-[#1565c0]/50 hover:bg-[#1565c0]/5"
        onClick={() => setView('preview')}
      />

      <QuizModeCard
        emoji="🏁"
        title="Review Quiz"
        schedule="Tuesday — Wednesday"
        desc="Test how closely you watched the last race — results, strategy and drama. AI-generated."
        unlockMsg={getReviewUnlockMessage()}
        available={reviewOpen}
        accent="#e10600"
        iconBg="bg-[#e10600]/15"
        hoverCls="hover:border-[#e10600]/50 hover:bg-[#e10600]/5"
        onClick={() => setView('review')}
      />

      <QuizModeCard
        emoji="❓"
        title="General Quiz"
        schedule="Any time"
        desc="10 questions spanning every era of F1 — drivers, liveries, helmets, team radio and more."
        unlockMsg=""
        available={true}
        accent="#2e7d32"
        iconBg="bg-[#2e7d32]/15"
        hoverCls="hover:border-[#2e7d32]/50 hover:bg-[#2e7d32]/5"
        onClick={() => setView('general')}
      />

      {/* Dev: bypass day gating for testing */}
      <button
        onClick={() => setDevUnlock(v => !v)}
        className="self-start text-[9px] font-black uppercase tracking-widest text-muted-foreground/25 hover:text-muted-foreground/60 transition-colors mt-1"
      >
        {devUnlock ? '× dev: gating off' : 'dev: unlock all'}
      </button>
    </div>
  );
}
