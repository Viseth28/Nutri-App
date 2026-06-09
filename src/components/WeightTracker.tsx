import React, { useState } from 'react';
import { Scale, RefreshCw, Sparkles } from 'lucide-react';

interface WeightTrackerProps {
  currentWeight: number;
  previousWeight: number | null;
  onUpdateWeight: (newWeight: number) => void;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  currentWeight,
  previousWeight,
  onUpdateWeight,
}) => {
  const [weightInput, setWeightInput] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      onUpdateWeight(val);
      setWeightInput('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  const difference = previousWeight !== null ? currentWeight - previousWeight : null;

  return (
    <div className="weight-tracker-view">
      <div className="header-container" style={{ marginBottom: '16px' }}>
        <h3>⚖️ Weight Tracker</h3>
        <Scale size={20} style={{ color: 'var(--color-primary)' }} />
      </div>

      {/* 1. Comparison Dashboard */}
      <div className="card card-highlight">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Weight Progress</span>
        </h4>
        
        <div className="weight-comparison-container">
          <div className="weight-comparison-box">
            <span className="weight-comp-val" style={{ color: 'var(--text-primary)' }}>
              {previousWeight !== null ? `${previousWeight} kg` : '--'}
            </span>
            <p className="weight-comp-lbl">Previous Weight</p>
          </div>
          
          <div className="weight-comparison-box" style={{ borderColor: 'var(--border-glass-highlight)' }}>
            <span className="weight-comp-val" style={{ color: 'var(--color-primary)' }}>
              {currentWeight} kg
            </span>
            <p className="weight-comp-lbl">Current Weight</p>
          </div>
        </div>

        {difference !== null && (
          <div 
            style={{ 
              marginTop: '16px', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)', 
              background: difference < 0 ? 'rgba(244, 63, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: difference < 0 ? '1px solid rgba(244, 63, 94, 0.1)' : '1px solid rgba(239, 68, 68, 0.1)',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{difference < 0 ? '🎉 Weight Lost:' : '⚠️ Weight Gained:'}</span>
            <span style={{ color: difference < 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
              {difference < 0 ? `${Math.abs(difference).toFixed(1)} kg` : `+${difference.toFixed(1)} kg`}
            </span>
            <span>Great progress!</span>
          </div>
        )}
      </div>

      {/* 2. Weight Logging Form */}
      <div className="card">
        <h4>✍️ Log New Weight</h4>
        <form onSubmit={handleSubmit} style={{ marginTop: '14px' }}>
          <div className="input-group">
            <span className="input-label">New Weight (kg)</span>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.1"
                required
                placeholder="Example: 92.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="form-input"
                style={{ paddingRight: '50px' }}
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                kg
              </span>
            </div>
          </div>

          <button type="submit" className="button-primary">
            <RefreshCw size={16} />
            <span>Update Weight</span>
          </button>
        </form>
      </div>

      {successMsg && (
        <div 
          style={{ 
            background: 'var(--color-primary-glow)', 
            border: '1px solid var(--color-primary)', 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            textAlign: 'center', 
            color: 'var(--color-primary)', 
            fontSize: '13px', 
            fontWeight: 600,
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          ✅ Weight saved and daily calories recalibrated successfully!
        </div>
      )}

      {/* 3. Weight Tracker Visual Info */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(16,185,129,0.02))' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
          <Sparkles size={16} />
          <span>TDEE Recalibration Technology</span>
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
          Every time you update your body weight, the smart system immediately recalculates your <b>BMR (Basal Metabolic Rate)</b> and <b>TDEE (Total Daily Energy Expenditure)</b> using the precise <b>Mifflin-St Jeor</b> equation. Your daily calorie target will adjust automatically to ensure safe and highly effective weight progress!
        </p>
      </div>
    </div>
  );
};
