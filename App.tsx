import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GameState, LevelData, GameCard, CardSide } from './types';
import { LEVELS } from './data/levels';
import { Card } from './components/Card';
import { VoiceControl } from './components/VoiceControl';
import { identifySpokenPhrase } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [leftCards, setLeftCards] = useState<GameCard[]>([]);
  const [rightCards, setRightCards] = useState<GameCard[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showRules, setShowRules] = useState(true);

  const currentLevelData = LEVELS[currentLevelIndex];

  // --- Initialization ---
  const initializeLevel = useCallback(() => {
    const level = LEVELS[currentLevelIndex];
    
    // Create cards
    const lCards: GameCard[] = level.couplets.map(c => ({
      id: `L-${c.id}`,
      text: c.left,
      side: CardSide.LEFT,
      pairId: c.id,
      isMatched: false
    }));

    const rCards: GameCard[] = level.couplets.map(c => ({
      id: `R-${c.id}`,
      text: c.right,
      side: CardSide.RIGHT,
      pairId: c.id,
      isMatched: false
    }));

    // Shuffle right side for difficulty
    const shuffledRight = [...rCards].sort(() => Math.random() - 0.5);

    setLeftCards(lCards);
    setRightCards(shuffledRight);
    setTimeLeft(level.timeLimit);
    setGameTime(0);
    setMatchedPairs(0);
    setSelectedLeft(null);
    setSelectedRight(null);
    setGameState(GameState.PLAYING);
  }, [currentLevelIndex]);

  // --- Game Loop ---
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameState === GameState.PLAYING) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState(GameState.GAME_OVER);
            return 0;
          }
          return prev - 1;
        });
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // --- Match Logic ---
  const handleMatch = useCallback((leftId: string, rightId: string) => {
    const leftCard = leftCards.find(c => c.id === leftId);
    const rightCard = rightCards.find(c => c.id === rightId);

    if (leftCard && rightCard && leftCard.pairId === rightCard.pairId) {
      // Match Success
      setLeftCards(prev => prev.map(c => c.id === leftId ? { ...c, isMatched: true } : c));
      setRightCards(prev => prev.map(c => c.id === rightId ? { ...c, isMatched: true } : c));
      setMatchedPairs(prev => {
        const newCount = prev + 1;
        if (newCount >= currentLevelData.couplets.length) {
           setTimeout(() => handleLevelComplete(), 1000);
        }
        return newCount;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Mismatch - Clear after delay
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  }, [leftCards, rightCards, currentLevelData.couplets.length]);

  const handleLevelComplete = () => {
     if (currentLevelIndex < LEVELS.length - 1) {
         setCurrentLevelIndex(prev => prev + 1);
         setGameState(GameState.VICTORY); // Brief pause or modal could go here
         setTimeout(() => {
             // Auto start next level for flow
         }, 1000); 
     } else {
         setGameState(GameState.VICTORY);
     }
  };

  // --- Interaction Handlers ---
  const onCardClick = (card: GameCard) => {
    if (gameState !== GameState.PLAYING) return;

    if (card.side === CardSide.LEFT) {
      setSelectedLeft(card.id);
      if (selectedRight) {
        handleMatch(card.id, selectedRight);
      }
    } else {
      setSelectedRight(card.id);
      if (selectedLeft) {
        handleMatch(selectedLeft, card.id);
      }
    }
  };

  const onVoiceRecorded = async (audioBlob: Blob) => {
    if (gameState !== GameState.PLAYING) return;
    setAiProcessing(true);

    // Build list of currently active phrases from both sides
    const activeLeft = leftCards.filter(c => !c.isMatched);
    const activeRight = rightCards.filter(c => !c.isMatched);
    
    // Flatten for AI detection
    const phrasesMap = [...activeLeft, ...activeRight].map(c => c.text);
    const cardsMap = [...activeLeft, ...activeRight];

    const result = await identifySpokenPhrase(audioBlob, phrasesMap);

    if (result) {
        const matchedCard = cardsMap[result.index];
        if (matchedCard) {
            // Select the card programmatically
            onCardClick(matchedCard);
        }
    } else {
        // Feedback for no match could go here
        console.log("No matching phrase found in audio.");
    }
    setAiProcessing(false);
  };

  // --- Render Helpers ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const nextLevel = () => {
      setGameState(GameState.IDLE); // Reset to idle to potentially show rules or start
      initializeLevel();
  };
  
  // Auto start first level on mount if not showing rules, or manual start
  useEffect(() => {
      if (!showRules && gameState === GameState.IDLE) {
          initializeLevel();
      }
  }, [showRules, gameState, initializeLevel]);


  return (
    <div className="min-h-screen w-full bg-cover bg-center relative font-sans overflow-hidden"
         style={{ 
             backgroundImage: 'linear-gradient(to bottom, #e0f7fa, #b2ebf2)', // Fallback
         }}>
         
         {/* Fancy Background Layer approximating the watercolor mountains */}
         <div className="absolute inset-0 z-0 opacity-60 pointer-events-none bg-no-repeat bg-bottom bg-cover"
              style={{ backgroundImage: 'url("https://picsum.photos/1920/1080?blur=2")' }}></div>
         
         <div className="absolute inset-0 bg-pattern opacity-30 z-0 pointer-events-none"></div>

         {/* Header Bar */}
         <div className="relative z-30 flex justify-between items-center p-4 md:px-8 bg-gradient-to-b from-white/80 to-transparent">
             <button onClick={() => setShowRules(true)} className="bg-red-100 border-2 border-red-400 text-red-700 rounded-full px-4 py-1 font-bold shadow-sm hover:bg-red-50">
                ◎ 游戏引导
             </button>

             <div className="flex flex-col items-center">
                 {/* Logo Placeholder */}
                 <div className="text-3xl md:text-4xl font-bold text-cyan-800 tracking-widest drop-shadow-md" style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}>
                    廉洁对对碰
                 </div>
                 <div className="bg-cyan-600 text-white text-xs px-2 py-0.5 rounded mt-1">
                    AI语音配对
                 </div>
             </div>

             <div className="bg-white/90 border border-red-300 rounded-full px-4 py-1 flex items-center gap-2 shadow-md text-red-800 font-bold">
                <span>剩余时间: {formatTime(timeLeft)}</span>
                <span className="text-sm font-normal text-gray-600">| 当前第 {currentLevelIndex + 1} 关/共{LEVELS.length}关</span>
                <div className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-xs">?</div>
             </div>
         </div>

         {/* Main Game Area */}
         <div className="relative z-10 flex flex-col md:flex-row h-[calc(100vh-80px)] p-2 md:p-6 gap-4">
             
             {/* Left Column: Upper Sentence */}
             <div className="flex-1 flex flex-col relative">
                 <div className="self-center mb-4">
                    <div className="bg-gradient-to-r from-transparent via-cyan-800/10 to-transparent w-32 h-1 mx-auto mb-1"></div>
                    <h3 className="text-center text-white font-bold text-xl drop-shadow-md">上句</h3>
                    <div className="bg-white/30 border border-white/50 rounded-full w-20 h-6 mx-auto mt-1"></div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 mask-image-gradient">
                     {leftCards.map(card => (
                         <Card 
                            key={card.id} 
                            card={card} 
                            isSelected={selectedLeft === card.id} 
                            onClick={onCardClick}
                            disabled={gameState !== GameState.PLAYING}
                         />
                     ))}
                 </div>
             </div>

             {/* Center Column: Gameplay Stats & Voice */}
             <div className="w-full md:w-1/4 flex flex-col items-center justify-center relative shrink-0">
                  {/* Level Info Pill */}
                  <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full px-6 py-1.5 mb-4 shadow-lg border border-white/30 font-bold">
                      第{currentLevelIndex + 1}关 {currentLevelData.name}
                  </div>

                  {/* Score */}
                  <div className="text-center mb-6 text-amber-600 drop-shadow-sm">
                      <div className="text-sm text-cyan-800 font-bold">成功匹配</div>
                      <div className="text-5xl font-bold text-amber-500 drop-shadow-white stroke-white">{matchedPairs}对</div>
                      <div className="text-sm text-cyan-800">共{currentLevelData.couplets.length}对</div>
                  </div>

                  {/* Timer Circle */}
                  <div className="mb-8 text-center">
                      <div className="text-cyan-800 font-bold mb-1">当前用时</div>
                      <div className="text-3xl font-mono font-bold text-white drop-shadow-md">
                          {formatTime(gameTime)}
                      </div>
                  </div>

                  {/* Voice Control */}
                  <VoiceControl 
                    onAudioRecorded={onVoiceRecorded} 
                    isProcessing={aiProcessing}
                    disabled={gameState !== GameState.PLAYING}
                  />

                  {/* Restart / Next Button */}
                  <button 
                    onClick={() => {
                        setCurrentLevelIndex(0);
                        initializeLevel();
                    }}
                    className="mt-8 bg-white/80 hover:bg-white text-cyan-700 font-bold py-2 px-8 rounded-full border-2 border-cyan-300 shadow-lg transition transform hover:scale-105"
                  >
                    重新开始
                  </button>

                  {gameState === GameState.VICTORY && (
                       <button 
                       onClick={nextLevel}
                       className="mt-4 bg-amber-500 hover:bg-amber-400 text-white font-bold py-2 px-8 rounded-full border-2 border-amber-300 shadow-xl animate-bounce"
                     >
                       {currentLevelIndex < LEVELS.length - 1 ? "下一关" : "完美通关!"}
                     </button>
                  )}
             </div>

             {/* Right Column: Lower Sentence */}
             <div className="flex-1 flex flex-col relative">
                <div className="self-center mb-4">
                    <div className="bg-gradient-to-r from-transparent via-cyan-800/10 to-transparent w-32 h-1 mx-auto mb-1"></div>
                    <h3 className="text-center text-white font-bold text-xl drop-shadow-md">下句</h3>
                    <div className="bg-white/30 border border-white/50 rounded-full w-20 h-6 mx-auto mt-1"></div>
                 </div>

                 <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
                     {rightCards.map(card => (
                         <Card 
                            key={card.id} 
                            card={card} 
                            isSelected={selectedRight === card.id} 
                            onClick={onCardClick}
                            disabled={gameState !== GameState.PLAYING}
                         />
                     ))}
                 </div>
             </div>
         </div>

         {/* Rules Modal */}
         {showRules && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                 <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border-4 border-cyan-600 relative">
                     <h2 className="text-2xl font-bold text-center text-cyan-800 mb-4">游戏规则</h2>
                     <ul className="space-y-3 text-gray-700">
                         {LEVELS.map((l, idx) => (
                             <li key={l.level} className="flex justify-between border-b pb-2">
                                 <span>第{idx+1}关 {l.name}</span>
                                 <span className="text-red-500 font-bold">共{l.couplets.length}对, 限时{Math.floor(l.timeLimit/60)}分钟</span>
                             </li>
                         ))}
                     </ul>
                     <div className="mt-6 text-center">
                         <p className="text-sm text-gray-500 mb-4">
                            点击麦克风朗读屏幕上的诗句，AI将自动为您选中！
                         </p>
                         <button 
                            onClick={() => {
                                setShowRules(false);
                                if (gameState === GameState.IDLE) initializeLevel();
                            }}
                            className="bg-cyan-600 text-white px-8 py-2 rounded-full font-bold hover:bg-cyan-500 shadow-lg"
                        >
                             我知道了
                         </button>
                     </div>
                 </div>
             </div>
         )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);
root.render(<App />);