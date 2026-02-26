import React from 'react';

interface AudioVisualizerProps {
  level: number; // 0 to 1
  isListening?: boolean;
}

export default function AudioVisualizer({ level, isListening = false }: AudioVisualizerProps) {
  // Normalize level to be more visible (boost low signals)
  const normalizedLevel = Math.min(Math.max(level * 5, 0.1), 1);
  
  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {[1, 2, 3, 4, 5].map((bar) => {
        // Calculate dynamic height based on level and bar index for variety
        const baseHeight = 8;
        const maxHeight = 48;
        const variableFactor = (bar % 2 === 0 ? 1.2 : 0.8);
        const dynamicHeight = isListening 
          ? Math.min(baseHeight + (normalizedLevel * (maxHeight - baseHeight) * variableFactor), maxHeight)
          : baseHeight;

        return (
          <div
            key={bar}
            className={`w-2 rounded-full transition-all duration-75 ease-out ${isListening ? 'bg-emerald-500' : 'bg-slate-400'}`}
            style={{
              height: `${dynamicHeight}px`,
            }}
          />
        );
      })}
    </div>
  );
}
