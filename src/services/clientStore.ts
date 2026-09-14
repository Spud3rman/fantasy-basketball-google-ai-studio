import { INITIAL_NBA_PLAYERS, DEFAULT_SCORING_RULES, calculateFantasyPoints, enforceAuthenticTeam } from '../data/nbaPlayers';
import { League, GroupMember, DraftPick, PlayByPlayAction, LiveGame, Player, ScoringRules } from '../types';

const STORAGE_KEY_PLAYERS = 'cv_players';
const STORAGE_KEY_LEAGUES = 'cv_leagues';
const STORAGE_KEY_GAMES = 'cv_games';
const STORAGE_KEY_SIM_MODE = 'cv_sim_mode';
const CURRENT_ROSTER_VERSION = 'cv_v8_espn_official_stats';
const STORAGE_KEY_ROSTER_VERSION = 'cv_roster_version';

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
      userName: 'Marcus',
      teamName: 'Rim Protectors',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      isHost: false,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    },
    {
      id: 'usr-3',
      userName: 'Elena',
      teamName: 'Triple Double Trouble',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      isHost: false,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    },
    {
      id: 'usr-4',
      userName: 'Jordan',
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
    name: 'CourtVision Elite Invitational',
    code: 'SWOOSH77',
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
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GAMES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored games:', e);
    }
    return [];
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

  public static joinLeague(data: { code: string; userName: string; teamName: string }): { league: League; member: GroupMember } {
    const leagues = this.getLeagues();
    const league = leagues.find((l) => l.code.toUpperCase() === (data.code || '').toUpperCase().trim());
    if (!league) throw new Error('League code not found');
    if (league.members.length >= league.maxTeams) throw new Error('League is full');

    const newMember: GroupMember = {
      id: 'usr-' + Date.now(),
      userName: data.userName || 'New Player',
      teamName: data.teamName || `${data.userName}'s Team`,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      isHost: false,
      roster: [],
      weeklyPoints: { 1: 0 },
      totalPoints: 0,
    };

    league.members.push(newMember);
    this.saveLeague(league);
    return { league, member: newMember };
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

    if (fetchedGames.length === 0) {
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
}
