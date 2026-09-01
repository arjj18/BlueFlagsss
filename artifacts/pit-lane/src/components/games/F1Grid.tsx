import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, AlertCircle, Loader2, Plus } from 'lucide-react';
import {
  type GridConfig, type Cell, type WinResult,
  generateValidGrid, getValidDrivers, checkWinner, computerMove,
  generateRoomCode, findDriver, normalizeName,
} from '@/lib/f1GridData';

type Screen = "menu" | "offline" | "online-setup" | "online-wait" | "online-play" | "game-over";
type Player = "player1" | "player2";
type BoardState = (Cell | null)[];

function StealIndicator({ remaining, total = 3 }: { remaining: number; total?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="text-base transition-opacity duration-300" style={{ opacity: i < remaining ? 1 : 0.15 }}>🏎️</span>
      ))}
    </div>
  );
}

function AnswerModal({
  cellIndex, grid, isSteal, existingDriver, onSubmit, onCancel,
}: {
  cellIndex: number; grid: GridConfig; isSteal: boolean; existingDriver: string | null;
  onSubmit: (name: string) => void; onCancel: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const col = grid.columns[cellIndex % 3];
  const row = grid.rows[Math.floor(cellIndex / 3)];
  const valid = getValidDrivers(col.tag, row.tag);
  const pool = isSteal ? valid.filter(d => normalizeName(d.name) !== normalizeName(existingDriver ?? "")) : valid;
  const matches = input.trim().length >= 2
    ? pool.filter(d => normalizeName(d.name).includes(normalizeName(input.trim()))).slice(0, 6) : [];

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);
  useEffect(() => {
    if (!showDropdown) return;
    function h(e: MouseEvent) { if (!containerRef.current?.contains(e.target as Node)) setShowDropdown(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showDropdown]);

  function commit(name: string) { setInput(name); setShowDropdown(false); setHighlighted(-1); submit(name); }
  function submit(explicit?: string) {
    const guess = (explicit ?? input).trim();
    if (!guess) return;
    const d = findDriver(guess, col.tag, row.tag);
    if (!d) { setError(`${guess} doesn't fit both criteria. Try another driver.`); setInput(""); return; }
    if (isSteal && existingDriver && normalizeName(d.name) === normalizeName(existingDriver)) {
      setError("You must name a DIFFERENT driver than the one already there."); setInput(""); return;
    }
    onSubmit(d.name);
  }

  function key(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { onCancel(); return; }
    if (e.key === "ArrowDown" && matches.length) { e.preventDefault(); setShowDropdown(true); setHighlighted(h => (h+1)%matches.length); return; }
    if (e.key === "ArrowUp" && matches.length) { e.preventDefault(); setShowDropdown(true); setHighlighted(h => h<=0?matches.length-1:h-1); return; }
    if (e.key === "Enter") {
      if (showDropdown && highlighted >= 0 && highlighted < matches.length) { e.preventDefault(); commit(matches[highlighted].name); }
      else submit();
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/80 animate-in fade-in duration-200" onClick={onCancel}>
      <div className="w-full max-w-md bg-[#111] border border-[#333] rounded-t-2xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2">
            {isSteal ? "Steal — name a DIFFERENT driver who fits BOTH:" : "Name a driver who fits BOTH:"}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#1a1a1a] border border-[#e10600]/40 rounded-lg px-3 py-1.5 text-sm font-semibold text-white">{col.label}</span>
            <span className="text-[#555] font-bold text-sm">AND</span>
            <span className="bg-[#1a1a1a] border border-[#1565c0]/40 rounded-lg px-3 py-1.5 text-sm font-semibold text-white">{row.label}</span>
          </div>
          {isSteal && existingDriver && <p className="text-[11px] text-[#e65100] mt-2">Current driver: {existingDriver}</p>}
        </div>
        <div ref={containerRef} className="relative mb-3">
          <input ref={inputRef} type="text" value={input}
            onChange={e => { setInput(e.target.value); setShowDropdown(true); setHighlighted(-1); setError(""); }}
            onKeyDown={key} placeholder="Type a driver name..." autoComplete="off"
            className="w-full px-4 py-3.5 bg-[#1a1a1a] border border-[#333] rounded-xl text-white text-base outline-none focus:border-[#e10600]/50 transition-colors" />
          {showDropdown && matches.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-[#333] rounded-b-xl max-h-[200px] overflow-y-auto z-50">
              {matches.map((d, i) => (
                <button key={d.name} type="button" onMouseDown={e => e.preventDefault()} onMouseEnter={() => setHighlighted(i)}
                  onClick={() => commit(d.name)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium text-white border-b border-[#222] last:border-b-0 transition-colors ${i===highlighted?"bg-[#222]":"bg-transparent"}`}>
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <div className="flex items-center gap-2 mb-3 text-sm text-[#e10600]"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 border border-[#333] rounded-xl text-sm font-semibold text-[#666] hover:bg-[#1a1a1a] transition-colors">Cancel</button>
          <button onClick={() => submit()} className="flex-[2] py-3.5 bg-[#e10600] rounded-xl text-sm font-bold text-white hover:bg-[#e10600]/90 transition-colors">Submit →</button>
        </div>
      </div>
    </div>
  );
}

function GameBoard({
  grid, board, currentTurn, myPlayer, stealMode, stealsP1, stealsP2, winningLine, onCellClick, isOnline, thinking,
}: {
  grid: GridConfig; board: BoardState; currentTurn: Player; myPlayer: Player; stealMode: boolean;
  stealsP1: number; stealsP2: number; winningLine: number[]; onCellClick: (i: number) => void;
  isOnline: boolean; thinking: boolean;
}) {
  const isMyTurn = currentTurn === myPlayer;
  const myColor = myPlayer === "player1" ? "#e10600" : "#1565c0";
  const oppColor = myPlayer === "player1" ? "#1565c0" : "#e10600";
  const myLabel = myPlayer === "player1" ? "X" : "O";
  const oppLabel = myPlayer === "player1" ? "O" : "X";
  const mySteals = myPlayer === "player1" ? stealsP1 : stealsP2;
  const oppSteals = myPlayer === "player1" ? stealsP2 : stealsP1;

  return (
    <div className="max-w-[500px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-xl px-3 py-2.5 text-center transition-all duration-200"
          style={{ background: isMyTurn ? myColor : "#1a1a1a", border: `1px solid ${isMyTurn ? myColor : "#333"}` }}>
          <div className="font-['Barlow_Condensed'] text-xl font-extrabold text-white leading-none">{myLabel}</div>
          <div className="mt-1"><StealIndicator remaining={mySteals} /></div>
          <div className="text-[9px] font-bold mt-1" style={{ color: isMyTurn ? "rgba(255,255,255,0.8)" : "#555" }}>{isMyTurn ? "YOUR TURN" : "WAITING"}</div>
        </div>
        <div className="font-['Barlow_Condensed'] text-2xl font-black text-[#333]">VS</div>
        <div className="rounded-xl px-3 py-2.5 text-center transition-all duration-200"
          style={{ background: !isMyTurn ? oppColor : "#1a1a1a", border: `1px solid ${!isMyTurn ? oppColor : "#333"}` }}>
          <div className="font-['Barlow_Condensed'] text-xl font-extrabold text-white leading-none">{oppLabel}</div>
          <div className="mt-1"><StealIndicator remaining={oppSteals} /></div>
          <div className="text-[9px] font-bold mt-1" style={{ color: !isMyTurn ? "rgba(255,255,255,0.8)" : "#555" }}>{!isMyTurn ? (thinking ? "THINKING..." : "THEIR TURN") : "WAITING"}</div>
        </div>
      </div>

      <div className="text-center mb-3">
        <button onClick={() => onCellClick(-1)} disabled={mySteals === 0 || !isMyTurn}
          className="rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: stealMode ? "#e65100" : "#1a1a1a", border: `1px solid ${stealMode ? "#e65100" : "#333"}`, color: stealMode ? "white" : "#666" }}>
          {stealMode ? "🏎️ STEAL MODE ON — tap opponent cell" : "🏎️ Use a steal"}
        </button>
      </div>

      <div className="grid gap-1.5 mb-4" style={{ gridTemplateColumns: "minmax(60px,80px) 1fr 1fr 1fr", gridTemplateRows: "minmax(60px,80px) 1fr 1fr 1fr" }}>
        <div />
        {grid.columns.map((col, ci) => (
          <div key={`col-${ci}`} className="bg-[#1a1a1a] border border-[#333] rounded-lg flex items-center justify-center p-1.5 text-[10px] font-bold text-[#aaa] text-center leading-tight">{col.label}</div>
        ))}
        {grid.rows.map((row, ri) => (
          <RowFragment key={`row-${ri}`} row={row} rowIndex={ri} board={board} stealMode={stealMode} currentTurn={currentTurn} myPlayer={myPlayer} winningLine={winningLine} onCellClick={onCellClick} />
        ))}
      </div>

      <div className="text-center text-sm text-[#666] py-2.5 px-4 bg-[#1a1a1a] rounded-lg">
        {thinking && !isMyTurn ? (
          <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Opponent is thinking...</span>
        ) : isMyTurn ? (stealMode ? "Tap an opponent's cell to steal it" : "Your turn — tap an empty cell to claim it") : `Opponent's turn${isOnline ? "" : " (Computer)"}`}
      </div>
    </div>
  );
}

function RowFragment({ row, rowIndex, board, stealMode, currentTurn, myPlayer, winningLine, onCellClick }: {
  row: GridConfig["rows"][number]; rowIndex: number; board: BoardState; stealMode: boolean;
  currentTurn: Player; myPlayer: Player; winningLine: number[]; onCellClick: (i: number) => void;
}) {
  return (
    <>
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg flex items-center justify-center p-1.5 text-[10px] font-bold text-[#aaa] text-center leading-tight">{row.label}</div>
      {[0,1,2].map(ci => {
        const idx = rowIndex*3+ci, cell = board[idx];
        const stealable = stealMode && cell && cell.player !== currentTurn && currentTurn === myPlayer;
        const winning = winningLine.includes(idx);
        const pColor = cell?.player === "player1" ? "#e10600" : "#1565c0";
        const pLabel = cell?.player === "player1" ? "X" : "O";
        let bC = "#333", bg = "#111";
        if (stealable) { bC = "#e65100"; bg = "#1a0800"; }
        else if (winning) { bC = "#22c55e"; bg = "#0a1a0a"; }
        else if (cell?.player === "player1") { bC = "#e10600"; bg = "#1a0000"; }
        else if (cell?.player === "player2") { bC = "#1565c0"; bg = "#00001a"; }
        return (
          <button key={idx} onClick={() => onCellClick(idx)} disabled={!!cell && !stealable}
            className="aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-150 relative p-1"
            style={{ border: `1.5px solid ${bC}`, background: bg, cursor: cell && !stealable ? "default" : "pointer" }}>
            {cell ? (
              <>
                <div className="font-['Barlow_Condensed'] text-2xl font-black leading-none" style={{ color: winning ? "#22c55e" : pColor }}>{pLabel}</div>
                <div className="text-[8px] text-[#555] text-center leading-tight mt-0.5 line-clamp-2">{cell.driver}</div>
                {stealable && <div className="absolute top-1 right-1 text-[10px]">🏎️</div>}
              </>
            ) : <Plus className="w-5 h-5 text-[#333]" />}
          </button>
        );
      })}
    </>
  );
}

function GameOverScreen({ result, myPlayer, onPlayAgain, onBackToMenu }: {
  result: WinResult; myPlayer: Player; onPlayAgain: () => void; onBackToMenu: () => void;
}) {
  const isWinner = result.winner === myPlayer, isDraw = result.draw;
  const [copied, setCopied] = useState(false);
  const text = isDraw ? "F1 Grid — Draw! 🤝" : isWinner ? "F1 Grid — I won! 🏆" : "F1 Grid — Opponent won 😔";
  const share = async () => {
    try { await navigator.clipboard.writeText(text); } catch {
      const el = document.createElement("textarea"); el.value = text; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-col items-center text-center py-8 animate-in fade-in">
      <div className="text-5xl mb-3">{isDraw ? "🤝" : isWinner ? "🏆" : "😔"}</div>
      <div className="font-['Barlow_Condensed'] text-4xl font-black mb-2" style={{ color: isDraw ? "white" : isWinner ? "#e10600" : "#555" }}>{isDraw ? "Draw!" : isWinner ? "You Win!" : "Opponent Wins!"}</div>
      <p className="text-sm text-[#555] mb-6">{isDraw ? "A perfectly matched game" : isWinner ? "Excellent F1 knowledge!" : "Better luck next time"}</p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button onClick={onPlayAgain} className="py-3.5 bg-[#e10600] rounded-xl text-sm font-bold text-white hover:bg-[#e10600]/90 transition-colors">Play again</button>
        <button onClick={share} className="py-3.5 border border-[#333] rounded-xl text-sm font-semibold text-[#666] hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied!" : "Share result"}</button>
        <button onClick={onBackToMenu} className="py-3.5 border border-[#222] rounded-xl text-sm font-semibold text-[#444] hover:bg-[#1a1a1a] transition-colors">Back to menu</button>
      </div>
    </div>
  );
}

export function F1Grid() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [grid, setGrid] = useState<GridConfig | null>(null);
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<Player>("player1");
  const [stealsP1, setStealsP1] = useState(3);
  const [stealsP2, setStealsP2] = useState(3);
  const [stealMode, setStealMode] = useState(false);
  const [winner, setWinner] = useState<WinResult | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player>("player1");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [answerModalCell, setAnswerModalCell] = useState<number | null>(null);
  const [isStealAttempt, setIsStealAttempt] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevBoardRef = useRef(board);

  const startNewGame = useCallback((g: GridConfig, player: Player, code: string | null) => {
    setGrid(g); setBoard(Array(9).fill(null)); setCurrentTurn("player1"); setStealsP1(3); setStealsP2(3);
    setStealMode(false); setWinner(null); setMyPlayer(player); setRoomCode(code); setAnswerModalCell(null); setThinking(false);
  }, []);

  const startOffline = useCallback(() => {
    const g = generateValidGrid(); if (!g) return;
    startNewGame(g, "player1", null); setScreen("offline");
  }, [startNewGame]);

  const handleCellClick = useCallback((cellIndex: number) => {
    if (cellIndex === -1) { setStealMode(s => !s); return; }
    if (!grid || winner) return;
    const cell = board[cellIndex];
    if (stealMode && cell && cell.player !== myPlayer) {
      const ms = myPlayer === "player1" ? stealsP1 : stealsP2;
      if (ms <= 0) return;
      setIsStealAttempt(true); setAnswerModalCell(cellIndex); return;
    }
    if (cell) return;
    if (currentTurn !== myPlayer) return;
    setStealMode(false); setIsStealAttempt(false); setAnswerModalCell(cellIndex);
  }, [grid, board, winner, stealMode, myPlayer, stealsP1, stealsP2, currentTurn]);

  const submitAnswer = useCallback((driverName: string) => {
    if (answerModalCell === null || !grid) return;
    const idx = answerModalCell, cell = board[idx];
    const nb = [...board]; nb[idx] = { player: myPlayer, driver: driverName }; setBoard(nb);
    if (isStealAttempt && cell) { if (myPlayer === "player1") setStealsP1(s => s-1); else setStealsP2(s => s-1); }
    setAnswerModalCell(null); setIsStealAttempt(false); setStealMode(false);
  }, [answerModalCell, grid, board, isStealAttempt, myPlayer]);

  useEffect(() => {
    if (!grid || winner) return;
    const r = checkWinner(board);
    if (r) { setWinner(r); setTimeout(() => setScreen("game-over"), 600); }
  }, [board, grid, winner]);

  useEffect(() => {
    if (screen !== "offline" || !grid || winner) return;
    const prev = prevBoardRef.current;
    const ci = board.findIndex((c, i) => c !== prev[i]);
    if (ci >= 0 && board[ci]?.player === "player1" && currentTurn === "player1") setCurrentTurn("player2");
    prevBoardRef.current = board;
  }, [board, screen, grid, winner, currentTurn]);

  useEffect(() => {
    if (screen !== "offline" || !grid || winner || currentTurn !== "player2") return;
    setThinking(true);
    const t = setTimeout(() => {
      const move = computerMove(board, grid);
      if (move !== null) {
        const col = grid.columns[move%3], row = grid.rows[Math.floor(move/3)];
        const vd = getValidDrivers(col.tag, row.tag);
        const d = vd[Math.floor(Math.random()*vd.length)];
        const nb = [...board]; nb[move] = { player: "player2", driver: d.name }; setBoard(nb);
      }
      setCurrentTurn("player1"); setThinking(false);
    }, 1500);
    return () => { clearTimeout(t); setThinking(false); };
  }, [screen, currentTurn, grid, board, winner]);

  const createOnlineRoom = useCallback(() => {
    const g = generateValidGrid(); if (!g) return;
    const code = generateRoomCode();
    setRoomCode(code); setMyPlayer("player1"); setGrid(g);
    setBoard(Array(9).fill(null)); setCurrentTurn("player1"); setStealsP1(3); setStealsP2(3);
    setStealMode(false); setWinner(null); setScreen("online-wait");
    localStorage.setItem(`f1grid-room-${code}`, JSON.stringify({ grid: g, board: Array(9).fill(null), currentTurn: "player1", stealsP1: 3, stealsP2: 3, status: "waiting", player2Joined: false }));
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      const raw = localStorage.getItem(`f1grid-room-${code}`); if (!raw) return;
      const room = JSON.parse(raw);
      if (room.player2Joined && room.status === "active") { if (pollRef.current) clearInterval(pollRef.current); setScreen("online-play"); }
    }, 1000);
  }, []);

  const joinOnlineRoom = useCallback(() => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) { setJoinError("Room code must be 6 characters"); return; }
    const raw = localStorage.getItem(`f1grid-room-${code}`);
    if (!raw) { setJoinError("Room not found. Check the code and try again."); return; }
    const room = JSON.parse(raw);
    if (room.status !== "waiting") { setJoinError("Game already started or finished."); return; }
    room.player2Joined = true; room.status = "active";
    localStorage.setItem(`f1grid-room-${code}`, JSON.stringify(room));
    setGrid(room.grid); setBoard(room.board); setCurrentTurn("player1"); setStealsP1(room.stealsP1); setStealsP2(room.stealsP2);
    setMyPlayer("player2"); setRoomCode(code); setStealMode(false); setWinner(null); setScreen("online-play");
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      const r = localStorage.getItem(`f1grid-room-${code}`); if (!r) return;
      const rm = JSON.parse(r);
      setBoard(rm.board); setCurrentTurn(rm.currentTurn); setStealsP1(rm.stealsP1); setStealsP2(rm.stealsP2);
      const result = checkWinner(rm.board);
      if (result) { setWinner(result); if (pollRef.current) clearInterval(pollRef.current); setTimeout(() => setScreen("game-over"), 600); }
    }, 1000);
  }, [joinCode]);

  useEffect(() => {
    if (screen !== "online-play" || !grid || winner || !roomCode) return;
    const prev = prevBoardRef.current;
    const ci = board.findIndex((c, i) => c !== prev[i]);
    if (ci >= 0 && board[ci]?.player === myPlayer) {
      const nt: Player = myPlayer === "player1" ? "player2" : "player1";
      setCurrentTurn(nt);
      const raw = localStorage.getItem(`f1grid-room-${roomCode}`);
      if (raw) { const room = JSON.parse(raw); room.board = board; room.currentTurn = nt; room.stealsP1 = stealsP1; room.stealsP2 = stealsP2; localStorage.setItem(`f1grid-room-${roomCode}`, JSON.stringify(room)); }
    }
    prevBoardRef.current = board;
  }, [board, screen, grid, winner, roomCode, myPlayer, stealsP1, stealsP2]);

  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

  if (screen === "menu") {
    return (
      <div className="flex flex-col items-center text-center py-6 animate-in fade-in">
        <div className="font-['Barlow_Condensed'] text-5xl font-black text-white leading-none mb-2">F1 GRID</div>
        <p className="text-sm text-[#555] mb-6 leading-relaxed max-w-sm">Name a driver who fits both criteria to claim each square. First to three in a row wins.</p>
        <div className="flex flex-col gap-3 w-full max-w-sm mb-6">
          <button onClick={startOffline} className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#333] rounded-xl text-left hover:border-[#555] transition-all active:scale-[0.98]">
            <span className="text-3xl">🤖</span>
            <div><div className="text-sm font-bold text-white">Play vs Computer</div><div className="text-xs text-[#555] mt-0.5">Challenge the AI — available any time</div></div>
          </button>
          <button onClick={() => setScreen("online-setup")} className="flex items-center gap-3 p-4 bg-[#1a0000] border border-[#e10600]/30 rounded-xl text-left hover:border-[#e10600] transition-all active:scale-[0.98]">
            <span className="text-3xl">🌐</span>
            <div><div className="text-sm font-bold text-[#e10600]">Play Online</div><div className="text-xs text-[#555] mt-0.5">Challenge a friend with a room code</div></div>
          </button>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 text-left max-w-sm w-full">
          <div className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2">How to play</div>
          <div className="text-xs text-[#666] leading-relaxed">
            • Tap a cell and name a driver fitting BOTH criteria<br />
            • Claim 3 cells in a row to win<br />
            • Each player has 3 🏎️ steals — use them to take opponent cells<br />
            • A steal requires naming a DIFFERENT valid driver
          </div>
        </div>
      </div>
    );
  }

  if (screen === "online-setup") {
    return (
      <div className="flex flex-col gap-4 py-2 animate-in fade-in">
        <div><p className="text-sm font-bold text-white mb-1">Play Online</p><p className="text-xs text-[#555] mb-5">Create a room and share the code with a friend</p></div>
        <button onClick={createOnlineRoom} className="w-full py-3.5 bg-[#e10600] rounded-xl text-sm font-bold text-white hover:bg-[#e10600]/90 transition-colors">Create new room →</button>
        <div className="flex items-center gap-3 my-1"><div className="flex-1 h-px bg-[#333]" /><span className="text-xs text-[#555]">OR</span><div className="flex-1 h-px bg-[#333]" /></div>
        <div>
          <label className="text-[11px] font-bold text-[#555] uppercase tracking-wider block mb-1.5">Enter room code</label>
          <div className="flex gap-2">
            <input type="text" value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase().slice(0,6)); setJoinError(""); }} onKeyDown={e => e.key === "Enter" && joinOnlineRoom()} placeholder="ABC123" maxLength={6}
              className="flex-1 px-3.5 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white text-base font-mono font-bold tracking-widest uppercase outline-none focus:border-[#e10600]/50 transition-colors" />
            <button onClick={joinOnlineRoom} className="px-5 py-3 bg-[#e10600] rounded-lg text-sm font-bold text-white hover:bg-[#e10600]/90 transition-colors">Join →</button>
          </div>
          {joinError && <div className="flex items-center gap-2 mt-2 text-sm text-[#e10600]"><AlertCircle className="w-4 h-4 shrink-0" /><span>{joinError}</span></div>}
        </div>
        <button onClick={() => setScreen("menu")} className="text-sm text-[#555] hover:text-[#777] transition-colors mt-2">← Back to menu</button>
      </div>
    );
  }

  if (screen === "online-wait" && roomCode) {
    return (
      <div className="flex flex-col items-center text-center py-8 animate-in fade-in">
        <p className="text-sm text-[#555] mb-3">Share this code with your opponent</p>
        <div className="font-mono text-5xl font-black text-[#e10600] tracking-widest mb-5">{roomCode}</div>
        <button onClick={() => { navigator.clipboard.writeText(roomCode).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
          className="px-6 py-3 border border-[#333] rounded-xl text-sm font-semibold text-[#666] hover:bg-[#1a1a1a] transition-colors flex items-center gap-2 mb-5">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied!" : "Copy code"}
        </button>
        <div className="text-sm text-[#555]">Waiting for opponent to join...</div>
        <Loader2 className="w-6 h-6 text-[#e10600] animate-spin mt-4" />
        <button onClick={() => { if (pollRef.current) clearInterval(pollRef.current); localStorage.removeItem(`f1grid-room-${roomCode}`); setScreen("menu"); }} className="mt-6 text-sm text-[#555] hover:text-[#777] transition-colors">Cancel</button>
      </div>
    );
  }

  if (screen === "game-over" && winner) {
    return <GameOverScreen result={winner} myPlayer={myPlayer}
      onPlayAgain={() => { if (roomCode) localStorage.removeItem(`f1grid-room-${roomCode}`); startOffline(); }}
      onBackToMenu={() => { if (roomCode) localStorage.removeItem(`f1grid-room-${roomCode}`); if (pollRef.current) clearInterval(pollRef.current); setScreen("menu"); }} />;
  }

  if ((screen === "offline" || screen === "online-play") && grid) {
    return (
      <div className="flex flex-col gap-4 py-2 animate-in fade-in">
        <GameBoard grid={grid} board={board} currentTurn={currentTurn} myPlayer={myPlayer} stealMode={stealMode}
          stealsP1={stealsP1} stealsP2={stealsP2} winningLine={winner?.line ?? []} onCellClick={handleCellClick}
          isOnline={screen === "online-play"} thinking={thinking} />
        {answerModalCell !== null && (
          <AnswerModal cellIndex={answerModalCell} grid={grid} isSteal={isStealAttempt}
            existingDriver={board[answerModalCell]?.driver ?? null} onSubmit={submitAnswer}
            onCancel={() => { setAnswerModalCell(null); setIsStealAttempt(false); }} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8">
      <p className="text-sm text-[#555]">Something went wrong. Go back to menu.</p>
      <button onClick={() => setScreen("menu")} className="mt-4 text-sm text-[#e10600]">← Menu</button>
    </div>
  );
}
