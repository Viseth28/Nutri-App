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
            name: '🥚 ស៊ុតចៀនបន្លែចម្រុះស្រាលៗ',
            calories: bCal,
            ingredients: ['ស៊ុតមាន់ ២ គ្រាប់', 'ត្រកួនហាន់ល្អិតៗ និងខ្ទឹមក្រហម', 'ប្រេងឆា ១ ស្លាបព្រាកាហ្វេ (កាត់បន្ថយខ្លាញ់)', 'ត្រសក់ និងការ៉ុតស្រស់ហាន់ជាចំណិតសម្រាប់ញ៉ាំហ្គេម']
          },
          lunch: {
            name: '🥩 ទ្រូងមាន់ចំហុយ ជ្រលក់ទឹកត្រីកោះកុង និងបន្លែស្ងោរ',
            calories: lCal,
            ingredients: ['ទ្រូងមាន់ ២០០ ក្រាម (ចំហុយ ឬស្ងោរ)', 'បន្លែស្ងោរចម្រុះ (ត្រកួន ស្ពៃក្តោប ខាត់ណា) ៤០០ ក្រាម', 'ទឹកត្រីកោះកុង (កាត់បន្ថយស្ករ) សម្រាប់បន្ថែមរសជាតិ']
          },
          dinner: {
            name: '🐟 ត្រីរ៉ស់អាំងខ្ញី ជាមួយសម្លម្ជូរត្រកួនឥតបាយ',
            calories: dCal,
            ingredients: ['សាច់ត្រីរ៉ស់អាំង ឬចំហុយ ១៥០ ក្រាម', 'សម្លម្ជូរត្រកួនក្តៅៗ (មិនបាច់ដាក់បាយ ឬម្សៅស៊ុបច្រើន)', 'ខ្ញីស្រស់ហាន់ និងស្លឹកក្រូចសើច']
          }
        });
      } else if (pref === 'meat') {
        setMenu({
          breakfast: {
            name: '🍳 ស៊ុតស្ងោរ ២ គ្រាប់ និងទ្រូងមាន់អាំងអំបិលម្ទេស',
            calories: bCal,
            ingredients: ['ស៊ុតមាន់ស្ងោរ ២ គ្រាប់', 'ទ្រូងមាន់អាំង ១៥០ ក្រាម ជាមួយអំបិល ម្ទេស ខ្ទឹមស', 'ត្រសក់ស្រស់ ១ ផ្លែធំ']
          },
          lunch: {
            name: '🥩 សាច់ជ្រូកចិញ្ច្រាំឆាគ្រឿងបុក និងស៊ុតចៀនទឹកប្រេងតិច',
            calories: lCal,
            ingredients: ['សាច់ជ្រូកស្គីនឡេស (សាច់សុទ្ធ) ២៥០ ក្រាម', 'គ្រឿងបុកខ្មែរ (ស្លឹកក្រូច ស្លឹកគ្រៃ រំដេង ខ្ទឹមស)', 'ស៊ុតមាន់ចៀន ១ គ្រាប់']
          },
          dinner: {
            name: '🐟 ត្រីឆ្ពិនអាំងទឹកត្រីអំពិលទុំ និងទ្រូងមាន់ស្ងោរ',
            calories: dCal,
            ingredients: ['ត្រីឆ្ពិនអាំងកម្រិតមធ្យម ២០០ ក្រាម', 'ទ្រូងមាន់ស្ងោរហាន់ជាបន្ទះៗ ១០០ ក្រាម', 'បន្លែស្រស់អន្លក់ (ពពាយ ត្រសក់ ស្ពៃស្រស់)']
          }
        });
      } else {
        setMenu({
          breakfast: {
            name: 'បាយសាច់ជ្រូកអាំងពិសេស (ម្ហូបខ្មែរទូទៅ)',
            calories: bCal,
            ingredients: ['បាយស ១ ចានតូច', 'សាច់ជ្រូកអាំងគ្រឿងខ្មែរ ១០០ ក្រាម', 'ស៊ុតចៀន ១ គ្រាប់', 'ជ្រក់ត្រសក់ ការ៉ុត ខ្ទឹមក្រហម']
          },
          lunch: {
            name: 'សម្លម្ជូរគ្រឿងសាច់គោ និងបាយសកម្រិតមធ្យម',
            calories: lCal,
            ingredients: ['បាយស ១ ចានមធ្យម', 'សម្លម្ជូរគ្រឿងសាច់គោជាមួយត្រកួន និងព្រលិត ១ ចានធំ', 'សាច់គោសុទ្ធ ១០០ ក្រាម']
          },
          dinner: {
            name: 'ត្រីបំពងទឹកត្រីស្វាយ និងសម្លប្រហើរខ្មែរ',
            calories: dCal,
            ingredients: ['បាយស ១ ចានតូច', 'ត្រីកំភ្លាញ ឬត្រីអណ្ដែងបំពង (ប្រេងតិច) ១ ខ្ទះតូច', 'សម្លប្រហើរបន្លែចម្រុះក្តៅៗ']
          }
        });
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="suggest-view">
      <div className="header-container" style={{ marginBottom: '16px' }}>
        <h3>💡 មុខម្ហូបណែនាំប្រចាំថ្ងៃ</h3>
        <span style={{ fontSize: '12px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
          🎯 {targetCal} kcal
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>
        រៀបចំមុខម្ហូបប្រចាំថ្ងៃដោយស្វ័យប្រវត្តិតាមចំណង់ចំណូលចិត្ត គ្រឿងផ្សំងាយរកបំផុតនៅផ្សារខ្មែរ ក្នុងតម្លៃសមរម្យ និងស័ក្តិសមជាមួយកម្រិតកាឡូរីរបស់អ្នក!
      </p>

      {/* Preference Selector Chips */}
      <div className="pref-chips-row">
        <button className={`pref-chip ${pref === 'veg' ? 'active' : ''}`} onClick={() => setPref('veg')}>
          🥗 បន្លែច្រើន (High Veg)
        </button>
        <button className={`pref-chip ${pref === 'meat' ? 'active' : ''}`} onClick={() => setPref('meat')}>
          🥩 សាច់ច្រើន (High Meat)
        </button>
        <button className={`pref-chip ${pref === 'normal' ? 'active' : ''}`} onClick={() => setPref('normal')}>
          🍲 ម្ហូបធម្មតា (Standard Khmer)
        </button>
      </div>

      <button className="button-primary" onClick={generateSuggestions} disabled={loading}>
        <ChefHat size={18} />
        <span>{loading ? 'កំពុងរៀបចំមុខម្ហូប...' : 'បង្កើតមុខម្ហូបណែនាំ'}</span>
      </button>

      {/* Render States */}
      {loading && (
        <div className="loader-container">
          <div className="spinner" />
          <p className="pulsing-circle" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
            កំពុងគណនា និងចងក្រងមុខម្ហូបខ្មែរសម្រកទម្ងន់...
          </p>
        </div>
      )}

      {!loading && menu && (
        <div className="menu-list" style={{ marginTop: '24px', animation: 'slideUp 0.3s ease-out' }}>
          
          {/* Breakfast */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h4 style={{ color: 'var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🍳 អាហារពេលព្រឹក (Breakfast)</span>
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
              <span>🍛 អាហារពេលថ្ងៃត្រង់ (Lunch)</span>
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
              <span>🍲 អាហារពេលល្ងាច (Dinner)</span>
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
