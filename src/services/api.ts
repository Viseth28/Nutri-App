// NutriApp/src/services/api.ts

const DEFAULT_API_BASE = "https://nutri-bot-gamma.vercel.app";

const getBaseUrl = (): string => {
  if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location) {
    const origin = window.location.origin;
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return origin;
    }
  }
  return DEFAULT_API_BASE;
};

const BASE_URL = getBaseUrl();

export interface Meal {
  meal_id?: number;
  food_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  coaching_recommendation?: string;
  time?: string;
  timestamp?: string;
}

export interface MealLog {
  id: string;
  meal_id?: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export interface UserProfile {
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  activity: string;
  goal_type: string;
}

export interface DashboardData {
  user_id: number;
  goal: number;
  goal_type: string;
  profile: UserProfile | null;
  today_meals: MealLog[];
  total_cals: number;
  total_burn: number;
  no_sweet_today: boolean;
}

export const api = {
  getDashboard: async (userId: number): Promise<DashboardData> => {
    const res = await fetch(`${BASE_URL}/api/tma/dashboard?user_id=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    const data = await res.json();
    
    const today_meals: MealLog[] = (data.today_meals || []).map((m: any) => {
      let time = "12:00";
      if (m.timestamp) {
        try {
          const parts = m.timestamp.split(" ");
          if (parts.length > 1) {
            time = parts[1].substring(0, 5); // get HH:MM
          }
        } catch (e) {
          console.error("Error parsing meal timestamp", e);
        }
      }
      return {
        id: m.meal_id?.toString() || Math.random().toString(),
        meal_id: m.meal_id,
        name: m.food_name,
        calories: m.calories,
        protein: m.protein,
        fat: m.fat,
        carbs: m.carbs,
        sugar: m.sugar,
        time: time
      };
    });

    return {
      user_id: data.user_id,
      goal: data.goal,
      goal_type: data.goal_type,
      profile: data.profile ? {
        gender: data.profile.gender,
        age: data.profile.age,
        height: data.profile.height,
        weight: data.profile.weight,
        activity: data.profile.activity,
        goal_type: data.profile.goal_type
      } : null,
      today_meals: today_meals,
      total_cals: data.total_cals || 0,
      total_burn: data.total_burn || 0,
      no_sweet_today: !!data.no_sweet_today
    };
  },

  addMeal: async (userId: number, foodDescription: string, customDate?: string): Promise<{ ok: boolean; meal?: Meal; error?: string }> => {
    const res = await fetch(`${BASE_URL}/api/tma/meal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, food_description: foodDescription, custom_date: customDate })
    });
    if (!res.ok) throw new Error("Failed to add meal");
    return await res.json();
  },

  addBurn: async (userId: number, calories: number, activityName = "Manual", customDate?: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch(`${BASE_URL}/api/tma/burn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, calories, activity_name: activityName, custom_date: customDate })
    });
    if (!res.ok) throw new Error("Failed to record burn");
    return await res.json();
  },

  updateWeight: async (userId: number, weight: number): Promise<{ ok: boolean; new_goal?: number; error?: string }> => {
    const res = await fetch(`${BASE_URL}/api/tma/weight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, weight })
    });
    if (!res.ok) throw new Error("Failed to update weight");
    return await res.json();
  },

  updateProfile: async (
    userId: number,
    profile: UserProfile
  ): Promise<{ ok: boolean; new_goal?: number; error?: string }> => {
    const res = await fetch(`${BASE_URL}/api/tma/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        gender: profile.gender,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        activity: profile.activity,
        goal_type: profile.goal_type
      })
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return await res.json();
  },

  toggleNoSweet: async (userId: number, noSweet: boolean): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch(`${BASE_URL}/api/tma/nosweet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, no_sweet: noSweet })
    });
    if (!res.ok) throw new Error("Failed to toggle no sweet drink status");
    return await res.json();
  },

  deleteMeal: async (userId: number, mealId: number): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch(`${BASE_URL}/api/tma/delete_meal?user_id=${userId}&meal_id=${mealId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete meal");
    return await res.json();
  }
};
