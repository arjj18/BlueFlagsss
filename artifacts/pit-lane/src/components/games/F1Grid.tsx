'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, X, ChevronRight, Zap } from 'lucide-react';
import { DRIVERS, ALL_CRITERIA, type GridCriteria } from './data/f1-drivers';

type GameMode = 'mode-select' | 'offline' | 'online-create' | 'online-join' | 'playing';

interface GridCell {
  player: 'player1' | 'player2' | null;
  driver: string;
}

interface GameState {
  grid: { columns: GridCriteria[]; rows: GridCriteria[] };
  board: (GridCell | null)[];
  currentTurn: 'player1' | 'player2';
  stealsPlayer1: number;
  stealsPlayer2: number;
  stealMode: boolean;
  gameOver: boolean;
  winner: 'player1' | 'player2' | 'draw' | null;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateValidGrid() {
  let attempts = 0;
  let validGrid = null;

  while (!validGrid && attempts < 100) {
    attempts++;

    const allCriteria = shuffleArray(ALL_CRITERIA);
    const columns = allCriteria.filter(c => c.category !== 'era').slice(0, 3);
    const rows = shuffleArray(ALL_CRITERIA).slice(0, 3);

    let isValid = true;
    for (const col of columns) {
      for (const row of rows) {
        const validDrivers = DRIVERS.filter(
          d => d.tags.includes(col.tag) && d.tags.includes(row.tag)
        );
        if (validDrivers.length < 3) {
          isValid = false;
          break;
        }
      }
      if (!isValid) break;
    }

    if (isValid) {
      validGrid = { columns, rows };
    }
  }

  return validGrid || { columns: [], rows: [] };
}

function getValidDrivers(
  colTag: string,
  rowTag: string
): string[] {
  return DRIVERS.filter(
    d => d.tags.includes(colTag) && d.tags.includes(rowTag)
  ).map(d => d.name);
}

function checkWinner(board: (GridCell | null)[]): {
  winner: 'player1' | 'player2' | null;
  line: number[];
  isDraw?: boolean;
} | null {
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
    if (
      board[a] &&
      board[b] &&
      board[c] &&
      board[a]!.player === board[b]!.player &&
      board[a]!.player === board[c]!.player
    ) {
      return { winner: board[a]!.player, line: [a, b, c] };
    }
  }

  if (board.every(cell => cell !== null)) {
    const p1Count = board.filter(c => c?.player === 'player1').length;
    const p2Count = board.filter(c => c?.player === 'player2').length;
    if (p1Count > p2Count) return { winner: 'player1', line: [] };
    if (p2Count > p1Count) return { winner: 'player2', line: [] };
    return { winner: null, line: [], isDraw: true };
  }

  return null;
}

function computerMove(
  board: (GridCell | null)[],
  grid: { columns: GridCriteria[]; rows: GridCriteria[] }
): number {
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

  // Try to win
  for (const [a, b, c] of lines) {
    const cells = [board[a], board[b], board[c]];
    const oCount = cells.filter(v => v?.player === 'player2').length;
    const emptyCount = cells.filter(v => !v).length;

    if (oCount === 2 && emptyCount === 1) {
      const emptyIdx = [a, b, c].find((idx, i) => !board[idx]);
      if (emptyIdx !== undefined) {
        const col = grid.columns[emptyIdx % 3];
        const row = grid.rows[Math.floor(emptyIdx / 3)];
        const validDrivers = getValidDrivers(col.tag, row.tag);
        if (validDrivers.length > 0) return emptyIdx;
      }
    }
  }

  // Block player from winning
  for (const [a, b, c] of lines) {
    const cells = [board[a], board[b], board[c]];
    const xCount = cells.filter(v => v?.player === 'player1').length;
    const emptyCount = cells.filter(v => !v).length;

    if (xCount === 2 && emptyCount === 1) {
      const emptyIdx = [a, b, c].find((idx, i) => !board[idx]);
      if (emptyIdx !== undefined) {
        const col = grid.columns[emptyIdx % 3];
        const row = grid.rows[Math.floor(emptyIdx / 3)];
        const validDrivers = getValidDrivers(col.tag, row.tag);
        if (validDrivers.length > 0) return emptyIdx;
      }
    }
  }

  // Take center
  if (!board[4]) return 4;

  // Take corner
  const corners = [0, 2, 6, 8].filter(i => !board[i]);
  if (corners.length > 0)
    return corners[Math.floor(Math.random() * corners.length)];

  // Take any available
  const available = board.map((v, i) => (!v ? i : -1)).filter(i => i !== -1);
  return available[Math.floor(Math.random() * available.length)];
}

export function F1Grid() {
  const [gameMode, setGameMode] = useState<GameMode>('mode-select');
  const [gameState, setGameState] = useState<GameState>({
    grid: { columns: [], rows: [] },
    board: Array(9).fill(null),
    currentTurn: 'player1',
    stealsPlayer1: 3,
    stealsPlayer2: 3,
    stealMode: false,
    gameOver: false,
    winner: null,
  });
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [autocompleteMatches, setAutocompleteMatches] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Start offline game
  const startOfflineGame = () => {
    const grid = generateValidGrid();
    setGameState({
      grid,
      board: Array(9).fill(null),
      currentTurn: 'player1',
      stealsPlayer1: 3,
      stealsPlayer2: 3,
      stealMode: false,
      gameOver: false,
      winner: null,
    });
    setGameMode('playing');
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (gameState.gameOver) return;
    if (gameState.board[index] && !gameState.stealMode) return;

    if (gameState.stealMode && gameState.board[index]) {
      if (gameState.board[index]!.player !== gameState.currentTurn) {
        setSelectedCell(index);
        setShowModal(true);
      }
      return;
    }

    if (!gameState.board[index]) {
      setSelectedCell(index);
      setShowModal(true);
    }
  };

  // Handle answer submission
  const submitAnswer = () => {
    if (!answerInput.trim() || selectedCell === null) return;

    const colIdx = selectedCell % 3;
    const rowIdx = Math.floor(selectedCell / 3);
    const col = gameState.grid.columns[colIdx];
    const row = gameState.grid.rows[rowIdx];

    const validDrivers = getValidDrivers(col.tag, row.tag);
    const matchedDriver = validDrivers.find(
      d => d.toLowerCase() === answerInput.trim().toLowerCase()
    );

    if (!matchedDriver) {
      setAnswerError(
        `${answerInput} does not fit both criteria. Try another driver.`
      );
      setAnswerInput('');
      return;
    }

    // Check if trying to steal
    const existingCell = gameState.board[selectedCell];
    if (existingCell && existingCell.player === gameState.currentTurn) {
      setAnswerError('That cell is already yours!');
      return;
    }

    if (existingCell && existingCell.player !== gameState.currentTurn) {
      if (existingCell.driver.toLowerCase() === matchedDriver.toLowerCase()) {
        setAnswerError('A steal requires a DIFFERENT driver.');
        return;
      }

      const stealsKey =
        gameState.currentTurn === 'player1' ? 'stealsPlayer1' : 'stealsPlayer2';
      const stealsRemaining = gameState[stealsKey];

      if (stealsRemaining <= 0) {
        setAnswerError('No steals remaining!');
        return;
      }

      // Execute steal
      const newBoard = [...gameState.board];
      newBoard[selectedCell] = {
        player: gameState.currentTurn,
        driver: matchedDriver,
      };

      const updatedState = {
        ...gameState,
        board: newBoard,
        [stealsKey]: stealsRemaining - 1,
        stealMode: false,
        currentTurn: gameState.currentTurn === 'player1' ? 'player2' : 'player1',
      };

      const result = checkWinner(newBoard);
      if (result) {
        updatedState.gameOver = true;
        updatedState.winner = result.winner;
      }

      setGameState(updatedState);
      setShowModal(false);
      setAnswerInput('');
      setAnswerError(null);
      setSelectedCell(null);

      // Computer move if offline
      if (gameMode === 'offline' && !result && updatedState.currentTurn === 'player2') {
        setTimeout(() => {
          const computerIdx = computerMove(newBoard, gameState.grid);
          const col = gameState.grid.columns[computerIdx % 3];
          const row = gameState.grid.rows[Math.floor(computerIdx / 3)];
          const drivers = getValidDrivers(col.tag, row.tag);
          const computerDriver =
            drivers[Math.floor(Math.random() * drivers.length)];

          const computerBoard = [...newBoard];
          computerBoard[computerIdx] = {
            player: 'player2',
            driver: computerDriver,
          };

          const computerResult = checkWinner(computerBoard);
          setGameState(prev => ({
            ...prev,
            board: computerBoard,
            currentTurn: 'player1',
            gameOver: !!computerResult,
            winner: computerResult?.winner || null,
          }));
        }, 1500);
      }
      return;
    }

    // Normal claim
    const newBoard = [...gameState.board];
    newBoard[selectedCell] = {
      player: gameState.currentTurn,
      driver: matchedDriver,
    };

    const result = checkWinner(newBoard);
    const updatedState = {
      ...gameState,
      board: newBoard,
      currentTurn: gameState.currentTurn === 'player1' ? 'player2' : 'player1',
      gameOver: !!result,
      winner: result?.winner || null,
    };

    setGameState(updatedState);
    setShowModal(false);
    setAnswerInput('');
    setAnswerError(null);
    setSelectedCell(null);

    // Computer move if offline
    if (gameMode === 'offline' && !result && updatedState.currentTurn === 'player2') {
      setTimeout(() => {
        const computerIdx = computerMove(newBoard, gameState.grid);
        const col = gameState.grid.columns[computerIdx % 3];
        const row = gameState.grid.rows[Math.floor(computerIdx / 3)];
        const drivers = getValidDrivers(col.tag, row.tag);
        const computerDriver =
          drivers[Math.floor(Math.random() * drivers.length)];

        const computerBoard = [...newBoard];
        computerBoard[computerIdx] = {
          player: 'player2',
          driver: computerDriver,
        };

        const computerResult = checkWinner(computerBoard);
        setGameState(prev => ({
          ...prev,
          board: computerBoard,
          currentTurn: 'player1',
          gameOver: !!computerResult,
          winner: computerResult?.winner || null,
        }));
      }, 1500);
    }
  };

  // Handle autocomplete
  useEffect(() => {
    if (!answerInput.trim() || selectedCell === null) {
      setAutocompleteMatches([]);
      return;
    }

    const colIdx = selectedCell % 3;
    const rowIdx = Math.floor(selectedCell / 3);
    const col = gameState.grid.columns[colIdx];
    const row = gameState.grid.rows[rowIdx];

    const validDrivers = getValidDrivers(col.tag, row.tag);
    const input = answerInput.toLowerCase();
    const matches = validDrivers
      .filter(d => d.toLowerCase().includes(input))
      .slice(0, 6);

    setAutocompleteMatches(matches);
  }, [answerInput, selectedCell, gameState.grid]);

  // Mode select view
  if (gameMode === 'mode-select') {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white mb-2">F1 GRID</h2>
          <p className="text-xs text-muted-foreground">
            Name a driver who fits both criteria to claim each square. First to three in a row wins.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={startOfflineGame}
            className="w-full flex items-center gap-3 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-lg p-4 transition-colors"
          >
            <span className="text-2xl">🤖</span>
            <div className="text-left">
              <p className="font-bold text-white text-sm">Play vs Computer</p>
              <p className="text-xs text-muted-foreground">Challenge the AI</p>
            </div>
          </button>
          <button
            onClick={() => setGameMode('online-create')}
            className="w-full flex items-center gap-3 bg-red-900/20 hover:bg-red-900/30 border border-red-600/30 rounded-lg p-4 transition-colors"
          >
            <span className="text-2xl">🌐</span>
            <div className="text-left">
              <p className="font-bold text-red-600 text-sm">Play Online</p>
              <p className="text-xs text-muted-foreground">Challenge a friend</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Playing view
  if (gameMode === 'playing') {
    const result = checkWinner(gameState.board);
    const p1Count = gameState.board.filter(c => c?.player === 'player1').length;
    const p2Count = gameState.board.filter(c => c?.player === 'player2').length;

    if (gameState.gameOver) {
      return (
        <div className="flex flex-col gap-4 items-center justify-center text-center py-8">
          <div className="text-4xl">
            {gameState.winner === null ? '🤝' : gameState.winner === 'player1' ? '🏆' : '😔'}
          </div>
          <h3 className="text-xl font-black text-white">
            {gameState.winner === null
              ? 'Draw!'
              : gameState.winner === 'player1'
              ? 'You Win!'
              : 'Computer Wins!'}
          </h3>
          <button
            onClick={() => setGameMode('mode-select')}
            className="mt-4 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Play Again
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Player indicators */}
        <div className="flex justify-between gap-3">
          <div
            className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
              gameState.currentTurn === 'player1'
                ? 'bg-red-900/20 border-red-600 text-red-600'
                : 'bg-secondary/30 border-border/50 text-muted-foreground'
            }`}
          >
            <div className="font-black text-lg">X</div>
            <div className="text-xs mt-1">
              {Array(gameState.stealsPlayer1)
                .fill('🏎️')
                .join('')}
            </div>
            <div className="text-[10px] mt-1">
              {gameState.currentTurn === 'player1' ? 'YOUR TURN' : 'WAITING'}
            </div>
          </div>
          <div className="flex items-center text-2xl font-black text-muted-foreground/50">
            VS
          </div>
          <div
            className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
              gameState.currentTurn === 'player2'
                ? 'bg-blue-900/20 border-blue-600 text-blue-600'
                : 'bg-secondary/30 border-border/50 text-muted-foreground'
            }`}
          >
            <div className="font-black text-lg">O</div>
            <div className="text-xs mt-1">
              {Array(gameState.stealsPlayer2)
                .fill('🏎️')
                .join('')}
            </div>
            <div className="text-[10px] mt-1">
              {gameState.currentTurn === 'player2' ? 'YOUR TURN' : 'WAITING'}
            </div>
          </div>
        </div>

        {/* Steal mode toggle */}
        {gameState.currentTurn === 'player1' &&
          (gameState.currentTurn === 'player1'
            ? gameState.stealsPlayer1 > 0
            : gameState.stealsPlayer2 > 0) && (
            <button
              onClick={() =>
                setGameState(prev => ({ ...prev, stealMode: !prev.stealMode }))
              }
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${
                gameState.stealMode
                  ? 'bg-orange-600/50 border border-orange-600 text-orange-600'
                  : 'bg-secondary/30 border border-border/50 text-muted-foreground hover:bg-secondary/50'
              }`}
            >
              <Zap className="w-4 h-4" />
              {gameState.stealMode
                ? 'STEAL MODE ON — tap opponent cell'
                : '🏎️ Use a steal'}
            </button>
          )}

        {/* Grid */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'auto 1fr 1fr 1fr' }}>
          {/* Empty corner */}
          <div />

          {/* Column headers */}
          {gameState.grid.columns.map(col => (
            <div
              key={col.tag}
              className="bg-secondary/40 border border-border/50 rounded p-2 flex items-center justify-center text-[10px] font-bold text-muted-foreground text-center h-16"
            >
              {col.label}
            </div>
          ))}

          {/* Rows */}
          {gameState.grid.rows.map((row, rowIdx) => (
            <React.Fragment key={row.tag}>
              {/* Row header */}
              <div className="bg-secondary/40 border border-border/50 rounded p-2 flex items-center justify-center text-[10px] font-bold text-muted-foreground text-center h-16">
                {row.label}
              </div>

              {/* 3 cells */}
              {[0, 1, 2].map(colIdx => {
                const cellIdx = rowIdx * 3 + colIdx;
                const cell = gameState.board[cellIdx];
                const isStealable =
                  gameState.stealMode &&
                  cell &&
                  cell.player !== gameState.currentTurn;

                return (
                  <button
                    key={cellIdx}
                    onClick={() => handleCellClick(cellIdx)}
                    className={`aspect-square rounded border-2 flex flex-col items-center justify-center text-center p-2 transition-all ${
                      isStealable
                        ? 'border-orange-600 bg-orange-900/20 cursor-pointer'
                        : cell?.player === 'player1'
                        ? 'border-red-600 bg-red-900/20 cursor-default'
                        : cell?.player === 'player2'
                        ? 'border-blue-600 bg-blue-900/20 cursor-default'
                        : 'border-border/50 bg-secondary/20 hover:border-primary/50 cursor-pointer'
                    }`}
                  >
                    {cell ? (
                      <>
                        <div className="font-black text-lg text-primary">
                          {cell.player === 'player1' ? 'X' : 'O'}
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-1 line-clamp-2">
                          {cell.driver}
                        </div>
                        {isStealable && <div className="text-xs mt-1">🏎️</div>}
                      </>
                    ) : (
                      <div className="text-2xl text-muted-foreground/20">+</div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Modal */}
        {showModal && selectedCell !== null && (
          <div className="fixed inset-0 bg-black/90 flex items-end z-50">
            <div className="w-full max-w-md mx-auto bg-secondary/80 rounded-t-2xl p-6 border-t border-border/50">
              <div className="mb-4">
                <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">
                  Name a driver who satisfies BOTH:
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-secondary/40 border border-red-600/30 rounded px-3 py-1 text-xs font-bold text-white">
                    {gameState.grid.columns[selectedCell % 3].label}
                  </span>
                  <span className="text-xs text-muted-foreground font-bold">AND</span>
                  <span className="bg-secondary/40 border border-blue-600/30 rounded px-3 py-1 text-xs font-bold text-white">
                    {gameState.grid.rows[Math.floor(selectedCell / 3)].label}
                  </span>
                </div>
              </div>

              <div className="mb-3 relative">
                <input
                  type="text"
                  value={answerInput}
                  onChange={e => {
                    setAnswerInput(e.target.value);
                    setAnswerError(null);
                  }}
                  onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                  placeholder="Type a driver name…"
                  className="w-full bg-secondary/40 border border-border/50 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground/40 outline-none focus:border-primary/50"
                  autoFocus
                />
                {autocompleteMatches.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-secondary/80 border border-border/50 rounded mt-1 max-h-40 overflow-y-auto z-10">
                    {autocompleteMatches.map(driver => (
                      <button
                        key={driver}
                        onClick={() => {
                          setAnswerInput(driver);
                          setAutocompleteMatches([]);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-white hover:bg-primary/20 border-b border-border/30 last:border-b-0 transition-colors"
                      >
                        {driver}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {answerError && (
                <p className="text-[10px] text-red-600 mb-3">{answerError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setAnswerInput('');
                    setAnswerError(null);
                  }}
                  className="flex-1 bg-secondary/40 border border-border/50 rounded px-3 py-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={!answerInput.trim()}
                  className="flex-1 bg-primary text-white rounded px-3 py-2 text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Submit →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
