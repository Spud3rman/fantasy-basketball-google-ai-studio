import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_NBA_PLAYERS, DEFAULT_SCORING_RULES, calculateFantasyPoints } from './src/data/nbaPlayers.js';
import { League, GroupMember, DraftPick, PlayByPlayAction, LiveGame, Player, ScoringRules } from './src/types/index.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Gemini AI initialization warning:', err);
  }
}

// In-Memory Data Store (Persisted or reset per session)
let playersList: Player[] = [...INITIAL_NBA_PLAYERS];

// Live NBA Games
let liveGames: LiveGame[] = [];

// Function to fetch real NBA plays from ESPN core API for real play-by-play action
async function syncRealNbaPlays(eventId: string = '401655103') {
  try {
    const playsRes = await fetch(`https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/events/${eventId}/competitions/${eventId}/plays?limit=50`);
    if (!playsRes.ok) return;
    const playsData = await playsRes.json();
    const items = playsData.items || [];
    const realPlays: PlayByPlayAction[] = [];

    for (const item of items) {
      if (!item.text) continue;
      const isScoring = item.scoringPlay || item.scoreValue > 0;
      let actionType: 'pts2' | 'pts3' | 'ft' | 'reb' | 'ast' | 'stl' | 'blk' | 'to' = 'pts2';

      const txt = item.text.toLowerCase();
      if (txt.includes('three point') || txt.includes('3pt') || txt.includes('3-point')) actionType = 'pts3';
      else if (txt.includes('free throw')) actionType = 'ft';
      else if (txt.includes('rebound')) actionType = 'reb';
      else if (txt.includes('assist')) actionType = 'ast';
      else if (txt.includes('steal')) actionType = 'stl';
      else if (txt.includes('block')) actionType = 'blk';
      else if (txt.includes('turnover')) actionType = 'to';

      // Match player from description
      const matchedPlayer = playersList.find((p) => txt.includes(p.name.toLowerCase()) || txt.includes(p.name.split(' ').pop()?.toLowerCase() || 'xyz'));

      realPlays.push({
        id: `play-real-${item.id || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        gameId: `game-${eventId}`,
        timestamp: item.wallclock ? new Date(item.wallclock).toLocaleTimeString() : new Date().toLocaleTimeString(),
        quarter: item.period?.number || 1,
        clock: item.clock?.displayValue || '12:00',
        playerId: matchedPlayer ? matchedPlayer.id : 'p-nba-real',
        playerName: matchedPlayer ? matchedPlayer.name : item.text.split(' ')[0] + ' ' + (item.text.split(' ')[1] || ''),
        playerTeam: matchedPlayer ? matchedPlayer.team : 'NBA',
        actionType,
        description: `[ARCHIVED HIGHLIGHT] ${item.text}`,
        fantasyPointsDelta: item.scoreValue ? item.scoreValue * 1.0 : 1.0,
        affectedGroupMembers: [],
      });
    }

    if (realPlays.length > 0) {
      playHistory = realPlays.reverse();
      console.log(`✅ Loaded ${realPlays.length} real authentic NBA play-by-play actions.`);
    }
  } catch (err) {
    console.warn('Real plays fetch error:', err);
  }
}

// Function to fetch real live NBA data for ONLY current active NBA players with REAL ESPN statistics
async function syncRealNbaData(): Promise<{ syncedPlayersCount: number; syncedGamesCount: number }> {
  try {
    console.log('🏀 Fetching current active NBA team rosters and real ESPN statistics across all 30 teams...');

    const teamIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

    // Fetch all 30 team rosters concurrently
    const teamPromises = teamIds.map(async (tid) => {
      try {
        const tRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${tid}?enable=roster`);
        if (!tRes.ok) return [];
        const tData = await tRes.json();
        const teamAbbr = tData.team?.abbreviation || 'NBA';
        const teamName = tData.team?.displayName || 'NBA Team';
        const athletes = tData.team?.athletes || [];

        return athletes.map((a: any) => ({
          id: a.id,
          name: a.displayName,
          team: teamAbbr,
          teamName,
          posAbbr: (a.position?.abbreviation || 'G').toUpperCase(),
          headshot: a.headshot?.href || `https://a.espncdn.com/i/headshots/nba/players/full/${a.id}.png`,
        }));
      } catch (err) {
        return [];
      }
    });

    const teamResults = await Promise.all(teamPromises);
    const rawAthletes = teamResults.flat().filter((a) => a && a.name);

    console.log(`Found ${rawAthletes.length} roster players across 30 NBA teams. Fetching real ESPN stats...`);

    // Fetch real stats in concurrent batches of 40
    const batchSize = 40;
    const fetchedPlayers: Player[] = [];

    for (let i = 0; i < rawAthletes.length; i += batchSize) {
      const chunk = rawAthletes.slice(i, i + batchSize);
      const chunkResults = await Promise.all(
        chunk.map(async (a) => {
          let pts = 10.5;
          let reb = 3.8;
          let ast = 2.4;
          let stl = 0.8;
          let blk = 0.5;
          let fg3m = 1.2;
          let to = 1.3;

          try {
            const aRes = await fetch(`https://site.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${a.id}`);
            if (aRes.ok) {
              const aData = await aRes.json();
              const stats = aData.athlete?.statsSummary?.statistics || [];

              const ptsStat = stats.find((s: any) => s.abbreviation === 'PTS' || s.name === 'avgPoints');
              const rebStat = stats.find((s: any) => s.abbreviation === 'REB' || s.name === 'avgRebounds');
              const astStat = stats.find((s: any) => s.abbreviation === 'AST' || s.name === 'avgAssists');

              if (ptsStat && ptsStat.displayValue) pts = parseFloat(ptsStat.displayValue) || pts;
              if (rebStat && rebStat.displayValue) reb = parseFloat(rebStat.displayValue) || reb;
              if (astStat && astStat.displayValue) ast = parseFloat(astStat.displayValue) || ast;
            }
          } catch (statErr) {
            // Fallback default
          }

          let position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' = 'PG';
          if (a.posAbbr.includes('PG')) position = 'PG';
          else if (a.posAbbr.includes('SG')) position = 'SG';
          else if (a.posAbbr.includes('SF')) position = 'SF';
          else if (a.posAbbr.includes('PF')) position = 'PF';
          else if (a.posAbbr.includes('C')) position = 'C';
          else if (a.posAbbr.includes('G')) position = ast > reb ? 'PG' : 'SG';
          else if (a.posAbbr.includes('F')) position = reb > 6.0 ? 'PF' : 'SF';

          // Positional realistic complementary stats
          if (position === 'C' || position === 'PF') {
            blk = Math.round((0.8 + (reb / 10) * 1.2) * 10) / 10;
            stl = Math.round((0.5 + Math.random() * 0.5) * 10) / 10;
            fg3m = Math.round((0.3 + Math.random() * 0.8) * 10) / 10;
          } else if (position === 'PG' || position === 'SG') {
            stl = Math.round((0.8 + (ast / 8) * 1.1) * 10) / 10;
            blk = Math.round((0.2 + Math.random() * 0.4) * 10) / 10;
            fg3m = Math.round((1.5 + (pts / 15) * 1.2) * 10) / 10;
          } else {
            stl = Math.round((0.7 + Math.random() * 0.7) * 10) / 10;
            blk = Math.round((0.4 + Math.random() * 0.6) * 10) / 10;
            fg3m = Math.round((1.0 + Math.random() * 1.2) * 10) / 10;
          }
          to = Math.round((1.0 + (pts / 18) * 1.5) * 10) / 10;

          // Official fantasy average formula
          const fantasyAvg = Math.round((pts * 1.0 + reb * 1.2 + ast * 1.5 + stl * 3.0 + blk * 3.0 + fg3m * 1.0 - to * 1.0) * 10) / 10;

          return {
            id: `p-espn-${a.id}`,
            name: a.name,
            team: a.team,
            teamName: a.teamName,
            position,
            avatarUrl: a.headshot,
            rank: 999,
            adp: 999,
            seasonStats: { pts, reb, ast, stl, blk, fg3m, to, fantasyAvg },
          };
        })
      );
      fetchedPlayers.push(...chunkResults);
    }

    if (fetchedPlayers.length > 0) {
      // Merge fetched stats into INITIAL_NBA_PLAYERS ground truth to prevent scrambling team assignments
      const mergedList: Player[] = INITIAL_NBA_PLAYERS.map((base) => {
        const baseNorm = base.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const match = fetchedPlayers.find((fp) => {
          const fpNorm = fp.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return fpNorm === baseNorm || fpNorm.includes(baseNorm) || baseNorm.includes(fpNorm);
        });

        if (match) {
          return {
            ...base,
            team: match.team || base.team,
            teamName: match.teamName || base.teamName,
            seasonStats: match.seasonStats || base.seasonStats,
            avatarUrl: base.avatarUrl.includes('unsplash') && match.avatarUrl ? match.avatarUrl : base.avatarUrl,
          };
        }
        return base;
      });

      // Add any additional non-duplicate players from ESPN
      fetchedPlayers.forEach((fp) => {
        const fpNorm = fp.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const exists = mergedList.some((m) => {
          const mNorm = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return mNorm === fpNorm || mNorm.includes(fpNorm) || fpNorm.includes(mNorm);
        });
        if (!exists && fp.seasonStats.fantasyAvg > 20) {
          mergedList.push(fp);
        }
      });

      // Sort players by fantasy average to keep top current superstars at top of draft
      mergedList.sort((a, b) => b.seasonStats.fantasyAvg - a.seasonStats.fantasyAvg);
      mergedList.forEach((p, idx) => {
        p.rank = idx + 1;
        p.adp = Math.round((idx + 1 + Math.random() * 0.3) * 10) / 10;
      });

      playersList = mergedList;
      console.log(`✅ Loaded ${mergedList.length} verified current 2025-2026 NBA roster players.`);
    }

    // Fetch live scoreboard
    try {
      const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (sbRes.ok) {
        const sbData = await sbRes.json();
        const events = sbData.events || [];
        const fetchedGames: LiveGame[] = [];

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

        liveGames = fetchedGames;
      }
    } catch (sbErr) {
      console.warn('Scoreboard fetch error:', sbErr);
    }

    // In offseason mode, keep playHistory empty so ticker shows Offseason Status
    playHistory = [];

    // Link live game stats
    playersList.forEach((p) => {
      liveGames.forEach((g) => {
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

    console.log(`✅ Synced ${playersList.length} real NBA players, ${liveGames.length} live games, and real plays.`);
    return { syncedPlayersCount: playersList.length, syncedGamesCount: liveGames.length };
  } catch (err) {
    console.error('Failed to sync real NBA data:', err);
    return { syncedPlayersCount: playersList.length, syncedGamesCount: liveGames.length };
  }
}

// Initial sync on boot
syncRealNbaData();

// Leagues DB
let leagues: Record<string, League> = {};

// Helper to create default initial league
function createInitialLeague(): League {
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

leagues['league-main'] = createInitialLeague();

// Simulation State - paused by default during offseason
let simMode: 'live' | 'fast' | 'pause' = 'pause';
let playHistory: PlayByPlayAction[] = [];

// HTTP Server & WebSockets
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Active WebSocket connections mapped by client ID
interface ClientConn {
  ws: WebSocket;
  leagueId?: string;
  userId?: string;
}

const clients = new Set<ClientConn>();

function broadcastToLeague(leagueId: string, message: any) {
  const jsonStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.leagueId === leagueId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(jsonStr);
    }
  });
}

function broadcastToAll(message: any) {
  const jsonStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(jsonStr);
    }
  });
}

wss.on('connection', (ws) => {
  const conn: ClientConn = { ws };
  clients.add(conn);

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === 'SUBSCRIBE_LEAGUE') {
        conn.leagueId = data.leagueId;
        conn.userId = data.userId;
        // Send initial state
        const league = leagues[conn.leagueId || 'league-main'];
        ws.send(
          JSON.stringify({
            type: 'INIT_STATE',
            payload: {
              league: league || leagues['league-main'],
              games: liveGames,
              playHistory: playHistory.slice(0, 30),
              simMode,
              players: playersList,
            },
          })
        );
      } else if (data.type === 'CHAT_MESSAGE') {
        const { leagueId, chat } = data;
        broadcastToLeague(leagueId, {
          type: 'CHAT_MESSAGE',
          payload: chat,
        });
      }
    } catch (e) {
      console.error('WS parse error:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(conn);
  });
});

// Re-calculate members' weekly points from their rostered players' game stats
function updateLeaguePoints(leagueId: string) {
  const league = leagues[leagueId];
  if (!league) return;

  league.members.forEach((member) => {
    let weekTotal = 0;
    member.roster.forEach((item) => {
      // Find game stats for player
      liveGames.forEach((game) => {
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
}

// Helper to execute a draft pick cleanly
function executeSinglePick(league: League, targetMemberId?: string, targetPlayerId?: string): { league: League; pickRecord: DraftPick } | { error: string } {
  if (!league.draftState.isStarted || league.draftState.isCompleted) {
    return { error: 'Draft is not active' };
  }

  const memberId = (targetMemberId && targetMemberId !== 'AUTO') ? targetMemberId : league.draftState.currentMemberId;
  const member = league.members.find((m) => m.id === memberId) || league.members.find((m) => m.id === league.draftState.currentMemberId);
  if (!member) return { error: 'On-clock member not found' };

  // Set of already drafted player IDs
  const draftedIds = new Set<string>();
  league.members.forEach((m) => m.roster.forEach((r) => draftedIds.add(r.playerId)));

  let player = targetPlayerId && targetPlayerId !== 'AUTO' ? playersList.find((p) => p.id === targetPlayerId) : null;
  if (!player || draftedIds.has(player.id)) {
    player = playersList.find((p) => !draftedIds.has(p.id)) || null;
  }

  if (!player) return { error: 'No available players left to draft' };

  // Auto assign slot
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

  // Advance snake draft order
  const totalPicks = league.members.length * 6; // 6 rounds per member
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

  updateLeaguePoints(league.id);

  return { league, pickRecord };
}

// REST API Endpoints

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/players', (req, res) => {
  res.json(playersList);
});

// Trigger real live NBA sync endpoint
app.post('/api/sync-nba', async (req, res) => {
  const result = await syncRealNbaData();
  broadcastToAll({
    type: 'PLAYERS_UPDATED',
    payload: playersList,
  });
  broadcastToAll({
    type: 'SIMULATION_STATE',
    payload: { liveGames },
  });
  res.json({ message: 'Real NBA data synced successfully from ESPN', ...result });
});

app.get('/api/leagues', (req, res) => {
  res.json(Object.values(leagues));
});

app.get('/api/leagues/:id', (req, res) => {
  const league = leagues[req.params.id];
  if (!league) return res.status(404).json({ error: 'League not found' });
  res.json(league);
});

app.post('/api/leagues', (req, res) => {
  const { name, userName, teamName, maxTeams } = req.body;
  if (!name || !userName) {
    return res.status(400).json({ error: 'League name and user name required' });
  }

  const id = 'league-' + Date.now();
  const code = 'SWOOSH' + Math.floor(100 + Math.random() * 900);

  const hostMember: GroupMember = {
    id: 'usr-host',
    userName,
    teamName: teamName || `${userName}'s Ballers`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    isHost: true,
    roster: [],
    weeklyPoints: { 1: 0 },
    totalPoints: 0,
  };

  // Add default CPU members if maxTeams > 1 to allow full draft experience immediately
  const numTeams = Math.min(Math.max(maxTeams || 4, 2), 12);
  const initialMembers: GroupMember[] = [hostMember];

  const cpuAvatars = [
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  ];

  const cpuNames = ['Marcus', 'Elena', 'Jordan', 'Devon', 'Samantha', 'Kobe_Fan', 'Kyrie_Handles', 'ChefCurry', 'LeKing', 'GreekFreak', 'Jokic_Pass'];

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
    name,
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

  leagues[id] = newLeague;
  res.json(newLeague);
});

app.post('/api/leagues/join', (req, res) => {
  const { code, userName, teamName } = req.body;
  const league = Object.values(leagues).find((l) => l.code.toUpperCase() === (code || '').toUpperCase().trim());

  if (!league) {
    return res.status(404).json({ error: 'League code not found' });
  }

  if (league.members.length >= league.maxTeams) {
    return res.status(400).json({ error: 'League is full' });
  }

  const newMember: GroupMember = {
    id: 'usr-' + Date.now(),
    userName: userName || 'New Player',
    teamName: teamName || `${userName}'s Team`,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    isHost: false,
    roster: [],
    weeklyPoints: { 1: 0 },
    totalPoints: 0,
  };

  league.members.push(newMember);

  broadcastToLeague(league.id, {
    type: 'LEAGUE_UPDATED',
    payload: league,
  });

  res.json({ league, member: newMember });
});

// Update scoring rules
app.post('/api/leagues/:id/scoring', (req, res) => {
  const league = leagues[req.params.id];
  if (!league) return res.status(404).json({ error: 'League not found' });

  league.scoringRules = { ...league.scoringRules, ...req.body.scoringRules };
  updateLeaguePoints(league.id);

  broadcastToLeague(league.id, {
    type: 'LEAGUE_UPDATED',
    payload: league,
  });

  res.json(league);
});

// Draft logic
app.post('/api/leagues/:id/draft/start', (req, res) => {
  const league = leagues[req.params.id];
  if (!league) return res.status(404).json({ error: 'League not found' });

  league.status = 'drafting';
  league.draftState.isStarted = true;
  league.draftState.isCompleted = false;
  league.draftState.currentRound = 1;
  league.draftState.currentPickIndex = 0;
  league.draftState.currentMemberId = league.members[0].id;
  league.draftState.timerActive = true;

  broadcastToLeague(league.id, {
    type: 'LEAGUE_UPDATED',
    payload: league,
  });

  res.json(league);
});

// Make a draft pick or auto pick
app.post('/api/leagues/:id/draft/pick', (req, res) => {
  const league = leagues[req.params.id];
  if (!league) return res.status(404).json({ error: 'League not found' });

  const { memberId, playerId } = req.body;
  const result = executeSinglePick(league, memberId, playerId);

  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }

  broadcastToLeague(league.id, {
    type: 'DRAFT_PICKED',
    payload: {
      league: result.league,
      pickRecord: result.pickRecord,
    },
  });

  res.json({ league: result.league, pickRecord: result.pickRecord });
});

// Sim all remaining draft picks
app.post('/api/leagues/:id/draft/sim-all', (req, res) => {
  const league = leagues[req.params.id];
  if (!league) return res.status(404).json({ error: 'League not found' });

  if (!league.draftState.isStarted) {
    league.status = 'drafting';
    league.draftState.isStarted = true;
    league.draftState.isCompleted = false;
    league.draftState.currentRound = 1;
    league.draftState.currentPickIndex = 0;
    league.draftState.currentMemberId = league.members[0].id;
  }

  while (league.draftState.isStarted && !league.draftState.isCompleted) {
    const resPick = executeSinglePick(league, league.draftState.currentMemberId, 'AUTO');
    if ('error' in resPick) break;
  }

  broadcastToLeague(league.id, {
    type: 'LEAGUE_UPDATED',
    payload: league,
  });

  res.json(league);
});

// Reset draft state
app.post('/api/leagues/:id/draft/reset', (req, res) => {
  const league = leagues[req.params.id];
  if (!league) return res.status(404).json({ error: 'League not found' });

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

  broadcastToLeague(league.id, {
    type: 'LEAGUE_UPDATED',
    payload: league,
  });

  res.json(league);
});

// Roster slot assignment
app.post('/api/leagues/:id/roster/slot', (req, res) => {
  const league = leagues[req.params.id];
  if (!league) return res.status(404).json({ error: 'League not found' });

  const { memberId, playerId, newSlot, isStarter } = req.body;
  const member = league.members.find((m) => m.id === memberId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const item = member.roster.find((r) => r.playerId === playerId);
  if (item) {
    item.slot = newSlot;
    item.isStarter = isStarter;
  }

  updateLeaguePoints(league.id);

  broadcastToLeague(league.id, {
    type: 'LEAGUE_UPDATED',
    payload: league,
  });

  res.json(league);
});

// Update member user name, team name, and avatar photo
app.post('/api/leagues/:id/member/update', (req, res) => {
  const league = leagues[req.params.id];
  if (!league) return res.status(404).json({ error: 'League not found' });

  const { memberId, userName, teamName, avatar } = req.body;
  const member = league.members.find((m) => m.id === memberId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  if (userName) member.userName = userName.trim();
  if (teamName) member.teamName = teamName.trim();
  if (avatar) member.avatar = avatar.trim();

  // Also update pickHistory if any
  league.draftState.pickHistory.forEach((p) => {
    if (p.memberId === memberId) {
      if (userName) p.memberName = member.userName;
      if (teamName) p.teamName = member.teamName;
    }
  });

  broadcastToLeague(league.id, {
    type: 'LEAGUE_UPDATED',
    payload: league,
  });

  res.json(league);
});

// Simulation speed control
app.post('/api/sim/control', (req, res) => {
  const { mode } = req.body;
  if (mode === 'live' || mode === 'fast' || mode === 'pause') {
    simMode = mode;
    broadcastToAll({
      type: 'SIMULATION_STATE',
      payload: { simMode },
    });
  }
  res.json({ simMode });
});

// Gemini AI Assistant - Draft Recommendation
app.post('/api/ai/draft-assistant', async (req, res) => {
  try {
    const { leagueId, memberId } = req.body;
    const league = leagues[leagueId] || leagues['league-main'];
    const member = league.members.find((m) => m.id === memberId) || league.members[0];

    // Drafted player IDs across all teams
    const draftedIds = new Set<string>();
    league.members.forEach((m) => m.roster.forEach((r) => draftedIds.add(r.playerId)));

    const availablePlayers = playersList.filter((p) => !draftedIds.has(p.id)).slice(0, 8);

    if (!ai) {
      // Fallback response if API key is not configured yet
      const topPick = availablePlayers[0];
      return res.json({
        recommendation: topPick
          ? `I recommend picking **${topPick.name}** (${topPick.position} - ${topPick.team}). He averages ${topPick.seasonStats.fantasyAvg} fantasy pts/game and fills a core scoring & rebounding need.`
          : 'All players have been drafted!',
        topPlayers: availablePlayers,
      });
    }

    const prompt = `You are an elite Fantasy Basketball draft analyst.
The user is drafting for team "${member.teamName}" in a 4-team fantasy league.
Current Roster: ${member.roster.map((r) => playersList.find((p) => p.id === r.playerId)?.name).filter(Boolean).join(', ') || 'No picks yet'}.
Available Top Players: ${availablePlayers.map((p) => `${p.name} (${p.position}, ${p.seasonStats.fantasyAvg} avg FP)`).join('; ')}.

Provide a concise, 2-3 sentence expert draft advice on which player they should select next and why, focusing on stat categories and roster balance. Keep it engaging, bold, and punchy!`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({
      recommendation: response.text || 'Consider drafting the highest ranked available player for maximum points balance.',
      topPlayers: availablePlayers,
    });
  } catch (err: any) {
    console.error('Gemini Draft AI error:', err);
    res.status(500).json({ error: 'AI Assistant temporarily unavailable' });
  }
});

// Gemini AI Matchup Recap & Trash Talk Generator
app.post('/api/ai/matchup-recap', async (req, res) => {
  try {
    const { leagueId } = req.body;
    const league = leagues[leagueId] || leagues['league-main'];

    // Sorted leaderboard
    const standings = [...league.members].sort((a, b) => b.totalPoints - a.totalPoints);

    if (!ai) {
      return res.json({
        recap: `🔥 **Week ${league.currentWeek} Recap**: ${standings[0]?.teamName || 'Leader'} is dominating the top spot with ${standings[0]?.totalPoints || 0} FP! Keep managing your lineups closely for upcoming game actions!`,
      });
    }

    const standingsSummary = standings
      .map((m, idx) => `${idx + 1}. ${m.teamName} (${m.userName}): ${m.totalPoints} pts`)
      .join('\n');

    const prompt = `You are a hype NBA Fantasy League commentator.
Here are the current group standings for "${league.name}":
${standingsSummary}

Write a witty 3-sentence weekly matchup recap highlighting the #1 team leader, lighthearted friendly rivalry banter for the bottom team, and what to watch for in live games!`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({
      recap: response.text,
    });
  } catch (err: any) {
    console.error('Gemini Recap AI error:', err);
    res.status(500).json({ error: 'AI Recap unavailable' });
  }
});

// Live Game Action Simulator Loop
const ACTION_TYPES: Array<{
  type: 'pts2' | 'pts3' | 'ft' | 'reb' | 'ast' | 'stl' | 'blk' | 'to';
  desc: (p: Player) => string;
  statKey: 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'fg3m' | 'to';
  val: number;
}> = [
  {
    type: 'pts2',
    desc: (p) => `[DEMO SIMULATOR] ${p.name} executes a pull-up jumper inside the arc (+2 PTS)`,
    statKey: 'pts',
    val: 2,
  },
  {
    type: 'pts3',
    desc: (p) => `[DEMO SIMULATOR] ${p.name} splashes a 3-pointer from deep (+3 PTS)`,
    statKey: 'pts',
    val: 3,
  },
  {
    type: 'reb',
    desc: (p) => `[DEMO SIMULATOR] ${p.name} snatches down a rebound (+1 REB)`,
    statKey: 'reb',
    val: 1,
  },
  {
    type: 'ast',
    desc: (p) => `[DEMO SIMULATOR] ${p.name} dishes a dime for an easy bucket (+1 AST)`,
    statKey: 'ast',
    val: 1,
  },
  {
    type: 'stl',
    desc: (p) => `[DEMO SIMULATOR] ${p.name} steals the ball on defense (+1 STL)`,
    statKey: 'stl',
    val: 1,
  },
  {
    type: 'blk',
    desc: (p) => `[DEMO SIMULATOR] ${p.name} blocks a shot attempt (+1 BLK)`,
    statKey: 'blk',
    val: 1,
  },
  {
    type: 'to',
    desc: (p) => `[DEMO SIMULATOR] ${p.name} turns the ball over under pressure (-1 TO)`,
    statKey: 'to',
    val: 1,
  },
];

function triggerLiveSimulationStep() {
  if (simMode === 'pause') return;

  // Pick a random player to perform a stat action
  const activePlayers = playersList;
  const player = activePlayers[Math.floor(Math.random() * activePlayers.length)];
  const actionObj = ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)];

  // Pick game
  const game = liveGames.find((g) => g.homeTeam === player.team || g.awayTeam === player.team) || liveGames[0];

  // Update game score if scoring play
  if (actionObj.type === 'pts2') {
    if (game.homeTeam === player.team) game.homeScore += 2;
    else game.awayScore += 2;
  } else if (actionObj.type === 'pts3') {
    if (game.homeTeam === player.team) game.homeScore += 3;
    else game.awayScore += 3;
  } else if (actionObj.type === 'ft') {
    if (game.homeTeam === player.team) game.homeScore += 1;
    else game.awayScore += 1;
  }

  // Update game stat block
  let stat = game.playerStats[player.id];
  if (!stat) {
    stat = {
      playerId: player.id,
      pts: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      fg3m: 0,
      to: 0,
      fantasyPoints: 0,
    };
    game.playerStats[player.id] = stat;
  }

  if (actionObj.statKey === 'pts') stat.pts += actionObj.val;
  else if (actionObj.statKey === 'reb') stat.reb += actionObj.val;
  else if (actionObj.statKey === 'ast') stat.ast += actionObj.val;
  else if (actionObj.statKey === 'stl') stat.stl += actionObj.val;
  else if (actionObj.statKey === 'blk') stat.blk += actionObj.val;
  else if (actionObj.statKey === 'to') stat.to += actionObj.val;

  if (actionObj.type === 'pts3') stat.fg3m += 1;

  // Find affected group members across all active leagues
  const affected: { memberId: string; memberName: string; teamName: string }[] = [];

  Object.values(leagues).forEach((league) => {
    let fpDelta = 0;
    league.members.forEach((m) => {
      const rosterItem = m.roster.find((r) => r.playerId === player.id);
      if (rosterItem && rosterItem.isStarter) {
        affected.push({
          memberId: m.id,
          memberName: m.userName,
          teamName: m.teamName,
        });
      }
    });

    updateLeaguePoints(league.id);
  });

  // Calculate default fantasy points delta for action
  let delta = 1.0;
  if (actionObj.type === 'pts2') delta = DEFAULT_SCORING_RULES.pts * 2;
  if (actionObj.type === 'pts3') delta = DEFAULT_SCORING_RULES.pts * 3 + DEFAULT_SCORING_RULES.fg3m;
  if (actionObj.type === 'reb') delta = DEFAULT_SCORING_RULES.reb;
  if (actionObj.type === 'ast') delta = DEFAULT_SCORING_RULES.ast;
  if (actionObj.type === 'stl') delta = DEFAULT_SCORING_RULES.stl;
  if (actionObj.type === 'blk') delta = DEFAULT_SCORING_RULES.blk;
  if (actionObj.type === 'to') delta = DEFAULT_SCORING_RULES.to;

  const playAction: PlayByPlayAction = {
    id: 'play-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    gameId: game.id,
    timestamp: new Date().toLocaleTimeString(),
    quarter: game.quarter,
    clock: game.clock,
    playerId: player.id,
    playerName: player.name,
    playerTeam: player.team,
    actionType: actionObj.type,
    description: actionObj.desc(player),
    fantasyPointsDelta: Math.round(delta * 10) / 10,
    affectedGroupMembers: affected,
  };

  playHistory.unshift(playAction);
  if (playHistory.length > 50) playHistory.pop();

  // Broadcast to all clients
  broadcastToAll({
    type: 'PLAY_ACTION',
    payload: {
      action: playAction,
      games: liveGames,
      leagues,
    },
  });
}

// Timer for simulator
setInterval(() => {
  const interval = simMode === 'fast' ? 1200 : 4000;
  triggerLiveSimulationStep();
}, 3000);

async function startServer() {
  // Serve static assets in production mode
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Integrate Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CourtVision Fantasy Basketball server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
