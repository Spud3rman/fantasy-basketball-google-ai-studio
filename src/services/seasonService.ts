export type SeasonMode = 'auto' | 'in_season' | 'offseason';

export interface SeasonInfo {
  isSeasonActive: boolean;
  mode: SeasonMode;
  seasonName: string;
  seasonStartDate: string;
  seasonStartDateFormatted: string;
  daysUntilTipoff: number;
  statusLabel: string;
}

const STORAGE_KEY_SEASON_MODE = 'cv_season_mode';
// 2026-27 NBA Regular Season begins Tuesday, October 20, 2026
const SEASON_START_DATE_STR = '2026-10-20T00:00:00Z';
const SEASON_END_DATE_STR = '2027-06-25T23:59:59Z';

export class SeasonService {
  public static getSeasonMode(): SeasonMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SEASON_MODE);
      if (stored === 'in_season' || stored === 'offseason' || stored === 'auto') {
        return stored;
      }
    } catch (e) {
      console.warn('Error reading season mode:', e);
    }
    return 'auto';
  }

  public static setSeasonMode(mode: SeasonMode) {
    try {
      localStorage.setItem(STORAGE_KEY_SEASON_MODE, mode);
    } catch (e) {
      console.warn('Error saving season mode:', e);
    }
    window.dispatchEvent(new CustomEvent('COURTVISION_SEASON_CHANGED', { detail: { mode } }));
  }

  public static isSeasonActive(): boolean {
    const mode = this.getSeasonMode();
    if (mode === 'in_season') return true;
    if (mode === 'offseason') return false;

    // 'auto' mode checks the calendar date against 2026-27 NBA Tip-off
    const now = new Date();
    const startDate = new Date(SEASON_START_DATE_STR);
    const endDate = new Date(SEASON_END_DATE_STR);

    return now >= startDate && now <= endDate;
  }

  public static getSeasonInfo(): SeasonInfo {
    const isSeasonActive = this.isSeasonActive();
    const mode = this.getSeasonMode();
    const now = new Date();
    const startDate = new Date(SEASON_START_DATE_STR);
    const diffMs = startDate.getTime() - now.getTime();
    const daysUntilTipoff = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    let statusLabel = '';
    if (isSeasonActive) {
      statusLabel = mode === 'in_season' ? 'SEASON ACTIVE (MANUAL)' : 'IN-SEASON (OFFICIAL)';
    } else {
      statusLabel = `OFFSEASON • TIPOFF IN ${daysUntilTipoff} DAYS (OCT 20, 2026)`;
    }

    return {
      isSeasonActive,
      mode,
      seasonName: '2026-27 NBA Season',
      seasonStartDate: SEASON_START_DATE_STR,
      seasonStartDateFormatted: 'October 20, 2026',
      daysUntilTipoff,
      statusLabel,
    };
  }

  public static onSeasonChange(callback: (info: SeasonInfo) => void): () => void {
    const handler = () => {
      callback(this.getSeasonInfo());
    };
    window.addEventListener('COURTVISION_SEASON_CHANGED', handler);
    return () => {
      window.removeEventListener('COURTVISION_SEASON_CHANGED', handler);
    };
  }
}
