import { useState, type ReactNode } from 'react';
import { Lock, Flame } from 'lucide-react';
import { GeneralQuiz } from './GeneralQuiz';
import { PostRaceQuiz } from './PostRaceQuiz';
import {
  hasCompletedThisWeek,
  getWeeklyStreak,
  getLastScore,
  hasCompletedReviewThisWeek,
  getNextReviewTuesdayLabel,
} from '@/lib/weeklyQuiz';

type View = 'home' | 'preview' | 'review' | 'general';

// ── Day-based availability ───────────────────────────────────────────────────
// getDay(): Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6

function isPreviewQuizAvailable(day: number) {
  return day === 4 || day === 5 || day === 6; // Thursday–Saturday
}

function getPreviewUnlockMessage(day: number) {
  if (day === 0) return 'Unlocks Thursday — 4 days away';
  if (day === 1) return 'Unlocks Thursday — 3 days away';
  if (day === 2) return 'Unlocks Thursday — 2 days away';
  if (day === 3) return 'Unlocks tomorrow — Thursday';
  return 'Available now!'; // Thursday–Saturday
}

function isReviewQuizAvailable(day: number) {
  return day === 2 || day === 3; // Tuesday–Wednesday
}

function getReviewUnlockMessage(day: number) {
  if (day === 0) return 'Unlocks Tuesday — 2 days away';
  if (day === 1) return 'Unlocks tomorrow — Tuesday';
  if (day === 4) return 'Unlocks next Tuesday — 4 days away';
  if (day === 5) return 'Unlocks next Tuesday — 3 days away';
  if (day === 6) return 'Unlocks next Tuesday — 2 days away';
  return 'Available now!'; // Tuesday–Wednesday
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
  trailing?: ReactNode;
};

function QuizModeCard({
  emoji, title, schedule, desc, unlockMsg, available, accent, iconBg, hoverCls, onClick, trailing,
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
        {trailing && <div className="ml-auto shrink-0">{trailing}</div>}
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
  const [dayOverride, setDayOverride] = useState<number | null>(null);

  if (view === 'general') return <GeneralQuiz />;
  if (view === 'preview') return <PostRaceQuiz initialMode="preview" onPlayGeneral={() => setView('general')} />;
  if (view === 'review') return <PostRaceQuiz initialMode="review" onPlayGeneral={() => setView('general')} />;

  // The day override only applies in development, so real users in production
  // can never bypass the day-based gating (even via the console).
  const day = import.meta.env.DEV && dayOverride !== null ? dayOverride : new Date().getDay();
  const previewOpen = isPreviewQuizAvailable(day);
  const reviewOpen = isReviewQuizAvailable(day);

  const generalDone = hasCompletedThisWeek();
  const generalStreak = getWeeklyStreak();
  const generalLastScore = getLastScore();
  const reviewDone = reviewOpen && hasCompletedReviewThisWeek();

  return (
    <div className="flex flex-col gap-4">
      {/* Weekly schedule strip */}
      <div className="bg-[#1a1a1a] rounded-lg py-2.5 px-3.5 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#1565c0] mb-0.5">Thu–Sat</div>
          <div className="text-[11px] text-muted-foreground">🔭 Preview</div>
        </div>
        <div className="border-x border-[#333]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#2e7d32] mb-0.5">Any time</div>
          <div className="text-[11px] text-muted-foreground">❓ General</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#e10600] mb-0.5">Tue–Wed</div>
          <div className="text-[11px] text-muted-foreground">🏁 Review</div>
        </div>
      </div>

      {/* Mode cards */}
      <QuizModeCard
        emoji="🔭"
        title="Preview Quiz"
        schedule="Thursday — Saturday"
        desc="Circuit history, records and famous moments from this weekend's track. AI-generated."
        unlockMsg={getPreviewUnlockMessage(day)}
        available={previewOpen}
        accent="#1565c0"
        iconBg="bg-[#1565c0]/15"
        hoverCls="hover:border-[#1565c0]/50 hover:bg-[#1565c0]/5"
        onClick={() => setView('preview')}
      />

      <QuizModeCard
        emoji="🏁"
        title="Review Quiz"
        schedule={reviewDone ? 'Completed this week' : 'Tuesday — Wednesday'}
        desc={
          reviewDone
            ? `You've completed this week's Review Quiz. Come back ${getNextReviewTuesdayLabel()}.`
            : 'Test how closely you watched the most recent race — results, strategy and drama. AI-generated, one play per week.'
        }
        unlockMsg={getReviewUnlockMessage(day)}
        available={reviewOpen}
        accent="#e10600"
        iconBg="bg-[#e10600]/15"
        hoverCls="hover:border-[#e10600]/50 hover:bg-[#e10600]/5"
        onClick={() => setView('review')}
      />

      <QuizModeCard
        emoji="❓"
        title="General Quiz"
        schedule={generalDone ? 'Completed this week' : 'Weekly — resets Monday'}
        desc={
          generalDone
            ? `You scored ${generalLastScore ?? 0}/100 this week. Come back Monday for a fresh set.`
            : '10 questions spanning every era of F1 — drivers, liveries, helmets, team radio and more. One play per week.'
        }
        unlockMsg=""
        available={true}
        accent="#2e7d32"
        iconBg="bg-[#2e7d32]/15"
        hoverCls="hover:border-[#2e7d32]/50 hover:bg-[#2e7d32]/5"
        onClick={() => setView('general')}
        trailing={
          generalStreak > 0 ? (
            <div className="flex flex-col items-center rounded-lg border border-[#2e7d32]/40 bg-[#2e7d32]/15 px-2.5 py-1.5">
              <Flame className="w-4 h-4 text-[#6fcf78]" />
              <span className="font-black text-[#6fcf78] text-base leading-none mt-0.5">{generalStreak}</span>
              <span className="text-[8px] font-bold text-muted-foreground tracking-wider">
                WEEK{generalStreak === 1 ? '' : 'S'}
              </span>
            </div>
          ) : undefined
        }
      />

      {/* Dev: override the day to test gating (development only) */}
      {import.meta.env.DEV && (
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#e10600]">DEV ONLY</span>
          {([
            { label: 'Force Tue', value: 2 },
            { label: 'Force Thu', value: 4 },
            { label: 'Force Other', value: 0 },
            { label: 'Off', value: null },
          ] as const).map(({ label, value }) => {
            const active = dayOverride === value;
            return (
              <button
                key={label}
                onClick={() => setDayOverride(value)}
                className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                  active ? 'text-foreground/70' : 'text-muted-foreground/25 hover:text-muted-foreground/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
