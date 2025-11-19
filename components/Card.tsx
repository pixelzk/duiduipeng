import React from 'react';
import { GameCard, CardSide } from '../types';

interface CardProps {
  card: GameCard;
  isSelected: boolean;
  onClick: (card: GameCard) => void;
  disabled: boolean;
}

export const Card: React.FC<CardProps> = ({ card, isSelected, onClick, disabled }) => {
  // Dynamic positioning styles based on index could be passed in props for more randomness,
  // but for now we keep it simple list.

  const baseClasses = "relative w-full py-3 px-4 mb-4 text-center rounded-lg border-2 transition-all duration-300 cursor-pointer select-none flex items-center justify-center min-h-[64px]";
  
  const sideClasses = card.side === CardSide.LEFT 
    ? "rounded-r-3xl rounded-l-md ml-auto" 
    : "rounded-l-3xl rounded-r-md mr-auto";

  let stateClasses = "bg-white/90 border-cyan-600 text-cyan-900 hover:bg-cyan-50 shadow-md hover:shadow-lg hover:-translate-y-1";
  
  if (isSelected) {
    stateClasses = "bg-amber-100 border-amber-500 text-amber-900 shadow-amber-200/50 shadow-lg scale-105 z-10 ring-2 ring-amber-300";
  } else if (card.isMatched) {
    stateClasses = "bg-green-100 border-green-500 opacity-0 scale-90 pointer-events-none"; // Dissolve effect handled by logic/classes
  }

  return (
    <div 
      onClick={() => !disabled && !card.isMatched && onClick(card)}
      className={`${baseClasses} ${sideClasses} ${stateClasses} ${card.isMatched ? 'dissolve-anim' : ''}`}
    >
        {/* Decorative Diamond */}
        <div className={`absolute top-1/2 w-2 h-2 rotate-45 border border-current opacity-50 ${card.side === CardSide.LEFT ? 'left-3' : 'right-3'}`} />
        
        <span className="font-serif font-medium text-base md:text-lg leading-tight tracking-wide">
            {card.text}
        </span>
        
        {/* Decorative Diamond */}
        <div className={`absolute top-1/2 w-2 h-2 rotate-45 border border-current opacity-50 ${card.side === CardSide.LEFT ? 'right-3' : 'left-3'}`} />
    </div>
  );
};