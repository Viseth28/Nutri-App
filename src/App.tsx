import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ChefHat, 
  Scale, 
  User as UserIcon, 
  Plus, 
  Camera, 
  Sparkles, 
  Flame 
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Suggest } from './components/Suggest';
import { WeightTracker } from './components/WeightTracker';
import { ProfileSetup } from './components/ProfileSetup';

interface MealLog {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

interface Profile {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activity: string;
  goal_type: string;
}

const App: React.FC = () => {
  // Global State
  const [activeTab, setActiveTab] = useState<'home' | 'suggest' | 'weight' | 'profile'>('home');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [burned, setBurned] = useState<number>(0);
  const [targetCal, setTargetCal] = useState<number>(2000);
  const [noSweetToday, setNoSweetToday] = useState<boolean>(false);
  
  // Weight & Profile States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [previousWeight, setPreviousWeight] = useState<number | null>(null);
  
  // Input Modal Forms State
  const [logType, setLogType] = useState<'food' | 'camera' | 'exercise'>('food');
  const [foodText, setFoodText] = useState('');
  const [exerciseCal, setExerciseCal] = useState('');
  
  // Simulated Camera loading
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraResult, setCameraResult] = useState<any | null>(null);

  // Set default initial data on load
  useEffect(() => {
    // Load some mock data for a full, premium initial look
    setLogs([
      { id: '1', name: '🍳 ស៊ុតស្ងោរ ២ គ្រាប់', calories: 155, protein: 13, carbs: 1, fat: 11, time: '08:15' },
      { id: '2', name: '🥤 កាហ្វេខ្មៅឥតស្ករ', calories: 5, protein: 0, carbs: 0, fat: 0, time: '08:30' },
      { id: '3', name: '🍛 បាយសាច់ជ្រូកអាំង (ផ្សារខ្មែរ)', calories: 550, protein: 28, carbs: 65, fat: 18, time: '12:10' }
    ]);
    setBurned(350);
    setTargetCal(2365);
    setNoSweetToday(true);
    setProfile({
      gender: 'male',
      age: 23,
      height: 177,
      weight: 96,
      activity: 'moderate',
      goal_type: 'weight_loss'
    });
    setPreviousWeight(98.5);
  }, []);

  // Update calories on Profile changes
  const handleSaveProfile = (newProfile: Profile, calculatedTarget: number) => {
    setProfile(newProfile);
    setPreviousWeight(profile ? profile.weight : null);
    setTargetCal(calculatedTarget);
  };

  // Recalculate TDEE manually when weight changes from WeightTracker
  const handleUpdateWeight = (newWeight: number) => {
    if (profile) {
      const oldWeight = profile.weight;
      const updatedProfile = { ...profile, weight: newWeight };
      setProfile(updatedProfile);
      setPreviousWeight(oldWeight);

      // Recalculate Mifflin-St Jeor TDEE instantly
      let bmr = 0;
      if (profile.gender === 'male') {
        bmr = 10 * newWeight + 6.25 * profile.height - 5 * profile.age + 5;
      } else {
        bmr = 10 * newWeight + 6.25 * profile.height - 5 * profile.age - 161;
      }

      let multiplier = 1.2;
      if (profile.activity === 'sedentary') multiplier = 1.2;
      else if (profile.activity === 'light') multiplier = 1.375;
      else if (profile.activity === 'moderate') multiplier = 1.465;
      else if (profile.activity === 'active') multiplier = 1.55;
      else if (profile.activity === 'very_active') multiplier = 1.725;

      let offset = 0;
      if (profile.goal_type === 'mild_loss') offset = -250;
      else if (profile.goal_type === 'weight_loss') offset = -500;
      else if (profile.goal_type === 'extreme_loss') offset = -1000;

      const newTarget = Math.max(1200, Math.round(bmr * multiplier) + offset);
      setTargetCal(newTarget);
    } else {
      setPreviousWeight(profile ? (profile as Profile).weight : 70);
      setProfile({
        gender: 'male',
        age: 25,
        height: 170,
        weight: newWeight,
        activity: 'moderate',
        goal_type: 'weight_loss'
      });
      setTargetCal(1800);
    }
  };

  // Dynamic date (ICT Timezone)
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `📅 ${year}-${month}-${day}`;
  };

  // Switch Challenge Toggle
  const handleToggleSweet = () => {
    setNoSweetToday(!noSweetToday);
  };

  // Logs Operations
  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter(item => item.id !== id));
  };

  const handleClearLogs = () => {
    setLogs([]);
    setBurned(0);
  };

  // Text Meal Logger submit
  const handleTextLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodText.trim()) return;

    // Simulate Gemini extraction parsing
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Simple mock nutrient parser based on keywords to look incredibly realistic
    let cal = 200;
    let p = 12;
    let c = 20;
    let f = 6;
    
    const textLower = foodText.toLowerCase();
    if (textLower.includes('បាយ') || textLower.includes('rice')) {
      cal = 420; p = 8; c = 85; f = 2;
    } else if (textLower.includes('ស៊ុត') || textLower.includes('egg')) {
      cal = 150; p = 13; c = 1; f = 10;
    } else if (textLower.includes('មាន់') || textLower.includes('chicken')) {
      cal = 310; p = 35; c = 2; f = 12;
    } else if (textLower.includes('សាច់ជ្រូក') || textLower.includes('pork')) {
      cal = 480; p = 25; c = 3; f = 22;
    }

    const newLog: MealLog = {
      id: Date.now().toString(),
      name: foodText,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      time: timeStr
    };

    setLogs([newLog, ...logs]);
    setFoodText('');
    setIsLogModalOpen(false);
  };

  // Exercise Logger submit
  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(exerciseCal);
    if (!isNaN(val) && val > 0) {
      setBurned(burned + val);
      setExerciseCal('');
      setIsLogModalOpen(false);
    }
  };

  // Camera Logger trigger (Mock AI upload)
  const handleTriggerCameraUpload = () => {
    setCameraLoading(true);
    setCameraImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"); // Mock food image
    
    setTimeout(() => {
      setCameraLoading(false);
      setCameraResult({
        name: '🥗 សាឡាត់ផ្លែបឺរ និងទ្រូងមាន់ស្ងោរ',
        calories: 380,
        protein: 32,
        carbs: 12,
        fat: 14
      });
    }, 1800);
  };

  const handleSaveCameraResult = () => {
    if (!cameraResult) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newLog: MealLog = {
      id: Date.now().toString(),
      name: cameraResult.name,
      calories: cameraResult.calories,
      protein: cameraResult.protein,
      carbs: cameraResult.carbs,
      fat: cameraResult.fat,
      time: timeStr
    };

    setLogs([newLog, ...logs]);
    setCameraResult(null);
    setCameraImage(null);
    setIsLogModalOpen(false);
  };

  return (
    <div className="app-container">
      {/* Premium Top Status Header */}
      <div style={{ padding: '20px 20px 0 20px', background: 'var(--bg-primary)' }}>
        <div className="header-container">
          <h1 className="header-logo">
            <Sparkles size={24} style={{ color: 'var(--color-primary)' }} />
            <span>NutriApp</span>
          </h1>
          <span className="header-date">{getTodayDateString()}</span>
        </div>
      </div>

      {/* Render current main page content view */}
      <div className="app-content">
        {activeTab === 'home' && (
          <Dashboard 
            logs={logs}
            burned={burned}
            target={targetCal}
            noSweetToday={noSweetToday}
            onToggleSweet={handleToggleSweet}
            onDeleteLog={handleDeleteLog}
            onClearLogs={handleClearLogs}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />
        )}
        
        {activeTab === 'suggest' && (
          <Suggest targetCal={targetCal} />
        )}
        
        {activeTab === 'weight' && (
          <WeightTracker 
            currentWeight={profile ? profile.weight : 70}
            previousWeight={previousWeight}
            onUpdateWeight={handleUpdateWeight}
          />
        )}
        
        {activeTab === 'profile' && (
          <ProfileSetup 
            profile={profile}
            onSaveProfile={handleSaveProfile}
          />
        )}
      </div>

      {/* Premium Bottom Navigation Tab Bar */}
      <div className="bottom-nav">
        <div className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home className="nav-tab-icon" size={22} />
          <span>Home</span>
        </div>

        <div className={`nav-tab ${activeTab === 'suggest' ? 'active' : ''}`} onClick={() => setActiveTab('suggest')}>
          <ChefHat className="nav-tab-icon" size={22} />
          <span>ណែនាំម្ហូប</span>
        </div>

        {/* Center Logging CTA Button */}
        <div className="nav-tab-center" onClick={() => setIsLogModalOpen(true)}>
          <Plus size={26} />
        </div>

        <div className={`nav-tab ${activeTab === 'weight' ? 'active' : ''}`} onClick={() => setActiveTab('weight')}>
          <Scale className="nav-tab-icon" size={22} />
          <span>ទម្ងន់</span>
        </div>

        <div className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <UserIcon className="nav-tab-icon" size={22} />
          <span>ប្រវត្តិរូប</span>
        </div>
      </div>

      {/* Log Form Bottom Sheet Modal */}
      {isLogModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLogModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✍️ កត់ត្រាសកម្មភាព</h3>
              <button className="close-btn" onClick={() => setIsLogModalOpen(false)}>✕</button>
            </div>

            {/* Log form type switcher tabs */}
            <div className="segmented-control" style={{ marginBottom: '20px' }}>
              <button className={`segment-btn ${logType === 'food' ? 'active' : ''}`} onClick={() => setLogType('food')}>
                📝 ម្ហូបអាហារ
              </button>
              <button className={`segment-btn ${logType === 'camera' ? 'active' : ''}`} onClick={() => setLogType('camera')}>
                📷 ស្កែនរូបភាព
              </button>
              <button className={`segment-btn ${logType === 'exercise' ? 'active' : ''}`} onClick={() => setLogType('exercise')}>
                🔥 ហាត់ប្រាណ
              </button>
            </div>

            {/* Render Log forms depending on type selection */}
            {logType === 'food' && (
              <form onSubmit={handleTextLogSubmit}>
                <div className="input-group">
                  <span className="input-label">រៀបរាប់ពីអាហារដែលអ្នកបានញ៉ាំ</span>
                  <input
                    type="text"
                    required
                    value={foodText}
                    onChange={(e) => setFoodText(e.target.value)}
                    placeholder="ឧទាហរណ៍: បាយសាច់ជ្រូកអាំង ១ចាន ឬ ស៊ុតស្ងោរ ២គ្រាប់"
                    className="form-input"
                  />
                </div>
                <button type="submit" className="button-primary">
                  <Sparkles size={16} />
                  <span>វិភាគ និងកត់ត្រាអាហារ</span>
                </button>
              </form>
            )}

            {logType === 'camera' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!cameraImage && !cameraLoading && (
                  <div className="image-preview-box" onClick={handleTriggerCameraUpload}>
                    <Camera size={40} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>ថតរូបភាពអាហារ ឬបញ្ចូលរូប</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gemini នឹងវិភាគកាឡូរីភ្លាមៗ</span>
                  </div>
                )}

                {cameraLoading && (
                  <div className="loader-container">
                    <div className="spinner" />
                    <p className="pulsing-circle" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                      Gemini កំពុងស្កែន និងវិភាគសារធាតុចិញ្ចឹម...
                    </p>
                  </div>
                )}

                {!cameraLoading && cameraImage && cameraResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.3s ease-out' }}>
                    <div 
                      className="image-preview-box" 
                      style={{ backgroundImage: `url(${cameraImage})`, borderStyle: 'solid' }}
                    />
                    
                    <div className="card" style={{ marginBottom: 0, border: '1px solid var(--border-glass-highlight)' }}>
                      <h4 style={{ color: 'var(--color-primary)' }}>📊 លទ្ធផលវិភាគរបស់ AI</h4>
                      <strong style={{ fontSize: '15px', display: 'block', margin: '8px 0' }}>{cameraResult.name}</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                        <div>🔥 កាឡូរី៖ <b>{cameraResult.calories} kcal</b></div>
                        <div>🥩 ប្រូតេអ៊ីន៖ <b>{cameraResult.protein}g</b></div>
                        <div>🌾 កាបូអ៊ីដ្រាត៖ <b>{cameraResult.carbs}g</b></div>
                        <div>🥑 ខ្លាញ់៖ <b>{cameraResult.fat}g</b></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="button-primary" 
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        onClick={() => { setCameraImage(null); setCameraResult(null); }}
                      >
                        ថតរូបឡើងវិញ
                      </button>
                      <button className="button-primary" onClick={handleSaveCameraResult}>
                        រក្សាទុកកំណត់ត្រា
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {logType === 'exercise' && (
              <form onSubmit={handleExerciseSubmit}>
                <div className="input-group">
                  <span className="input-label">កាឡូរីដែលបានដុតរំលាយ (kcal)</span>
                  <input
                    type="number"
                    required
                    value={exerciseCal}
                    onChange={(e) => setExerciseCal(e.target.value)}
                    placeholder="ឧទាហរណ៍: 300"
                    className="form-input"
                  />
                </div>
                <button type="submit" className="button-primary">
                  <Flame size={16} />
                  <span>កត់ត្រាការដុតកាឡូរី</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
