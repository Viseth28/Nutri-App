import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ChefHat, 
  Scale, 
  User as UserIcon, 
  Plus, 
  Camera, 
  Sparkles, 
  Flame,
  Calendar,
  Search
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Suggest } from './components/Suggest';
import { WeightTracker } from './components/WeightTracker';
import { ProfileSetup } from './components/ProfileSetup';
import { WeeklyReport } from './components/WeeklyReport';
import { FoodSearch } from './components/FoodSearch';
import { api } from './services/api';
import type { WeeklyDashboardData } from './services/api';

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
  const [activeTab, setActiveTab] = useState<'home' | 'weekly' | 'suggest' | 'search' | 'weight' | 'profile'>('home');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [burned, setBurned] = useState<number>(0);
  const [targetCal, setTargetCal] = useState<number>(2000);
  const [noSweetToday, setNoSweetToday] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyDashboardData | null>(null);
  
  // Weight & Profile States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [previousWeight, setPreviousWeight] = useState<number | null>(null);
  
  // Input Modal Forms State
  const [logType, setLogType] = useState<'food' | 'camera' | 'manual_food' | 'exercise'>('food');
  const [foodText, setFoodText] = useState('');
  const [exerciseCal, setExerciseCal] = useState('');

  // Manual Food Inputs
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualSugar, setManualSugar] = useState('');
  
  // Simulated Camera loading
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraResult, setCameraResult] = useState<any | null>(null);

  // Load live data from the FastAPI backend using Turso SQLite
  const loadDashboardData = async (uid: number) => {
    try {
      setLoading(true);
      const [dashRes, weeklyRes] = await Promise.all([
        api.getDashboard(uid),
        api.getWeeklyData(uid)
      ]);
      
      setLogs(dashRes.today_meals);
      setBurned(dashRes.total_burn);
      setTargetCal(dashRes.goal);
      setNoSweetToday(dashRes.no_sweet_today);
      setProfile(dashRes.profile);
      if (dashRes.profile) {
        setPreviousWeight(dashRes.profile.weight);
      }
      setWeeklyData(weeklyRes);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Error retrieving user database logs:", err);
      setErrorMsg("Unable to connect to the database.");
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
        alert(res.error || "Failed to save");
      }
    } catch (err) {
      alert("Error: " + err);
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
        alert(res.error || "Failed to update");
      }
    } catch (err) {
      alert("Error: " + err);
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
      alert("Error logging: " + err);
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
          alert(res.error || "Failed to delete");
        }
      } catch (err) {
        alert("Error: " + err);
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
        alert(res.error || "AI cannot analyze this food.");
      }
    } catch (err) {
      alert("Error analyzing: " + err);
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
          alert(res.error || "Unable to log burned calories.");
        }
      } catch (err) {
        alert("Error: " + err);
      } finally {
        setExerciseCal('');
        setLoading(false);
      }
    }
  };

  // Record custom meal logs manually (without AI)
  const handleManualFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFoodName || !manualCalories) return;

    try {
      setIsLogModalOpen(false);
      setLoading(true);
      const res = await api.addCustomMeal(userId, {
        food_name: manualFoodName,
        calories: parseInt(manualCalories) || 0,
        protein: parseInt(manualProtein) || 0,
        fat: parseInt(manualFat) || 0,
        carbs: parseInt(manualCarbs) || 0,
        sugar: parseInt(manualSugar) || 0
      });

      if (res.ok) {
        setManualFoodName('');
        setManualCalories('');
        setManualProtein('');
        setManualFat('');
        setManualCarbs('');
        setManualSugar('');
        await loadDashboardData(userId);
      } else {
        alert(res.error || "Unable to log food.");
      }
    } catch (err) {
      alert("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  // Camera Logger trigger - clicks hidden file input
  const handleTriggerCameraUpload = () => {
    const fileInput = document.getElementById('camera-file-input');
    if (fileInput) {
      (fileInput as HTMLInputElement).value = ''; // Reset to allow same file upload
      fileInput.click();
    }
  };

  // Process selected photo file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview and analyze
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setCameraImage(base64);
      setCameraLoading(true);
      setCameraResult(null);

      try {
        const res = await api.addMealPhoto(userId, base64);
        if (res.ok && res.meal) {
          setCameraResult({
            name: res.meal.food_name,
            calories: res.meal.calories,
            protein: res.meal.protein,
            carbs: res.meal.carbs,
            fat: res.meal.fat,
            sugar: res.meal.sugar,
            coaching_recommendation: res.meal.coaching_recommendation
          });
        } else {
          alert(res.error || "Unable to analyze image.");
          setCameraImage(null);
        }
      } catch (err) {
        alert("Error: " + err);
        setCameraImage(null);
      } finally {
        setCameraLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCameraResult = async () => {
    if (!cameraResult) return;

    try {
      setIsLogModalOpen(false);
      setLoading(true);
      const res = await api.addCustomMeal(userId, {
        food_name: cameraResult.name,
        calories: cameraResult.calories,
        protein: cameraResult.protein,
        fat: cameraResult.fat,
        carbs: cameraResult.carbs,
        sugar: cameraResult.sugar || 0
      });
      if (res.ok) {
        await loadDashboardData(userId);
      } else {
        alert(res.error || "Unable to log food.");
      }
    } catch (err) {
      alert("Error: " + err);
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
            Connecting and fetching data...
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
        
        {activeTab === 'weekly' && (
          <WeeklyReport 
            weeklyData={weeklyData} 
            onFilterChange={async (start, end) => {
              try {
                setLoading(true);
                const res = await api.getWeeklyData(userId, start, end);
                setWeeklyData(res);
              } catch (e) {
                alert("Failed to fetch data: " + e);
              } finally {
                setLoading(false);
              }
            }}
            onFilterReset={async () => {
              try {
                setLoading(true);
                const res = await api.getWeeklyData(userId);
                setWeeklyData(res);
              } catch (e) {
                alert("Failed to fetch data: " + e);
              } finally {
                setLoading(false);
              }
            }}
          />
        )}
        
        {activeTab === 'suggest' && (
          <Suggest targetCal={targetCal} />
        )}
        
        {activeTab === 'search' && (
          <FoodSearch 
            userId={userId} 
            onLogSuccess={() => {
              loadDashboardData(userId);
              setActiveTab('home');
            }} 
          />
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
          <span>Dashboard</span>
        </div>

        <div className={`nav-tab ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>
          <Calendar className="nav-tab-icon" size={22} />
          <span>Report</span>
        </div>

        <div className={`nav-tab ${activeTab === 'suggest' ? 'active' : ''}`} onClick={() => setActiveTab('suggest')}>
          <ChefHat className="nav-tab-icon" size={22} />
          <span>Meal Plan</span>
        </div>

        {/* Center Logging CTA Button */}
        <div className="nav-tab-center" onClick={() => setIsLogModalOpen(true)}>
          <Plus size={26} />
        </div>

        <div className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
          <Search className="nav-tab-icon" size={22} />
          <span>Search</span>
        </div>

        <div className={`nav-tab ${activeTab === 'weight' ? 'active' : ''}`} onClick={() => setActiveTab('weight')}>
          <Scale className="nav-tab-icon" size={22} />
          <span>Weight</span>
        </div>

        <div className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <UserIcon className="nav-tab-icon" size={22} />
          <span>Profile</span>
        </div>
      </div>

      {/* Log Form Bottom Sheet Modal */}
      {isLogModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLogModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✍️ Record Activity</h3>
              <button className="close-btn" onClick={() => setIsLogModalOpen(false)}>✕</button>
            </div>

            {/* Log form type switcher tabs */}
            <div className="segmented-control" style={{ marginBottom: '20px' }}>
              <button className={`segment-btn ${logType === 'food' ? 'active' : ''}`} onClick={() => setLogType('food')}>
                📝 AI Text
              </button>
              <button className={`segment-btn ${logType === 'camera' ? 'active' : ''}`} onClick={() => setLogType('camera')}>
                📷 AI Image
              </button>
              <button className={`segment-btn ${logType === 'manual_food' ? 'active' : ''}`} onClick={() => setLogType('manual_food')}>
                ✍️ Manual
              </button>
              <button className={`segment-btn ${logType === 'exercise' ? 'active' : ''}`} onClick={() => setLogType('exercise')}>
                🔥 Workout
              </button>
            </div>

            {/* Render Log forms depending on type selection */}
            {logType === 'food' && (
              <form onSubmit={handleTextLogSubmit}>
                <div className="input-group">
                  <span className="input-label">Describe what you ate</span>
                  <input
                    type="text"
                    required
                    value={foodText}
                    onChange={(e) => setFoodText(e.target.value)}
                    placeholder="Example: 1 plate of grilled pork rice, or 2 boiled eggs"
                    className="form-input"
                  />
                </div>
                <button type="submit" className="button-primary">
                  <Sparkles size={16} />
                  <span>Analyze & Log Food</span>
                </button>
              </form>
            )}

            {logType === 'camera' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="file"
                  id="camera-file-input"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {!cameraImage && !cameraLoading && (
                  <div className="image-preview-box" onClick={handleTriggerCameraUpload}>
                    <Camera size={40} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Take food photo or upload image</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AI will analyze calories instantly</span>
                  </div>
                )}

                {cameraLoading && (
                  <div className="loader-container">
                    <div className="spinner" />
                    <p className="pulsing-circle" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                      AI is scanning and analyzing nutrients...
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
                      <h4 style={{ color: 'var(--color-primary)' }}>📊 AI Analysis Results</h4>
                      <strong style={{ fontSize: '15px', display: 'block', margin: '8px 0' }}>{cameraResult.name}</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                        <div>🔥 Calories: <b>{cameraResult.calories} Cal</b></div>
                        <div>🥩 Protein: <b>{cameraResult.protein}g</b></div>
                        <div>🌾 Carbs: <b>{cameraResult.carbs}g</b></div>
                        <div>🥑 Fat: <b>{cameraResult.fat}g</b></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="button-primary" 
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        onClick={() => { setCameraImage(null); setCameraResult(null); }}
                      >
                        Retake Photo
                      </button>
                      <button className="button-primary" onClick={handleSaveCameraResult}>
                        Save Log
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {logType === 'manual_food' && (
              <form onSubmit={handleManualFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="input-group">
                  <span className="input-label">Food Name</span>
                  <input
                    type="text"
                    required
                    value={manualFoodName}
                    onChange={(e) => setManualFoodName(e.target.value)}
                    placeholder="Example: Pork Fried Rice"
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="input-group">
                    <span className="input-label">Calories (Cal)</span>
                    <input
                      type="number"
                      required
                      value={manualCalories}
                      onChange={(e) => setManualCalories(e.target.value)}
                      placeholder="Cal"
                      className="form-input"
                    />
                  </div>
                  <div className="input-group">
                    <span className="input-label">Protein (g)</span>
                    <input
                      type="number"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(e.target.value)}
                      placeholder="g"
                      className="form-input"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div className="input-group">
                    <span className="input-label">Carbs (g)</span>
                    <input
                      type="number"
                      value={manualCarbs}
                      onChange={(e) => setManualCarbs(e.target.value)}
                      placeholder="g"
                      className="form-input"
                    />
                  </div>
                  <div className="input-group">
                    <span className="input-label">Total Fat (g)</span>
                    <input
                      type="number"
                      value={manualFat}
                      onChange={(e) => setManualFat(e.target.value)}
                      placeholder="g"
                      className="form-input"
                    />
                  </div>
                  <div className="input-group">
                    <span className="input-label">Sugar (g)</span>
                    <input
                      type="number"
                      value={manualSugar}
                      onChange={(e) => setManualSugar(e.target.value)}
                      placeholder="g"
                      className="form-input"
                    />
                  </div>
                </div>
                <button type="submit" className="button-primary" style={{ marginTop: '8px' }}>
                  <span>Save Log</span>
                </button>
              </form>
            )}

            {logType === 'exercise' && (
              <form onSubmit={handleExerciseSubmit}>
                <div className="input-group">
                  <span className="input-label">Calories Burned (Cal)</span>
                  <input
                    type="number"
                    required
                    value={exerciseCal}
                    onChange={(e) => setExerciseCal(e.target.value)}
                    placeholder="Example: 300"
                    className="form-input"
                  />
                </div>
                <button type="submit" className="button-primary">
                  <Flame size={16} />
                  <span>Log Burned Calories</span>
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
