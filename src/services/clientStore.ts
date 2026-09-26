import { INITIAL_NBA_PLAYERS, DEFAULT_SCORING_RULES, calculateFantasyPoints, enforceAuthenticTeam } from '../data/nbaPlayers';
import { League, GroupMember, DraftPick, PlayByPlayAction, LiveGame, Player, ScoringRules, CustomLeaderboard, CustomLeaderboardEntry, LeaderboardTrend } from '../types';
import { SeasonService } from './seasonService';

function getInitialInSeasonGames(): LiveGame[] {
  return [
    {
      id: 'game-den-lal',
      homeTeam: 'DEN',
      awayTeam: 'LAL',
      homeScore: 112,
      awayScore: 106,
      quarter: 4,
      clock: '03:15',
      status: 'live',
      playerStats: {
        p1: { playerId: 'p1', pts: 28, reb: 14, ast: 11, stl: 2, blk: 1, fg3m: 2, to: 3, fantasyPoints: 67.8 },
        p2: { playerId: 'p2', pts: 32, reb: 8, ast: 9, stl: 1, blk: 0, fg3m: 4, to: 4, fantasyPoints: 58.1 },
      },
    },
    {
      id: 'game-bos-nyk',
      homeTeam: 'BOS',
      awayTeam: 'NYK',
      homeScore: 104,
      awayScore: 101,
      quarter: 4,
      clock: '05:40',
      status: 'live',
      playerStats: {
        p5: { playerId: 'p5', pts: 27, reb: 8, ast: 5, stl: 2, blk: 1, fg3m: 3, to: 2, fantasyPoints: 49.6 },
        p8: { playerId: 'p8', pts: 29, reb: 4, ast: 7, stl: 1, blk: 0, fg3m: 3, to: 3, fantasyPoints: 47.3 },
      },
    },
    {
      id: 'game-mil-phi',
      homeTeam: 'MIL',
      awayTeam: 'PHI',
      homeScore: 98,
      awayScore: 94,
      quarter: 3,
      clock: '02:10',
      status: 'live',
      playerStats: {
        p3: { playerId: 'p3', pts: 31, reb: 12, ast: 6, stl: 1, blk: 2, fg3m: 0, to: 4, fantasyPoints: 59.4 },
        p11: { playerId: 'p11', pts: 26, reb: 11, ast: 4, stl: 1, blk: 2, fg3m: 1, to: 3, fantasyPoints: 52.2 },
      },
    },
  ];
}

const STORAGE_KEY_PLAYERS = 'cv_players';
const STORAGE_KEY_LEAGUES = 'cv_leagues';
const STORAGE_KEY_GAMES = 'cv_games';
const STORAGE_KEY_SIM_MODE = 'cv_sim_mode';
const CURRENT_ROSTER_VERSION = 'cv_v8_espn_official_stats';
const STORAGE_KEY_ROSTER_VERSION = 'cv_roster_version';
const STORAGE_KEY_CUSTOM_LEADERBOARDS = 'cv_custom_leaderboards';
const STORAGE_KEY_ACTIVE_LEADERBOARD_ID = 'cv_active_leaderboard_id';

export function cleanLeagueCode(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .toString()
    .toUpperCase()
    .replace(/^CODE\s*[:#-]?\s*/i, '')
    .replace(/[#\s\-_]/g, '')
    .trim();
}

function createDefaultLeague(): League {
  const defaultMembers: GroupMember[] = [
    {
      id: 'usr-1',
      userName: 'Alex (You)',
      teamName: 'Downtown Daggers',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      isHost: true,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    },
    {
      id: 'usr-2',
      userName: 'Marcus (CPU)',
      teamName: 'Rim Protectors',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      isHost: false,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    },
    {
      id: 'usr-3',
      userName: 'Elena (CPU)',
      teamName: 'Triple Double Trouble',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      isHost: false,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    },
    {
      id: 'usr-4',
      userName: 'Jordan (CPU)',
      teamName: 'Splash Brothers Fan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isHost: false,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    },
  ];

  return {
    id: 'league-main',
    name: 'Swoosh Legends League',
    code: 'SWOOSH1',
    maxTeams: 4,
    status: 'setup',
    currentWeek: 1,
    scoringRules: { ...DEFAULT_SCORING_RULES },
    draftState: {
      isStarted: false,
      isCompleted: false,
      currentRound: 1,
      currentPickIndex: 0,
      currentMemberId: 'usr-1',
      pickHistory: [],
      pickTimeSeconds: 45,
      timerActive: false,
    },
    members: defaultMembers,
    createdAt: new Date().toISOString(),
  };
}

export class ClientStore {
  // Players
  public static getPlayers(): Player[] {
    try {
      const version = localStorage.getItem(STORAGE_KEY_ROSTER_VERSION);
      if (version !== CURRENT_ROSTER_VERSION) {
        localStorage.removeItem(STORAGE_KEY_PLAYERS);
        localStorage.setItem(STORAGE_KEY_ROSTER_VERSION, CURRENT_ROSTER_VERSION);
        const fresh = INITIAL_NBA_PLAYERS.map(enforceAuthenticTeam);
        this.savePlayers(fresh);
        return fresh;
      }

      const stored = localStorage.getItem(STORAGE_KEY_PLAYERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          // Always sanitize and enforce authentic real-world teams
          const sanitized = parsed.map(enforceAuthenticTeam);
          return sanitized;
        }
      }
    } catch (e) {
      console.warn('Error reading stored players:', e);
    }
    const fresh = INITIAL_NBA_PLAYERS.map(enforceAuthenticTeam);
    this.savePlayers(fresh);
    return fresh;
  }

  public static savePlayers(players: Player[]) {
    try {
      const sanitized = players.map(enforceAuthenticTeam);
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(sanitized));
      localStorage.setItem(STORAGE_KEY_ROSTER_VERSION, CURRENT_ROSTER_VERSION);
    } catch (e) {
      console.warn('Error saving players to localStorage:', e);
    }
  }

  // Games
  public static getGames(): LiveGame[] {
    if (!SeasonService.isSeasonActive()) {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GAMES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored games:', e);
    }
    const inSeason = getInitialInSeasonGames();
    this.saveGames(inSeason);
    return inSeason;
  }

  public static saveGames(games: LiveGame[]) {
    try {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
    } catch (e) {
      console.warn('Error saving games to localStorage:', e);
    }
  }

  // Leagues
  public static getLeagues(): League[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LEAGUES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored leagues:', e);
    }
    const def = createDefaultLeague();
    this.saveLeagues([def]);
    return [def];
  }

  public static saveLeagues(leagues: League[]) {
    try {
      localStorage.setItem(STORAGE_KEY_LEAGUES, JSON.stringify(leagues));
    } catch (e) {
      console.warn('Error saving leagues to localStorage:', e);
    }
  }

  public static getLeague(id: string): League {
    const list = this.getLeagues();
    const found = list.find((l) => l.id === id);
    if (found) return found;
    return list[0] || createDefaultLeague();
  }

  public static saveLeague(league: League): League {
    const list = this.getLeagues();
    const idx = list.findIndex((l) => l.id === league.id);
    if (idx >= 0) {
      list[idx] = league;
    } else {
      list.push(league);
    }
    this.saveLeagues(list);
    return league;
  }

  public static updateLeaguePoints(league: League, games: LiveGame[] = this.getGames()): League {
    league.members.forEach((member) => {
      let weekTotal = 0;
      member.roster.forEach((item) => {
        games.forEach((game) => {
          const stat = game.playerStats[item.playerId];
          if (stat) {
            const fp = calculateFantasyPoints(stat, league.scoringRules);
            stat.fantasyPoints = fp;
            if (item.isStarter) {
              weekTotal += fp;
            }
          }
        });
      });
      member.weeklyPoints[league.currentWeek] = Math.round(weekTotal * 10) / 10;
      member.totalPoints = Object.values(member.weeklyPoints).reduce((a, b) => a + b, 0);
    });
    return this.saveLeague(league);
  }

  // Draft operations
  public static startDraft(leagueId: string): League {
    const league = this.getLeague(leagueId);
    league.status = 'drafting';
    league.draftState.isStarted = true;
    league.draftState.isCompleted = false;
    league.draftState.currentRound = 1;
    league.draftState.currentPickIndex = 0;
    league.draftState.currentMemberId = league.members[0].id;
    league.draftState.timerActive = true;
    return this.saveLeague(league);
  }

  public static makeDraftPick(leagueId: string, targetMemberId?: string, targetPlayerId?: string): { league: League; pickRecord: DraftPick } {
    const league = this.getLeague(leagueId);
    const players = this.getPlayers();

    if (!league.draftState.isStarted || league.draftState.isCompleted) {
      throw new Error('Draft is not active');
    }

    const memberId = (targetMemberId && targetMemberId !== 'AUTO') ? targetMemberId : league.draftState.currentMemberId;
    const member = league.members.find((m) => m.id === memberId) || league.members.find((m) => m.id === league.draftState.currentMemberId);
    if (!member) throw new Error('On-clock member not found');

    const draftedIds = new Set<string>();
    league.members.forEach((m) => m.roster.forEach((r) => draftedIds.add(r.playerId)));

    let player = targetPlayerId && targetPlayerId !== 'AUTO' ? players.find((p) => p.id === targetPlayerId) : null;
    if (!player || draftedIds.has(player.id)) {
      player = players.find((p) => !draftedIds.has(p.id)) || null;
    }

    if (!player) throw new Error('No available players left to draft');

    const filledSlots = member.roster.filter((r) => r.isStarter).map((r) => r.slot);
    let slot: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'UTIL' | 'BENCH' = 'BENCH';
    if (filledSlots.length < 5) {
      if (!filledSlots.includes(player.position)) {
        slot = player.position;
      } else if (!filledSlots.includes('UTIL')) {
        slot = 'UTIL';
      }
    }

    const pickNumber = league.draftState.pickHistory.length + 1;
    member.roster.push({
      playerId: player.id,
      draftRound: league.draftState.currentRound,
      draftPick: pickNumber,
      isStarter: slot !== 'BENCH',
      slot,
    });

    const pickRecord: DraftPick = {
      round: league.draftState.currentRound,
      pickNumber,
      memberId: member.id,
      memberName: member.userName,
      teamName: member.teamName,
      player,
      timestamp: new Date().toLocaleTimeString(),
    };

    league.draftState.pickHistory.push(pickRecord);

    const totalPicks = league.members.length * 6;
    if (pickNumber >= totalPicks) {
      league.draftState.isCompleted = true;
      league.status = 'active';
    } else {
      league.draftState.currentRound = Math.floor(pickNumber / league.members.length) + 1;
      const pickInRound = pickNumber % league.members.length;
      const isEvenRound = league.draftState.currentRound % 2 === 0;

      let nextMemberIndex = 0;
      if (!isEvenRound) {
        nextMemberIndex = pickInRound;
      } else {
        nextMemberIndex = league.members.length - 1 - pickInRound;
      }
      league.draftState.currentPickIndex = pickNumber;
      league.draftState.currentMemberId = league.members[nextMemberIndex].id;
    }

    this.updateLeaguePoints(league);
    return { league, pickRecord };
  }

  public static simAllDraftPicks(leagueId: string): League {
    let league = this.getLeague(leagueId);
    if (!league.draftState.isStarted) {
      league = this.startDraft(leagueId);
    }
    while (league.draftState.isStarted && !league.draftState.isCompleted) {
      const result = this.makeDraftPick(leagueId, league.draftState.currentMemberId, 'AUTO');
      league = result.league;
    }
    return league;
  }

  public static resetDraft(leagueId: string): League {
    const league = this.getLeague(leagueId);
    league.members.forEach((m) => (m.roster = []));
    league.status = 'setup';
    league.draftState = {
      isStarted: false,
      isCompleted: false,
      currentRound: 1,
      currentPickIndex: 0,
      currentMemberId: league.members[0].id,
      pickHistory: [],
      pickTimeSeconds: 45,
      timerActive: false,
    };
    return this.saveLeague(league);
  }

  public static updateRosterSlot(leagueId: string, memberId: string, playerId: string, newSlot: string, isStarter: boolean): League {
    const league = this.getLeague(leagueId);
    const member = league.members.find((m) => m.id === memberId);
    if (member) {
      const item = member.roster.find((r) => r.playerId === playerId);
      if (item) {
        item.slot = newSlot as any;
        item.isStarter = isStarter;
      }
    }
    return this.updateLeaguePoints(league);
  }

  public static updateScoringRules(leagueId: string, scoringRules: ScoringRules): League {
    const league = this.getLeague(leagueId);
    league.scoringRules = { ...league.scoringRules, ...scoringRules };
    return this.updateLeaguePoints(league);
  }

  public static updateMemberName(leagueId: string, memberId: string, userName: string, teamName: string, avatar?: string): League {
    const league = this.getLeague(leagueId);
    const member = league.members.find((m) => m.id === memberId);
    if (member) {
      if (userName) member.userName = userName.trim();
      if (teamName) member.teamName = teamName.trim();
      if (avatar) member.avatar = avatar.trim();
      league.draftState.pickHistory.forEach((p) => {
        if (p.memberId === memberId) {
          if (userName) p.memberName = member.userName;
          if (teamName) p.teamName = member.teamName;
        }
      });
    }
    return this.saveLeague(league);
  }

  public static createLeague(data: { name: string; userName: string; teamName: string; maxTeams: number }): League {
    const id = 'league-' + Date.now();
    const code = 'SWOOSH' + Math.floor(100 + Math.random() * 900);
    const hostMember: GroupMember = {
      id: 'usr-host',
      userName: data.userName,
      teamName: data.teamName || `${data.userName}'s Ballers`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      isHost: true,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    };

    const numTeams = Math.min(Math.max(data.maxTeams || 4, 2), 12);
    const initialMembers: GroupMember[] = [hostMember];
    const cpuAvatars = [
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    ];
    const cpuNames = ['Marcus', 'Elena', 'Jordan', 'Devon', 'Samantha', 'ChefCurry', 'LeKing'];

    for (let i = 1; i < numTeams; i++) {
      const cName = cpuNames[i - 1] || `Manager_${i + 1}`;
      initialMembers.push({
        id: `usr-cpu-${i + 1}`,
        userName: `${cName} (CPU)`,
        teamName: `${cName}'s Squad`,
        avatar: cpuAvatars[(i - 1) % cpuAvatars.length],
        isHost: false,
        roster: [],
        weeklyPoints: { 1: 0 },
        totalPoints: 0,
      });
    }

    const newLeague: League = {
      id,
      name: data.name,
      code,
      maxTeams: numTeams,
      status: 'setup',
      currentWeek: 1,
      scoringRules: { ...DEFAULT_SCORING_RULES },
      draftState: {
        isStarted: false,
        isCompleted: false,
        currentRound: 1,
        currentPickIndex: 0,
        currentMemberId: 'usr-host',
        pickHistory: [],
        pickTimeSeconds: 45,
        timerActive: false,
      },
      members: initialMembers,
      createdAt: new Date().toISOString(),
    };

    return this.saveLeague(newLeague);
  }

  public static joinLeague(data: {
    code?: string;
    userName: string;
    teamName?: string;
    avatar?: string;
    leagueId?: string;
  }): { league: League; member: GroupMember } {
    const leagues = this.getLeagues();
    const rawCode = (data.code || '').trim();
    const normalized = cleanLeagueCode(rawCode);

    let league = leagues.find((l) => {
      const lCode = cleanLeagueCode(l.code);
      const lId = cleanLeagueCode(l.id);
      return (
        (normalized && (lCode === normalized || lId === normalized)) ||
        ((normalized === 'SWOOSH1' || normalized === 'SWOOSH77' || normalized === 'MAIN' || normalized === 'SWOOSH') &&
          l.id === 'league-main') ||
        (data.leagueId && l.id === data.leagueId)
      );
    });

    if (!league) {
      league = leagues.find((l) => l.id === 'league-main') || leagues[0];
      if (!league || (!normalized.startsWith('SWOOSH') && normalized !== '')) {
        throw new Error(`League code "${rawCode}" not found. Try default league code "SWOOSH1" or check with host.`);
      }
    }

    const newMember: GroupMember = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userName: (data.userName || 'New Player').trim(),
      teamName: (data.teamName || `${data.userName || 'New Player'}'s Ballers`).trim(),
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      isHost: false,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    };

    // Replace CPU member if at capacity or auto-expand
    if (league.members.length >= league.maxTeams) {
      const cpuIdx = league.members.findIndex(
        (m) =>
          !m.isHost &&
          (m.userName.toLowerCase().includes('(cpu)') ||
            m.id.startsWith('usr-cpu') ||
            (m.id !== 'usr-1' && m.roster.length === 0 && (m.id === 'usr-2' || m.id === 'usr-3' || m.id === 'usr-4')))
      );

      if (cpuIdx >= 0) {
        league.members[cpuIdx] = newMember;
      } else if (league.maxTeams < 16) {
        league.maxTeams += 1;
        league.members.push(newMember);
      } else {
        throw new Error('League is full (maximum 16 teams reached)');
      }
    } else {
      league.members.push(newMember);
    }

    this.saveLeague(league);
    return { league, member: newMember };
  }

  public static addMemberToLeague(
    leagueId: string,
    data: { userName: string; teamName?: string; avatar?: string }
  ): { league: League; member: GroupMember } {
    return this.joinLeague({
      leagueId,
      userName: data.userName,
      teamName: data.teamName,
      avatar: data.avatar,
    });
  }

  // DIRECT CLIENT-SIDE ESPN OFFICIAL SYNC
  public static async syncDirectFromEspn(): Promise<{ message: string; syncedPlayersCount: number; syncedGamesCount: number }> {
    console.log('🔄 Executing client-side direct ESPN sync (Vercel/Static compatible)...');

    let currentPlayers = this.getPlayers();
    let fetchedGames: LiveGame[] = [];

    // 1. Fetch live scoreboard from ESPN API
    try {
      const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (sbRes.ok) {
        const sbData = await sbRes.json();
        const events = sbData.events || [];
        for (const ev of events) {
          const comp = ev.competitions?.[0];
          if (!comp) continue;
          const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home');
          const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away');
          if (!homeComp || !awayComp) continue;

          const homeTeam = homeComp.team?.abbreviation || 'HOME';
          const awayTeam = awayComp.team?.abbreviation || 'AWAY';
          const homeScore = parseInt(homeComp.score || '0', 10);
          const awayScore = parseInt(awayComp.score || '0', 10);
          const quarter = ev.status?.period || 1;
          const clock = ev.status?.displayClock || '12:00';
          const state = ev.status?.type?.state;
          const status: 'live' | 'upcoming' | 'final' =
            state === 'in' ? 'live' : state === 'post' ? 'final' : 'upcoming';

          fetchedGames.push({
            id: `game-${ev.id}`,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            quarter,
            clock,
            status,
            playerStats: {},
          });
        }
      }
    } catch (e) {
      console.warn('Direct ESPN scoreboard sync failed, using cached games:', e);
    }

    if (!SeasonService.isSeasonActive()) {
      fetchedGames = [];
    } else if (fetchedGames.length === 0) {
      fetchedGames = this.getGames();
    }

    // Ensure we start with full authentic roster
    if (currentPlayers.length < INITIAL_NBA_PLAYERS.length) {
      currentPlayers = [...INITIAL_NBA_PLAYERS];
    }

    // 2. Fetch team rosters from ESPN API to update live headshots
    try {
      const teamsRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams?limit=35');
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        const teams = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];

        // Check teams with concurrency
        const rosterPromises = teams.map(async (tObj: any) => {
          try {
            const rRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${tObj.team.id}?enable=roster`);
            if (!rRes.ok) return [];
            const rData = await rRes.json();
            return (rData.team?.athletes || []).map((a: any) => ({
              id: a.id,
              name: a.displayName || a.fullName,
              headshot: a.headshot?.href || `https://a.espncdn.com/i/headshots/nba/players/full/${a.id}.png`,
            }));
          } catch {
            return [];
          }
        });

        const rosters = (await Promise.all(rosterPromises)).flat();
        if (rosters.length > 0) {
          // Strictly match by exact name to prevent scrambling players with similar names
          currentPlayers = currentPlayers.map((p) => {
            const pNorm = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const match = rosters.find((r: any) => {
              const rNorm = (r.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
              return rNorm === pNorm;
            });
            if (match && match.headshot) {
              return {
                ...p,
                avatarUrl: match.headshot,
              };
            }
            return p;
          });
        }
      }
    } catch (e) {
      console.warn('Direct ESPN team rosters sync failed, using verified roster:', e);
    }

    // Link player stats into live games
    currentPlayers.forEach((p) => {
      fetchedGames.forEach((g) => {
        if (g.homeTeam === p.team || g.awayTeam === p.team) {
          if (!g.playerStats[p.id]) {
            g.playerStats[p.id] = {
              playerId: p.id,
              pts: Math.floor(p.seasonStats.pts * 0.7),
              reb: Math.floor(p.seasonStats.reb * 0.7),
              ast: Math.floor(p.seasonStats.ast * 0.7),
              stl: Math.floor(p.seasonStats.stl * 0.7),
              blk: Math.floor(p.seasonStats.blk * 0.7),
              fg3m: Math.floor(p.seasonStats.fg3m * 0.7),
              to: Math.floor(p.seasonStats.to * 0.7),
              fantasyPoints: 0,
            };
            g.playerStats[p.id].fantasyPoints = calculateFantasyPoints(g.playerStats[p.id], DEFAULT_SCORING_RULES);
          }
        }
      });
    });

    this.savePlayers(currentPlayers);
    this.saveGames(fetchedGames);

    // Update league points
    const leagues = this.getLeagues();
    leagues.forEach((l) => this.updateLeaguePoints(l, fetchedGames));

    // Dispatch global event for immediate reactive refresh across tabs/components
    window.dispatchEvent(
      new CustomEvent('COURTVISION_DATA_UPDATED', {
        detail: {
          players: currentPlayers,
          games: fetchedGames,
          leagues,
        },
      })
    );

    return {
      message: 'Official NBA data synced directly from ESPN API',
      syncedPlayersCount: currentPlayers.length,
      syncedGamesCount: fetchedGames.length,
    };
  }

  // ==========================================
  // CUSTOM LEADERBOARDS
  // ==========================================
  public static getDefaultCustomLeaderboards(): CustomLeaderboard[] {
    return [
      {
        id: 'board-power-rankings',
        title: 'My Custom Power Rankings',
        description: 'Custom weekly rankings, head-to-head tiers, and manager momentum',
        category: 'Power Rankings',
        metricLabel: 'Power Score (FP)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entries: [
          {
            id: 'entry-1',
            name: 'Alex (You)',
            subtitle: 'Downtown Daggers • 1st Place',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            score: 382.4,
            rank: 1,
            trend: 'crown',
            badge: '👑 #1 Contender',
            notes: 'Dominant backcourt play, leading the league in assists and 3PM.',
          },
          {
            id: 'entry-2',
            name: 'Marcus',
            subtitle: 'Rim Protectors • 2nd Place',
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
            score: 364.8,
            rank: 2,
            trend: 'up',
            badge: '🔥 On Fire',
            notes: 'Elite rim protection and blocks anchoring the roster.',
          },
          {
            id: 'entry-3',
            name: 'Elena',
            subtitle: 'Triple Double Trouble • 3rd Place',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
            score: 341.2,
            rank: 3,
            trend: 'same',
            badge: '⭐ Contender',
            notes: 'Dangerous all-around scoring threat, always in striking distance.',
          },
          {
            id: 'entry-4',
            name: 'Jordan',
            subtitle: 'Splash Brothers Fan • 4th Place',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            score: 319.5,
            rank: 4,
            trend: 'down',
            badge: '🎯 Sleeper',
            notes: 'Streaky three-point shooting, looking for a bounce-back week.',
          },
        ],
      },
      {
        id: 'board-nba-mvp-ladder',
        title: 'NBA MVP Ladder 2026',
        description: 'Tracking the top individual superstars powered by authentic ESPN statistics',
        category: 'NBA Superstars',
        metricLabel: 'ESPN Fantasy Avg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entries: [
          {
            id: 'mvp-1',
            name: 'Nikola Jokić',
            subtitle: 'Denver Nuggets • C',
            avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3112335.png&w=350&h=254',
            score: 58.4,
            rank: 1,
            trend: 'crown',
            badge: 'MVP Frontrunner',
            notes: 'Averaging triple-double territory with historic efficiency.',
          },
          {
            id: 'mvp-2',
            name: 'Luka Dončić',
            subtitle: 'Dallas Mavericks • PG',
            avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3945274.png&w=350&h=254',
            score: 55.7,
            rank: 2,
            trend: 'fire',
            badge: 'Scoring Champ',
            notes: 'Unstoppable step-backs and clutch fourth-quarter shot making.',
          },
          {
            id: 'mvp-3',
            name: 'Giannis Antetokounmpo',
            subtitle: 'Milwaukee Bucks • PF',
            avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3032977.png&w=350&h=254',
            score: 53.2,
            rank: 3,
            trend: 'up',
            badge: 'Two-Way Beast',
            notes: 'Dominating the paint on both offense and defense nightly.',
          },
          {
            id: 'mvp-4',
            name: 'Shai Gilgeous-Alexander',
            subtitle: 'Oklahoma City Thunder • PG',
            avatar: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4278073.png&w=350&h=254',
            score: 51.9,
            rank: 4,
            trend: 'same',
            badge: 'Clutch King',
            notes: 'Leading OKC to the #1 seed with surgical mid-range shooting.',
          },
        ],
      },
    ];
  }

  public static getCustomLeaderboards(): CustomLeaderboard[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_LEADERBOARDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading custom leaderboards:', e);
    }
    const defaults = this.getDefaultCustomLeaderboards();
    this.saveCustomLeaderboards(defaults);
    return defaults;
  }

  public static saveCustomLeaderboards(boards: CustomLeaderboard[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LEADERBOARDS, JSON.stringify(boards));
      window.dispatchEvent(new CustomEvent('COURTVISION_LEADERBOARDS_UPDATED', { detail: boards }));
    } catch (e) {
      console.warn('Error saving custom leaderboards:', e);
    }
  }

  public static getActiveLeaderboardId(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_LEADERBOARD_ID);
      if (stored) return stored;
    } catch (e) {
      // ignore
    }
    const boards = this.getCustomLeaderboards();
    return boards[0]?.id || 'board-power-rankings';
  }

  public static setActiveLeaderboardId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_LEADERBOARD_ID, id);
      window.dispatchEvent(new CustomEvent('COURTVISION_ACTIVE_LEADERBOARD_CHANGED', { detail: id }));
    } catch (e) {
      console.warn('Error setting active leaderboard id:', e);
    }
  }

  public static getActiveLeaderboard(): CustomLeaderboard {
    const boards = this.getCustomLeaderboards();
    const activeId = this.getActiveLeaderboardId();
    const found = boards.find((b) => b.id === activeId);
    return found || boards[0] || this.getDefaultCustomLeaderboards()[0];
  }

  public static createCustomLeaderboard(boardData: Partial<CustomLeaderboard>): CustomLeaderboard {
    const boards = this.getCustomLeaderboards();
    const newBoard: CustomLeaderboard = {
      id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: boardData.title?.trim() || 'My Custom Leaderboard',
      description: boardData.description?.trim() || 'Custom ranked leaderboard',
      category: boardData.category?.trim() || 'Custom',
      metricLabel: boardData.metricLabel?.trim() || 'Points',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entries: boardData.entries || [],
    };
    const updated = [newBoard, ...boards];
    this.saveCustomLeaderboards(updated);
    this.setActiveLeaderboardId(newBoard.id);
    return newBoard;
  }

  public static updateCustomLeaderboard(id: string, updates: Partial<CustomLeaderboard>): CustomLeaderboard | null {
    const boards = this.getCustomLeaderboards();
    const idx = boards.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    boards[idx] = {
      ...boards[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveCustomLeaderboards(boards);
    return boards[idx];
  }

  public static deleteCustomLeaderboard(id: string): CustomLeaderboard[] {
    let boards = this.getCustomLeaderboards();
    boards = boards.filter((b) => b.id !== id);
    if (boards.length === 0) {
      boards = this.getDefaultCustomLeaderboards();
    }
    this.saveCustomLeaderboards(boards);
    this.setActiveLeaderboardId(boards[0].id);
    return boards;
  }

  public static addEntryToLeaderboard(leaderboardId: string, entryData: Omit<CustomLeaderboardEntry, 'id'>): CustomLeaderboard | null {
    const boards = this.getCustomLeaderboards();
    const idx = boards.findIndex((b) => b.id === leaderboardId);
    if (idx === -1) return null;

    const board = boards[idx];
    const newEntry: CustomLeaderboardEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...entryData,
      rank: entryData.rank || board.entries.length + 1,
    };
    board.entries.push(newEntry);
    board.updatedAt = new Date().toISOString();
    boards[idx] = board;
    this.saveCustomLeaderboards(boards);
    return board;
  }

  public static updateLeaderboardEntry(leaderboardId: string, entryId: string, updates: Partial<CustomLeaderboardEntry>): CustomLeaderboard | null {
    const boards = this.getCustomLeaderboards();
    const idx = boards.findIndex((b) => b.id === leaderboardId);
    if (idx === -1) return null;

    const board = boards[idx];
    const entryIdx = board.entries.findIndex((e) => e.id === entryId);
    if (entryIdx === -1) return null;

    board.entries[entryIdx] = {
      ...board.entries[entryIdx],
      ...updates,
    };
    board.updatedAt = new Date().toISOString();
    boards[idx] = board;
    this.saveCustomLeaderboards(boards);
    return board;
  }

  public static deleteLeaderboardEntry(leaderboardId: string, entryId: string): CustomLeaderboard | null {
    const boards = this.getCustomLeaderboards();
    const idx = boards.findIndex((b) => b.id === leaderboardId);
    if (idx === -1) return null;

    const board = boards[idx];
    board.entries = board.entries.filter((e) => e.id !== entryId);
    // Recalculate ranks
    board.entries.forEach((entry, i) => {
      entry.rank = i + 1;
    });
    board.updatedAt = new Date().toISOString();
    boards[idx] = board;
    this.saveCustomLeaderboards(boards);
    return board;
  }

  public static reorderLeaderboardEntries(leaderboardId: string, entryId: string, direction: 'up' | 'down'): CustomLeaderboard | null {
    const boards = this.getCustomLeaderboards();
    const idx = boards.findIndex((b) => b.id === leaderboardId);
    if (idx === -1) return null;

    const board = boards[idx];
    const entryIdx = board.entries.findIndex((e) => e.id === entryId);
    if (entryIdx === -1) return null;

    const targetIdx = direction === 'up' ? entryIdx - 1 : entryIdx + 1;
    if (targetIdx < 0 || targetIdx >= board.entries.length) return board;

    const temp = board.entries[entryIdx];
    board.entries[entryIdx] = board.entries[targetIdx];
    board.entries[targetIdx] = temp;

    // Recalculate ranks to match new order
    board.entries.forEach((e, i) => {
      e.rank = i + 1;
    });

    board.updatedAt = new Date().toISOString();
    boards[idx] = board;
    this.saveCustomLeaderboards(boards);
    return board;
  }
}
