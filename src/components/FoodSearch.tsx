import React, { useState } from 'react';
import { Search, Sparkles, Plus, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { Meal } from '../services/api';

interface FoodSearchProps {
  userId: number;
  onLogSuccess: () => void;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ userId, onLogSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Meal | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const popularFoods = [
    { label: '🥩 បាយសាច់ជ្រូក', query: 'បាយសាច់ជ្រូកអាំង ១ចាន' },
    { label: '🍜 គុយទាវសាច់ជ្រូក', query: 'គុយទាវសាច់ជ្រូក ១ចាន' },
    { label: '☕ កាហ្វេទឹកដោះគោ', query: 'កាហ្វេទឹកដោះគោទឹកកក ១កែវ' },
    { label: '🥤 តែទឹកដោះគោ', query: 'តែទឹកដោះគោគុជ ១កែវ' },
    { label: '🥗 ញាំមាន់', query: 'ញាំមាន់ម្ហូបខ្មែរ ១ចាន' },
    { label: '🍳 ពងទាចៀន', query: 'ពងទាចៀនប្រេងតិច ១គ្រាប់' }
  ];

  const handleSearch = async (queryStr: string) => {
    if (!queryStr.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setSearchResult(null);
    setAddSuccess(false);

    try {
      const res = await api.searchFood(userId, queryStr);
      if (res.ok && res.food) {
        setSearchResult(res.food);
      } else {
        setErrorMsg(res.error || 'មិនអាចស្វែងរកព័ត៌មានអាហារនេះបានទេ។');
      }
    } catch (err: any) {
      console.error('Error searching food:', err);
      setErrorMsg('មានបញ្ហាក្នុងការតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ។');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handlePopularClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleAddMeal = async () => {
    if (!searchResult) return;
    setAddLoading(true);

    try {
      const res = await api.addCustomMeal(userId, {
        food_name: searchResult.food_name,
        calories: searchResult.calories,
        protein: searchResult.protein,
        fat: searchResult.fat,
        carbs: searchResult.carbs,
        sugar: searchResult.sugar
      });

      if (res.ok) {
        setAddSuccess(true);
        setTimeout(() => {
          onLogSuccess();
        }, 1500);
      } else {
        alert(res.error || 'មិនអាចបន្ថែមកំណត់ត្រាបានទេ');
      }
    } catch (err) {
      alert('មានបញ្ហា៖ ' + err);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="food-search-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div className="header-container" style={{ marginBottom: '16px' }}>
        <h3>🔍 ស្វែងរកព័ត៌មានអាហារ</h3>
        <Search size={20} style={{ color: 'var(--color-primary)' }} />
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកអាហារ (ឧទាហរណ៍: បាយមាន់ ឬ ស៊ុប...)"
            className="form-input"
            style={{ paddingRight: '50px', borderRadius: 'var(--radius-lg)' }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              border: 'none',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dark)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.2)'
            }}
          >
            {loading ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
          </button>
        </div>
      </form>

      {/* Popular Chips */}
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
          💡 ម្ហូបពេញនិយម (Quick Tap)
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {popularFoods.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handlePopularClick(item.query)}
              className="pref-chip"
              style={{ padding: '8px 14px', fontSize: '12px' }}
              disabled={loading}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state spinner */}
      {loading && (
        <div className="loader-container">
          <div className="spinner" />
          <p className="pulsing-circle" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
            Gemini កំពុងវិភាគ និងទាញយកទិន្នន័យអាហារ...
          </p>
        </div>
      )}

      {/* Error Toast */}
      {errorMsg && (
        <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--color-error)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Search Result display */}
      {!loading && searchResult && (
        <div className="card card-highlight" style={{ animation: 'slideUp 0.3s ease-out' }}>
          {/* Title */}
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
            <span>{searchResult.food_name}</span>
          </h4>

          {/* Calorie Large Display */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              តម្លៃថាមពលប៉ាន់ស្មាន
            </span>
            <strong style={{ fontSize: '38px', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', display: 'block', lineHeight: 1 }}>
              {searchResult.calories} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>Cal</span>
            </strong>
          </div>

          {/* Macros Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 4px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>🥩 ប្រូតេអ៊ីន</span>
              <strong style={{ fontSize: '13px', color: 'white' }}>{searchResult.protein}g</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 4px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>🌾 កាបូ</span>
              <strong style={{ fontSize: '13px', color: 'white' }}>{searchResult.carbs}g</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 4px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>🥑 ខ្លាញ់</span>
              <strong style={{ fontSize: '13px', color: 'white' }}>{searchResult.fat}g</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 4px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>🥤 ស្ករ</span>
              <strong style={{ fontSize: '13px', color: 'white' }}>{searchResult.sugar}g</strong>
            </div>
          </div>

          {/* Coaching Recommendation */}
          {searchResult.coaching_recommendation && (
            <div style={{ background: 'rgba(244, 63, 94, 0.03)', border: '1px solid rgba(244, 63, 94, 0.12)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>💡 ដំបូន្មានរបស់ AI:</span>
              {searchResult.coaching_recommendation}
            </div>
          )}

          {/* Actions */}
          {!addSuccess ? (
            <button
              onClick={handleAddMeal}
              disabled={addLoading}
              className="button-primary"
              style={{ marginTop: 0 }}
            >
              {addLoading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>កំពុងកត់ត្រា...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>បន្ថែមទៅកំណត់ត្រាអាហារថ្ងៃនេះ</span>
                </>
              )}
            </button>
          ) : (
            <div
              style={{
                background: 'var(--color-primary-glow)',
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                fontSize: '14px',
                animation: 'pulseGlow 1s infinite alternate'
              }}
            >
              <Check size={18} />
              <span>បានបន្ថែមទៅកំណត់ត្រាថ្ងៃនេះដោយជោគជ័យ!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
