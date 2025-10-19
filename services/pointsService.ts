// services/pointsService.ts
import * as db from './database';

export interface PrayerPoints {
  base: number;
  speedBonus: number;
  total: number;
}

export interface DailyScore {
  userId: string;
  date: string;
  totalPoints: number;
  prayersCompleted: string[];
  completionTimes: { [key: string]: string };
  rank: number;
}

export interface UserStats {
  highestDailyScore: number;
  highestScoreDate: string | null;
  currentDailyScore: number;
  currentStreak: number;
  totalPrayersCompleted: number;
  averageDailyScore: number;
}

class PointsService {
  // Points configuration
  private readonly PRAYER_BASE_POINTS = 20;
  private readonly SPEED_BONUS_POINTS = 10;
  private readonly ON_TIME_BONUS = 5;

  // Calculate points for prayer completion
  calculatePrayerPoints(
    prayerName: string,
    completionTime: Date = new Date()
  ): PrayerPoints {
    const basePoints = this.PRAYER_BASE_POINTS;
    const speedBonus = this.calculateSpeedBonus(prayerName, completionTime);

    return {
      base: basePoints,
      speedBonus,
      total: basePoints + speedBonus,
    };
  }

  // Calculate speed bonus based on prayer timing
  private calculateSpeedBonus(
    prayerName: string,
    completionTime: Date
  ): number {
    const hour = completionTime.getHours();
    const minute = completionTime.getMinutes();

    // Define optimal prayer time windows
    const prayerWindows = {
      Fajr: { start: 4.5, optimal: 5.5, end: 6.5 }, // 4:30 AM - 6:30 AM (optimal 5:30 AM)
      Dhuhr: { start: 12, optimal: 12.5, end: 14 }, // 12:00 PM - 2:00 PM (optimal 12:30 PM)
      Asr: { start: 15, optimal: 15.5, end: 17 }, // 3:00 PM - 5:00 PM (optimal 3:30 PM)
      Maghrib: { start: 18, optimal: 18.25, end: 19 }, // 6:00 PM - 7:00 PM (optimal 6:15 PM)
      Isha: { start: 20, optimal: 20.5, end: 22 }, // 8:00 PM - 10:00 PM (optimal 8:30 PM)
    };

    const window = prayerWindows[prayerName as keyof typeof prayerWindows];
    if (!window) return 0;

    const currentTime = hour + minute / 60;

    // Maximum bonus for optimal time
    if (Math.abs(currentTime - window.optimal) <= 0.25) {
      // Within 15 minutes of optimal
      return this.SPEED_BONUS_POINTS;
    }
    // Good bonus for early completion
    else if (currentTime >= window.start && currentTime <= window.optimal) {
      return this.ON_TIME_BONUS;
    }
    // Small bonus for on-time completion
    else if (currentTime > window.optimal && currentTime <= window.end) {
      return Math.floor(this.ON_TIME_BONUS / 2);
    }

    return 0; // No bonus for late completion
  }

  // Complete a prayer and update points
  async completePrayer(
    userId: string,
    prayerName: string
  ): Promise<{
    success: boolean;
    points?: PrayerPoints;
    dailyTotal?: number;
    error?: string;
  }> {
    try {
      const completionTime = new Date();
      const points = this.calculatePrayerPoints(prayerName, completionTime);

      // Update database
      const result = await db.updateUserDailyScore(
        userId,
        points.total,
        prayerName
      );

      if (result.success && result.data) {
        return {
          success: true,
          points,
          dailyTotal: result.data.totalDaily,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to update score',
        };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get user's daily score
  async getDailyScore(
    userId: string,
    date?: string | null
  ): Promise<{
    success: boolean;
    data?: DailyScore;
    error?: string;
  }> {
    const result = await db.getUserDailyScore(userId, date);
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data as DailyScore,
      };
    }
    return { success: false, error: result.error };
  }

  // Get daily leaderboard
  async getLeaderboard(limit = 50): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    return await db.getDailyLeaderboard(limit);
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    success: boolean;
    data?: UserStats;
    error?: string;
  }> {
    return await db.getUserStats(userId);
  }

  // Check if it's time for Fajr reset (runs every minute)
  shouldResetScores(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Reset at 4:30 AM (Fajr time)
    return hour === 4 && minute === 30;
  }

  // Manual reset for testing
  async resetDailyScores(): Promise<{ success: boolean; error?: string }> {
    return await db.resetDailyScores();
  }
}

export const pointsService = new PointsService();
