import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

interface Profile {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activity: string;
  goal_type: string;
}

interface ProfileSetupProps {
  profile: Profile | null;
  onSaveProfile: (profile: Profile, calculatedTarget: number) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ profile, onSaveProfile }) => {
  // Step-by-step questionnaire state
  const [step, setStep] = useState(profile ? 6 : 1);
  const [gender, setGender] = useState<'male' | 'female'>(profile?.gender || 'male');
  const [age, setAge] = useState(profile?.age || 25);
  const [height, setHeight] = useState(profile?.height || 170);
  const [weight, setWeight] = useState(profile?.weight || 70);
  const [activity, setActivity] = useState(profile?.activity || 'moderate');
  
  // Results calculation using Mifflin-St Jeor
  const calculateTDEE = () => {
    // BMR Mifflin-St Jeor
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity Multiplier
    let multiplier = 1.2;
    if (activity === 'sedentary') multiplier = 1.2;
    else if (activity === 'light') multiplier = 1.375;
    else if (activity === 'moderate') multiplier = 1.465; // Precise mapping matching calculator.net
    else if (activity === 'active') multiplier = 1.55;
    else if (activity === 'very_active') multiplier = 1.725;

    const tdee = Math.round(bmr * multiplier);
    return {
      tdee,
      maintain: tdee,
      mild: tdee - 250,
      weight_loss: tdee - 500,
      extreme: tdee - 1000
    };
  };

  const results = calculateTDEE();

  const handleSelectGoal = (goalType: string, targetCal: number) => {
    const updatedProfile: Profile = {
      gender,
      age,
      height,
      weight,
      activity,
      goal_type: goalType
    };
    onSaveProfile(updatedProfile, targetCal);
    setStep(6);
  };

  return (
    <div className="profile-setup-view">
      <div className="header-container" style={{ marginBottom: '16px' }}>
        <h3>👤 គណនាបរិមាណកាឡូរីប្រចាំថ្ងៃ</h3>
        <Calculator size={20} style={{ color: 'var(--color-primary)' }} />
      </div>

      {/* STEP 1: Gender */}
      {step === 1 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            ជំហានទី ១៖ ជ្រើសរើសភេទរបស់អ្នក
          </span>
          <div className="segmented-control" style={{ marginBottom: '20px' }}>
            <button className={`segment-btn ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>
              🙋‍♂️ ប្រុស (Male)
            </button>
            <button className={`segment-btn ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>
              🙋‍♀️ ស្រី (Female)
            </button>
          </div>
          <button className="button-primary" onClick={() => setStep(2)}>
            <span>បន្តទៅមុខទៀត</span>
          </button>
        </div>
      )}

      {/* STEP 2: Age */}
      {step === 2 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            ជំហានទី ២៖ បញ្ជាក់អាយុរបស់អ្នក
          </span>
          <div className="input-group">
            <span className="input-label">អាយុ (Age - ឆ្នាំ)</span>
            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 25)}
              className="form-input"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="button-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setStep(1)}>
              ត្រឡប់ក្រោយ
            </button>
            <button className="button-primary" onClick={() => setStep(3)}>
              បន្តទៅមុខទៀត
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Height */}
      {step === 3 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            ជំហានទី ៣៖ កម្ពស់របស់អ្នក
          </span>
          <div className="input-group">
            <span className="input-label">កម្ពស់ (Height - cm)</span>
            <input
              type="number"
              min="50"
              max="250"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 170)}
              className="form-input"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="button-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setStep(2)}>
              ត្រឡប់ក្រោយ
            </button>
            <button className="button-primary" onClick={() => setStep(4)}>
              បន្តទៅមុខទៀត
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Weight */}
      {step === 4 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            ជំហានទី ៤៖ ទម្ងន់បច្ចុប្បន្នរបស់អ្នក
          </span>
          <div className="input-group">
            <span className="input-label">ទម្ងន់ (Weight - kg)</span>
            <input
              type="number"
              step="0.1"
              min="10"
              max="300"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
              className="form-input"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="button-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setStep(3)}>
              ត្រឡប់ក្រោយ
            </button>
            <button className="button-primary" onClick={() => setStep(5)}>
              បន្តទៅមុខទៀត
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Activity Level */}
      {step === 5 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            ជំហានទី ៥៖ កម្រិតសកម្មភាពហាត់ប្រាណ
          </span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'sedentary' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('sedentary')}>
              🚶‍♂️ ស្ងប់ស្ងៀម (Sedentary) - មិនសូវធ្វើចលនា
            </button>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'light' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('light')}>
              🏃‍♂️ ស្រាល (Light) - ហាត់ប្រាណ ១-៣ ថ្ងៃ/សប្តាហ៍
            </button>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'moderate' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('moderate')}>
              🚴‍♂️ មធ្យម (Moderate) - ហាត់ប្រាណ ៤-៥ ថ្ងៃ/សប្តាហ៍ (1.465)
            </button>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'active' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('active')}>
              🏋️‍♂️ សកម្ម (Active) - ហាត់ប្រាណ ៦-៧ ថ្ងៃ/សប្តាហ៍
            </button>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'very_active' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('very_active')}>
              ⚡ សកម្មខ្លាំង (Very Active) - ហាត់ប្រាណធ្ងន់រាល់ថ្ងៃ
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="button-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setStep(4)}>
              ត្រឡប់ក្រោយ
            </button>
            <button className="button-primary" onClick={() => setStep(6)}>
              រក្សាទុក និងគណនា
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Results Dashboard Grid */}
      {step === 6 && (
        <div style={{ animation: 'slideUp 0.3s ease-out' }}>
          {/* Summary Details */}
          <div className="card">
            <h4>📊 លទ្ធផលការគណនាកាឡូរី (TDEE)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div>• ភេទ៖ <b>{gender === 'male' ? 'ប្រុស' : 'ស្រី'}</b></div>
              <div>• អាយុ៖ <b>{age} ឆ្នាំ</b></div>
              <div>• កម្ពស់៖ <b>{height} cm</b></div>
              <div>• ទម្ងន់៖ <b>{weight} kg</b></div>
              <div style={{ gridColumn: 'span 2' }}>• សកម្មភាព៖ <b>{activity.toUpperCase()}</b></div>
            </div>
            <button 
              onClick={() => setStep(1)} 
              className="button-primary" 
              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', marginTop: '16px', padding: '10px' }}
            >
              🔄 គណនាឡើងវិញ
            </button>
          </div>

          {/* Goal selection layout cards */}
          <div className="header-container" style={{ margin: '20px 0 10px 0' }}>
            <h3>🎯 ជ្រើសរើសគោលដៅថ្ងៃនេះ</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Maintain */}
            <div 
              className={`card ${profile?.goal_type === 'maintain' ? 'card-highlight' : ''}`}
              style={{ cursor: 'pointer', padding: '16px' }}
              onClick={() => handleSelectGoal('maintain', results.maintain)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '15px' }}>🥦 រក្សាទម្ងន់ (Maintain Weight)</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>ថែរក្សារូបរាង និងទម្ងន់ឲ្យនៅដដែល</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>{results.maintain}</span>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>kcal/ថ្ងៃ</span>
                </div>
              </div>
            </div>

            {/* Mild Loss */}
            <div 
              className={`card ${profile?.goal_type === 'mild_loss' ? 'card-highlight' : ''}`}
              style={{ cursor: 'pointer', padding: '16px' }}
              onClick={() => handleSelectGoal('mild_loss', results.mild)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '15px' }}>🥗 សម្រកតិចតួច (Mild Weight Loss)</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>សម្រកទម្ងន់ ~០.២៥ គីឡូក្រាម/សប្តាហ៍</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-secondary)' }}>{results.mild}</span>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>kcal/ថ្ងៃ</span>
                </div>
              </div>
            </div>

            {/* Weight Loss */}
            <div 
              className={`card ${profile?.goal_type === 'weight_loss' ? 'card-highlight' : ''}`}
              style={{ cursor: 'pointer', padding: '16px' }}
              onClick={() => handleSelectGoal('weight_loss', results.weight_loss)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '15px' }}>🔥 សម្រកធម្មតា (Weight Loss)</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>សម្រកទម្ងន់ ~០.៥ គីឡូក្រាម/សប្តាហ៍</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-accent)' }}>{results.weight_loss}</span>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>kcal/ថ្ងៃ</span>
                </div>
              </div>
            </div>

            {/* Extreme Loss */}
            <div 
              className={`card ${profile?.goal_type === 'extreme_loss' ? 'card-highlight' : ''}`}
              style={{ cursor: 'pointer', padding: '16px' }}
              onClick={() => handleSelectGoal('extreme_loss', results.extreme)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '15px' }}>⚡ សម្រកល្បឿនលឿន (Extreme Loss)</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>សម្រកទម្ងន់ ~១.០ គីឡូក្រាម/សប្តាហ៍</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-error)' }}>{results.extreme}</span>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>kcal/ថ្ងៃ</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
