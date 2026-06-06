import React, { useState } from 'react';
import { BarChart3, Calendar, Award } from 'lucide-react';
import type { WeeklyDashboardData } from '../services/api';

interface WeeklyReportProps {
  weeklyData: WeeklyDashboardData | null;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({ weeklyData }) => {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const toggleExpandDate = (dateStr: string) => {
    if (expandedDate === dateStr) {
      setExpandedDate(null);
    } else {
      setExpandedDate(dateStr);
    }
  };

  if (!weeklyData) {
    return (
      <div className="loader-container">
        <div className="spinner" />
        <p className="pulsing-circle" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
          កំពុងទាញយករបាយការណ៍ប្រចាំសប្តាហ៍...
        </p>
      </div>
    );
  }

  // Calculate weekly summary totals
  const totalWeeklyEaten = weeklyData.days.reduce((sum, day) => sum + day.eaten, 0);
  const totalWeeklyBurned = weeklyData.days.reduce((sum, day) => sum + day.burned, 0);
  const weeklyBudget = weeklyData.daily_goal * 7;
  const netWeeklyRemaining = weeklyBudget - totalWeeklyEaten + totalWeeklyBurned;
  
  const sweetFreeDays = weeklyData.days.filter(day => day.no_sweet).length;

  return (
    <div className="weekly-report-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="header-container" style={{ marginBottom: '16px' }}>
        <h3>📊 របាយការណ៍ប្រចាំសប្តាហ៍</h3>
        <span style={{ fontSize: '12px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
          {weeklyData.start_date.substring(5)} ដល់ {weeklyData.end_date.substring(5)}
        </span>
      </div>

      {/* 1. Weekly Overview Stats Grid */}
      <div className="card card-highlight" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>ញ៉ាំសរុប (Eaten)</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary)' }}>{totalWeeklyEaten} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>Cal</span></span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>ថវិកា៖ {weeklyBudget} Cal</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>ដុតសរុប (Burned)</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-secondary)' }}>{totalWeeklyBurned} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>Cal</span></span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>ពីសកម្មភាព & Strava</span>
        </div>
        <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>តុល្យភាពកាឡូរីសប្តាហ៍នេះ</span>
            <strong style={{ fontSize: '14px', color: netWeeklyRemaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
              {netWeeklyRemaining >= 0 ? `សល់ ${netWeeklyRemaining} Cal` : `លើស ${Math.abs(netWeeklyRemaining)} Cal`}
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary-glow)', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
            <Award size={14} />
            <span>🥤 ជោគជ័យ {sweetFreeDays}/៧ ថ្ងៃ</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Calorie Bar Chart Card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} />
          <span>ក្រាហ្វិកប្រៀបធៀបកាឡូរីប្រចាំថ្ងៃ</span>
        </h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '110px', padding: '10px 0 20px 0', marginBottom: '8px' }}>
          {weeklyData.days.map((day) => {
            const capGoal = weeklyData.daily_goal || 2000;
            const ratio = Math.min(1.2, day.eaten / capGoal);
            const heightPct = Math.round(ratio * 100);
            
            const isOver = day.eaten > capGoal;
            const barColor = isOver ? 'var(--color-error)' : 'var(--color-primary)';
            const isToday = new Date().toISOString().split('T')[0] === day.date;
            
            return (
              <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px', cursor: 'pointer' }} onClick={() => toggleExpandDate(day.date)}>
                <span style={{ fontSize: '9px', color: isOver ? 'var(--color-error)' : 'var(--text-primary)', fontWeight: 700, marginBottom: '2px' }}>
                  {day.eaten > 0 ? day.eaten : ''}
                </span>
                <div style={{ position: 'relative', width: '12px', height: '60px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${heightPct || 4}%`, background: barColor, borderRadius: '6px', transition: 'height 0.4s ease-out', boxShadow: !isOver ? '0 0 8px var(--color-primary-glow)' : 'none' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: isToday ? 'bold' : 'normal', color: isToday ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                  {day.day_name_kh}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Collapsible Daily Records Accordion */}
      <div className="header-container" style={{ margin: '20px 0 12px 0' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
          <span>កំណត់ត្រាប្រចាំថ្ងៃ</span>
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  padding: '14px 16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: isToday ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                    {day.day_name_kh}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {day.date}
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

                  <span style={{ fontSize: '14px' }}>
                    {day.no_sweet ? "🥤✅" : "🥤❌"}
                  </span>
                  
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                    ▶
                  </span>
                </div>
              </div>

              {/* Expanded Meals */}
              {isExpanded && (
                <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', background: 'rgba(0, 0, 0, 0.15)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', margin: '12px 0 8px 0' }}>
                    📖 កំណត់ត្រាអាហារ ({day.meals.length})
                  </div>
                  
                  {day.meals.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px 0' }}>
                      គ្មានកំណត់ត្រាអាហារសម្រាប់ថ្ងៃនេះទេ។
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {day.meals.map((meal) => (
                        <div key={meal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.02)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{meal.name}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              ⏰ {meal.time} | P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                            </span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
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
  );
};
