import { useEffect, useState } from 'react';
import { Share2, Check, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { saveScore } from '@/lib/scoreHistory';
import { resolveTeamLogo } from '@/lib/teamLogos';
import {
  hasCompletedThisWeek,
  completeWeeklyQuiz,
  getWeeklyStreak,
  getLastScore,
  getNextMondayCountdown,
  type WeeklyCompletion,
} from '@/lib/weeklyQuiz';

type QuestionType =
  | 'standard'
  | 'career'
  | 'graph'
  | 'radio'
  | 'helmet'
  | 'moment'
  | 'livery'
  | 'sponsor';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

type BaseQuestion = {
  q: string;
  opts: string[];
  ans: number;
  fact: string;
  difficulty: Difficulty;
};

type StandardQuestion = BaseQuestion & {
  type: 'standard' | 'radio' | 'helmet' | 'moment' | 'livery' | 'sponsor';
  radio?: string;
  helmet?: string;
  moment?: string;
  livery?: string;
  sponsor?: string;
  image?: string;
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
    difficulty: 'medium',
    fact: 'Räikkönen returned to Sauber in 2019 when the team was rebranded Alfa Romeo, completing a full circle in his career.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Minardi', 'Renault', 'McLaren', 'Renault', 'Ferrari', 'McLaren', 'Alpine', 'Aston Martin'],
    years: ['2001', '2003–06', '2007', '2008–09', '2010–14', '2015', '2021–22', '2023–'],
    opts: ['Michael Schumacher', 'Fernando Alonso', 'Jenson Button', 'Rubens Barrichello'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Alonso is one of the most well travelled drivers in F1 history having raced for 8 different teams across his career.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Jordan', 'Benetton', 'Ferrari', 'Mercedes'],
    years: ['1991', '1991–95', '1996–2006', '2010–12'],
    opts: ['Damon Hill', 'Michael Schumacher', 'Eddie Irvine', 'Rubens Barrichello'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Schumacher won all five of his consecutive titles at Ferrari before a brief retirement and comeback with Mercedes.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['McLaren', 'Mercedes', 'Ferrari'],
    years: ['2007–12', '2013–24', '2025–'],
    opts: ['Nico Rosberg', 'Lewis Hamilton', 'Valtteri Bottas', 'George Russell'],
    ans: 1,
    difficulty: 'easy',
    fact: 'Hamilton shocked the F1 world in 2024 by announcing he would join Ferrari for the 2025 season after 12 years at Mercedes.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Toro Rosso', 'Red Bull'],
    years: ['2015', '2016–'],
    opts: ['Daniel Ricciardo', 'Carlos Sainz', 'Max Verstappen', 'Daniil Kvyat'],
    ans: 2,
    difficulty: 'easy',
    fact: 'Verstappen became the youngest driver to start an F1 race at 17 years and 166 days old with Toro Rosso in 2015.',
  },
  {
    type: 'career',
    q: 'Which driver followed this career path?',
    career: ['Renault', 'McLaren', 'Ferrari', 'Lotus', 'Ferrari', 'Alfa Romeo'],
    years: ['2001', '2002–06', '2007–09', '2010–12', '2014–18', '2019–21'],
    opts: ['Fernando Alonso', 'Kimi Räikkönen', 'Felipe Massa', 'Romain Grosjean'],
    ans: 1,
    difficulty: 'expert',
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
    difficulty: 'medium',
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
    difficulty: 'medium',
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
    difficulty: 'easy',
    fact: 'Verstappen won three consecutive World Championships from 2021 to 2023 and dominated the 2023 season winning 19 of 22 races.',
  },

  // ── TEAM RADIO ───────────────────────────────────────────────
  {
    type: 'radio',
    q: 'Which driver said this on team radio?',
    radio: '"Multi 21 Seb, Multi 21." — and the driver ignored the instruction and overtook his teammate anyway.',
    opts: ['Lewis Hamilton', 'Sebastian Vettel', 'Mark Webber', 'Nico Rosberg'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Multi 21 was a Red Bull coded instruction telling Vettel to hold position behind Webber at the 2013 Malaysian GP. Vettel ignored it and passed Webber to win.',
  },
  {
    type: 'radio',
    q: 'Which driver said this on team radio?',
    radio: '"Leave me alone, I know what I am doing!"',
    opts: ['Fernando Alonso', 'Sebastian Vettel', 'Kimi Räikkönen', 'Max Verstappen'],
    ans: 2,
    difficulty: 'medium',
    fact: 'Räikkönen said this iconic line to his Ferrari engineer at the 2012 Abu Dhabi Grand Prix while managing his tyres on the way to victory.',
  },
  {
    type: 'radio',
    q: 'Which driver said this on team radio?',
    radio: '"Somebody is squeezing me... this is not right. Somebody is doing this on purpose."',
    opts: ['Ayrton Senna', 'Alain Prost', 'Nigel Mansell', 'Nelson Piquet'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Senna said this at the 1990 Japanese Grand Prix shortly before his collision with Prost that handed Senna the World Championship.',
  },
  {
    type: 'radio',
    q: 'Which driver said this on team radio after winning his first World Championship?',
    radio: '"Oh my God. Oh my God. Is this real? Is this real?"',
    opts: ['Jenson Button', 'Sebastian Vettel', 'Lewis Hamilton', 'Kimi Räikkönen'],
    ans: 2,
    difficulty: 'medium',
    fact: 'Hamilton said this after winning his first World Championship at the 2008 Brazilian Grand Prix on the very last corner of the last lap.',
  },
  {
    type: 'radio',
    q: 'Which driver said this on team radio?',
    radio: '"I am not a lion. I am a Ferrari."',
    opts: ['Felipe Massa', 'Kimi Räikkönen', 'Michael Schumacher', 'Eddie Irvine'],
    ans: 1,
    difficulty: 'expert',
    fact: 'Räikkönen made this comment during a 2018 race when his engineer told him to be aggressive like a lion on the restart.',
  },

  // ── HELMET ───────────────────────────────────────────────────
  {
    type: 'helmet',
    q: 'Which driver wears this distinctive helmet design?',
    helmet: 'A bright orange helmet with a red lion motif on the top and Dutch national colours running down the sides. Clean modern design with minimal sponsor logos on the visor strip.',
    opts: ['Max Verstappen', 'Lando Norris', 'Daniel Ricciardo', 'Nyck de Vries'],
    ans: 0,
    difficulty: 'easy',
    fact: 'Verstappen chose orange as his primary colour in tribute to the Dutch national colour and the Dutch motorsport tradition of orange racing.',
  },
  {
    type: 'helmet',
    q: 'Which driver wears this distinctive helmet design?',
    helmet: 'A striking papaya orange and yellow gradient helmet with a tropical sunset design. Features a small cartoon character detail and has become one of the most recognised helmets in the modern paddock.',
    opts: ['George Russell', 'Lando Norris', 'Oscar Piastri', 'Charles Leclerc'],
    ans: 1,
    difficulty: 'easy',
    fact: 'Norris worked with a helmet designer to create his distinctive gradient designs which change slightly each season but always feature warm orange and yellow tones.',
  },
  {
    type: 'helmet',
    q: 'Which legendary driver wore a helmet with this iconic design?',
    helmet: 'A yellow helmet with a distinctive green and blue Brazilian flag inspired design running across the top. Simple, instantly recognisable, and became one of the most iconic helmets in motorsport history.',
    opts: ['Nelson Piquet', 'Rubens Barrichello', 'Ayrton Senna', 'Felipe Massa'],
    ans: 2,
    difficulty: 'medium',
    fact: "Senna's yellow helmet became so iconic that it is now displayed in museums around the world and inspired countless tribute designs by modern drivers.",
  },
  {
    type: 'helmet',
    q: 'Which driver wore this helmet design?',
    helmet: 'A distinctive red and white design with a large number 1 on the back even before he was champion. Clean lines, British flag elements, and a very recognisable visor strip colour.',
    opts: ['Nigel Mansell', 'Damon Hill', 'Jenson Button', 'David Coulthard'],
    ans: 0,
    difficulty: 'hard',
    fact: "Mansell's red and white helmet became famous worldwide when he won the 1992 World Championship with Williams in dominant fashion.",
  },

  // ── FAMOUS MOMENT ────────────────────────────────────────────
  {
    type: 'moment',
    q: 'What happened immediately after this famous F1 moment?',
    moment: "It is the 1994 San Marino Grand Prix at Imola. Ayrton Senna's Williams car exits the Tamburello corner at high speed during the race. The car appears to be going straight.",
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ayrton_Senna_1994_Imola.jpg/320px-Ayrton_Senna_1994_Imola.jpg',
    opts: [
      'Senna pitted immediately for a tyre change',
      'Senna\'s car hit the concrete wall and he sustained fatal injuries',
      'Senna recovered the car and continued racing',
      'Senna retired with a mechanical failure',
    ],
    ans: 1,
    difficulty: 'medium',
    fact: 'Senna\'s death on 1 May 1994 devastated the motorsport world. He remains one of the greatest drivers in F1 history and his loss led to major safety reforms in the sport.',
  },
  {
    type: 'moment',
    q: 'What happened in this famous F1 moment?',
    moment: 'It is the final corner of the final lap of the 2008 Brazilian Grand Prix. Lewis Hamilton is in fifth place and needs to be fourth or higher to win the championship by one point. Timo Glock is ahead of him.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Lewis_Hamilton_2008_Brazil.jpg/320px-Lewis_Hamilton_2008_Brazil.jpg',
    opts: [
      'Hamilton crashed out and lost the championship',
      'Hamilton overtook Glock on the last corner to clinch the championship',
      'Hamilton finished fifth and Felipe Massa won the championship',
      'The race was red flagged and Hamilton was awarded the championship',
    ],
    ans: 1,
    difficulty: 'medium',
    fact: 'Hamilton overtook Glock who was on dry tyres in wet conditions on the very last corner of the season to claim his first World Championship by one single point.',
  },
  {
    type: 'moment',
    q: 'What happened before this famous F1 moment?',
    moment: 'Michael Schumacher is standing on the pit wall at the 2006 Japanese Grand Prix looking devastated as his Ferrari sits stationary on track with smoke coming from the engine.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Michael_Schumacher_2006_Japan.jpg/320px-Michael_Schumacher_2006_Japan.jpg',
    opts: [
      'Schumacher had just crashed into Alonso deliberately',
      'Schumacher\'s engine failed while he was leading the race from pole position',
      'Schumacher had just received a drive through penalty',
      'Schumacher had just been lapped by Alonso',
    ],
    ans: 1,
    difficulty: 'medium',
    fact: 'Schumacher\'s engine failure at Suzuka 2006 while leading effectively ended his title challenge against Alonso with just two races remaining.',
  },
  {
    type: 'moment',
    q: 'What happened in this famous F1 moment?',
    moment: 'It is the start of the 1990 Japanese Grand Prix. Ayrton Senna lines up on pole position but is moved to the dirty side of the grid by the FIA after protesting his grid position.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Senna_Prost_1990_Japan.jpg/320px-Senna_Prost_1990_Japan.jpg',
    opts: [
      'Senna made a perfect start and won the race comfortably',
      'Senna immediately drove into Prost at the first corner handing himself the championship',
      'Senna retired on lap one with a mechanical failure',
      'Senna and Prost had a clean race with Prost winning',
    ],
    ans: 1,
    difficulty: 'hard',
    fact: 'Senna later admitted he deliberately drove into Prost in retaliation for Prost doing the same to him at the same corner in 1989. The collision gave Senna his second World Championship.',
  },

  // ── LIVERY ───────────────────────────────────────────────────
  {
    type: 'livery',
    q: 'Which F1 team raced with this famous car livery?',
    livery: 'A stunning bright yellow car with black detailing. No major tobacco sponsor. Clean and distinctive on the grid. Raced in the late 1990s and became one of the most loved liveries in F1 history.',
    opts: ['Renault', 'Jordan Grand Prix', 'Minardi', 'Arrows'],
    ans: 1,
    difficulty: 'expert',
    fact: "The Jordan 191 and subsequent yellow Jordans became iconic on the F1 grid. Eddie Jordan's team was known for spotting young talent including Michael Schumacher.",
  },
  {
    type: 'livery',
    q: 'Which F1 team raced with this famous car livery?',
    livery: 'Distinctive orange livery covering the entire car. No other colour. Ran in the late 1960s and early 1970s and was the most visually striking car on the grid. Named after a fruit.',
    opts: ['Tyrrell', 'McLaren', 'Lotus', 'BRM'],
    ans: 1,
    difficulty: 'hard',
    fact: 'McLaren ran papaya orange cars in their early years as an independent team. The colour was revived in 2017 when McLaren returned to their heritage colours.',
  },
  {
    type: 'livery',
    q: 'Which F1 team raced with this famous car livery?',
    livery: 'Black and gold car that became one of the most iconic liveries in motorsport history. Sponsored by a cigarette brand. Raced in the 1970s and won multiple World Championships.',
    opts: ['Brabham', 'Tyrrell', 'Lotus', 'Ferrari'],
    ans: 2,
    difficulty: 'medium',
    fact: 'The John Player Special Lotus in black and gold is considered one of the most beautiful F1 liveries ever created. It was driven by legends including Emerson Fittipaldi and Mario Andretti.',
  },

  // ── SPONSOR ──────────────────────────────────────────────────
  {
    type: 'sponsor',
    q: 'Which F1 team was most famously associated with this sponsor?',
    sponsor: 'Marlboro — the red and white chevron design that became one of the most recognisable sponsor logos in motorsport history across three decades.',
    opts: ['Williams', 'Ferrari and McLaren', 'Lotus', 'Brabham'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Marlboro sponsored McLaren from 1974 to 1996 and Ferrari from 1984 to 2011 making it the longest running and most valuable sponsorship in F1 history.',
  },
  {
    type: 'sponsor',
    q: 'Which F1 team was most famously associated with this sponsor?',
    sponsor: 'Rothmans — blue white and gold colour scheme that defined one of the most dominant teams of the 1990s.',
    opts: ['McLaren', 'Benetton', 'Williams', 'Ferrari'],
    ans: 2,
    difficulty: 'hard',
    fact: 'Rothmans Williams dominated F1 in the early 1990s winning four consecutive Constructors Championships from 1992 to 1994 with drivers like Mansell, Prost and Hill.',
  },
  {
    type: 'sponsor',
    q: 'Which F1 team was most famously associated with this sponsor?',
    sponsor: 'West — a cigarette brand whose silver and red livery created one of the most striking car designs of the late 1990s.',
    opts: ['Ferrari', 'McLaren', 'Williams', 'Jordan'],
    ans: 1,
    difficulty: 'expert',
    fact: 'West McLaren Mercedes in silver and red became iconic during the Hakkinen and Coulthard era of the late 1990s and early 2000s.',
  },

  // ── STANDARD TRIVIA ──────────────────────────────────────────
  {
    type: 'standard',
    q: 'Which driver holds the record for the most pole positions in F1 history?',
    opts: ['Michael Schumacher', 'Ayrton Senna', 'Lewis Hamilton', 'Sebastian Vettel'],
    ans: 2,
    difficulty: 'easy',
    fact: 'Hamilton has taken over 100 pole positions in F1, comfortably ahead of Schumacher in second place.',
  },
  {
    type: 'standard',
    q: 'What is the name of the famous tunnel section at the Monaco Grand Prix?',
    opts: ['The Tunnel', 'Portier', 'Casino Square', 'Rascasse'],
    ans: 0,
    difficulty: 'easy',
    fact: 'The Monaco tunnel is one of the most unique features in F1 — drivers go from bright sunlight into near darkness at over 180mph.',
  },
  {
    type: 'standard',
    q: 'Which team did Brawn GP become after being sold in 2009?',
    opts: ['Force India', 'Mercedes', 'Lotus', 'Aston Martin'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Brawn GP won the 2009 championship in their only season before being purchased by Mercedes who turned it into their works F1 team.',
  },
  {
    type: 'standard',
    q: 'What does VSC stand for in Formula 1?',
    opts: ['Variable Speed Control', 'Virtual Safety Car', 'Vehicle Speed Check', 'Velocity Safety Control'],
    ans: 1,
    difficulty: 'medium',
    fact: "The Virtual Safety Car was introduced in 2015 after Jules Bianchi's fatal accident at the 2014 Japanese Grand Prix to slow cars without a physical safety car.",
  },
  {
    type: 'standard',
    q: 'How many constructors compete in Formula 1 in 2026?',
    opts: ['9', '10', '11', '12'],
    ans: 2,
    difficulty: 'easy',
    fact: 'F1 has 11 constructors on the grid for the 2026 season after Cadillac joined as the 11th team, the first new American works constructor in decades.',
  },
  {
    type: 'standard',
    q: 'How many cars start a Formula 1 race in 2026?',
    opts: ['18', '20', '22', '24'],
    ans: 2,
    difficulty: 'easy',
    fact: 'There are now 11 teams on the grid with 2 drivers each making 22 cars in total. Cadillac joined as the 11th constructor bringing new American investment to the sport.',
  },
  {
    type: 'standard',
    q: 'Which circuit hosts the Italian Grand Prix?',
    opts: ['Imola', 'Mugello', 'Monza', 'Pescara'],
    ans: 2,
    difficulty: 'easy',
    fact: 'Monza has hosted the Italian Grand Prix almost every year since 1950 making it one of the most historic venues in F1.',
  },
  {
    type: 'standard',
    q: 'What colour are the Soft tyres in modern F1?',
    opts: ['Yellow', 'White', 'Red', 'Orange'],
    ans: 2,
    difficulty: 'easy',
    fact: 'Pirelli uses red for Soft, yellow for Medium, and white for Hard tyres to make compound identification easy for fans watching on TV.',
  },
  {
    type: 'standard',
    q: 'Which driver won the first ever Formula 1 World Championship in 1950?',
    opts: ['Alberto Ascari', 'Juan Manuel Fangio', 'Giuseppe Farina', 'Luigi Fagioli'],
    ans: 2,
    difficulty: 'expert',
    fact: 'Giuseppe Farina won the inaugural F1 World Championship driving an Alfa Romeo, beating Juan Manuel Fangio who would go on to win five titles.',
  },
  {
    type: 'standard',
    q: 'What is the maximum number of points available in a single F1 race weekend including sprint?',
    opts: ['29', '34', '44', '38'],
    ans: 1,
    difficulty: 'expert',
    fact: 'A sprint race weekend offers 25 for race win plus 1 fastest lap plus 8 for sprint win totalling 34 maximum points in one weekend.',
  },
  {
    type: 'standard',
    q: 'Which F1 team is based in Woking, England?',
    opts: ['Williams', 'Aston Martin', 'McLaren', 'Mercedes'],
    ans: 2,
    difficulty: 'medium',
    fact: 'McLaren Technology Centre in Woking Surrey has been the home of McLaren F1 since 2004 and is considered one of the most impressive facilities in motorsport.',
  },
  {
    type: 'standard',
    q: 'What year was the DRS overtaking aid introduced to Formula 1?',
    opts: ['2009', '2010', '2011', '2013'],
    ans: 2,
    difficulty: 'medium',
    fact: 'DRS was introduced for the 2011 season to help overtaking after the 2010 season was criticised for processional racing with limited on track action.',
  },
  {
    type: 'standard',
    q: 'Which country has produced the most F1 World Champions?',
    opts: ['Germany', 'Brazil', 'United Kingdom', 'France'],
    ans: 2,
    difficulty: 'easy',
    fact: 'The UK has produced more F1 World Champions than any other country including Hamilton, Button, Hill, Clark, Stewart, Mansell and others.',
  },
  {
    type: 'standard',
    q: 'What is the name of the Red Bull junior team in F1?',
    opts: ['Alpha Tauri', 'Toro Rosso', 'Racing Bulls', 'RB F1'],
    ans: 2,
    difficulty: 'hard',
    fact: "The team has gone through several name changes — Minardi, Toro Rosso, AlphaTauri and now Racing Bulls — but has always served as Red Bull's driver development team.",
  },
  {
    type: 'standard',
    q: 'Which Grand Prix was cancelled in 2020 due to the COVID-19 pandemic and replaced by two races at the same venue?',
    opts: ['British Grand Prix', 'Belgian Grand Prix', 'Austrian Grand Prix', 'Spanish Grand Prix'],
    ans: 2,
    difficulty: 'medium',
    fact: 'The Red Bull Ring in Austria hosted two consecutive race weekends in July 2020 when the season was severely disrupted by the pandemic.',
  },
  // ── Additional bank: lap records, team principal history, firsts,
  // retirements, technical regulations, and driver nationality records.
  {
    type: 'standard',
    q: 'Who holds the outright lap record around Monza, F1\'s fastest circuit?',
    opts: ['Rubens Barrichello', 'Lewis Hamilton', 'Kimi Räikkönen', 'Juan Pablo Montoya'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Barrichello\'s 2004 pole lap (264.362 km/h average) remains the fastest average-speed lap in F1 history.',
  },
  {
    type: 'standard',
    q: 'Who was the first driver to win a Grand Prix in a turbocharged engine car?',
    opts: ['Niki Lauda', 'Nelson Piquet', 'René Arnoux', 'Alain Prost'],
    ans: 1,
    difficulty: 'hard',
    fact: 'Piquet won the 1980 United States GP West at Long Beach in a Brabham-BMW turbo — the first turbo victory in F1.',
  },
  {
    type: 'standard',
    q: 'How many races did Michael Schumacher win in the 2002 season, finishing on the podium in every single race?',
    opts: ['9', '10', '11', '12'],
    ans: 2,
    difficulty: 'medium',
    fact: 'Schumacher won 11 of 17 races in 2002 and stood on the podium in all 17 — a record for a single season.',
  },
  {
    type: 'standard',
    q: 'Which team principal led Ferrari to six consecutive constructors\' titles from 1999 to 2004?',
    opts: ['Stefano Domenicali', 'Luca di Montezemolo', 'Jean Todt', 'Ross Brawn'],
    ans: 2,
    difficulty: 'medium',
    fact: 'Jean Todt ran the Scuderia through its dominant Schumacher era before moving to the FIA as president.',
  },
  {
    type: 'standard',
    q: 'Who was the first driver to win the World Championship in a rear-engined car?',
    opts: ['Jack Brabham', 'Phil Hill', 'Stirling Moss', 'Bruce McLaren'],
    ans: 1,
    difficulty: 'hard',
    fact: 'Phil Hill won the 1961 title in a rear-engined Ferrari 156 — the first rear-engined championship car.',
  },
  {
    type: 'standard',
    q: 'Which driver\'s retirement at the 1976 Japanese GP handed James Hunt the title by a single point?',
    opts: ['Niki Lauda', 'Clay Regazzoni', 'Jody Scheckter', 'Mario Andretti'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Lauda withdrew from the rain-soaked Fuji race on safety grounds, allowing Hunt to clinch the title by 1 point.',
  },
  {
    type: 'standard',
    q: 'In what year were DRS zones first introduced to F1?',
    opts: ['2009', '2010', '2011', '2012'],
    ans: 2,
    difficulty: 'medium',
    fact: 'The Drag Reduction System debuted in 2011 to encourage overtaking after the 2010 no-refuelling rules.',
  },
  {
    type: 'standard',
    q: 'Who was the first Japanese driver to score a Formula 1 podium?',
    opts: ['Takuma Sato', 'Aguri Suzuki', 'Kamui Kobayashi', 'Ukyo Katayama'],
    ans: 1,
    difficulty: 'hard',
    fact: 'Aguri Suzuki finished third at the 1990 Japanese GP for Larrousse — the first Japanese driver on an F1 podium.',
  },
  {
    type: 'standard',
    q: 'Which Grand Prix saw the infamous 2005 United States GP where only six cars started due to tyre safety concerns?',
    opts: ['Detroit', 'Phoenix', 'Indianapolis', 'Watkins Glen'],
    ans: 2,
    difficulty: 'medium',
    fact: 'After Ralf Schumacher\'s crash in practice, the Michelin-shod cars withdrew on the formation lap at Indianapolis.',
  },
  {
    type: 'standard',
    q: 'Who holds the record for the most consecutive race wins in a single season?',
    opts: ['Sebastian Vettel', 'Max Verstappen', 'Nico Rosberg', 'Alberto Ascari'],
    ans: 1,
    difficulty: 'easy',
    fact: 'Max Verstappen won 10 consecutive races across 2023, breaking Sebastian Vettel\'s previous record of 9.',
  },
  {
    type: 'standard',
    q: 'Which driver\'s DNF at the 1994 Australian GP cost him the title in his debut season?',
    opts: ['Damon Hill', 'Rubens Barrichello', 'Mika Häkkinen', 'Jean Alesi'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Hill retired from the season finale in Adelaide, handing the 1994 title to Michael Schumacher by a single point.',
  },
  {
    type: 'standard',
    q: 'When were refuelling stops banned in F1 (before their brief 2010-2024 absence)?',
    opts: ['1983', '1994', '2009', 'They were never banned'],
    ans: 2,
    difficulty: 'hard',
    fact: 'Refuelling was banned from 2010 on safety grounds, returning only as a never-implemented proposal in later years.',
  },
  {
    type: 'standard',
    q: 'Who was the first driver from New Zealand to win a Formula 1 race?',
    opts: ['Denny Hulme', 'Bruce McLaren', 'Chris Amon', 'Mike Thackwell'],
    ans: 1,
    difficulty: 'expert',
    fact: 'Bruce McLaren won the 1959 United States GP — the first New Zealander to win an F1 race, before founding his eponymous team.',
  },
  {
    type: 'standard',
    q: 'Which race incident led to the introduction of the halo cockpit protection device in 2018?',
    opts: ['Jules Bianchi\'s 2014 crash', 'Felipe Massa\'s 2009 spring strike', 'Ayrton Senna\'s 1994 crash', 'Both Bianchi and Massa incidents'],
    ans: 3,
    difficulty: 'hard',
    fact: 'Bianchi\'s fatal 2014 Suzuka crash drove the halo\'s adoption; Massa\'s 2009 spring injury had earlier highlighted cockpit vulnerability.',
  },
  {
    type: 'standard',
    q: 'Who was the first driver to win a race for Williams in the team\'s debut 1977 season?',
    opts: ['Alan Jones', 'Clay Regazzoni', 'Carlos Reutemann', 'Keke Rosberg'],
    ans: 1,
    difficulty: 'expert',
    fact: 'Clay Regazzoni won the 1979 British GP — Williams\' first victory, at Silverstone.',
  },
  {
    type: 'standard',
    q: 'Which driver was the first to be disqualified from a race for using a "double diffuser" concept later ruled legal?',
    opts: ['Jenson Button', 'Rubens Barrichello', 'No one — it was legal from the start', 'Sebastian Vettel'],
    ans: 2,
    difficulty: 'hard',
    fact: 'Brawn GP\'s double diffuser was protested but ruled legal in 2009 — no driver was ever disqualified for it.',
  },
  {
    type: 'standard',
    q: 'Who is the only driver to win the Indianapolis 500, F1 World Championship, and the Le Mans 24 Hours?',
    opts: ['A.J. Foyt', 'Graham Hill', 'Mario Andretti', 'Bruce McLaren'],
    ans: 1,
    difficulty: 'hard',
    fact: 'Graham Hill completed the unofficial "Triple Crown of Motorsport" across his career — the only driver to do all three.',
  },
  {
    type: 'standard',
    q: 'Which race saw the first ever points-scoring finish for a Chinese driver in F1?',
    opts: ['2008 Chinese GP', '2013 Chinese GP', '2021 Saudi Arabian GP', 'No Chinese driver has scored points'],
    ans: 3,
    difficulty: 'expert',
    fact: 'As of the 2026 season, no Chinese driver has scored an F1 championship point; Zhou Guanyu raced without scoring.',
  },
  {
    type: 'standard',
    q: 'When were points for fastest lap reintroduced to F1, before being dropped again in 2025?',
    opts: ['2018', '2019', '2020', '2021'],
    ans: 1,
    difficulty: 'medium',
    fact: 'The fastest-lap point returned in 2019 (for top-10 finishers) and was abolished mid-2024 after team-order controversies.',
  },
  {
    type: 'standard',
    q: 'Which team principal famously led Benetton to titles before moving to Ferrari and then founding his own title-winning team?',
    opts: ['Flavio Briatore', 'Ross Brawn', 'Rory Byrne', 'Pat Symonds'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Ross Brawn was technical director at Benetton and Ferrari, then led Brawn GP to both 2009 titles in its only season.',
  },
  {
    type: 'standard',
    q: 'Which driver won the inaugural Formula 1 World Championship race at Silverstone in 1950?',
    opts: ['Juan Manuel Fangio', 'Nino Farina', 'Luigi Fagioli', 'Reg Parnell'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Giuseppe "Nino" Farina won the very first World Championship race at Silverstone on 13 May 1950, driving an Alfa Romeo 158.',
  },
  {
    type: 'standard',
    q: 'Which circuit has hosted the most Formula 1 Grands Prix as of 2026?',
    opts: ['Monza', 'Monaco', 'Silverstone', 'Spa-Francorchamps'],
    ans: 0,
    difficulty: 'easy',
    fact: 'Monza has hosted the Italian Grand Prix every year since 1950 except 1980, making it the most-visited circuit on the calendar.',
  },
  {
    type: 'standard',
    q: 'What is the maximum race distance allowed in Formula 1, excluding suspensions?',
    opts: ['200 km', '305 km', '350 km', '400 km'],
    ans: 1,
    difficulty: 'medium',
    fact: 'The FIA Sporting Regulations cap race distance at 305 km, with a two-hour time limit and a three-hour overall window including suspensions.',
  },
  {
    type: 'standard',
    q: 'Which tyre manufacturer was the sole supplier in Formula 1 from 2011 to 2026?',
    opts: ['Bridgestone', 'Michelin', 'Pirelli', 'Goodyear'],
    ans: 2,
    difficulty: 'easy',
    fact: 'Pirelli became the single tyre supplier in 2011 after Bridgestone withdrew at the end of 2010.',
  },
  {
    type: 'standard',
    q: 'Which compound is the softest in Pirelli\'s 2026 dry-weather range?',
    opts: ['Hard (C1)', 'Medium (C2)', 'Soft (C3)', 'Supersoft (C5)'],
    ans: 3,
    difficulty: 'medium',
    fact: 'Pirelli\'s 2026 range runs from C1 (hardest) to C5 (softest); three compounds are nominated per weekend.',
  },
  {
    type: 'standard',
    q: 'What does "graining" refer to in Formula 1 tyre terminology?',
    opts: ['Tyre overheating', 'Rubber tearing into grain-like strips', 'Tyre pressure loss', 'Tyre blistering'],
    ans: 1,
    difficulty: 'hard',
    fact: 'Graining occurs when the tyre surface tears into fine strips that re-adhere, usually under heavy cornering on a cold or overworked surface.',
  },
  {
    type: 'standard',
    q: 'What does "blistering" refer to in Formula 1 tyre terminology?',
    opts: ['Surface rubber lifting into bubbles', 'Tyre wear down to the canvas', 'Puncture from debris', 'Thermal degradation only'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Blistering occurs when the carcass overheats and trapped gases lift the surface rubber into bubbles that can detach.',
  },
  {
    type: 'standard',
    q: 'Which engine supplier returned to Formula 1 in 2026 with a works partnership alongside Cadillac?',
    opts: ['Honda', 'Renault', 'Ford', 'Audi'],
    ans: 3,
    difficulty: 'medium',
    fact: 'Audi entered Formula 1 in 2026 as a full works power unit manufacturer, partnering with the Cadillac-branded team.',
  },
  {
    type: 'standard',
    q: 'Which engine supplier powered Max Verstappen to all four of his world championships between 2021 and 2024?',
    opts: ['Renault', 'Ferrari', 'Honda', 'Mercedes'],
    ans: 2,
    difficulty: 'easy',
    fact: 'Honda\'s power unit propelled Verstappen to the 2021-2024 titles, initially badged as Honda then as RBPT after 2022.',
  },
  {
    type: 'standard',
    q: 'Which team used Renault engines from 2016 to 2025 before switching to Mercedes for 2026?',
    opts: ['Red Bull Racing', 'McLaren', 'Williams', 'Aston Martin'],
    ans: 1,
    difficulty: 'medium',
    fact: 'McLaren raced with Renault power from 2016 before switching to Mercedes power units in 2026.',
  },
  {
    type: 'standard',
    q: 'Which driver scored the first-ever pole position for Toro Rosso at the 2008 Italian Grand Prix?',
    opts: ['Sebastian Vettel', 'Sebastien Bourdais', 'Jaime Alguersuari', 'Daniel Ricciardo'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Sebastian Vettel took pole and won at a wet Monza in 2008, giving Toro Rosso its first and only pole and victory.',
  },
  {
    type: 'standard',
    q: 'Which driver scored Stewart Grand Prix\'s only victory at the 1999 European Grand Prix?',
    opts: ['Rubens Barrichello', 'Johnny Herbert', 'Jan Magnussen', 'Jos Verstappen'],
    ans: 1,
    difficulty: 'hard',
    fact: 'Johnny Herbert won the 1999 European GP at the Nürburgring, the sole win for the Stewart team before it became Jaguar and then Red Bull.',
  },
  {
    type: 'standard',
    q: 'Which driver scored Jaguar Racing\'s only podium finish at the 2002 Malaysian Grand Prix?',
    opts: ['Eddie Irvine', 'Pedro de la Rosa', 'Mark Webber', 'Luciano Burti'],
    ans: 0,
    difficulty: 'expert',
    fact: 'Eddie Irvine finished third at Sepang in 2002, scoring Jaguar Racing\'s only podium in its five-year history.',
  },
  {
    type: 'standard',
    q: 'Which team won the constructors\' championship in its debut season under the name "Brawn GP"?',
    opts: ['Toyota', 'Brawn GP', 'Red Bull Racing', 'McLaren'],
    ans: 1,
    difficulty: 'easy',
    fact: 'Brawn GP won both titles in 2009, the only team to win the constructors\' championship in its debut season.',
  },
  {
    type: 'standard',
    q: 'Which team holds the record for most consecutive constructors\' championships with 8 titles from 2010 to 2017?',
    opts: ['Ferrari', 'McLaren', 'Red Bull Racing', 'Mercedes'],
    ans: 3,
    difficulty: 'easy',
    fact: 'Mercedes won 8 straight constructors\' titles from 2010 to 2017, a record streak for the sport.',
  },
  {
    type: 'standard',
    q: 'Which driver holds the record for most pole positions in a single season with 15 in 2016?',
    opts: ['Ayrton Senna', 'Nigel Mansell', 'Lewis Hamilton', 'Sebastian Vettel'],
    ans: 2,
    difficulty: 'medium',
    fact: 'Lewis Hamilton took 15 pole positions in 2016, breaking the previous record of 14 set by Nigel Mansell in 1992.',
  },
  {
    type: 'standard',
    q: 'Which driver holds the record for most wins in a single season with 19 in 2023?',
    opts: ['Sebastian Vettel', 'Michael Schumacher', 'Max Verstappen', 'Lewis Hamilton'],
    ans: 2,
    difficulty: 'easy',
    fact: 'Max Verstappen won 19 of 22 races in 2023, breaking the previous record of 13 held jointly by Schumacher and Vettel.',
  },
  {
    type: 'standard',
    q: 'Which driver holds the record for most podium finishes in a single season with 21 in 2023?',
    opts: ['Lewis Hamilton', 'Max Verstappen', 'Michael Schumacher', 'Sebastian Vettel'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Max Verstappen finished on the podium 21 times in 2023, breaking the record of 17 he had shared with Hamilton and Schumacher.',
  },
  {
    type: 'standard',
    q: 'Which driver scored the 100th win of his career at the 2021 Russian Grand Prix?',
    opts: ['Lewis Hamilton', 'Sebastian Vettel', 'Max Verstappen', 'Fernando Alonso'],
    ans: 0,
    difficulty: 'easy',
    fact: 'Lewis Hamilton took his 100th Grand Prix victory at Sochi in 2021, becoming the first driver to reach triple figures.',
  },
  {
    type: 'standard',
    q: 'Which circuit features the famous "Wall of Champions" corner that has caught out many title contenders?',
    opts: ['Monaco', 'Montréal', 'Baku', 'Singapore'],
    ans: 1,
    difficulty: 'medium',
    fact: 'The Wall of Champions at the final chicane of the Circuit Gilles Villeneuve in Montréal famously ended the races of Hill, Schumacher and Villeneuve in 1999.',
  },
  {
    type: 'standard',
    q: 'Which corner at Monaco is the slowest tightest turn on the track?',
    opts: ['Casino Square', 'Loews Hairpin', 'Grand Hotel Hairpin', 'Fairmont Hairpin'],
    ans: 1,
    difficulty: 'medium',
    fact: 'The Loews Hairpin (also called the Grand Hotel Hairpin) is the slowest corner in Formula 1, taken at around 50 km/h.',
  },
  {
    type: 'standard',
    q: 'Which circuit features the longest flat-out section in Formula 1?',
    opts: ['Monza', 'Spa-Francorchamps', 'Baku', 'Jeddah'],
    ans: 2,
    difficulty: 'medium',
    fact: 'The Baku City Circuit\'s 2.2 km start-finish straight is the longest flat-out section on the F1 calendar.',
  },
  {
    type: 'standard',
    q: 'Which circuit features the legendary Eau Rouge-Raidillon complex of corners?',
    opts: ['Suzuka', 'Spa-Francorchamps', 'Silverstone', 'Hungaroring'],
    ans: 1,
    difficulty: 'easy',
    fact: 'Eau Rouge-Raidillon at Spa-Francorchamps is a steeply banked uphill sweeping complex taken flat-out in the dry.',
  },
  {
    type: 'standard',
    q: 'Which circuit features the "S-Curves" that test driver precision through a flowing sequence of bends?',
    opts: ['Suzuka', 'Imola', 'Monaco', 'Zandvoort'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Suzuka\'s S-Curves form a fast, flowing ess-bend sequence right after the first corner, rewarding a well-balanced car.',
  },
  {
    type: 'standard',
    q: 'Which circuit is famous for its "130R" corner, one of the fastest in Formula 1?',
    opts: ['Suzuka', 'Monza', 'Spa-Francorchamps', 'Silverstone'],
    ans: 0,
    difficulty: 'hard',
    fact: 'The 130R at Suzuka is a sweeping left-hander historically taken flat-out, named after its 130-metre radius.',
  },
  {
    type: 'standard',
    q: 'What is the purpose of the Virtual Safety Car (VSC) introduced in 2015?',
    opts: ['To neutralise the race without a full safety car', 'To penalise drivers', 'To stop the race', 'To reset the grid'],
    ans: 0,
    difficulty: 'medium',
    fact: 'The VSC forces drivers to slow to a delta time, neutralising the race for clearances without deploying a physical safety car.',
  },
  {
    type: 'standard',
    q: 'How many points are awarded to the winner of a Grand Prix under the current points system?',
    opts: ['10', '25', '26', '50'],
    ans: 1,
    difficulty: 'easy',
    fact: 'The winner receives 25 points, with 18 for second and 15 for third, under the system introduced in 2010.',
  },
  {
    type: 'standard',
    q: 'How many points were awarded for the fastest lap under the 2019-2024 rule (if finishing in the top 10)?',
    opts: ['0', '1', '2', '5'],
    ans: 1,
    difficulty: 'easy',
    fact: 'From 2019 to mid-2024, one bonus point was awarded for the fastest lap, but only if the driver finished in the top 10.',
  },
  {
    type: 'standard',
    q: 'What is the maximum number of power unit components allowed per driver per season before grid penalties apply (2026 rules)?',
    opts: ['2', '3', '4', '5'],
    ans: 2,
    difficulty: 'hard',
    fact: 'Drivers are limited to 4 of each power unit component per season; exceeding this triggers grid penalties.',
  },
  {
    type: 'standard',
    q: 'What is the purpose of the Drag Reduction System (DRS)?',
    opts: ['To improve braking', 'To reduce drag and aid overtaking', 'To increase downforce', 'To save fuel'],
    ans: 1,
    difficulty: 'easy',
    fact: 'DRS opens the rear wing flap to reduce drag, allowing a following car to overtake more easily in designated zones.',
  },
  {
    type: 'standard',
    q: 'How many DRS zones are typically available at most circuits on the 2026 calendar?',
    opts: ['1', '2', '3', '4'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Most circuits feature two DRS zones, though some like Bahrain and Albert Park have three.',
  },
  {
    type: 'standard',
    q: 'What is the standard pit lane speed limit during a race?',
    opts: ['60 km/h', '80 km/h', '100 km/h', '120 km/h'],
    ans: 1,
    difficulty: 'easy',
    fact: 'The standard pit lane speed limit is 80 km/h during races, though some circuits like Monaco use 60 km/h.',
  },
  {
    type: 'standard',
    q: 'What happens if a driver exceeds the pit lane speed limit?',
    opts: ['A reprimand', 'A 5-second time penalty', 'A drive-through penalty', 'A grid drop'],
    ans: 1,
    difficulty: 'medium',
    fact: 'Exceeding the pit lane speed limit typically results in a 5-second time penalty added to the driver\'s race time.',
  },
  {
    type: 'standard',
    q: 'What does "undercut" mean in Formula 1 strategy?',
    opts: ['Pitting after a rival to overtake on fresh tyres', 'Pitting before a rival to gain track position', 'Skipping a pit stop', 'Pitting during a safety car'],
    ans: 1,
    difficulty: 'hard',
    fact: 'The undercut involves pitting before a rival to use fresh-tyre pace to gain track position before they stop.',
  },
  {
    type: 'standard',
    q: 'What does "overcut" mean in Formula 1 strategy?',
    opts: ['Pitting after a rival to overtake on fresher tyres', 'Pitting before a rival', 'Staying out longer than a rival to gain track position', 'Skipping a pit stop entirely'],
    ans: 2,
    difficulty: 'hard',
    fact: 'The overcut keeps a driver out longer than a rival, banking track position while the rival is on fresh but cold tyres.',
  },
  {
    type: 'standard',
    q: 'What is the fastest recorded pit stop time in Formula 1 history?',
    opts: ['1.82 seconds', '1.91 seconds', '2.31 seconds', '1.95 seconds'],
    ans: 1,
    difficulty: 'expert',
    fact: 'Red Bull Racing recorded a 1.91-second stop for Max Verstappen at the 2023 Saudi Arabian Grand Prix, the fastest verified time.',
  },
  {
    type: 'standard',
    q: 'How many crew members are typically involved in a Formula 1 pit stop?',
    opts: ['12', '18', '20', '24'],
    ans: 2,
    difficulty: 'medium',
    fact: 'A standard F1 pit stop involves around 20 crew members: wheel gunners, jack operators, and support roles.',
  },
  {
    type: 'standard',
    q: 'What does "graining" refer to in Formula 1 tyre terminology?',
    opts: ['Tyre overheating', 'Rubber tearing into grain-like strips', 'Tyre pressure loss', 'Tyre blistering'],
    ans: 1,
    difficulty: 'hard',
    fact: 'Graining occurs when the tyre surface tears into fine strips that re-adhere, usually under heavy cornering on a cold or overworked surface.',
  },
  {
    type: 'standard',
    q: 'What does "blistering" refer to in Formula 1 tyre terminology?',
    opts: ['Surface rubber lifting into bubbles', 'Tyre wear down to the canvas', 'Puncture from debris', 'Thermal degradation only'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Blistering occurs when the carcass overheats and trapped gases lift the surface rubber into bubbles that can detach.',
  },
  {
    type: 'standard',
    q: 'Which tyre manufacturer was the sole supplier in Formula 1 from 2011 to 2026?',
    opts: ['Bridgestone', 'Michelin', 'Pirelli', 'Goodyear'],
    ans: 2,
    difficulty: 'easy',
    fact: 'Pirelli became the single tyre supplier in 2011 after Bridgestone withdrew at the end of 2010.',
  },
  // ── BATCH_INSERT_MARKER ──
  {
    type: 'standard',
    q: 'Which driver famously overtook 12 cars on the first lap of the 1993 European Grand Prix at Donington Park?',
    opts: ['Ayrton Senna', 'Alain Prost', 'Damon Hill', 'Michael Schumacher'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Ayrton Senna went from 5th to 1st in one lap at Donington in 1993, passing cars including Schumacher, Wendlinger, Hill and Prost.',
  },
  {
    type: 'standard',
    q: 'Which drivers were involved in the famous "Multi 21" team orders incident at the 2013 Malaysian Grand Prix?',
    opts: ['Sebastian Vettel and Mark Webber', 'Fernando Alonso and Felipe Massa', 'Lewis Hamilton and Nico Rosberg', 'Max Verstappen and Sergio Pérez'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Sebastian Vettel ignored Red Bull\'s "Multi 21" instruction and passed teammate Mark Webber for the lead at Sepang.',
  },
  {
    type: 'standard',
    q: 'Which driver won the 2008 Brazilian Grand Prix by overtaking Timo Glock on the final lap to clinch the title?',
    opts: ['Felipe Massa', 'Lewis Hamilton', 'Kimi Räikkönen', 'Fernando Alonso'],
    ans: 1,
    difficulty: 'easy',
    fact: 'Lewis Hamilton passed Toyota\'s Timo Glock on the last corner of the last lap at Interlagos to secure the 2008 title by one point.',
  },
  {
    type: 'standard',
    q: 'Which driver scored Jordan Grand Prix\'s first-ever win at the 1998 Belgian Grand Prix in chaotic conditions?',
    opts: ['Damon Hill', 'Ralf Schumacher', 'Heinz-Harald Frentzen', 'Giancarlo Fisichella'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Damon Hill won the rain-soaked 1998 Belgian GP at Spa, giving Eddie Jordan\'s team its maiden Formula 1 victory.',
  },
  {
    type: 'standard',
    q: 'Which driver won his only race at the 1996 Monaco Grand Prix in torrential conditions where only 3 cars finished?',
    opts: ['Olivier Panis', 'Eddie Irvine', 'Mika Salo', 'Giancarlo Fisichella'],
    ans: 0,
    difficulty: 'expert',
    fact: 'Olivier Panis won the chaotic 1996 Monaco GP for Ligier — the only win of his career and Ligier\'s last victory.',
  },
  {
    type: 'standard',
    q: 'Which driver retired from the lead of the 1988 Monaco Grand Prix with a lap-and-a-half to go?',
    opts: ['Ayrton Senna', 'Alain Prost', 'Nelson Piquet', 'Michele Alboreto'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Ayrton Senna crashed out of the lead at Portier in 1988, handing victory to teammate Alain Prost.',
  },
  {
    type: 'standard',
    q: 'Which driver retired from the lead of the 2006 Hungarian Grand Prix after a late-race downpour?',
    opts: ['Kimi Räikkönen', 'Fernando Alonso', 'Michael Schumacher', 'Jenson Button'],
    ans: 1,
    difficulty: 'hard',
    fact: 'Fernando Alonso retired from the lead at the Hungaroring in 2006 after a wheel nut failure following a late tyre stop for wets.',
  },
  {
    type: 'standard',
    q: 'Which driver scored the first win for Renault as a constructor since 2006 at the 2020 Eifel Grand Prix?',
    opts: ['Daniel Ricciardo', 'Esteban Ocon', 'Fernando Alonso', 'Nico Hülkenberg'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Daniel Ricciardo won the 2020 Eifel GP at the Nürburgring, giving Renault its first win as a constructor since 2006.',
  },
  {
    type: 'standard',
    q: 'Which driver scored the first win for the Mercedes works team since its 2010 return at the 2012 Chinese Grand Prix?',
    opts: ['Nico Rosberg', 'Michael Schumacher', 'Lewis Hamilton', 'Valtteri Bottas'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Nico Rosberg won the 2012 Chinese GP, Mercedes\' first victory since Juan Manuel Fangio in 1955.',
  },
  {
    type: 'standard',
    q: 'Which driver won his first race at the 2006 Hungarian Grand Prix in his 113th attempt?',
    opts: ['Jenson Button', 'Rubens Barrichello', 'Giancarlo Fisichella', 'Mark Webber'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Jenson Button won his first Grand Prix at the 2006 Hungarian GP after 113 starts, in a Honda RA106.',
  },
  {
    type: 'standard',
    q: 'Which driver won his first race at the 2020 Sakhir Grand Prix after 190 starts, the longest wait for a first win at the time?',
    opts: ['Sergio Pérez', 'Esteban Ocon', 'Lance Stroll', 'Sebastian Vettel'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Sergio Pérez won his first Grand Prix at the 2020 Sakhir GP after 190 starts, driving for Racing Point.',
  },
  {
    type: 'standard',
    q: 'Which driver scored Williams\' last victory to date at the 2012 Spanish Grand Prix?',
    opts: ['Pastor Maldonado', 'Rubens Barrichello', 'Bruno Senna', 'Valtteri Bottas'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Pastor Maldonado won the 2012 Spanish GP at Barcelona — Williams\' most recent victory as of 2026.',
  },
  {
    type: 'standard',
    q: 'Which driver scored McLaren\'s first win since 2012 at the 2024 Miami Grand Prix?',
    opts: ['Lando Norris', 'Oscar Piastri', 'Daniel Ricciardo', 'Carlos Sainz'],
    ans: 0,
    difficulty: 'easy',
    fact: 'Lando Norris won the 2024 Miami GP, his first victory and McLaren\'s first since Jenson Button at Brazil 2012.',
  },
  {
    type: 'standard',
    q: 'Which driver scored Ferrari\'s first win of the hybrid era at the 2015 Malaysian Grand Prix?',
    opts: ['Sebastian Vettel', 'Kimi Räikkönen', 'Fernando Alonso', 'Charles Leclerc'],
    ans: 0,
    difficulty: 'medium',
    fact: 'Sebastian Vettel won the 2015 Malaysian GP at Sepang, Ferrari\'s first victory of the V6 turbo-hybrid era.',
  },
  {
    type: 'standard',
    q: 'Which driver scored Ferrari\'s first win at Monaco since 2001 by winning the 2017 Monaco Grand Prix?',
    opts: ['Kimi Räikkönen', 'Sebastian Vettel', 'Charles Leclerc', 'Fernando Alonso'],
    ans: 0,
    difficulty: 'hard',
    fact: 'Kimi Räikkönen won the 2017 Monaco GP, ending Ferrari\'s 16-year victory drought in the Principality.',
  },
  {
    type: 'standard',
    q: 'Which driver scored Charles Leclerc\'s first career win at the 2019 Belgian Grand Prix?',
    opts: ['Charles Leclerc', 'Max Verstappen', 'Lewis Hamilton', 'Sebastian Vettel'],
    ans: 0,
    difficulty: 'easy',
    fact: 'Charles Leclerc won the 2019 Belgian GP at Spa, his first Formula 1 victory, a day after the death of friend Anthoine Hubert.',
  },
  {
    type: 'standard',
    q: 'Which driver scored Max Verstappen\'s first career win at the 2016 Spanish Grand Prix?',
    opts: ['Max Verstappen', 'Daniel Ricciardo', 'Lewis Hamilton', 'Kimi Räikkönen'],
    ans: 0,
    difficulty: 'easy',
    fact: 'Max Verstappen won the 2016 Spanish GP at Barcelona in his Red Bull debut, becoming the youngest ever Grand Prix winner at 18.',
  },
  {
    type: 'standard',
    q: 'Which driver became the youngest World Champion in Formula 1 history by clinching the 2010 title at 23?',
    opts: ['Sebastian Vettel', 'Lewis Hamilton', 'Fernando Alonso', 'Max Verstappen'],
    ans: 0,
    difficulty: 'easy',
    fact: 'Sebastian Vettel became the youngest World Champion in 2010 at 23 years and 134 days, a record that still stands.',
  },
  {
    type: 'standard',
    q: 'Which driver became the youngest Grand Prix winner in Formula 1 history at the 2016 Spanish Grand Prix?',
    opts: ['Max Verstappen', 'Sebastian Vettel', 'Charles Leclerc', 'Lando Norris'],
    ans: 0,
    difficulty: 'easy',
    fact: 'Max Verstappen won on his Red Bull debut at 18 years and 228 days, the youngest ever winner — a record that still stands.',
  },
  {
    type: 'standard',
    q: 'Which country has produced the most Formula 1 World Champions?',
    opts: ['Brazil', 'Germany', 'United Kingdom', 'Argentina'],
    ans: 2,
    difficulty: 'medium',
    fact: 'The UK has produced the most World Champions of any nation, including Hamilton, Stewart, Hunt, Mansell, Button and Clark.',
  },
  // ── BATCH_INSERT_MARKER ──
// Season: 2026 F1 World Championship
// Grid: 11 teams, 22 drivers

// Best-effort real images for spotlight questions. Keyed by the correct answer
// (driver for helmets, team for liveries). Many of these are external URLs that
// may not always resolve — QuizImage hides itself on error so the descriptive
// text below always remains as a graceful fallback.
const HELMET_IMAGES: Record<string, string> = {
  'Max Verstappen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Max_Verstappen_2022_helmet.png/200px-Max_Verstappen_2022_helmet.png',
  'Lewis Hamilton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Lewis_Hamilton_2020_helmet.png/200px-Lewis_Hamilton_2020_helmet.png',
  'Ayrton Senna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ayrton_Senna_helmet.svg/200px-Ayrton_Senna_helmet.svg.png',
  'Lando Norris': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lando_Norris_2023_helmet.png/200px-Lando_Norris_2023_helmet.png',
  'Charles Leclerc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Charles_Leclerc_2023_helmet.png/200px-Charles_Leclerc_2023_helmet.png',
  'Sebastian Vettel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sebastian_Vettel_helmet_2013.png/200px-Sebastian_Vettel_helmet_2013.png',
  'Nigel Mansell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Nigel_Mansell_helmet.png/200px-Nigel_Mansell_helmet.png',
  'Michael Schumacher': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Michael_Schumacher_helmet.png/200px-Michael_Schumacher_helmet.png',
};

const LIVERY_IMAGES: Record<string, string> = {
  'Jordan Grand Prix': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jordan_191_-_1991_Formula_One_season.jpg/320px-Jordan_191_-_1991_Formula_One_season.jpg',
  Lotus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lotus_72_1970.jpg/320px-Lotus_72_1970.jpg',
};

function imageForQuestion(q: Question): string | null {
  if (q.type === 'helmet') return HELMET_IMAGES[q.opts[q.ans]] ?? null;
  if (q.type === 'livery') return LIVERY_IMAGES[q.opts[q.ans]] ?? null;
  if (q.type === 'moment') return q.image ?? null;
  return null;
}

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

// Deterministic weekly question selection.
//
// The quiz rotates to a new set of 10 questions every Monday at midnight and
// every user who plays in a given week sees the exact same 10 questions in the
// exact same order. We derive a stable week key from the current date and use
// it to seed a hash-based PRNG, which deterministically shuffles the bank. The
// same week key always yields the same selection and order.

function getWeekNumber(now: Date = new Date()): string {
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  return `${now.getFullYear()}-W${weekNumber}`;
}

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return function () {
    hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
    hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
    hash = hash ^ (hash >>> 16);
    return (hash >>> 0) / 0xffffffff;
  };
}

// Difficulty curve: a 10-question quiz ramps from easy to expert —
// 3 easy, 3 medium, 3 hard, then 1 expert finisher, presented in that order.
const DIFFICULTY_PLAN: { tier: Difficulty; count: number }[] = [
  { tier: 'easy', count: 3 },
  { tier: 'medium', count: 3 },
  { tier: 'hard', count: 3 },
  { tier: 'expert', count: 1 },
];

function pickQuestions(): Question[] {
  const rng = seededRandom(getWeekNumber());

  // Deterministic shuffle of the full bank — same seed ⇒ same order.
  const shuffledBank = [...BANK]
    .map((q) => ({ q, sort: rng() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.q);

  const picked: Question[] = [];
  for (const { tier, count } of DIFFICULTY_PLAN) {
    const pool = shuffledBank.filter((q) => q.difficulty === tier && !picked.includes(q));
    picked.push(...pool.slice(0, count));
  }

  // Backfill from the remaining shuffled bank if any tier was short, keeping the
  // easy→expert ordering by difficulty rank.
  if (picked.length < TOTAL_QUESTIONS) {
    const rest = shuffledBank.filter((q) => !picked.includes(q));
    for (const q of rest) {
      if (picked.length >= TOTAL_QUESTIONS) break;
      picked.push(q);
    }
  }

  const rank: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2, expert: 3 };
  return picked
    .slice(0, TOTAL_QUESTIONS)
    .sort((a, b) => rank[a.difficulty] - rank[b.difficulty]);
}

function ratingFor(score: number): string {
  if (score >= 90) return 'F1 Encyclopaedia — you know everything 🏆';
  if (score >= 70) return 'Serious fan — you have done your homework 👍';
  if (score >= 50) return 'Casual viewer — keep watching the races 📺';
  return 'Are you sure you watch F1? 😅';
}

function QuizImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  // Reset failure state when the source changes so a single broken image in one
  // question never suppresses valid images in later questions (same instance is
  // reused across the quiz).
  useEffect(() => setFailed(false), [src]);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function CareerTimeline({ q }: { q: CareerQuestion }) {
  return (
    <div className="overflow-x-auto pb-2 mb-4">
      <div className="flex items-center gap-1.5 min-w-max">
        {q.career.map((team, i) => {
          const logo = resolveTeamLogo(team);
          return (
            <div key={i} className="flex items-center gap-1.5">
              <div className="bg-black/50 border border-border rounded-lg px-3 py-2 text-center min-w-[64px]">
                {logo ? (
                  <QuizImage src={logo} alt={team} className="h-5 w-auto object-contain mx-auto mb-1" />
                ) : null}
                <div className="text-xs font-semibold text-white whitespace-nowrap">{team}</div>
                {q.years[i] ? (
                  <div className="text-[9px] text-primary font-medium mt-0.5">{q.years[i]}</div>
                ) : null}
              </div>
              {i < q.career.length - 1 && <div className="text-primary text-base font-bold">→</div>}
            </div>
          );
        })}
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

  const imageSrc = imageForQuestion(q);

  if (imageSrc || description) {
    return (
      <div className="mb-4 space-y-2">
        {imageSrc && (
          <div className="bg-black/40 border border-border rounded-lg overflow-hidden flex items-center justify-center p-2">
            <QuizImage src={imageSrc} alt={q.q} className="max-h-48 w-auto object-contain rounded" />
          </div>
        )}
        {description && (
          <div className="bg-secondary/40 border border-border rounded-lg px-4 py-3">
            <p className="text-sm text-foreground/90 leading-relaxed">{description}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function WeeklyLockedScreen({
  score,
  streak,
  justFinished,
}: {
  score: number;
  streak: number;
  justFinished: boolean;
}) {
  const [countdown, setCountdown] = useState(() => getNextMondayCountdown());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setCountdown(getNextMondayCountdown()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleShare = async () => {
    const text = `I scored ${score}/${MAX_SCORE} on the Pit Lane Fan Zone weekly F1 quiz — can you beat me?`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-5 animate-in fade-in py-8 text-center">
      <div className="text-5xl">🏁</div>
      <div>
        <h2 className="text-3xl font-black">{justFinished ? 'This week done!' : 'Already played this week'}</h2>
        <p className="text-muted-foreground mt-1">
          You scored <strong className="text-primary">{score}/{MAX_SCORE}</strong> this week
        </p>
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-2 rounded-full border border-[#2e7d32]/40 bg-[#2e7d32]/15 px-4 py-1.5">
          <Flame className="w-4 h-4 text-[#6fcf78]" />
          <span className="font-bold text-[#6fcf78]">
            {streak} week{streak === 1 ? '' : 's'} streak
          </span>
        </div>
      )}

      <div className="w-full max-w-xs rounded-xl border border-border bg-secondary/30 px-4 py-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Next quiz unlocks in
        </div>
        <div className="text-3xl font-black font-mono tabular-nums">{countdown}</div>
      </div>

      <p className="text-sm text-muted-foreground">Come back every Monday for a fresh challenge.</p>

      <Button onClick={handleShare} size="lg" variant="outline" className="font-bold tracking-widest">
        {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
        {copied ? 'COPIED' : 'SHARE MY SCORE'}
      </Button>
    </div>
  );
}

export function GeneralQuiz() {
  const [questions] = useState<Question[]>(pickQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [lockedAtMount] = useState(() => hasCompletedThisWeek());
  const [completion, setCompletion] = useState<WeeklyCompletion | null>(null);

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
      setCompletion(completeWeeklyQuiz(score));
      setGameOver(true);
    }
  };

  if (lockedAtMount && !gameOver) {
    return (
      <WeeklyLockedScreen
        score={getLastScore() ?? 0}
        streak={getWeeklyStreak()}
        justFinished={false}
      />
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-4 animate-in fade-in py-2">
        <p className="text-muted-foreground text-center max-w-sm text-base font-medium">{ratingFor(score)}</p>
        <WeeklyLockedScreen
          score={score}
          streak={completion?.streak ?? getWeeklyStreak()}
          justFinished
        />
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
