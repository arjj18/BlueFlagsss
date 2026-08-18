import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, set, onValue, update, get, remove } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import '../styles/F1Grid.css';

interface GridCell {
  position: number;
  driver: string | null;
  isCorrect: boolean;
}

interface MultiplayerSession {
  sessionId: string;
  createdBy: string;
  participants: Record<string, ParticipantData>;
  grid: GridCell[];
  started: boolean;
  createdAt: number;
}

interface ParticipantData {
  userId: string;
  username: string;
  score: number;
  grid: Record<number, string>;
  joinedAt: number;
}

interface DriverOption {
  name: string;
  country: string;
  team: string;
}

const F1_DRIVERS_2024: DriverOption[] = [
  { name: 'Max Verstappen', country: 'Netherlands', team: 'Red Bull' },
  { name: 'Lando Norris', country: 'United Kingdom', team: 'McLaren' },
  { name: 'Oscar Piastri', country: 'Australia', team: 'McLaren' },
  { name: 'Carlos Sainz', country: 'Spain', team: 'Ferrari' },
  { name: 'Charles Leclerc', country: 'Monaco', team: 'Ferrari' },
  { name: 'Lewis Hamilton', country: 'United Kingdom', team: 'Mercedes' },
  { name: 'George Russell', country: 'United Kingdom', team: 'Mercedes' },
  { name: 'Fernando Alonso', country: 'Spain', team: 'Aston Martin' },
  { name: 'Lance Stroll', country: 'Canada', team: 'Aston Martin' },
  { name: 'Nico Hulkenberg', country: 'Germany', team: 'Haas' },
  { name: 'Kevin Magnussen', country: 'Denmark', team: 'Haas' },
  { name: 'Pierre Gasly', country: 'France', team: 'Alpine' },
  { name: 'Esteban Ocon', country: 'France', team: 'Alpine' },
  { name: 'Yuki Tsunoda', country: 'Japan', team: 'Racing Bulls' },
  { name: 'Daniel Ricciardo', country: 'Australia', team: 'Racing Bulls' },
  { name: 'Sergio Perez', country: 'Mexico', team: 'Red Bull' },
  { name: 'Zhou Guanyu', country: 'China', team: 'Alfa Romeo' },
  { name: 'Valtteri Bottas', country: 'Finland', team: 'Alfa Romeo' },
  { name: 'Alex Albon', country: 'Thailand', team: 'Williams' },
  { name: 'Logan Sargeant', country: 'United States', team: 'Williams' },
];

const F1Grid: React.FC = () => {
  const auth = getAuth();
  const database = getDatabase();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Auth & User state
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [authComplete, setAuthComplete] = useState(false);

  // Game mode state
  const [gameMode, setGameMode] = useState<'menu' | 'solo' | 'multiplayer' | 'join'>('menu');
  const [sessionId, setSessionId] = useState<string>('');
  const [joinSessionId, setJoinSessionId] = useState<string>('');

  // Game state
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [userGrid, setUserGrid] = useState<Record<number, string>>({});
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [filteredDrivers, setFilteredDrivers] = useState<DriverOption[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Multiplayer state
  const [multiplayerSession, setMultiplayerSession] = useState<MultiplayerSession | null>(null);
  const [participants, setParticipants] = useState<Record<string, ParticipantData>>({});
  const [shareCode, setShareCode] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Initialize Firebase auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        if (auth.currentUser) {
          setUserId(auth.currentUser.uid);
          setAuthComplete(true);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    initAuth();
  }, [auth]);

  // Set username
  const handleSetUsername = () => {
    if (usernameInput.trim()) {
      setUsername(usernameInput.trim());
    }
  };

  // Initialize solo game
  const startSoloGame = () => {
    const newGrid: GridCell[] = Array.from({ length: 20 }, (_, i) => ({
      position: i + 1,
      driver: null,
      isCorrect: false,
    }));
    setGrid(newGrid);
    setUserGrid({});
    setScore(0);
    setGameStarted(true);
    setGameComplete(false);
    setGameMode('solo');
  };

  // Create multiplayer session
  const createMultiplayerSession = async () => {
    if (!userId || !username) return;

    const newSessionId = Math.random().toString(36).substring(2, 11).toUpperCase();
    const newSession: MultiplayerSession = {
      sessionId: newSessionId,
      createdBy: userId,
      participants: {
        [userId]: {
          userId,
          username,
          score: 0,
          grid: {},
          joinedAt: Date.now(),
        },
      },
      grid: Array.from({ length: 20 }, (_, i) => ({
        position: i + 1,
        driver: null,
        isCorrect: false,
      })),
      started: false,
      createdAt: Date.now(),
    };

    try {
      await set(ref(database, `f1grid-sessions/${newSessionId}`), newSession);
      setSessionId(newSessionId);
      setShareCode(newSessionId);
      setGameMode('multiplayer');
      setGameStarted(false);
      setMultiplayerSession(newSession);
      
      // Listen for session updates
      subscribeToSession(newSessionId);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Join multiplayer session
  const joinMultiplayerSession = async () => {
    if (!userId || !username || !joinSessionId) return;

    try {
      const sessionRef = ref(database, `f1grid-sessions/${joinSessionId}`);
      const snapshot = await get(sessionRef);

      if (!snapshot.exists()) {
        alert('Session not found');
        return;
      }

      const session = snapshot.val() as MultiplayerSession;

      // Add current user to participants
      const updatedParticipants = {
        ...session.participants,
        [userId]: {
          userId,
          username,
          score: 0,
          grid: {},
          joinedAt: Date.now(),
        },
      };

      await update(sessionRef, { participants: updatedParticipants });

      setSessionId(joinSessionId);
      setGameMode('multiplayer');
      setMultiplayerSession(session);
      subscribeToSession(joinSessionId);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Could not join session');
    }
  };

  // Subscribe to session updates
  const subscribeToSession = (sid: string) => {
    const sessionRef = ref(database, `f1grid-sessions/${sid}`);
    onValue(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        const session = snapshot.val() as MultiplayerSession;
        setMultiplayerSession(session);
        setParticipants(session.participants);
        if (session.started && !gameStarted) {
          setGameStarted(true);
        }
      }
    });
  };

  // Start multiplayer game
  const startMultiplayerGame = async () => {
    if (!sessionId) return;

    try {
      await update(ref(database, `f1grid-sessions/${sessionId}`), { started: true });
      setGameStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  // Autocomplete filter
  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    
    if (value.length === 0) {
      setFilteredDrivers([]);
    } else {
      const filtered = F1_DRIVERS_2024.filter(driver =>
        driver.name.toLowerCase().includes(value.toLowerCase()) ||
        driver.team.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDrivers(filtered);
    }
  };

  // Select driver from autocomplete
  const selectDriver = (driver: DriverOption) => {
    if (activeCell !== null) {
      const newUserGrid = { ...userGrid, [activeCell]: driver.name };
      setUserGrid(newUserGrid);
      
      // Update multiplayer session if active
      if (gameMode === 'multiplayer' && sessionId && userId) {
        const participantRef = ref(
          database,
          `f1grid-sessions/${sessionId}/participants/${userId}/grid`
        );
        update(participantRef, { [activeCell]: driver.name });
      }

      setCurrentInput('');
      setFilteredDrivers([]);
      setActiveCell(null);
    }
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (!gameStarted || gameComplete) return;
    setActiveCell(index);
    setCurrentInput('');
  };

  // Calculate score
  const calculateScore = useCallback(() => {
    if (!gameMode || gameMode === 'menu') return 0;
    
    let correctCount = 0;
    Object.values(userGrid).forEach(driver => {
      if (F1_DRIVERS_2024.some(d => d.name === driver)) {
        correctCount++;
      }
    });
    return correctCount;
  }, [userGrid, gameMode]);

  useEffect(() => {
    setScore(calculateScore());
  }, [userGrid, calculateScore]);

  // Submit game
  const submitGame = async () => {
    setGameComplete(true);
    
    if (gameMode === 'multiplayer' && sessionId && userId) {
      try {
        await update(ref(database, `f1grid-sessions/${sessionId}/participants/${userId}`), {
          score,
        });
      } catch (error) {
        console.error('Error submitting score:', error);
      }
    }
  };

  // Draw grid
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;

    const cellSize = canvas.width / 5;
    const colors = ['#FF1801', '#0082FA', '#39B54A', '#FFC800', '#9B59B6'];

    // Draw grid
    for (let i = 0; i < 20; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = col * cellSize;
      const y = row * cellSize;

      const color = colors[col];
      ctx.fillStyle = activeCell === i ? 'rgba(255, 255, 255, 0.3)' : color;
      ctx.fillRect(x, y, cellSize, cellSize);

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellSize, cellSize);

      // Draw position number
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`P${i + 1}`, x + cellSize / 2, y + 10);

      // Draw driver name if filled
      if (userGrid[i]) {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const driverText = userGrid[i].split(' ')[1] || userGrid[i];
        ctx.fillText(driverText, x + cellSize / 2, y + cellSize / 2 + 15);
      }
    }
  }, [userGrid, activeCell]);

  // If not authenticated, show loading
  if (!authComplete) {
    return <div className="f1grid-container">Initializing...</div>;
  }

  // Username setup
  if (!username) {
    return (
      <div className="f1grid-container">
        <div className="username-setup">
          <h2>Enter Your Username</h2>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
            placeholder="Your name..."
          />
          <button onClick={handleSetUsername}>Continue</button>
        </div>
      </div>
    );
  }

  // Main menu
  if (gameMode === 'menu') {
    return (
      <div className="f1grid-container">
        <div className="menu">
          <h1>🏁 F1 Grid Challenge</h1>
          <p>Welcome, {username}!</p>
          <div className="menu-buttons">
            <button className="btn-primary" onClick={startSoloGame}>
              Solo Game
            </button>
            <button className="btn-primary" onClick={createMultiplayerSession}>
              Create Multiplayer
            </button>
            <button className="btn-primary" onClick={() => setGameMode('join')}>
              Join Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join session screen
  if (gameMode === 'join') {
    return (
      <div className="f1grid-container">
        <div className="join-session">
          <h2>Join Multiplayer Session</h2>
          <input
            type="text"
            value={joinSessionId}
            onChange={(e) => setJoinSessionId(e.target.value.toUpperCase())}
            placeholder="Enter session code..."
            maxLength={9}
          />
          <button onClick={joinMultiplayerSession}>Join</button>
          <button onClick={() => setGameMode('menu')}>Back</button>
        </div>
      </div>
    );
  }

  // Waiting room for multiplayer
  if (gameMode === 'multiplayer' && !gameStarted) {
    return (
      <div className="f1grid-container">
        <div className="waiting-room">
          <h2>Waiting Room</h2>
          <div className="share-code">
            <p>Session Code: <strong>{shareCode || sessionId}</strong></p>
            <button onClick={() => navigator.clipboard.writeText(shareCode || sessionId)}>
              Copy Code
            </button>
          </div>
          
          <div className="participants-list">
            <h3>Players ({Object.keys(participants).length})</h3>
            {Object.values(participants).map((p) => (
              <div key={p.userId} className="participant">
                {p.username}
              </div>
            ))}
          </div>

          <button 
            className="btn-primary" 
            onClick={startMultiplayerGame}
            disabled={userId !== multiplayerSession?.createdBy}
          >
            {userId === multiplayerSession?.createdBy ? 'Start Game' : 'Waiting for host...'}
          </button>
          <button onClick={() => setGameMode('menu')}>Back</button>
        </div>
      </div>
    );
  }

  // Game screen
  if (gameStarted && !gameComplete) {
    return (
      <div className="f1grid-container">
        <div className="game-screen">
          <div className="game-header">
            <h2>F1 Grid Challenge</h2>
            <div className="score-info">
              <p>Score: {score}/20</p>
              {gameMode === 'multiplayer' && <p>Players: {Object.keys(participants).length}</p>}
            </div>
          </div>

          <div className="game-content">
            <canvas ref={canvasRef} className="grid-canvas" />
            
            <div className="input-section">
              {activeCell !== null && (
                <div>
                  <p>Position {activeCell + 1}</p>
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Type driver name..."
                    autoFocus
                  />
                  
                  {filteredDrivers.length > 0 && (
                    <div className="autocomplete-results">
                      {filteredDrivers.map((driver, idx) => (
                        <div
                          key={idx}
                          className="driver-option"
                          onClick={() => selectDriver(driver)}
                        >
                          <strong>{driver.name}</strong>
                          <span>{driver.team}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="game-buttons">
            <button className="btn-primary" onClick={submitGame}>
              Submit Game
            </button>
            <button onClick={() => setGameMode('menu')}>Exit</button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameComplete) {
    return (
      <div className="f1grid-container">
        <div className="results-screen">
          <h2>Game Complete! 🎉</h2>
          <div className="score-display">
            <h3>Your Score: {score}/20</h3>
            <p>Accuracy: {Math.round((score / 20) * 100)}%</p>
          </div>

          {gameMode === 'multiplayer' && (
            <div className="leaderboard">
              <h3>Leaderboard</h3>
              {Object.values(participants)
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div key={p.userId} className="leaderboard-entry">
                    <span>#{idx + 1}</span>
                    <span>{p.username}</span>
                    <span>{p.score}/20</span>
                  </div>
                ))}
            </div>
          )}

          <div className="results-buttons">
            <button className="btn-primary" onClick={() => setGameMode('menu')}>
              Back to Menu
            </button>
            <button onClick={startSoloGame}>Play Again</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default F1Grid;
