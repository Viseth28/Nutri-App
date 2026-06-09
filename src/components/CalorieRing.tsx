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
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* Track Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
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
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        {/* Defs for Premium Gradient & Glow */}
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(348, 85%, 55%)" />
            <stop offset="100%" stopColor="hsl(24, 95%, 60%)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Center Label Text */}
      <div className="ring-center-text">
        <span className="ring-center-val" style={{ color: remaining > 0 ? 'var(--text-primary)' : 'var(--color-primary)' }}>
          {remaining}
        </span>
        <span className="ring-center-lbl">kcal remaining</span>
      </div>
    </div>
  );
};
