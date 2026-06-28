import { useEffect, useMemo, useState } from 'react';
import type { RaceStatus } from '../lib/f1Calendar';

type Target = { date: Date; label: string; liveMessage: string } | null;

function computeTarget(status: RaceStatus): Target {
  if (status.kind === 'offseason') return null;
  const raceDay = new Date(`${status.race.date}T00:00:00`);
  if (status.kind === 'weekend') {
    const lightsOut = new Date(raceDay);
    lightsOut.setHours(15, 0, 0, 0);
    return {
      date: lightsOut,
      label: 'Lights out in',
      liveMessage: `${status.race.shortName} — lights out!`,
    };
  }
  const weekendStart = new Date(raceDay);
  weekendStart.setDate(raceDay.getDate() - 3);
  weekendStart.setHours(0, 0, 0, 0);
  return {
    date: weekendStart,
    label: 'Race weekend in',
    liveMessage: `${status.race.shortName} — race weekend!`,
  };
}

function Unit({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="text-center">
      <div className="font-['Barlow_Condensed'] text-[22px] font-bold text-white leading-none tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[8px] text-[#555] font-semibold tracking-[0.12em] mt-0.5">{unit}</div>
    </div>
  );
}

function Colon() {
  return <span className="text-[18px] text-[#333] leading-none self-start mt-[1px]">:</span>;
}

export function RaceCountdown({ status }: { status: RaceStatus }) {
  const target = useMemo(() => computeTarget(status), [status]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target) return null;

  const diff = target.date.getTime() - now;
  const d = Math.max(0, diff);
  const days = Math.floor(d / 86_400_000);
  const hours = Math.floor((d % 86_400_000) / 3_600_000);
  const mins = Math.floor((d % 3_600_000) / 60_000);
  const secs = Math.floor((d % 60_000) / 1_000);

  const units: Array<[number, string]> =
    days > 0
      ? [[days, 'DAYS'], [hours, 'HRS'], [mins, 'MINS']]
      : [[hours, 'HRS'], [mins, 'MINS'], [secs, 'SECS']];

  return (
    <div className="bg-[#111] border-b border-[#1a1a1a]">
      <div className="max-w-[680px] mx-auto px-5 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse shrink-0" />
          <span className="text-[12px] font-semibold text-[#aaa] truncate">
            {diff <= 0 ? target.liveMessage : target.label}
          </span>
        </div>
        {diff > 0 ? (
          <div className="flex items-center gap-2.5 shrink-0">
            <Unit value={units[0][0]} unit={units[0][1]} />
            <Colon />
            <Unit value={units[1][0]} unit={units[1][1]} />
            <Colon />
            <Unit value={units[2][0]} unit={units[2][1]} />
          </div>
        ) : (
          <span className="text-[18px] shrink-0">🏁</span>
        )}
      </div>
    </div>
  );
}
