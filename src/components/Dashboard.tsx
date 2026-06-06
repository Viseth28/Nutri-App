import React, { useState } from 'react';
import { CalorieRing } from './CalorieRing';
import { Trash2 } from 'lucide-react';
import type { WeeklyDashboardData } from '../services/api';

interface MealLog {
  id: string;
  meal_id?: number;
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
  weeklyData: WeeklyDashboardData | null;
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
  weeklyData,
}) => {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const toggleExpandDate = (dateStr: string) => {
    if (expandedDate === dateStr) {
      setExpandedDate(null);
    } else {
      setExpandedDate(dateStr);
    }
  };
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

      {/* 1b. Weekly Progress Card */}
      {weeklyData && (
        <div className="card" style={{ padding: '16px 20px' }}>
          <h4 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span>📊 របាយការណ៍សប្តាហ៍នេះ</span>
            <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
              ({weeklyData.start_date} ដល់ {weeklyData.end_date})
            </span>
          </h4>

          {/* 7 Days Progress Bar Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '90px', padding: '10px 0 20px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '16px' }}>
            {weeklyData.days.map((day) => {
              const capGoal = weeklyData.daily_goal || 2000;
              const ratio = Math.min(1.2, day.eaten / capGoal);
              const heightPct = Math.round(ratio * 100);
              
              // Highlight if budget exceeded
              const isOver = day.eaten > capGoal;
              const barColor = isOver ? 'var(--color-error)' : 'var(--color-primary)';
              
              const isToday = new Date().toISOString().split('T')[0] === day.date;
              
              return (
                <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px', cursor: 'pointer' }} onClick={() => toggleExpandDate(day.date)}>
                  <div style={{ position: 'relative', width: '10px', height: '50px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '5px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${heightPct || 4}%`, background: barColor, borderRadius: '5px', transition: 'height 0.4s ease-out', boxShadow: !isOver ? '0 0 8px var(--color-primary-glow)' : 'none' }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: isToday ? 'bold' : 'normal', color: isToday ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                    {day.day_name_kh}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Days Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {weeklyData.days.map((day) => {
              const isExpanded = expandedDate === day.date;
              const isToday = new Date().toISOString().split('T')[0] === day.date;
              
              return (
                <div 
                  key={day.date} 
                  style={{ 
                    borderRadius: 'var(--radius-md)', 
                    background: isToday ? 'rgba(244, 63, 94, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                    border: isToday ? '1px solid rgba(244, 63, 94, 0.15)' : '1px solid rgba(255, 255, 255, 0.03)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Day Header Trigger */}
                  <div 
                    onClick={() => toggleExpandDate(day.date)}
                    style={{ 
                      padding: '12px 14px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isToday ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                        {day.day_name_kh}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {day.date.substring(5)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right', fontSize: '12px' }}>
                        <div>
                          <span style={{ fontWeight: 700 }}>{day.eaten}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}> / {weeklyData.daily_goal} Cal</span>
                        </div>
                        {day.burned > 0 && (
                          <div style={{ fontSize: '10px', color: 'var(--color-secondary)', fontWeight: 600 }}>
                            🔥 ដុត {day.burned} Cal
                          </div>
                        )}
                      </div>

                      {/* No Sweet Drink Badge */}
                      <span style={{ fontSize: '14px' }}>
                        {day.no_sweet ? "🥤✅" : "🥤❌"}
                      </span>
                      
                      {/* Accordion Arrow Indicator */}
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                        ▶
                      </span>
                    </div>
                  </div>

                  {/* Expanded Meal Records for that Day */}
                  {isExpanded && (
                    <div style={{ padding: '0 14px 14px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(0, 0, 0, 0.15)', animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', margin: '10px 0 6px 0' }}>
                        📖 កំណត់ត្រាអាហារ ({day.meals.length})
                      </div>
                      
                      {day.meals.length === 0 ? (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 0' }}>
                          គ្មានកំណត់ត្រាអាហារសម្រាប់ថ្ងៃនេះទេ។
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {day.meals.map((meal) => (
                            <div key={meal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.02)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>{meal.name}</span>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                  ⏰ {meal.time} | P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                                </span>
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                +{meal.calories} Cal
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
