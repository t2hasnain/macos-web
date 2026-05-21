// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useEffect, useRef } from 'react';
import { Gamepad2, RotateCcw, Award, Play, ChevronLeft, Trash2, Trophy, BarChart3 } from 'lucide-react';
import { useOSStore, GameStats } from '@/store/osStore';
import MacIcon from '../MacIcon';

type GameId = 'menu' | 'tictactoe' | 'snake' | 'minesweeper' | 'cookie' | 'memory';

export default function GameApp() {
  const [activeGame, setActiveGame] = useState<GameId>('menu');

  return (
    <div className="macos-app h-full flex flex-col font-sans select-none">
      {/* Header */}
      <div className="macos-toolbar px-6 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activeGame !== 'menu' && (
            <button 
              onClick={() => setActiveGame('menu')}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <MacIcon id="game" className="w-8 h-8" />
          <span className="font-semibold text-sm text-slate-900">Arcade</span>
        </div>
      </div>

      {/* Game Screens */}
      <div className="flex-1 overflow-y-auto">
        {activeGame === 'menu' && <GameMenu onSelect={setActiveGame} />}
        {activeGame === 'tictactoe' && <TicTacToeGame />}
        {activeGame === 'snake' && <SnakeGame />}
        {activeGame === 'minesweeper' && <MinesweeperGame />}
        {activeGame === 'cookie' && <CookieClickerGame />}
        {activeGame === 'memory' && <MemoryMatchGame />}
      </div>
    </div>
  );
}

function GameMenu({ onSelect }: { onSelect: (id: GameId) => void }) {
  const { gameStats } = useOSStore();
  const games = [
    { id: 'tictactoe', name: 'Tic-Tac-Toe', desc: 'Classic three-in-a-row board', tag: 'Puzzle', icon: 'appstore' },
    { id: 'snake', name: 'Snake', desc: 'Classic grid arcade game', tag: 'Arcade', icon: 'game' },
    { id: 'minesweeper', name: 'Minesweeper', desc: 'Flag mines and clear the field', tag: 'Strategy', icon: 'calculator' },
    { id: 'cookie', name: 'Clicker', desc: 'Simple incremental score game', tag: 'Casual', icon: 'podcasts' },
    { id: 'memory', name: 'Memory', desc: 'Match cards with flips', tag: 'Memory', icon: 'gallery' }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <MacIcon id="game" className="w-8 h-8" />
          Arcade Library
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">Choose a game to play.</p>
      </div>

      {/* Grid of games */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {games.map((g) => {
          const stats: GameStats = gameStats[g.id] || { highScore: 0, wins: 0, losses: 0, draws: 0, history: [] };
          return (
            <div 
              key={g.id}
              onClick={() => onSelect(g.id as GameId)}
              className="macos-card rounded-xl p-5 flex flex-col gap-4 cursor-pointer transition-all duration-150 group hover:scale-[1.02]"
            >
              <div className="flex gap-4 items-center">
                <MacIcon id={g.icon} className="w-12 h-12 group-hover:scale-105 transition-transform duration-150" />
                <div className="flex flex-col">
                  <h3 className="font-bold text-xs text-slate-900">{g.name}</h3>
                  <span className="text-[9px] text-slate-500 mt-0.5 font-semibold">{g.tag}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed pr-2 h-8 overflow-hidden">{g.desc}</p>
              
              <div className="flex items-center justify-between border-t border-black/10 pt-3 mt-1 text-[9px] text-slate-500 font-semibold">
                <span>Record: <strong className="text-slate-900">{stats.highScore}</strong></span>
                <span>W/L: <strong className="text-green-400">{stats.wins}</strong>/<strong className="text-red-400">{stats.losses}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 2. STATS COMPONENT SIDEBAR */
function GameStatsPanel({ gameId }: { gameId: string }) {
  const { gameStats, resetGameStats } = useOSStore();
  const stats = gameStats[gameId] || { highScore: 0, wins: 0, losses: 0, draws: 0, history: [] };

  return (
    <div className="w-80 bg-black/30 border-l border-white/5 p-5 flex flex-col justify-between select-text">
      <div className="flex flex-col gap-5 overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Statistics & Records</span>
          </div>
          <button 
            onClick={() => resetGameStats(gameId)}
            className="p-1 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
            title="Reset Game Stats"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Highest Record</span>
            <span className="text-xl font-bold text-yellow-400 font-mono">{stats.highScore}</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Win Rate</span>
            <span className="text-xl font-bold text-green-400 font-mono">
              {stats.wins + stats.losses > 0 
                ? `${Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%` 
                : '0%'}
            </span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Total Wins</span>
            <span className="text-sm font-bold text-white font-mono">{stats.wins} matches</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Losses/Draws</span>
            <span className="text-sm font-bold text-white font-mono">{stats.losses} L / {stats.draws} D</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 overflow-hidden flex-1">
          <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Match Logs History</span>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1.5 scrollbar-none">
            {stats.history.length === 0 ? (
              <span className="text-[10px] text-white/20 italic text-center py-4">No match records logged.</span>
            ) : (
              stats.history.map((entry, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-[10px]">
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-bold ${
                      entry.result === 'Win' ? 'text-green-400' : entry.result === 'Loss' ? 'text-red-400' : 'text-slate-400'
                    }`}>{entry.result === 'Score' ? 'Completed' : entry.result}</span>
                    <span className="text-[8px] text-white/30">{entry.date}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 font-mono">
                    {entry.score !== undefined && <span className="font-bold text-yellow-400">Pts: {entry.score}</span>}
                    {entry.detail && <span className="text-[8px] text-white/50">{entry.detail}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* 3. TIC TAC TOE GAME */
function TicTacToeGame() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const { updateGameStats } = useOSStore();

  const calculateWinner = (squares: string[]) => {
    const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (calculateWinner(board) || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const winner = calculateWinner(newBoard);
    const isDraw = !winner && newBoard.every((s) => s !== null);
    
    if (winner) {
      updateGameStats('tictactoe', winner === 'X' ? 'Win' : 'Loss', 100, `Defeated opponent`);
    } else if (isDraw) {
      updateGameStats('tictactoe', 'Draw', undefined, `Grid filled`);
    }
    setXIsNext(!xIsNext);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((s) => s !== null);
  const status = winner ? `Winner: ${winner}` : isDraw ? "It's a draw!" : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 bg-slate-950/20">
        <h3 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Tic-Tac-Toe Neon</h3>
        <span className="text-xs text-white/50 mb-2 font-semibold">{status}</span>
        
        <div className="grid grid-cols-3 gap-2.5">
          {board.map((cell, i) => (
            <button 
              key={i}
              onClick={() => handleClick(i)}
              className={`w-20 h-20 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-3xl font-extrabold transition-all duration-300 active:scale-95 flex items-center justify-center ${
                cell === 'X' ? 'text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.25)]' : cell === 'O' ? 'text-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.25)]' : 'transparent'
              }`}
            >
              {cell}
            </button>
          ))}
        </div>
        <button onClick={reset} className="flex items-center gap-2 mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition-all">
          <RotateCcw size={12} /> Restart Match
        </button>
      </div>

      <GameStatsPanel gameId="tictactoe" />
    </div>
  );
}

/* 4. RETRO SNAKE GAME WITH SPEED LEVELS */
function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const [gameMode, setGameMode] = useState<'easy' | 'medium' | 'hard'>('medium');
  const { updateGameStats } = useOSStore();

  const snake = useRef<{x: number, y: number}[]>([{x: 10, y: 10}]);
  const food = useRef<{x: number, y: number}>({x: 5, y: 5});
  const dir = useRef<{x: number, y: number}>({x: 1, y: 0});
  const gridCount = 20;

  const handleStart = () => {
    setScore(0);
    setGameOver(false);
    setIsRunning(true);
    snake.current = [{x: 10, y: 10}];
    dir.current = {x: 1, y: 0};
    spawnFood();
  };

  const spawnFood = () => {
    food.current = {
      x: Math.floor(Math.random() * gridCount),
      y: Math.floor(Math.random() * gridCount)
    };
  };

  const getSpeed = () => {
    if (gameMode === 'easy') return 150;
    if (gameMode === 'hard') return 60;
    return 100;
  };

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (dir.current.y !== 1) dir.current = {x: 0, y: -1}; break;
        case 'ArrowDown': if (dir.current.y !== -1) dir.current = {x: 0, y: 1}; break;
        case 'ArrowLeft': if (dir.current.x !== 1) dir.current = {x: -1, y: 0}; break;
        case 'ArrowRight': if (dir.current.x !== -1) dir.current = {x: 1, y: 0}; break;
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  useEffect(() => {
    if (!isRunning || gameOver) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 300, 300);

      const head = { x: snake.current[0].x + dir.current.x, y: snake.current[0].y + dir.current.y };
      
      if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount || snake.current.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        setIsRunning(false);
        updateGameStats('snake', 'Score', score, `Level: ${gameMode.toUpperCase()}`);
        return;
      }

      snake.current.unshift(head);

      if (head.x === food.current.x && head.y === food.current.y) {
        setScore(s => s + 10);
        spawnFood();
      } else {
        snake.current.pop();
      }

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(food.current.x * 15 + 1.5, food.current.y * 15 + 1.5, 12, 12);

      ctx.fillStyle = '#10b981';
      snake.current.forEach((s) => {
        ctx.fillRect(s.x * 15 + 1.5, s.y * 15 + 1.5, 12, 12);
      });
    }, getSpeed());

    return () => clearInterval(gameLoop);
  }, [isRunning, gameOver, gameMode, score]);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3 bg-slate-950/20">
        <h3 className="text-xl font-extrabold tracking-tight text-emerald-400">Retro Snake Arena</h3>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          {['easy', 'medium', 'hard'].map((mode) => (
            <button 
              key={mode} 
              disabled={isRunning}
              onClick={() => setGameMode(mode as any)}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase transition-colors ${
                gameMode === mode ? 'bg-emerald-600 text-white shadow-sm' : 'text-white/40 hover:text-white/80'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <span className="text-xs text-white/50 font-bold">Score: {score}</span>
        
        <div className="relative w-[300px] h-[300px] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <canvas ref={canvasRef} width="300" height="300" className="w-full h-full" />
          {(!isRunning || gameOver) && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
              <span className="text-sm font-extrabold tracking-widest">{gameOver ? '💥 COLLISION DETECTED!' : 'RETRO SNAKE'}</span>
              {gameOver && <span className="text-xs text-yellow-400 font-bold">Final score: {score} Pts</span>}
              <button onClick={handleStart} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold transition-all">
                {gameOver ? 'Try Again' : 'Start Arena'}
              </button>
            </div>
          )}
        </div>
        <span className="text-[9px] text-white/30">Use Arrow keys on your keyboard to navigate.</span>
      </div>

      <GameStatsPanel gameId="snake" />
    </div>
  );
}

/* 5. MINESWEEPER GAME WITH DIFFICULTY LEVELS */
interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  count: number;
}

function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const { updateGameStats } = useOSStore();

  const getParams = () => {
    if (difficulty === 'hard') return { size: 14, mines: 30 };
    if (difficulty === 'medium') return { size: 11, mines: 18 };
    return { size: 9, mines: 10 };
  };

  const initBoard = (diff = difficulty) => {
    const { size, mines } = getParams();
    let cells: Cell[][] = [];
    for (let x = 0; x < size; x++) {
      cells[x] = [];
      for (let y = 0; y < size; y++) {
        cells[x][y] = { x, y, isMine: false, isRevealed: false, isFlagged: false, count: 0 };
      }
    }
    let placed = 0;
    while (placed < mines) {
      const rx = Math.floor(Math.random() * size);
      const ry = Math.floor(Math.random() * size);
      if (!cells[rx][ry].isMine) {
        cells[rx][ry].isMine = true;
        placed++;
      }
    }
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (cells[x][y].isMine) continue;
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (cells[x+dx]?.[y+dy]?.isMine) count++;
          }
        }
        cells[x][y].count = count;
      }
    }
    setGrid(cells);
    setGameOver(false);
    setWin(false);
  };

  const reveal = (x: number, y: number) => {
    if (gameOver || win || grid[x][y].isFlagged || grid[x][y].isRevealed) return;
    const newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[x][y].isMine) {
      newGrid.forEach(row => row.forEach(c => { if (c.isMine) c.isRevealed = true; }));
      setGrid(newGrid);
      setGameOver(true);
      updateGameStats('minesweeper', 'Loss', undefined, `Explosion!`);
      return;
    }

    const revealCell = (cx: number, cy: number) => {
      if (newGrid[cx]?.[cy] && !newGrid[cx][cy].isRevealed && !newGrid[cx][cy].isFlagged) {
        newGrid[cx][cy].isRevealed = true;
        if (newGrid[cx][cy].count === 0 && !newGrid[cx][cy].isMine) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              revealCell(cx + dx, cy + dy);
            }
          }
        }
      }
    };

    revealCell(x, y);
    
    const hasWon = newGrid.every(row => row.every(c => c.isMine || c.isRevealed));
    if (hasWon) {
      setWin(true);
      updateGameStats('minesweeper', 'Win', 500, `Cleared board`);
    }
    setGrid(newGrid);
  };

  const flag = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameOver || win || grid[x][y].isRevealed) return;
    const newGrid = [...grid.map(row => [...row])];
    newGrid[x][y].isFlagged = !newGrid[x][y].isFlagged;
    setGrid(newGrid);
  };

  useEffect(() => { initBoard(); }, [difficulty]);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3 bg-slate-950/20">
        <h3 className="text-xl font-extrabold tracking-tight text-purple-400">Minesweeper Intel</h3>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          {['easy', 'medium', 'hard'].map((diff) => (
            <button 
              key={diff} 
              onClick={() => setDifficulty(diff as any)}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase transition-colors ${
                difficulty === diff ? 'bg-purple-600 text-white shadow-sm' : 'text-white/40 hover:text-white/80'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <span className="text-xs text-white/50 font-semibold">{gameOver ? '💥 BOOM! Hit a mine.' : win ? '🎉 Clear! You win.' : 'Left click to reveal, Right click to flag'}</span>

        <div className="grid gap-1 bg-slate-950 p-2.5 rounded-2xl border border-white/10 shadow-2xl" style={{ gridTemplateColumns: `repeat(${getParams().size}, minmax(0, 1fr))` }}>
          {grid.map((row, x) => row.map((c, y) => (
            <button 
              key={`${x}-${y}`}
              onClick={() => reveal(x, y)}
              onContextMenu={(e) => flag(e, x, y)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${
                c.isRevealed 
                  ? 'bg-slate-800 border-transparent text-purple-300' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 active:scale-90 text-white/80'
              }`}
            >
              {c.isRevealed ? (c.isMine ? '💣' : c.count || '') : c.isFlagged ? '🚩' : ''}
            </button>
          )))}
        </div>

        <button onClick={() => initBoard()} className="flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold">
          <RotateCcw size={12} /> Reset Field
        </button>
      </div>

      <GameStatsPanel gameId="minesweeper" />
    </div>
  );
}

/* 6. COOKIE CLICKER GAME */
function CookieClickerGame() {
  const [cookies, setCookies] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [cps, setCps] = useState(0);
  const { updateGameStats } = useOSStore();

  const [cursorCost, setCursorCost] = useState(15);
  const [grandmaCost, setGrandmaCost] = useState(100);

  useEffect(() => {
    if (cps === 0) return;
    const interval = setInterval(() => {
      setCookies(c => c + cps);
      updateGameStats('cookie', 'Score', cookies + cps, `Production active`);
    }, 1000);
    return () => clearInterval(interval);
  }, [cps, cookies]);

  const buyUpgrade = (type: 'cursor' | 'grandma') => {
    if (type === 'cursor' && cookies >= cursorCost) {
      setCookies(c => c - cursorCost);
      setMultiplier(m => m + 1);
      setCursorCost(c => Math.floor(c * 1.5));
    }
    if (type === 'grandma' && cookies >= grandmaCost) {
      setCookies(c => c - grandmaCost);
      setCps(c => c + 2);
      setGrandmaCost(c => Math.floor(c * 1.6));
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 bg-slate-950/20">
        <h3 className="text-xl font-extrabold tracking-tight text-pink-400">Cookie Tycoon</h3>
        
        <div className="text-center">
          <h4 className="text-3xl font-mono font-bold text-white">{cookies}</h4>
          <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">{cps} Cookies / sec</span>
        </div>

        <button 
          onClick={() => { setCookies(cookies + multiplier); updateGameStats('cookie', 'Score', cookies + multiplier, `Manual tap`); }}
          className="w-32 h-32 bg-yellow-800 hover:bg-yellow-700 active:scale-95 border-4 border-yellow-950 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.3)] flex items-center justify-center text-4xl select-none cursor-pointer transition-all hover:shadow-[0_0_50px_rgba(234,179,8,0.5)]"
        >
          🍪
        </button>

        <div className="w-full max-w-sm flex flex-col gap-2.5 mt-4">
          <div className="flex justify-between items-center bg-[#1e2230]/40 border border-white/5 p-3 rounded-2xl">
            <div>
              <h5 className="text-xs font-bold text-white/95">Auto Cursor</h5>
              <span className="text-[10px] text-indigo-400 font-bold">+1 Cookie / click</span>
            </div>
            <button 
              disabled={cookies < cursorCost}
              onClick={() => buyUpgrade('cursor')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                cookies >= cursorCost ? 'bg-pink-600 hover:bg-pink-500' : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              Buy ({cursorCost} c)
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#1e2230]/40 border border-white/5 p-3 rounded-2xl">
            <div>
              <h5 className="text-xs font-bold text-white/95">Grandma Baker</h5>
              <span className="text-[10px] text-indigo-400 font-bold">+2 Cookies / sec</span>
            </div>
            <button 
              disabled={cookies < grandmaCost}
              onClick={() => buyUpgrade('grandma')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                cookies >= grandmaCost ? 'bg-pink-600 hover:bg-pink-500' : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              Buy ({grandmaCost} c)
            </button>
          </div>
        </div>
      </div>

      <GameStatsPanel gameId="cookie" />
    </div>
  );
}

/* 7. MEMORY MATCH CARDS GAME */
const cardIcons = ['🦊', '🐸', '🐨', '🐼', '🐯', '🦁', '🦖', '🦄'];

function MemoryMatchGame() {
  const [cards, setCards] = useState<{ id: number; symbol: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [win, setWin] = useState(false);
  const { updateGameStats } = useOSStore();

  const initGame = () => {
    const symbols = [...cardIcons, ...cardIcons];
    const shuffled = symbols
      .map((s, idx) => ({ id: idx, symbol: s, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setWin(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (idx: number) => {
    if (cards[idx].isFlipped || cards[idx].isMatched || flippedIndices.length >= 2) return;
    
    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].symbol === cards[second].symbol) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);

        const allMatched = newCards.every(c => c.isMatched);
        if (allMatched) {
          setWin(true);
          updateGameStats('memory', 'Win', moves + 1, `Matched cards in ${moves + 1} moves`);
        }
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3 bg-slate-950/20">
        <h3 className="text-xl font-extrabold tracking-tight text-amber-500">Memory Match Cards</h3>
        <span className="text-xs text-white/50 font-bold">{win ? `🎉 Completed in ${moves} moves!` : `Moves: ${moves}`}</span>
        
        <div className="grid grid-cols-4 gap-3 bg-[#1e2230]/40 p-4 rounded-2xl border border-white/5 shadow-2xl">
          {cards.map((card, idx) => {
            const isShown = card.isFlipped || card.isMatched;
            return (
              <button 
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 transform active:scale-90 border ${
                  isShown 
                    ? 'bg-amber-600/25 border-amber-500/50 text-white rotate-y-180' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                {isShown ? card.symbol : '❓'}
              </button>
            );
          })}
        </div>

        <button onClick={initGame} className="flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold">
          <RotateCcw size={12} /> Reset Deck
        </button>
      </div>

      <GameStatsPanel gameId="memory" />
    </div>
  );
}
