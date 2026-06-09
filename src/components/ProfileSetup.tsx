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
        <h3>👤 Calculate Daily Calorie Target</h3>
        <Calculator size={20} style={{ color: 'var(--color-primary)' }} />
      </div>

      {/* STEP 1: Gender */}
      {step === 1 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            Step 1: Select Your Gender
          </span>
          <div className="segmented-control" style={{ marginBottom: '20px' }}>
            <button className={`segment-btn ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>
              👨 Male
            </button>
            <button className={`segment-btn ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>
              👩 Female
            </button>
          </div>
          <button className="button-primary" onClick={() => setStep(2)}>
            <span>Next Step</span>
          </button>
        </div>
      )}

      {/* STEP 2: Age */}
      {step === 2 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            Step 2: Enter Your Age
          </span>
          <div className="input-group">
            <span className="input-label">Age (Years)</span>
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
              Back
            </button>
            <button className="button-primary" onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Height */}
      {step === 3 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            Step 3: Enter Your Height
          </span>
          <div className="input-group">
            <span className="input-label">Height (cm)</span>
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
              Back
            </button>
            <button className="button-primary" onClick={() => setStep(4)}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Weight */}
      {step === 4 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            Step 4: Enter Your Weight
          </span>
          <div className="input-group">
            <span className="input-label">Weight (kg)</span>
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
              Back
            </button>
            <button className="button-primary" onClick={() => setStep(5)}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Activity Level */}
      {step === 5 && (
        <div className="card" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <span className="input-label" style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>
            Step 5: Physical Activity Level
          </span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'sedentary' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('sedentary')}>
              🛋️ Sedentary (Little to no exercise)
            </button>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'light' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('light')}>
              🚶 Light (Exercise 1-3 days/week)
            </button>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'moderate' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('moderate')}>
              🏃 Moderate (Exercise 4-5 days/week)
            </button>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'active' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('active')}>
              🏋️ Active (Exercise daily/heavy)
            </button>
            <button className={`form-input`} style={{ textAlign: 'left', borderColor: activity === 'very_active' ? 'var(--color-primary)' : '' }} onClick={() => setActivity('very_active')}>
              ⚡ Very Active (Very heavy daily exercise)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="button-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setStep(4)}>
              Back
            </button>
            <button className="button-primary" onClick={() => setStep(6)}>
              Save & Calculate
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Results Dashboard Grid */}
      {step === 6 && (
        <div style={{ animation: 'slideUp 0.3s ease-out' }}>
          {/* Summary Details */}
          <div className="card">
            <h4>📊 BMR & TDEE Calculation Results</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div>• Gender: <b>{gender === 'male' ? 'Male' : 'Female'}</b></div>
              <div>• Age: <b>{age} years old</b></div>
              <div>• Height: <b>{height} cm</b></div>
              <div>• Weight: <b>{weight} kg</b></div>
              <div style={{ gridColumn: 'span 2' }}>• Activity: <b>{activity.toUpperCase()}</b></div>
            </div>
            <button 
              onClick={() => setStep(1)} 
              className="button-primary" 
              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', marginTop: '16px', padding: '10px' }}
            >
              🔄 Recalculate
            </button>
          </div>

          {/* Goal selection layout cards */}
          <div className="header-container" style={{ margin: '20px 0 10px 0' }}>
            <h3>🎯 Select Daily Calorie Goal</h3>
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
                  <strong style={{ fontSize: '15px' }}>🥦 Maintain Weight</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Keep your weight and shape the same</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>{results.maintain}</span>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>kcal/day</span>
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
                  <strong style={{ fontSize: '15px' }}>🥗 Mild Weight Loss</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Lose ~0.25 kg/week</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-secondary)' }}>{results.mild}</span>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>kcal/day</span>
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
                  <strong style={{ fontSize: '15px' }}>🔥 Weight Loss</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Lose ~0.5 kg/week</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-accent)' }}>{results.weight_loss}</span>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>kcal/day</span>
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
                  <strong style={{ fontSize: '15px' }}>⚡ Extreme Loss</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Lose ~1.0 kg/week</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-error)' }}>{results.extreme}</span>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>kcal/day</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
