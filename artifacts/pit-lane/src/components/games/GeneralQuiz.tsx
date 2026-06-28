import { useState } from 'react';
import { Trophy, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { saveScore } from '@/lib/scoreHistory';

type QuestionType =
  | 'standard'
  | 'career'
  | 'graph'
  | 'radio'
  | 'helmet'
  | 'moment'
  | 'livery'
  | 'sponsor';

type BaseQuestion = {
  q: string;
  opts: string[];
  ans: number;
  fact: string;
};

type StandardQuestion = BaseQuestion & {
  type: 'standard' | 'radio' | 'helmet' | 'moment' | 'livery' | 'sponsor';
  radio?: string;
  helmet?: string;
  moment?: string;
  livery?: string;
  sponsor?: string;
};

type CareerQuestion = BaseQuestion & {
  type: 'career';
  career: string[];
  years: string[];
};

type GraphQuestion = BaseQuestion & {
  type: 'graph';
  positions: { year: string; pos: number }[];
};

type Question = StandardQuestion | CareerQuestion | GraphQuestion;

const BANK: Question[] = [
  // ── CAREER PATH ──────────────────────────────────────────────
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Sauber', 'Ferrari', 'Lotus', 'Ferrari', 'Alfa Romeo'],
    years: ['2018', '2019–present', '', '', ''],
    opts: ['Charles Leclerc', 'Kimi Räikkönen', 'Sebastian Vettel', 'Fernando Alonso'],
    ans: 1,
    fact: 'Räikkönen returned to Sauber in 2019 when the team was rebranded Alfa Romeo, completing a full circle in his career.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Minardi', 'Renault', 'McLaren', 'Renault', 'Ferrari', 'McLaren', 'Alpine', 'Aston Martin'],
    years: ['2001', '2003–06', '2007', '2008–09', '2010–14', '2015', '2021–22', '2023–'],
    opts: ['Michael Schumacher', 'Fernando Alonso', 'Jenson Button', 'Rubens Barrichello'],
    ans: 1,
    fact: 'Alonso is one of the most well travelled drivers in F1 history having raced for 8 different teams across his career.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Jordan', 'Benetton', 'Ferrari', 'Mercedes'],
    years: ['1991', '1991–95', '1996–2006', '2010–12'],
    opts: ['Damon Hill', 'Michael Schumacher', 'Eddie Irvine', 'Rubens Barrichello'],
    ans: 1,
    fact: 'Schumacher won all five of his consecutive titles at Ferrari before a brief retirement and comeback with Mercedes.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['McLaren', 'Mercedes', 'Ferrari'],
    years: ['2007–12', '2013–24', '2025–'],
    opts: ['Nico Rosberg', 'Lewis Hamilton', 'Valtteri Bottas', 'George Russell'],
    ans: 1,
    fact: 'Hamilton shocked the F1 world in 2024 by announcing he would join Ferrari for the 2025 season after 12 years at Mercedes.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Toro Rosso', 'Red Bull'],
    years: ['2015', '2016–'],
    opts: ['Daniel Ricciardo', 'Carlos Sainz', 'Max Verstappen', 'Daniil Kvyat'],
    ans: 2,
    fact: 'Verstappen became the youngest driver to start an F1 race at 17 years and 166 days old with Toro Rosso in 2015.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Renault', 'McLaren', 'Ferrari', 'Lotus', 'Ferrari', 'Alfa Romeo'],
    years: ['2001', '2002–06', '2007–09', '2010–12', '2014–18', '2019–21'],
    opts: ['Fernando Alonso', 'Kimi Räikkönen', 'Felipe Massa', 'Romain Grosjean'],
    ans: 1,
    fact: 'Räikkönen holds the record for most F1 race starts with 349 appearances across his career.',
  },

  // ── FINISHING GRAPH ──────────────────────────────────────────
  {
    type: 'graph',
    q: 'Which driver had these championship finishing positions across their career?',
    positions: [
      { year: '2015', pos: 3 },
      { year: '2016', pos: 1 },
      { year: '2017', pos: 2 },
      { year: '2018', pos: 2 },
      { year: '2019', pos: 5 },
      { year: '2020', pos: 2 },
    ],
    opts: ['Lewis Hamilton', 'Nico Rosberg', 'Sebastian Vettel', 'Valtteri Bottas'],
    ans: 1,
    fact: 'Rosberg retired just five days after winning the 2016 World Championship, one of the most shocking retirements in F1 history.',
  },
  {
    type: 'graph',
    q: 'Which driver had these championship finishing positions across their career?',
    positions: [
      { year: '2010', pos: 1 },
      { year: '2011', pos: 1 },
      { year: '2012', pos: 1 },
      { year: '2013', pos: 1 },
      { year: '2014', pos: 5 },
      { year: '2015', pos: 3 },
    ],
    opts: ['Fernando Alonso', 'Sebastian Vettel', 'Lewis Hamilton', 'Mark Webber'],
    ans: 1,
    fact: 'Vettel dominated F1 from 2010 to 2013 with Red Bull but struggled badly when the sport moved to turbo hybrid engines in 2014.',
  },
  {
    type: 'graph',
    q: 'Which driver had these championship finishing positions across their career?',
    positions: [
      { year: '2019', pos: 6 },
      { year: '2020', pos: 3 },
      { year: '2021', pos: 1 },
      { year: '2022', pos: 1 },
      { year: '2023', pos: 1 },
    ],
    opts: ['Charles Leclerc', 'Lewis Hamilton', 'Max Verstappen', 'Lando Norris'],
    ans: 2,
    fact: 'Verstappen won three consecutive World Championships from 2021 to 2023 and dominated the 2023 season winning 19 of 22 races.',
  },

  // ── TEAM RADIO ───────────────────────────────────────────────
  {
    type: 'radio',
    q: 'Which driver said this on team radio?',
    radio: '"Multi 21 Seb, Multi 21." — and the driver ignored the instruction and overtook his teammate anyway.',
    opts: ['Lewis Hamilton', 'Sebastian Vettel', 'Mark Webber', 'Nico Rosberg'],
    ans: 1,
    fact: 'Multi 21 was a Red Bull coded instruction telling Vettel to hold position behind Webber at the 2013 Malaysian GP. Vettel ignored it and passed Webber to win.',
  },
  {
    type: 'radio',
    q: 'Which driver said this on team radio?',
    radio: '"Leave me alone, I know what I am doing!"',
    opts: ['Fernando Alonso', 'Sebastian Vettel', 'Kimi Räikkönen', 'Max Verstappen'],
    ans: 2,
    fact: 'Räikkönen said this iconic line to his Ferrari engineer at the 2012 Abu Dhabi Grand Prix while managing his tyres on the way to victory.',
  },
  {
    type: 'radio',
    q: 'Which driver said this on team radio?',
    radio: '"Somebody is squeezing me... this is not right. Somebody is doing this on purpose."',
    opts: ['Ayrton Senna', 'Alain Prost', 'Nigel Mansell', 'Nelson Piquet'],
    ans: 0,
    fact: 'Senna said this at the 1990 Japanese Grand Prix shortly before his collision with Prost that handed Senna the World Championship.',
  },
  {
    type: 'radio',
    q: 'Which driver said this on team radio after winning his first World Championship?',
    radio: '"Oh my God. Oh my God. Is this real? Is this real?"',
    opts: ['Jenson Button', 'Sebastian Vettel', 'Lewis Hamilton', 'Kimi Räikkönen'],
    ans: 2,
    fact: 'Hamilton said this after winning his first World Championship at the 2008 Brazilian Grand Prix on the very last corner of the last lap.',
  },
  {
    type: 'radio',
    q: 'Which driver said this on team radio?',
    radio: '"I am not a lion. I am a Ferrari."',
    opts: ['Felipe Massa', 'Kimi Räikkönen', 'Michael Schumacher', 'Eddie Irvine'],
    ans: 1,
    fact: 'Räikkönen made this comment during a 2018 race when his engineer told him to be aggressive like a lion on the restart.',
  },

  // ── HELMET ───────────────────────────────────────────────────
  {
    type: 'helmet',
    q: 'Which driver wears this distinctive helmet design?',
    helmet: 'A bright orange helmet with a red lion motif on the top and Dutch national colours running down the sides. Clean modern design with minimal sponsor logos on the visor strip.',
    opts: ['Max Verstappen', 'Lando Norris', 'Daniel Ricciardo', 'Nyck de Vries'],
    ans: 0,
    fact: 'Verstappen chose orange as his primary colour in tribute to the Dutch national colour and the Dutch motorsport tradition of orange racing.',
  },
  {
    type: 'helmet',
    q: 'Which driver wears this distinctive helmet design?',
    helmet: 'A striking papaya orange and yellow gradient helmet with a tropical sunset design. Features a small cartoon character detail and has become one of the most recognised helmets in the modern paddock.',
    opts: ['George Russell', 'Lando Norris', 'Oscar Piastri', 'Charles Leclerc'],
    ans: 1,
    fact: 'Norris worked with a helmet designer to create his distinctive gradient designs which change slightly each season but always feature warm orange and yellow tones.',
  },
  {
    type: 'helmet',
    q: 'Which legendary driver wore a helmet with this iconic design?',
    helmet: 'A yellow helmet with a distinctive green and blue Brazilian flag inspired design running across the top. Simple, instantly recognisable, and became one of the most iconic helmets in motorsport history.',
    opts: ['Nelson Piquet', 'Rubens Barrichello', 'Ayrton Senna', 'Felipe Massa'],
    ans: 2,
    fact: "Senna's yellow helmet became so iconic that it is now displayed in museums around the world and inspired countless tribute designs by modern drivers.",
  },
  {
    type: 'helmet',
    q: 'Which driver wore this helmet design?',
    helmet: 'A distinctive red and white design with a large number 1 on the back even before he was champion. Clean lines, British flag elements, and a very recognisable visor strip colour.',
    opts: ['Nigel Mansell', 'Damon Hill', 'Jenson Button', 'David Coulthard'],
    ans: 0,
    fact: "Mansell's red and white helmet became famous worldwide when he won the 1992 World Championship with Williams in dominant fashion.",
  },

  // ── FAMOUS MOMENT ────────────────────────────────────────────
  {
    type: 'moment',
    q: 'What happened immediately after this famous F1 moment?',
    moment: "It is the 1994 San Marino Grand Prix at Imola. Ayrton Senna's Williams car exits the Tamburello corner at high speed during the race. The car appears to be going straight.",
    opts: [
      'Senna pitted immediately for a tyre change',
      'Senna\'s car hit the concrete wall and he sustained fatal injuries',
      'Senna recovered the car and continued racing',
      'Senna retired with a mechanical failure',
    ],
    ans: 1,
    fact: 'Senna\'s death on 1 May 1994 devastated the motorsport world. He remains one of the greatest drivers in F1 history and his loss led to major safety reforms in the sport.',
  },
  {
    type: 'moment',
    q: 'What happened in this famous F1 moment?',
    moment: 'It is the final corner of the final lap of the 2008 Brazilian Grand Prix. Lewis Hamilton is in fifth place and needs to be fourth or higher to win the championship by one point. Timo Glock is ahead of him.',
    opts: [
      'Hamilton crashed out and lost the championship',
      'Hamilton overtook Glock on the last corner to clinch the championship',
      'Hamilton finished fifth and Felipe Massa won the championship',
      'The race was red flagged and Hamilton was awarded the championship',
    ],
    ans: 1,
    fact: 'Hamilton overtook Glock who was on dry tyres in wet conditions on the very last corner of the season to claim his first World Championship by one single point.',
  },
  {
    type: 'moment',
    q: 'What happened before this famous F1 moment?',
    moment: 'Michael Schumacher is standing on the pit wall at the 2006 Japanese Grand Prix looking devastated as his Ferrari sits stationary on track with smoke coming from the engine.',
    opts: [
      'Schumacher had just crashed into Alonso deliberately',
      'Schumacher\'s engine failed while he was leading the race from pole position',
      'Schumacher had just received a drive through penalty',
      'Schumacher had just been lapped by Alonso',
    ],
    ans: 1,
    fact: 'Schumacher\'s engine failure at Suzuka 2006 while leading effectively ended his title challenge against Alonso with just two races remaining.',
  },
  {
    type: 'moment',
    q: 'What happened in this famous F1 moment?',
    moment: 'It is the start of the 1990 Japanese Grand Prix. Ayrton Senna lines up on pole position but is moved to the dirty side of the grid by the FIA after protesting his grid position.',
    opts: [
      'Senna made a perfect start and won the race comfortably',
      'Senna immediately drove into Prost at the first corner handing himself the championship',
      'Senna retired on lap one with a mechanical failure',
      'Senna and Prost had a clean race with Prost winning',
    ],
    ans: 1,
    fact: 'Senna later admitted he deliberately drove into Prost in retaliation for Prost doing the same to him at the same corner in 1989. The collision gave Senna his second World Championship.',
  },

  // ── LIVERY ───────────────────────────────────────────────────
  {
    type: 'livery',
    q: 'Which F1 team raced with this famous car livery?',
    livery: 'A stunning bright yellow car with black detailing. No major tobacco sponsor. Clean and distinctive on the grid. Raced in the late 1990s and became one of the most loved liveries in F1 history.',
    opts: ['Renault', 'Jordan Grand Prix', 'Minardi', 'Arrows'],
    ans: 1,
    fact: "The Jordan 191 and subsequent yellow Jordans became iconic on the F1 grid. Eddie Jordan's team was known for spotting young talent including Michael Schumacher.",
  },
  {
    type: 'livery',
    q: 'Which F1 team raced with this famous car livery?',
    livery: 'Distinctive orange livery covering the entire car. No other colour. Ran in the late 1960s and early 1970s and was the most visually striking car on the grid. Named after a fruit.',
    opts: ['Tyrrell', 'McLaren', 'Lotus', 'BRM'],
    ans: 1,
    fact: 'McLaren ran papaya orange cars in their early years as an independent team. The colour was revived in 2017 when McLaren returned to their heritage colours.',
  },
  {
    type: 'livery',
    q: 'Which F1 team raced with this famous car livery?',
    livery: 'Black and gold car that became one of the most iconic liveries in motorsport history. Sponsored by a cigarette brand. Raced in the 1970s and won multiple World Championships.',
    opts: ['Brabham', 'Tyrrell', 'Lotus', 'Ferrari'],
    ans: 2,
    fact: 'The John Player Special Lotus in black and gold is considered one of the most beautiful F1 liveries ever created. It was driven by legends including Emerson Fittipaldi and Mario Andretti.',
  },

  // ── SPONSOR ──────────────────────────────────────────────────
  {
    type: 'sponsor',
    q: 'Which F1 team was most famously associated with this sponsor?',
    sponsor: 'Marlboro — the red and white chevron design that became one of the most recognisable sponsor logos in motorsport history across three decades.',
    opts: ['Williams', 'Ferrari and McLaren', 'Lotus', 'Brabham'],
    ans: 1,
    fact: 'Marlboro sponsored McLaren from 1974 to 1996 and Ferrari from 1984 to 2011 making it the longest running and most valuable sponsorship in F1 history.',
  },
  {
    type: 'sponsor',
    q: 'Which F1 team was most famously associated with this sponsor?',
    sponsor: 'Rothmans — blue white and gold colour scheme that defined one of the most dominant teams of the 1990s.',
    opts: ['McLaren', 'Benetton', 'Williams', 'Ferrari'],
    ans: 2,
    fact: 'Rothmans Williams dominated F1 in the early 1990s winning four consecutive Constructors Championships from 1992 to 1994 with drivers like Mansell, Prost and Hill.',
  },
  {
    type: 'sponsor',
    q: 'Which F1 team was most famously associated with this sponsor?',
    sponsor: 'West — a cigarette brand whose silver and red livery created one of the most striking car designs of the late 1990s.',
    opts: ['Ferrari', 'McLaren', 'Williams', 'Jordan'],
    ans: 1,
    fact: 'West McLaren Mercedes in silver and red became iconic during the Hakkinen and Coulthard era of the late 1990s and early 2000s.',
  },

  // ── STANDARD TRIVIA ──────────────────────────────────────────
  {
    type: 'standard',
    q: 'Which driver holds the record for the most pole positions in F1 history?',
    opts: ['Michael Schumacher', 'Ayrton Senna', 'Lewis Hamilton', 'Sebastian Vettel'],
    ans: 2,
    fact: 'Hamilton has taken over 100 pole positions in F1, comfortably ahead of Schumacher in second place.',
  },
  {
    type: 'standard',
    q: 'What is the name of the famous tunnel section at the Monaco Grand Prix?',
    opts: ['The Tunnel', 'Portier', 'Casino Square', 'Rascasse'],
    ans: 0,
    fact: 'The Monaco tunnel is one of the most unique features in F1 — drivers go from bright sunlight into near darkness at over 180mph.',
  },
  {
    type: 'standard',
    q: 'Which team did Brawn GP become after being sold in 2009?',
    opts: ['Force India', 'Mercedes', 'Lotus', 'Aston Martin'],
    ans: 1,
    fact: 'Brawn GP won the 2009 championship in their only season before being purchased by Mercedes who turned it into their works F1 team.',
  },
  {
    type: 'standard',
    q: 'What does VSC stand for in Formula 1?',
    opts: ['Variable Speed Control', 'Virtual Safety Car', 'Vehicle Speed Check', 'Velocity Safety Control'],
    ans: 1,
    fact: "The Virtual Safety Car was introduced in 2015 after Jules Bianchi's fatal accident at the 2014 Japanese Grand Prix to slow cars without a physical safety car.",
  },
  {
    type: 'standard',
    q: 'How many constructors compete in Formula 1 in 2026?',
    opts: ['9', '10', '11', '12'],
    ans: 2,
    fact: 'F1 has 11 constructors on the grid for the 2026 season after Cadillac joined as the 11th team, the first new American works constructor in decades.',
  },
  {
    type: 'standard',
    q: 'How many cars start a Formula 1 race in 2026?',
    opts: ['18', '20', '22', '24'],
    ans: 2,
    fact: 'There are now 11 teams on the grid with 2 drivers each making 22 cars in total. Cadillac joined as the 11th constructor bringing new American investment to the sport.',
  },
  {
    type: 'standard',
    q: 'Which circuit hosts the Italian Grand Prix?',
    opts: ['Imola', 'Mugello', 'Monza', 'Pescara'],
    ans: 2,
    fact: 'Monza has hosted the Italian Grand Prix almost every year since 1950 making it one of the most historic venues in F1.',
  },
  {
    type: 'standard',
    q: 'What colour are the Soft tyres in modern F1?',
    opts: ['Yellow', 'White', 'Red', 'Orange'],
    ans: 2,
    fact: 'Pirelli uses red for Soft, yellow for Medium, and white for Hard tyres to make compound identification easy for fans watching on TV.',
  },
  {
    type: 'standard',
    q: 'Which driver won the first ever Formula 1 World Championship in 1950?',
    opts: ['Alberto Ascari', 'Juan Manuel Fangio', 'Giuseppe Farina', 'Luigi Fagioli'],
    ans: 2,
    fact: 'Giuseppe Farina won the inaugural F1 World Championship driving an Alfa Romeo, beating Juan Manuel Fangio who would go on to win five titles.',
  },
  {
    type: 'standard',
    q: 'What is the maximum number of points available in a single F1 race weekend including sprint?',
    opts: ['29', '34', '44', '38'],
    ans: 1,
    fact: 'A sprint race weekend offers 25 for race win plus 1 fastest lap plus 8 for sprint win totalling 34 maximum points in one weekend.',
  },
  {
    type: 'standard',
    q: 'Which F1 team is based in Woking, England?',
    opts: ['Williams', 'Aston Martin', 'McLaren', 'Mercedes'],
    ans: 2,
    fact: 'McLaren Technology Centre in Woking Surrey has been the home of McLaren F1 since 2004 and is considered one of the most impressive facilities in motorsport.',
  },
  {
    type: 'standard',
    q: 'What year was the DRS overtaking aid introduced to Formula 1?',
    opts: ['2009', '2010', '2011', '2013'],
    ans: 2,
    fact: 'DRS was introduced for the 2011 season to help overtaking after the 2010 season was criticised for processional racing with limited on track action.',
  },
  {
    type: 'standard',
    q: 'Which country has produced the most F1 World Champions?',
    opts: ['Germany', 'Brazil', 'United Kingdom', 'France'],
    ans: 2,
    fact: 'The UK has produced more F1 World Champions than any other country including Hamilton, Button, Hill, Clark, Stewart, Mansell and others.',
  },
  {
    type: 'standard',
    q: 'What is the name of the Red Bull junior team in F1?',
    opts: ['Alpha Tauri', 'Toro Rosso', 'Racing Bulls', 'RB F1'],
    ans: 2,
    fact: "The team has gone through several name changes — Minardi, Toro Rosso, AlphaTauri and now Racing Bulls — but has always served as Red Bull's driver development team.",
  },
  {
    type: 'standard',
    q: 'Which Grand Prix was cancelled in 2020 due to the COVID-19 pandemic and replaced by two races at the same venue?',
    opts: ['British Grand Prix', 'Belgian Grand Prix', 'Austrian Grand Prix', 'Spanish Grand Prix'],
    ans: 2,
    fact: 'The Red Bull Ring in Austria hosted two consecutive race weekends in July 2020 when the season was severely disrupted by the pandemic.',
  },
];

// Question bank last updated: June 2026
// Season: 2026 F1 World Championship
// Grid: 11 teams, 22 drivers

const TYPE_META: Record<QuestionType, { label: string; badge: string }> = {
  career: { label: 'Career Path', badge: 'bg-[#1565c0]/15 text-[#6db1ec] border-[#1565c0]/40' },
  graph: { label: 'Position Graph', badge: 'bg-[#2e7d32]/15 text-[#6fcf78] border-[#2e7d32]/40' },
  radio: { label: 'Team Radio', badge: 'bg-[#e65100]/15 text-[#ff9d4d] border-[#e65100]/40' },
  moment: { label: 'Famous Moment', badge: 'bg-[#e10600]/15 text-[#ff6259] border-[#e10600]/40' },
  helmet: { label: 'Helmet', badge: 'bg-[#7b1fa2]/15 text-[#cf8ae3] border-[#7b1fa2]/40' },
  livery: { label: 'Livery', badge: 'bg-[#c2185b]/15 text-[#f16a9c] border-[#c2185b]/40' },
  sponsor: { label: 'Sponsor', badge: 'bg-[#00838f]/15 text-[#4fd2da] border-[#00838f]/40' },
  standard: { label: 'Trivia', badge: 'bg-secondary text-muted-foreground border-border' },
};

const TOTAL_QUESTIONS = 10;
const POINTS_PER_QUESTION = 10;
const MAX_SCORE = TOTAL_QUESTIONS * POINTS_PER_QUESTION;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickQuestions(): Question[] {
  const byType = (t: QuestionType) => BANK.filter((q) => q.type === t);
  const picked: Question[] = [];

  const career = shuffle(byType('career'))[0];
  const graph = shuffle(byType('graph'))[0];
  const spotlight = shuffle([...byType('radio'), ...byType('helmet'), ...byType('moment')])[0];

  for (const q of [career, graph, spotlight]) {
    if (q && !picked.includes(q)) picked.push(q);
  }

  const rest = shuffle(BANK.filter((q) => !picked.includes(q)));
  for (const q of rest) {
    if (picked.length >= TOTAL_QUESTIONS) break;
    picked.push(q);
  }

  return shuffle(picked).slice(0, TOTAL_QUESTIONS);
}

function ratingFor(score: number): string {
  if (score >= 90) return 'F1 Encyclopaedia — you know everything 🏆';
  if (score >= 70) return 'Serious fan — you have done your homework 👍';
  if (score >= 50) return 'Casual viewer — keep watching the races 📺';
  return 'Are you sure you watch F1? 😅';
}

function CareerTimeline({ q }: { q: CareerQuestion }) {
  return (
    <div className="overflow-x-auto pb-2 mb-4">
      <div className="flex items-center gap-1.5 min-w-max">
        {q.career.map((team, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="bg-black/50 border border-border rounded-lg px-3 py-2 text-center">
              <div className="text-xs font-semibold text-white whitespace-nowrap">{team}</div>
              {q.years[i] ? (
                <div className="text-[9px] text-primary font-medium mt-0.5">{q.years[i]}</div>
              ) : null}
            </div>
            {i < q.career.length - 1 && <div className="text-primary text-base font-bold">→</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FinishingGraph({ q }: { q: GraphQuestion }) {
  const maxPos = Math.max(...q.positions.map((p) => p.pos));
  const chartHeight = 120;

  return (
    <div className="mb-4">
      <div className="text-[11px] text-muted-foreground mb-2">Championship finishing positions by season</div>
      <div className="flex items-end gap-1.5 p-3 bg-secondary/40 rounded-lg overflow-x-auto">
        {q.positions.map((p, i) => {
          const barHeight = Math.max(((maxPos - p.pos + 1) / maxPos) * chartHeight, 8);
          const color = p.pos === 1 ? '#e10600' : p.pos <= 3 ? '#e65100' : '#1565c0';
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-[10px] font-bold" style={{ color }}>
                P{p.pos}
              </div>
              <div
                className="w-7 rounded-t-sm"
                style={{ height: `${barHeight}px`, background: color }}
              />
              <div className="text-[9px] text-muted-foreground">{p.year}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PromptMedia({ q }: { q: Question }) {
  if (q.type === 'career') return <CareerTimeline q={q} />;
  if (q.type === 'graph') return <FinishingGraph q={q} />;

  if (q.type === 'radio' && q.radio) {
    return (
      <div className="mb-4 border-l-4 border-[#e65100] bg-[#e65100]/10 rounded-r-lg px-4 py-3">
        <p className="text-base italic text-white leading-relaxed">{q.radio}</p>
      </div>
    );
  }

  const description = q.type === 'helmet' ? q.helmet
    : q.type === 'moment' ? q.moment
    : q.type === 'livery' ? q.livery
    : q.type === 'sponsor' ? q.sponsor
    : undefined;

  if (description) {
    return (
      <div className="mb-4 bg-secondary/40 border border-border rounded-lg px-4 py-3">
        <p className="text-sm text-foreground/90 leading-relaxed">{description}</p>
      </div>
    );
  }

  return null;
}

export function GeneralQuiz() {
  const [questions] = useState<Question[]>(pickQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);

  const q = questions[currentIdx];
  const meta = TYPE_META[q.type];
  const isLast = currentIdx >= questions.length - 1;

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === q.ans) setScore((s) => s + POINTS_PER_QUESTION);
  };

  const nextQuestion = () => {
    if (!isLast) {
      setCurrentIdx(currentIdx + 1);
      setAnswered(null);
    } else {
      saveScore({ game: 'quiz', label: 'General Quiz', score, total: MAX_SCORE });
      setGameOver(true);
    }
  };

  const handleShare = async () => {
    const text = `I scored ${score}/${MAX_SCORE} on the Pit Lane Fan Zone General Quiz — can you beat me?`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in py-8">
        <Trophy className="w-16 h-16 text-primary" />
        <h2 className="text-4xl font-black">
          {score} / {MAX_SCORE}
        </h2>
        <p className="text-muted-foreground text-center max-w-sm text-lg font-medium">{ratingFor(score)}</p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-4">
          <Button onClick={() => window.location.reload()} size="lg" className="flex-1 font-bold tracking-widest">
            PLAY AGAIN
          </Button>
          <Button onClick={handleShare} size="lg" variant="outline" className="flex-1 font-bold tracking-widest">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
            {copied ? 'COPIED' : 'SHARE'}
          </Button>
        </div>
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
        <Progress value={(currentIdx / questions.length) * 100} className="h-2 rounded-none bg-secondary" />
      </div>

      <div>
        <span
          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="text-xl md:text-2xl font-bold leading-tight">{q.q}</div>

      <PromptMedia q={q} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.opts.map((opt, idx) => {
          let stateClass = 'bg-secondary hover:bg-secondary/80 text-foreground border-transparent';
          if (answered !== null) {
            if (idx === q.ans)
              stateClass =
                'bg-green-600 hover:bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]';
            else if (idx === answered) stateClass = 'bg-red-600 hover:bg-red-600 text-white border-red-500';
            else stateClass = 'bg-secondary/50 text-muted-foreground border-transparent opacity-50';
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
            {!isLast ? 'NEXT QUESTION' : 'FINISH'}
          </Button>
        </div>
      )}
    </div>
  );
}
