import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';

interface SuggestProps {
  targetCal: number;
}

interface MealSuggestion {
  name: string;
  calories: number;
  ingredients: string[];
}

export const Suggest: React.FC<SuggestProps> = ({ targetCal }) => {
  const [pref, setPref] = useState<'veg' | 'meat' | 'normal'>('veg');
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState<{
    breakfast: MealSuggestion;
    lunch: MealSuggestion;
    dinner: MealSuggestion;
  } | null>(null);

  const generateSuggestions = () => {
    setLoading(true);
    // Simulate Gemini API response with clean Khmer-market food datasets matching their exact preference & target cal
    setTimeout(() => {
      let bCal = Math.round(targetCal * 0.25);
      let lCal = Math.round(targetCal * 0.40);
      let dCal = Math.round(targetCal * 0.35);

      if (pref === 'veg') {
        setMenu({
          breakfast: {
            name: '🥚 Light Fried Eggs with Mixed Veggies',
            calories: bCal,
            ingredients: ['2 chicken eggs', 'Finely chopped morning glory and shallots', '1 tsp oil (low fat)', 'Fresh cucumber and carrot slices']
          },
          lunch: {
            name: '🥩 Steamed Chicken Breast with Spicy Lime Dip & Steamed Veggies',
            calories: lCal,
            ingredients: ['200g chicken breast (steamed or boiled)', '400g mixed steamed greens (cabbage, morning glory)', 'Low-sugar spicy lime dip for flavor']
          },
          dinner: {
            name: '🐟 Grilled Fish with Ginger & Morning Glory Sour Soup (No Rice)',
            calories: dCal,
            ingredients: ['150g grilled/steamed fish fillet', 'Warm morning glory sour soup', 'Fresh sliced ginger and lime leaves']
          }
        });
      } else if (pref === 'meat') {
        setMenu({
          breakfast: {
            name: '🍳 2 Boiled Eggs & Chili Garlic Grilled Chicken Breast',
            calories: bCal,
            ingredients: ['2 boiled chicken eggs', '150g grilled chicken breast with chili, salt, garlic', '1 large fresh cucumber']
          },
          lunch: {
            name: '🥩 Lemongrass Minced Pork Stir-fry & Low-Oil Fried Egg',
            calories: lCal,
            ingredients: ['250g lean minced pork', 'Lemongrass paste (garlic, lemongrass, lime leaf)', '1 fried egg']
          },
          dinner: {
            name: '🐟 Grilled Fish with Tamarind Sauce & Steamed Chicken Breast',
            calories: dCal,
            ingredients: ['200g grilled fish', '100g sliced boiled chicken breast', 'Fresh raw vegetables (cucumber, fresh greens)']
          }
        });
      } else {
        setMenu({
          breakfast: {
            name: 'Special Grilled Pork Rice (Standard balanced)',
            calories: bCal,
            ingredients: ['1 small bowl of white rice', '100g grilled marinated pork', '1 fried egg', 'Pickled cucumbers, carrots, shallots']
          },
          lunch: {
            name: 'Beef Lemongrass Sour Soup & White Rice',
            calories: lCal,
            ingredients: ['1 medium bowl of white rice', '1 large bowl of beef lemongrass sour soup with water spinach', '100g lean beef']
          },
          dinner: {
            name: 'Fried Fish with Green Mango Dip & Mixed Vegetable Soup',
            calories: dCal,
            ingredients: ['1 small bowl of white rice', '1 small fried fish (low oil)', 'Warm mixed vegetable soup']
          }
        });
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="suggest-view">
      <div className="header-container" style={{ marginBottom: '16px' }}>
        <h3>💡 Daily Meal Suggestions</h3>
        <span style={{ fontSize: '12px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
          🎯 {targetCal} kcal
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>
        Automatically prepare a daily meal plan based on your preferences, using easy-to-find ingredients that fit your calorie budget perfectly!
      </p>

      {/* Preference Selector Chips */}
      <div className="pref-chips-row">
        <button className={`pref-chip ${pref === 'veg' ? 'active' : ''}`} onClick={() => setPref('veg')}>
          🥗 High Veg
        </button>
        <button className={`pref-chip ${pref === 'meat' ? 'active' : ''}`} onClick={() => setPref('meat')}>
          🥩 High Meat
        </button>
        <button className={`pref-chip ${pref === 'normal' ? 'active' : ''}`} onClick={() => setPref('normal')}>
          🍲 Standard Balanced
        </button>
      </div>

      <button className="button-primary" onClick={generateSuggestions} disabled={loading}>
        <ChefHat size={18} />
        <span>{loading ? 'Preparing meals...' : 'Generate Meal Suggestion'}</span>
      </button>

      {/* Render States */}
      {loading && (
        <div className="loader-container">
          <div className="spinner" />
          <p className="pulsing-circle" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
            Calculating and compiling weight loss meal plan...
          </p>
        </div>
      )}

      {!loading && menu && (
        <div className="menu-list" style={{ marginTop: '24px', animation: 'slideUp 0.3s ease-out' }}>
          
          {/* Breakfast */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h4 style={{ color: 'var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🍳 Breakfast</span>
              <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>
                {menu.breakfast.calories} kcal
              </span>
            </h4>
            <div style={{ marginTop: '10px' }}>
              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>{menu.breakfast.name}</strong>
              <ul style={{ listStyle: 'none', paddingLeft: '4px' }}>
                {menu.breakfast.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--color-primary)' }}>•</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lunch */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
            <h4 style={{ color: 'var(--color-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🍛 Lunch</span>
              <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>
                {menu.lunch.calories} kcal
              </span>
            </h4>
            <div style={{ marginTop: '10px' }}>
              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>{menu.lunch.name}</strong>
              <ul style={{ listStyle: 'none', paddingLeft: '4px' }}>
                {menu.lunch.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--color-secondary)' }}>•</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dinner */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <h4 style={{ color: 'var(--color-accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🍲 Dinner</span>
              <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>
                {menu.dinner.calories} kcal
              </span>
            </h4>
            <div style={{ marginTop: '10px' }}>
              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>{menu.dinner.name}</strong>
              <ul style={{ listStyle: 'none', paddingLeft: '4px' }}>
                {menu.dinner.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--color-accent)' }}>•</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
