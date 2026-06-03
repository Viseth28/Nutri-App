import React from 'react';
import { CalorieRing } from './CalorieRing';
import { Trash2 } from 'lucide-react';

interface MealLog {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

interface DashboardProps {
  logs: MealLog[];
  burned: number;
  target: number;
  noSweetToday: boolean;
  onToggleSweet: () => void;
  onDeleteLog: (id: string) => void;
  onClearLogs: () => void;
  onOpenLogModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  logs,
  burned,
  target,
  noSweetToday,
  onToggleSweet,
  onDeleteLog,
  onClearLogs,
  onOpenLogModal,
}) => {
  // Calculations
  const totalEaten = logs.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = logs.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = logs.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = logs.reduce((sum, item) => sum + item.fat, 0);
  
  const totalMacros = totalProtein + totalCarbs + totalFat;
  const pPercent = totalMacros > 0 ? (totalProtein / totalMacros) * 100 : 0;
  const cPercent = totalMacros > 0 ? (totalCarbs / totalMacros) * 100 : 0;
  const fPercent = totalMacros > 0 ? (totalFat / totalMacros) * 100 : 0;

  return (
    <div className="dashboard-view">
      {/* 1. Calorie Dashboard Card */}
      <div className="card card-highlight">
        <div className="ring-section">
          <CalorieRing eaten={totalEaten} burned={burned} target={target} />
          
          <div className="ring-legend">
            <div className="legend-item">
              <span className="legend-dot eaten" />
              <div className="legend-details">
                <span className="legend-val">{totalEaten} kcal</span>
                <span className="legend-lbl">បានញ៉ាំ (Eaten)</span>
              </div>
            </div>
            
            <div className="legend-item">
              <span className="legend-dot burned" />
              <div className="legend-details">
                <span className="legend-val">{burned} kcal</span>
                <span className="legend-lbl">បានដុត (Burned)</span>
              </div>
            </div>
            
            <div className="legend-item">
              <span className="legend-dot target" />
              <div className="legend-details">
                <span className="legend-val">{target} kcal</span>
                <span className="legend-lbl">គោលដៅ (Target)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Macro breakdown */}
        <div className="macros-bar-container">
          <div className="macro-segment" style={{ width: `${pPercent}%`, backgroundColor: '#9061f9' }} />
          <div className="macro-segment" style={{ width: `${cPercent}%`, backgroundColor: '#f43f5e' }} />
          <div className="macro-segment" style={{ width: `${fPercent}%`, backgroundColor: '#f97316' }} />
        </div>

        <div className="macro-labels">
          <div className="macro-lbl-item">
            <span className="macro-dot p" />
            <span>ប្រូតេអ៊ីន: {totalProtein}g ({Math.round(pPercent)}%)</span>
          </div>
          <div className="macro-lbl-item">
            <span className="macro-dot c" />
            <span>កាបូ: {totalCarbs}g ({Math.round(cPercent)}%)</span>
          </div>
          <div className="macro-lbl-item">
            <span className="macro-dot f" />
            <span>ខ្លាញ់: {totalFat}g ({Math.round(fPercent)}%)</span>
          </div>
        </div>
      </div>

      {/* 2. Challenge Toggle Card */}
      <div className="card">
        <div className="challenge-toggle-row">
          <div className="challenge-toggle-meta">
            <div className="challenge-icon" style={{ color: noSweetToday ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              🥤
            </div>
            <div>
              <span className="challenge-title">No Sweet Challenge</span>
              <p className="challenge-desc">
                {noSweetToday ? '🥤 សម្រេចបានថ្ងៃនេះ (Sweet Free!) ✅' : '🥤 មិនទាន់បានកត់ត្រានៅឡើយទេ ⏳'}
              </p>
            </div>
          </div>
          <label className="custom-switch">
            <input type="checkbox" checked={noSweetToday} onChange={onToggleSweet} />
            <span className="slider-switch" />
          </label>
        </div>
      </div>

      {/* 3. Meal Logs Section */}
      <div className="header-container" style={{ margin: '24px 0 12px 0' }}>
        <h3>📖 កំណត់ត្រាអាហារថ្ងៃនេះ</h3>
        {logs.length > 0 && (
          <button 
            onClick={onClearLogs} 
            className="log-delete-btn" 
            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
          >
            <Trash2 size={13} />
            <span>Reset ថ្ងៃនេះ</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div 
          onClick={onOpenLogModal}
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '30px 20px', 
            borderStyle: 'dashed', 
            borderColor: 'rgba(255,255,255,0.1)',
            cursor: 'pointer'
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>មិនទាន់មានកំណត់ត្រាអាហារនៅឡើយទេ</p>
          <span style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, display: 'block', marginTop: '8px' }}>
            + បន្ថែមអាហារដំបូងរបស់អ្នក
          </span>
        </div>
      ) : (
        <div className="logs-list">
          {logs.map((log) => (
            <div key={log.id} className="log-item-row">
              <div className="log-item-meta">
                <span className="log-item-title">{log.name}</span>
                <span className="log-item-sub">
                  ⏰ {log.time} | P: {log.protein}g • C: {log.carbs}g • F: {log.fat}g
                </span>
              </div>
              <div className="log-item-right">
                <span className="log-item-cal" style={{ color: 'var(--color-primary)' }}>+{log.calories} kcal</span>
                <button onClick={() => onDeleteLog(log.id)} className="log-delete-btn">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
