// Bundled F1 team logos. These are local assets so they always load reliably —
// the quiz uses them for "identify the team logo" questions and for any question
// whose `image` field is a `logo:<TeamName>` token.

import ferrari from '@/assets/logos/ferrari.png';
import mercedes from '@/assets/logos/mercedes.png';
import redBull from '@/assets/logos/red-bull.png';
import mclaren from '@/assets/logos/mclaren.png';
import williams from '@/assets/logos/williams.png';
import astonMartin from '@/assets/logos/aston-martin.png';

// Canonical team name → bundled logo URL. Display names used by the quiz.
export const TEAM_LOGOS: Record<string, string> = {
  Ferrari: ferrari,
  Mercedes: mercedes,
  'Red Bull': redBull,
  McLaren: mclaren,
  Williams: williams,
  'Aston Martin': astonMartin,
};

// Teams we can show a real logo for — handy for building logo-ID questions.
export const TEAMS_WITH_LOGOS = Object.keys(TEAM_LOGOS);

// Alternate spellings/full names mapped to a canonical key above.
const ALIASES: Record<string, string> = {
  'scuderia ferrari': 'Ferrari',
  ferrari: 'Ferrari',
  'mercedes-amg': 'Mercedes',
  'mercedes amg': 'Mercedes',
  'mercedes-amg petronas': 'Mercedes',
  mercedes: 'Mercedes',
  'red bull': 'Red Bull',
  'red bull racing': 'Red Bull',
  redbull: 'Red Bull',
  mclaren: 'McLaren',
  'mclaren racing': 'McLaren',
  williams: 'Williams',
  'williams racing': 'Williams',
  'aston martin': 'Aston Martin',
  'aston martin aramco': 'Aston Martin',
};

/** Resolve a team name (any common spelling) to a bundled logo URL, or null. */
export function resolveTeamLogo(name: string): string | null {
  const key = name.trim().toLowerCase();
  const canonical = ALIASES[key];
  if (canonical && TEAM_LOGOS[canonical]) return TEAM_LOGOS[canonical];
  // Direct match against canonical display names (case-insensitive).
  const direct = Object.keys(TEAM_LOGOS).find((k) => k.toLowerCase() === key);
  return direct ? TEAM_LOGOS[direct] : null;
}

/**
 * Resolve a question `image` field to a renderable URL.
 * - `logo:<TeamName>` → bundled team logo (or null if unknown).
 * - absolute http(s) URL → used as-is (rendered with a graceful fallback).
 * - anything else → null (no image shown).
 */
export function resolveQuestionImage(image: string | undefined): string | null {
  if (!image) return null;
  const trimmed = image.trim();
  if (trimmed.toLowerCase().startsWith('logo:')) {
    return resolveTeamLogo(trimmed.slice(5));
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}
