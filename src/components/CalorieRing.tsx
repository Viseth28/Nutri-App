import React from 'react';

interface CalorieRingProps {
  eaten: number;
  burned: number;
  target: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({ eaten, burned, target }) => {
  const size = 140;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Calorie math
  const netCalories = Math.max(0, eaten - burned);
  const remaining = Math.max(0, target - netCalories);
  
  // Progress calculations
  const progressPercent = target > 0 ? Math.min(1, netCalories / target) : 0;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="ring-box">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress Ring with Glow */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Defs for Premium Gradient */}
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(162, 84%, 45%)" />
            <stop offset="100%" stopColor="hsl(190, 90%, 50%)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center Label Text */}
      <div className="ring-center-text">
        <span className="ring-center-val" style={{ color: remaining > 0 ? 'var(--text-primary)' : 'var(--color-primary)' }}>
          {remaining}
        </span>
        <span className="ring-center-lbl">Kcal សល់</span>
      </div>
    </div>
  );
};
