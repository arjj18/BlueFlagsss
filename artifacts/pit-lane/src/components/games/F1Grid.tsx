'use client';

import React, { useEffect, useRef } from 'react';
import { DRIVERS, type Driver } from './data/f1-drivers';

interface GridCriteria {
  tag: string;
  label: string;
}

interface GameCell {
  player: 'X' | 'O';
  driver: string;
}

interface GameState {
  board: (GameCell | null)[];
  currentTurn: 'X' | 'O';
  gameMode: 'computer' | 'friend' | null;
  status: 'playing' | 'won' | 'draw';
  winner: 'X' | 'O' | null;
  winLine: number[];
  stealsX: number;
  stealsO: number;
  stealMode: boolean;
  grid: { columns: GridCriteria[]; rows: GridCriteria[] } | null;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateValidGrid(): { columns: GridCriteria[]; rows: GridCriteria[] } | null {
  const allTeams: GridCriteria[] = [
    { tag: 'drove-ferrari', label: 'Drove for Ferrari' },
    { tag: 'drove-mclaren', label: 'Drove for McLaren' },
    { tag: 'drove-mercedes', label: 'Drove for Mercedes' },
    { tag: 'drove-red-bull', label: 'Drove for Red Bull' },
    { tag: 'drove-williams', label: 'Drove for Williams' },
    { tag: 'drove-renault', label: 'Drove for Renault' },
    { tag: 'drove-lotus', label: 'Drove for Lotus' },
  ];

  const allNationalities: GridCriteria[] = [
    { tag: 'british', label: 'British Driver' },
    { tag: 'german', label: 'German Driver' },
    { tag: 'brazilian', label: 'Brazilian Driver' },
    { tag: 'french', label: 'French Driver' },
    { tag: 'finnish', label: 'Finnish Driver' },
    { tag: 'spanish', label: 'Spanish Driver' },
    { tag: 'dutch', label: 'Dutch Driver' },
  ];

  const allAchievements: GridCriteria[] = [
    { tag: 'won-championship', label: 'Won Championship' },
    { tag: 'won-monaco', label: 'Won at Monaco' },
    { tag: 'won-monza', label: 'Won at Monza' },
    { tag: 'pole-position', label: 'Took Pole Position' },
    { tag: '100-races', label: '100+ Races' },
    { tag: '10-wins', label: '10+ Wins' },
    { tag: 'podium', label: 'Scored a Podium' },
  ];

  const allCriteria = [...allTeams, ...allNationalities, ...allAchievements];

  for (let attempt = 0; attempt < 100; attempt++) {
    const shuffled = shuffleArray(allCriteria);
    const columns = shuffled.slice(0, 3);
    const rows = shuffleArray(allCriteria).slice(0, 3);

    let valid = true;
    for (const col of columns) {
      for (const row of rows) {
        const matches = DRIVERS.filter(
          d => d.tags.includes(col.tag) && d.tags.includes(row.tag)
        );
        if (matches.length < 1) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }

    if (valid) {
      return { columns, rows };
    }
  }

  return null;
}

function getValidDrivers(colTag: string, rowTag: string): string[] {
  return DRIVERS.filter(d => d.tags.includes(colTag) && d.tags.includes(rowTag)).map(d => d.name);
}

function checkWinner(board: (GameCell | null)[]): { winner: 'X' | 'O'; line: number[] } | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[b] && board[c] && board[a]!.player === board[b]!.player && board[a]!.player === board[c]!.player) {
      return { winner: board[a]!.player, line: [a, b, c] };
    }
  }
  return null;
}

function getBestComputerMove(board: (GameCell | null)[], grid: { columns: GridCriteria[]; rows: GridCriteria[] }): number | null {
  const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

  function canAnswerCell(index: number): boolean {
    const col = grid.columns[index % 3];
    const row = grid.rows[Math.floor(index / 3)];
    return getValidDrivers(col.tag, row.tag).length > 0;
  }

  // 1. Try to win
  for (const [a, b, c] of lines) {
    const cells = [board[a], board[b], board[c]];
    const oCount = cells.filter(v => v?.player === 'O').length;
    const nullCount = cells.filter(v => !v).length;
    if (oCount === 2 && nullCount === 1) {
      const emptyIdx = [a, b, c].find((idx, i) => !board[idx]);
      if (emptyIdx !== undefined && canAnswerCell(emptyIdx)) return emptyIdx;
    }
  }

  // 2. Block player from winning
  for (const [a, b, c] of lines) {
    const cells = [board[a], board[b], board[c]];
    const xCount = cells.filter(v => v?.player === 'X').length;
    const nullCount = cells.filter(v => !v).length;
    if (xCount === 2 && nullCount === 1) {
      const emptyIdx = [a, b, c].find((idx, i) => !board[idx]);
      if (emptyIdx !== undefined && canAnswerCell(emptyIdx)) return emptyIdx;
    }
  }

  // 3. Take centre
  if (!board[4] && canAnswerCell(4)) return 4;

  // 4. Take a corner
  const corners = [0, 2, 6, 8].filter(i => !board[i] && canAnswerCell(i));
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  // 5. Take any available
  const available = board.map((v, i) => (!v && canAnswerCell(i) ? i : -1)).filter(i => i !== -1);
  return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
}

export function F1Grid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>({
    board: Array(9).fill(null),
    currentTurn: 'X',
    gameMode: null,
    status: 'playing',
    winner: null,
    winLine: [],
    stealsX: 3,
    stealsO: 3,
    stealMode: false,
    grid: null,
  });

  const [renderKey, setRenderKey] = React.useState(0);

  const updateGameState = (newState: GameState) => {
    gameStateRef.current = newState;
    setRenderKey(k => k + 1);
  };

  const startGame = (mode: 'computer' | 'friend') => {
    const grid = generateValidGrid();
    if (!grid) {
      alert('Could not generate a valid grid. Please try again.');
      return;
    }

    updateGameState({
      board: Array(9).fill(null),
      currentTurn: 'X',
      gameMode: mode,
      status: 'playing',
      winner: null,
      winLine: [],
      stealsX: 3,
      stealsO: 3,
      stealMode: false,
      grid,
    });
  };

  const makeComputerMove = (state: GameState) => {
    const grid = state.grid;
    if (!grid) return;

    const cellIndex = getBestComputerMove(state.board, grid);
    if (cellIndex === null) return;

    const col = grid.columns[cellIndex % 3];
    const row = grid.rows[Math.floor(cellIndex / 3)];
    const validDrivers = getValidDrivers(col.tag, row.tag);

    if (validDrivers.length === 0) return;

    const driver = validDrivers[Math.floor(Math.random() * validDrivers.length)];
    const newBoard = [...state.board];
    newBoard[cellIndex] = { player: 'O', driver };

    const result = checkWinner(newBoard);
    if (result) {
      updateGameState({ ...state, board: newBoard, status: 'won', winner: 'O', winLine: result.line });
      return;
    }

    if (newBoard.every(c => c !== null)) {
      updateGameState({ ...state, board: newBoard, status: 'draw' });
      return;
    }

    updateGameState({ ...state, board: newBoard, currentTurn: 'X' });
  };

  const handleCellClick = (cellIndex: number) => {
    const state = gameStateRef.current;
    if (!state || state.status !== 'playing') return;
    if (state.currentTurn !== 'X') return;

    const cell = state.board[cellIndex];

    if (state.stealMode) {
      if (!cell || cell.player === 'X') {
        updateGameState({ ...state, stealMode: false });
        return;
      }
      if (state.stealsX <= 0) return;
      showAnswerModal(cellIndex, true);
      return;
    }

    if (cell) return;
    showAnswerModal(cellIndex, false);
  };

  const toggleStealMode = () => {
    const state = gameStateRef.current;
    if (!state || state.currentTurn !== 'X' || state.stealsX <= 0) return;
    updateGameState({ ...state, stealMode: !state.stealMode });
  };

  const showAnswerModal = (cellIndex: number, isSteal: boolean) => {
    const state = gameStateRef.current;
    if (!state || !state.grid) return;

    const col = state.grid.columns[cellIndex % 3];
    const row = state.grid.rows[Math.floor(cellIndex / 3)];
    const existingDriver = state.board[cellIndex]?.driver || null;

    const modal = document.createElement('div');
    modal.id = 'f1grid-modal';
    modal.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;
      background:rgba(0,0,0,0.88);
      display:flex;
      align-items:flex-end;
      z-index:99999;
    `;

    const closeModal = () => modal.remove();

    const handleSubmit = () => {
      const input = document.getElementById('f1grid-answer') as HTMLInputElement;
      if (!input) return;
      const driverName = input.value.trim();
      if (!driverName) return;

      const driver = DRIVERS.find(d => {
        const nameLower = d.name.toLowerCase();
        const inputLower = driverName.toLowerCase();
        const nameMatch = nameLower === inputLower || (nameLower.includes(inputLower) && inputLower.length >= 3);
        const validForCell = d.tags.includes(col.tag) && d.tags.includes(row.tag);
        const notSameAsExisting = !isSteal || nameLower !== (existingDriver || '').toLowerCase();
        return nameMatch && validForCell && notSameAsExisting;
      });

      if (!driver) {
        const errorEl = document.getElementById('f1grid-error');
        if (errorEl) {
          errorEl.textContent = isSteal ? `Invalid steal — ${driverName} either doesn't fit both criteria or is the same driver` : `${driverName} doesn't fit both criteria.`;
          errorEl.style.display = 'block';
        }
        return;
      }

      closeModal();

      const newBoard = [...state.board];
      newBoard[cellIndex] = { player: state.currentTurn, driver: driver.name };

      let newStealsX = state.stealsX;
      let newStealsO = state.stealsO;
      if (isSteal) {
        if (state.currentTurn === 'X') newStealsX--;
        else newStealsO--;
      }

      const result = checkWinner(newBoard);

      if (result) {
        updateGameState({ ...state, board: newBoard, status: 'won', winner: result.winner, winLine: result.line, stealsX: newStealsX, stealsO: newStealsO, stealMode: false });
        setTimeout(() => showGameOver({ ...state, board: newBoard, status: 'won', winner: result.winner, winLine: result.line, stealsX: newStealsX, stealsO: newStealsO }), 300);
        return;
      }

      if (newBoard.every(c => c !== null)) {
        const finalState = { ...state, board: newBoard, status: 'draw' as const, stealsX: newStealsX, stealsO: newStealsO, stealMode: false };
        updateGameState(finalState);
        setTimeout(() => showGameOver(finalState), 300);
        return;
      }

      const nextTurn = state.currentTurn === 'X' ? 'O' : 'X';
      const newState = { ...state, board: newBoard, currentTurn: nextTurn, stealsX: newStealsX, stealsO: newStealsO, stealMode: false };

      updateGameState(newState);

      if (state.gameMode === 'computer' && nextTurn === 'O') {
        setTimeout(() => {
          makeComputerMove(gameStateRef.current);
        }, 1500);
      }
    };

    modal.innerHTML = `
      <div style='
        background:#111;
        border:0.5px solid #333;
        border-radius:16px 16px 0 0;
        padding:24px 20px 32px;
        width:100%;
        max-width:500px;
        margin:0 auto;
      '>
        <div style='margin-bottom:16px;'>
          <div style='font-size:10px; color:#555; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;'>
            ${isSteal ? '🏎️ STEAL — Name a DIFFERENT driver fitting both:' : 'Name a driver fitting BOTH:'}
          </div>
          <div style='display:flex; gap:8px; flex-wrap:wrap;'>
            <span style='background:#1a0000;border:0.5px solid #e10600;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;color:white;'>${col.label}</span>
            <span style='color:#555;align-self:center;font-size:12px;font-weight:700;'>AND</span>
            <span style='background:#00001a;border:0.5px solid #1565c0;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;color:white;'>${row.label}</span>
          </div>
          ${
            isSteal && existingDriver
              ? `<div style='margin-top:8px;font-size:11px;color:#e65100;'>⚠️ Cannot use: ${existingDriver}</div>`
              : ''
          }
        </div>
        
        <div style='position:relative;margin-bottom:10px;'>
          <input
            type='text'
            id='f1grid-answer'
            placeholder='Type a driver name...'
            autocomplete='off'
            style='
              width:100%;
              padding:14px 16px;
              background:#1a1a1a;
              border:1.5px solid #333;
              border-radius:10px;
              color:white;
              font-size:16px;
              font-family:Inter,sans-serif;
              outline:none;
              box-sizing:border-box;
            '
          />
          <div id='f1grid-autocomplete' style='
            position:absolute;
            top:calc(100% + 2px);
            left:0;right:0;
            background:#1a1a1a;
            border:0.5px solid #444;
            border-radius:8px;
            max-height:180px;
            overflow-y:auto;
            z-index:100;
            display:none;
          '></div>
        </div>
        
        <div id='f1grid-error' style='
          color:#e10600;
          font-size:12px;
          margin-bottom:10px;
          display:none;
          padding:8px 12px;
          background:#1a0000;
          border-radius:6px;
        '></div>
        
        <div style='display:flex;gap:10px;'>
          <button 
            onclick='this.closest("#f1grid-modal")?.remove()'
            style='
              flex:1;padding:13px;
              background:none;border:0.5px solid #333;
              border-radius:10px;color:#555;
              font-family:Inter,sans-serif;font-size:14px;font-weight:600;cursor:pointer;
            '
          >Cancel</button>
          <button 
            id='f1grid-submit'
            style='
              flex:2;padding:13px;
              background:#e10600;border:none;
              border-radius:10px;color:white;
              font-family:Inter,sans-serif;font-size:14px;font-weight:700;cursor:pointer;
            '
          >Submit →</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = document.getElementById('f1grid-answer') as HTMLInputElement;
    const dropdown = document.getElementById('f1grid-autocomplete') as HTMLElement;
    const submitBtn = document.getElementById('f1grid-submit') as HTMLButtonElement;

    input.addEventListener('input', () => {
      const val = input.value.trim().toLowerCase();
      if (val.length < 2) {
        dropdown.style.display = 'none';
        return;
      }

      const matches = DRIVERS.filter(d => {
        const nameMatch = d.name.toLowerCase().includes(val);
        const validForCell = d.tags.includes(col.tag) && d.tags.includes(row.tag);
        const notExcluded = !isSteal || d.name.toLowerCase() !== (existingDriver || '').toLowerCase();
        return nameMatch && validForCell && notExcluded;
      }).slice(0, 8);

      if (matches.length === 0) {
        dropdown.style.display = 'none';
        return;
      }

      dropdown.innerHTML = matches
        .map(
          d => `
        <div 
          onclick='this.closest("#f1grid-modal") && document.getElementById("f1grid-answer").value = "${d.name}"; document.getElementById("f1grid-autocomplete").style.display = "none";'
          style='
            padding:12px 16px;cursor:pointer;
            font-size:14px;font-weight:500;color:white;
            border-bottom:0.5px solid #222;
            transition:background 0.1s;
          '
          onmouseover='this.style.background="#222"'
          onmouseout='this.style.background="transparent"'
        >${d.name}</div>
      `
        )
        .join('');
      dropdown.style.display = 'block';
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') closeModal();
    });

    submitBtn.addEventListener('click', handleSubmit);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });

    setTimeout(() => input.focus(), 100);
  };

  const showGameOver = (finalState: GameState) => {
    const isXWinner = finalState.winner === 'X';
    const isDraw = finalState.status === 'draw';
    const oLabel = finalState.gameMode === 'computer' ? 'Computer' : 'Player 2';

    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'f1grid-gameover';
    gameOverDiv.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;
      background:rgba(0,0,0,0.92);
      display:flex;align-items:center;justify-content:center;
      z-index:99999;padding:20px;
    `;

    gameOverDiv.innerHTML = `
      <div style='
        background:#111;border:0.5px solid #333;
        border-radius:16px;padding:28px 24px;
        width:100%;max-width:360px;text-align:center;
      '>
        <div style='font-size:52px;margin-bottom:12px;'>
          ${isDraw ? '🤝' : isXWinner ? '🏆' : finalState.gameMode === 'computer' ? '🤖' : '🏆'}
        </div>
        <div style='
          font-family:Barlow Condensed,sans-serif;
          font-size:36px;font-weight:900;
          color:${isDraw ? 'white' : isXWinner ? '#e10600' : '#1565c0'};
          margin-bottom:6px;
        '>
          ${isDraw ? "It's a Draw!" : isXWinner ? 'Player 1 Wins!' : `${oLabel} Wins!`}
        </div>
        <p style='font-size:13px;color:#555;margin-bottom:24px;'>
          ${isDraw ? 'A perfectly matched game of F1 knowledge' : isXWinner ? 'Excellent F1 knowledge!' : finalState.gameMode === 'computer' ? 'The AI knows its F1!' : 'Player 2 takes the win!'}
        </p>
        <div style='display:flex;flex-direction:column;gap:8px;'>
          <button id='f1grid-playagain' style='
            padding:14px;background:#e10600;border:none;
            border-radius:10px;color:white;
            font-family:Inter,sans-serif;font-size:14px;font-weight:700;cursor:pointer;
          '>↺ Play again</button>
          <button id='f1grid-changemode' style='
            padding:14px;background:none;border:0.5px solid #333;
            border-radius:10px;color:#555;
            font-family:Inter,sans-serif;font-size:14px;font-weight:600;cursor:pointer;
          '>Change mode</button>
        </div>
      </div>
    `;

    document.body.appendChild(gameOverDiv);

    document.getElementById('f1grid-playagain')?.addEventListener('click', () => {
      gameOverDiv.remove();
      if (finalState.gameMode) startGame(finalState.gameMode);
    });

    document.getElementById('f1grid-changemode')?.addEventListener('click', () => {
      gameOverDiv.remove();
      updateGameState({ ...gameStateRef.current, gameMode: null });
    });
  };

  const state = gameStateRef.current;

  const renderModeSelection = () => (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
      <div style={{ textAlign: 'center', padding: '24px 20px', marginBottom: '12px', background: '#111', borderRadius: '12px', border: '0.5px solid #333' }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '40px', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '6px', letterSpacing: '2px' }}>F1 GRID</div>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px', lineHeight: 1.6 }}>
          Name a driver who fits BOTH criteria to claim each square.
          <br />
          First to get three in a row wins.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => startGame('computer')}
            style={{
              padding: '16px',
              background: '#1a0000',
              border: '1.5px solid #e10600',
              borderRadius: '12px',
              color: 'white',
              fontFamily: 'Inter,sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '32px' }}>🤖</span>
            <div>
              <div style={{ color: '#e10600', marginBottom: '3px' }}>VS Computer</div>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: 400 }}>Play solo against the AI — available any time</div>
            </div>
          </button>

          <button
            onClick={() => startGame('friend')}
            style={{
              padding: '16px',
              background: '#0a0a1a',
              border: '1.5px solid #1565c0',
              borderRadius: '12px',
              color: 'white',
              fontFamily: 'Inter,sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '32px' }}>👥</span>
            <div>
              <div style={{ color: '#1565c0', marginBottom: '3px' }}>VS Friend — Same Device</div>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: 400 }}>Take turns on the same phone or computer</div>
            </div>
          </button>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '10px', padding: '14px', textAlign: 'left' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>How to play</div>
          <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.8 }}>
            🎯 Tap a cell and name a driver fitting BOTH criteria
            <br />
            🏆 Get three in a row to win
            <br />
            🏎️ Use steals to take opponent cells — name a DIFFERENT driver
            <br />⚡ Each player starts with 3 steals
          </div>
        </div>
      </div>
    </div>
  );

  const renderGameBoard = () => {
    if (!state.grid) return <div>Loading grid...</div>;

    const isXTurn = state.currentTurn === 'X';
    const oLabel = state.gameMode === 'computer' ? 'Computer' : 'Player 2';
    const isComputerThinking = state.gameMode === 'computer' && state.currentTurn === 'O' && state.status === 'playing';

    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '12px' }}>
        <div
          style={{
            textAlign: 'center',
            padding: '10px',
            marginBottom: '12px',
            background: '#1a1a1a',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 700,
            color: isXTurn ? '#e10600' : '#1565c0',
          }}
        >
          {isComputerThinking ? '🤖 Computer is thinking...' : isXTurn ? '❌ Player 1 — your turn' : state.gameMode === 'computer' ? '⭕ Computer — your turn' : '⭕ Player 2 — your turn'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#555', fontWeight: 700 }}>P1 STEALS</span>
            {Array(state.stealsX)
              .fill('🏎️')
              .join('')}
            {Array(3 - state.stealsX)
              .fill('⬜')
              .join('')}
          </div>
          <button
            onClick={toggleStealMode}
            style={{
              background: state.stealMode ? '#e65100' : '#1a1a1a',
              border: `0.5px solid ${state.stealMode ? '#e65100' : '#333'}`,
              borderRadius: '20px',
              color: state.stealMode ? 'white' : '#555',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 12px',
              cursor: 'pointer',
              fontFamily: 'Inter,sans-serif',
            }}
          >
            {state.stealMode ? '🏎️ STEAL ON' : '🏎️ Steal'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {Array(state.stealsO)
              .fill('🏎️')
              .join('')}
            {Array(3 - state.stealsO)
              .fill('⬜')
              .join('')}
            <span style={{ fontSize: '11px', color: '#555', fontWeight: 700 }}>{state.gameMode === 'computer' ? 'CPU' : 'P2'} STEALS</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr 1fr', gridTemplateRows: '72px 1fr 1fr 1fr', gap: '4px', marginBottom: '12px' }}>
          <div></div>

          {state.grid.columns.map(col => (
            <div
              key={col.tag}
              style={{
                background: '#1a1a1a',
                border: '0.5px solid #333',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 4px',
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#e10600',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {col.label}
            </div>
          ))}

          {state.grid.rows.map((row, rowIndex) => (
            <React.Fragment key={row.tag}>
              <div
                style={{
                  background: '#1a1a1a',
                  border: '0.5px solid #333',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 4px',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#1565c0',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {row.label}
              </div>

              {[0, 1, 2].map(colIndex => {
                const cellIndex = rowIndex * 3 + colIndex;
                const cell = state.board[cellIndex];
                const isWinCell = state.winLine.includes(cellIndex);
                const isStealable = state.stealMode && cell && cell.player !== state.currentTurn && state.currentTurn === 'X';
                const isEmpty = !cell;
                const isClickable = (isEmpty || isStealable) && state.status === 'playing' && state.currentTurn === 'X';

                return (
                  <div
                    key={cellIndex}
                    onClick={() => isClickable && handleCellClick(cellIndex)}
                    style={{
                      aspectRatio: '1',
                      border: `1.5px solid ${isWinCell ? '#FFD700' : isStealable ? '#e65100' : cell?.player === 'X' ? '#e10600' : cell?.player === 'O' ? '#1565c0' : '#333'}`,
                      borderRadius: '8px',
                      background: isWinCell ? '#2a2a00' : isStealable ? '#1a0800' : cell?.player === 'X' ? '#1a0000' : cell?.player === 'O' ? '#00001a' : '#111',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isClickable ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                      padding: '4px',
                      minHeight: '80px',
                      position: 'relative',
                    }}
                  >
                    {cell ? (
                      <>
                        <div style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: '24px', fontWeight: 900, color: cell.player === 'X' ? '#e10600' : '#1565c0', lineHeight: 1 }}>{cell.player}</div>
                        <div style={{ fontSize: '8px', color: '#666', textAlign: 'center', lineHeight: 1.2, marginTop: '3px', padding: '0 2px' }}>{cell.driver}</div>
                        {isStealable && <div style={{ position: 'absolute', top: '3px', right: '3px', fontSize: '10px' }}>🏎️</div>}
                      </>
                    ) : (
                      <div style={{ fontSize: '22px', color: '#2a2a2a' }}>+</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => updateGameState({ ...state, gameMode: null })}
          style={{
            width: '100%',
            padding: '10px',
            background: 'none',
            border: '0.5px solid #333',
            borderRadius: '8px',
            color: '#555',
            fontFamily: 'Inter,sans-serif',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          ↺ New game
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (containerRef.current) {
      // Cleanup modals on unmount
      return () => {
        document.getElementById('f1grid-modal')?.remove();
        document.getElementById('f1grid-gameover')?.remove();
      };
    }
  }, []);

  return <div ref={containerRef}>{state.gameMode ? renderGameBoard() : renderModeSelection()}</div>;
}
