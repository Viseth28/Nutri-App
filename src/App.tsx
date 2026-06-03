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
import { api } from './services/api';

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

interface Profile {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activity: string;
  goal_type: string;
}

// ---------------------------------------------------------
// Telegram SDK Integration
// ---------------------------------------------------------
let telegramUserId: number | null = null;
if (typeof window !== 'undefined' && (window as any).Telegram && (window as any).Telegram.WebApp) {
  const tgWebApp = (window as any).Telegram.WebApp;
  try {
    tgWebApp.ready();
    if (tgWebApp.initDataUnsafe && tgWebApp.initDataUnsafe.user) {
      telegramUserId = tgWebApp.initDataUnsafe.user.id;
    }
  } catch (err) {
    console.error("Error initializing Telegram WebApp SDK:", err);
  }
}

// Fallback to query parameter '?user_id=...' in standard web browser
if (!telegramUserId && typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const qId = urlParams.get('user_id');
  if (qId) {
    telegramUserId = parseInt(qId);
  }
}

// Default to a test user ID (562180371) if no active Telegram session or param is found
const ACTIVE_USER_ID = telegramUserId || 562180371;

const App: React.FC = () => {
  // Global State
  const [userId] = useState<number>(ACTIVE_USER_ID);
  const [activeTab, setActiveTab] = useState<'home' | 'suggest' | 'weight' | 'profile'>('home');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [burned, setBurned] = useState<number>(0);
  const [targetCal, setTargetCal] = useState<number>(2000);
  const [noSweetToday, setNoSweetToday] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
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

  // Load live data from the FastAPI backend using Turso SQLite
  const loadDashboardData = async (uid: number) => {
    try {
      setLoading(true);
      const data = await api.getDashboard(uid);
      
      setLogs(data.today_meals);
      setBurned(data.total_burn);
      setTargetCal(data.goal);
      setNoSweetToday(data.no_sweet_today);
      setProfile(data.profile);
      if (data.profile) {
        setPreviousWeight(data.profile.weight);
      }
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Error retrieving user database logs:", err);
      setErrorMsg("មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធទិន្នន័យបានឡើយ។");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(userId);
  }, [userId]);

  // Save profile and recalculated target calories to the backend
  const handleSaveProfile = async (newProfile: Profile, _calculatedTarget: number) => {
    try {
      setLoading(true);
      const res = await api.updateProfile(userId, {
        gender: newProfile.gender,
        age: newProfile.age,
        height: newProfile.height,
        weight: newProfile.weight,
        activity: newProfile.activity,
        goal_type: newProfile.goal_type
      });
      if (res.ok) {
        setProfile(newProfile);
        setPreviousWeight(newProfile.weight);
        if (res.new_goal) setTargetCal(res.new_goal);
        await loadDashboardData(userId);
      } else {
        alert(res.error || "បរាជ័យក្នុងការរក្សាទុក");
      }
    } catch (err) {
      alert("មានបញ្ហា៖ " + err);
    } finally {
      setLoading(false);
    }
  };

  // Update weight and trigger calorie target adjustments dynamically
  const handleUpdateWeight = async (newWeight: number) => {
    try {
      setLoading(true);
      const res = await api.updateWeight(userId, newWeight);
      if (res.ok) {
        if (res.new_goal) setTargetCal(res.new_goal);
        if (profile) {
          setPreviousWeight(profile.weight);
          setProfile({ ...profile, weight: newWeight });
        }
        await loadDashboardData(userId);
      } else {
        alert(res.error || "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាព");
      }
    } catch (err) {
      alert("មានបញ្ហា៖ " + err);
    } finally {
      setLoading(false);
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

  // Toggle Sweet Drink Challenge
  const handleToggleSweet = async () => {
    const newVal = !noSweetToday;
    try {
      const res = await api.toggleNoSweet(userId, newVal);
      if (res.ok) {
        setNoSweetToday(newVal);
      }
    } catch (err) {
      alert("មានបញ្ហាក្នុងការកត់ត្រា៖ " + err);
    }
  };

  // Delete logged meal entries
  const handleDeleteLog = async (id: string) => {
    const logItem = logs.find(item => item.id === id);
    if (logItem && logItem.meal_id) {
      try {
        setLoading(true);
        const res = await api.deleteMeal(userId, logItem.meal_id);
        if (res.ok) {
          setLogs(logs.filter(item => item.id !== id));
          await loadDashboardData(userId);
        } else {
          alert(res.error || "បរាជ័យក្នុងការលុប");
        }
      } catch (err) {
        alert("មានបញ្ហា៖ " + err);
      } finally {
        setLoading(false);
      }
    } else {
      setLogs(logs.filter(item => item.id !== id));
    }
  };

  const handleClearLogs = () => {
    // Keeping local list reset fallback
    setLogs([]);
    setBurned(0);
  };

  // Add meal using Gemini text analysis
  const handleTextLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodText.trim()) return;

    try {
      setIsLogModalOpen(false);
      setLoading(true);
      const res = await api.addMeal(userId, foodText);
      if (res.ok) {
        await loadDashboardData(userId);
      } else {
        alert(res.error || "AI មិនអាចវិភាគអាហារនេះបានទេ។");
      }
    } catch (err) {
      alert("មានបញ្ហាក្នុងការវិភាគ៖ " + err);
    } finally {
      setFoodText('');
      setLoading(false);
    }
  };

  // Record active calorie burns manually
  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(exerciseCal);
    if (!isNaN(val) && val > 0) {
      try {
        setIsLogModalOpen(false);
        setLoading(true);
        const res = await api.addBurn(userId, val);
        if (res.ok) {
          await loadDashboardData(userId);
        } else {
          alert(res.error || "មិនអាចកត់ត្រាការដុតកាឡូរីបានឡើយ");
        }
      } catch (err) {
        alert("មានបញ្ហា៖ " + err);
      } finally {
        setExerciseCal('');
        setLoading(false);
      }
    }
  };

  // Camera Logger trigger (Mock AI upload, then saves to actual DB on click)
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

  const handleSaveCameraResult = async () => {
    if (!cameraResult) return;

    try {
      setIsLogModalOpen(false);
      setLoading(true);
      const res = await api.addMeal(userId, cameraResult.name);
      if (res.ok) {
        await loadDashboardData(userId);
      } else {
        alert(res.error || "មិនអាចកត់ត្រាអាហារបានទេ");
      }
    } catch (err) {
      alert("មានបញ្ហា៖ " + err);
    } finally {
      setCameraResult(null);
      setCameraImage(null);
      setLoading(false);
    }
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

      {/* Network Error Toast banner if any */}
      {errorMsg && (
        <div style={{ margin: '10px 20px', padding: '12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '12px', display: 'flex', justifyContent: 'center' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Full-screen glassmorphism loader for API updates */}
      {loading && (
        <div className="loader-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 10, 15, 0.75)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" />
          <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.5px' }}>
            កំពុងភ្ជាប់ប្រព័ន្ធ និងទាញយកទិន្នន័យ...
          </p>
        </div>
      )}

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
                        <div>🔥 កាឡូរី៖ <b>{cameraResult.calories} Cal</b></div>
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
                  <span className="input-label">កាឡូរីដែលបានដុតរំលាយ (Cal)</span>
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
