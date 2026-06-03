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
        <h3>⚖️ តាមដានទម្ងន់ខ្លួន</h3>
        <Scale size={20} style={{ color: 'var(--color-primary)' }} />
      </div>

      {/* 1. Comparison Dashboard */}
      <div className="card card-highlight">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>បច្ចុប្បន្នភាពទម្ងន់</span>
        </h4>
        
        <div className="weight-comparison-container">
          <div className="weight-comparison-box">
            <span className="weight-comp-val" style={{ color: 'var(--text-primary)' }}>
              {previousWeight !== null ? `${previousWeight} kg` : '--'}
            </span>
            <p className="weight-comp-lbl">ទម្ងន់លើកមុន</p>
          </div>
          
          <div className="weight-comparison-box" style={{ borderColor: 'var(--border-glass-highlight)' }}>
            <span className="weight-comp-val" style={{ color: 'var(--color-primary)' }}>
              {currentWeight} kg
            </span>
            <p className="weight-comp-lbl">ទម្ងន់បច្ចុប្បន្ន</p>
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
            <span>{difference < 0 ? '🎉 ស្រកទម្ងន់អស់៖' : '⚠️ ឡើងទម្ងន់បន្ថែម៖'}</span>
            <span style={{ color: difference < 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
              {difference < 0 ? `${Math.abs(difference).toFixed(1)} kg` : `+${difference.toFixed(1)} kg`}
            </span>
            <span>សម្រេចបានលទ្ធផលល្អ!</span>
          </div>
        )}
      </div>

      {/* 2. Weight Logging Form */}
      <div className="card">
        <h4>✍️ កត់ត្រាទម្ងន់ថ្មី</h4>
        <form onSubmit={handleSubmit} style={{ marginTop: '14px' }}>
          <div className="input-group">
            <span className="input-label">ទម្ងន់ថ្មី (គិតជាគីឡូក្រាម - kg)</span>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.1"
                required
                placeholder="ឧទាហរណ៍: 92.5"
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
            <span>ធ្វើបច្ចុប្បន្នភាពទម្ងន់</span>
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
          ✅ រក្សាទុកទម្ងន់ និងគណនាកាឡូរីគោលដៅឡើងវិញដោយជោគជ័យ!
        </div>
      )}

      {/* 3. Weight Tracker Visual Info */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(16,185,129,0.02))' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
          <Sparkles size={16} />
          <span>បច្ចេកវិទ្យា TDEE Recalibration</span>
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
          រាល់ពេលដែលអ្នកធ្វើបច្ចុប្បន្នភាពទម្ងន់ខ្លួន ប្រព័ន្ធឆ្លាតវៃនឹងធ្វើការគណនាឡើងវិញភ្លាមៗនូវកម្រិត <b>BMR (Basal Metabolic Rate)</b> និង <b>TDEE (Total Daily Energy Expenditure)</b> ដោយប្រើប្រាស់រូបមន្ត <b>Mifflin-St Jeor</b> ដ៏ច្បាស់លាស់។ គោលដៅកាឡូរីប្រចាំថ្ងៃរបស់អ្នកនឹងកែសម្រួលដោយស្វ័យប្រវត្តិដើម្បីធានាការសម្រកទម្ងន់មានសុវត្ថិភាព និងប្រសិទ្ធភាពខ្ពស់!
        </p>
      </div>
    </div>
  );
};
