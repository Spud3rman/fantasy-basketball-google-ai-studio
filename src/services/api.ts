import { League, LiveGame, PlayByPlayAction, Player, ScoringRules, ChatMessage } from '../types';
import { ClientStore } from './clientStore';

async function safeApiCall<T>(
  url: string,
  options: RequestInit | undefined,
  fallback: () => Promise<T> | T
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
    // If backend returned non-JSON (like Vercel 404 HTML "The page could not be found..."), use client fallback
    console.warn(`API ${url} returned ${res.status} (${contentType}), switching to local/direct client fallback.`);
    return await fallback();
  } catch (err) {
    console.warn(`API ${url} fetch error, switching to local/direct client fallback:`, err);
    return await fallback();
  }
}

export class ApiService {
  private static ws: WebSocket | null = null;
  private static listeners: Set<(event: any) => void> = new Set();
  private static clientTickerTimer: number | null = null;

  public static async syncRealNbaData(): Promise<{ message: string; syncedPlayersCount: number; syncedGamesCount: number }> {
    return safeApiCall(
      '/api/sync-nba',
      { method: 'POST' },
      () => ClientStore.syncDirectFromEspn()
    );
  }

  public static async simAllDraftPicks(leagueId: string): Promise<League> {
    return safeApiCall(
      `/api/leagues/${leagueId}/draft/sim-all`,
      { method: 'POST' },
      () => ClientStore.simAllDraftPicks(leagueId)
    );
  }

  public static async resetDraft(leagueId: string): Promise<League> {
    return safeApiCall(
      `/api/leagues/${leagueId}/draft/reset`,
      { method: 'POST' },
      () => ClientStore.resetDraft(leagueId)
    );
  }

  public static async getPlayers(): Promise<Player[]> {
    return safeApiCall(
      '/api/players',
      undefined,
      () => ClientStore.getPlayers()
    );
  }

  public static async getLeagues(): Promise<League[]> {
    return safeApiCall(
      '/api/leagues',
      undefined,
      () => ClientStore.getLeagues()
    );
  }

  public static async getLeague(id: string): Promise<League> {
    return safeApiCall(
      `/api/leagues/${id}`,
      undefined,
      () => ClientStore.getLeague(id)
    );
  }

  public static async createLeague(data: {
    name: string;
    userName: string;
    teamName: string;
    maxTeams: number;
  }): Promise<League> {
    return safeApiCall(
      '/api/leagues',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => ClientStore.createLeague(data)
    );
  }

  public static async joinLeague(data: {
    code: string;
    userName: string;
    teamName: string;
  }): Promise<{ league: League; member: any }> {
    return safeApiCall(
      '/api/leagues/join',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => ClientStore.joinLeague(data)
    );
  }

  public static async startDraft(leagueId: string): Promise<League> {
    return safeApiCall(
      `/api/leagues/${leagueId}/draft/start`,
      { method: 'POST' },
      () => ClientStore.startDraft(leagueId)
    );
  }

  public static async makeDraftPick(
    leagueId: string,
    memberId: string,
    playerId: string
  ): Promise<{ league: League; pickRecord: any }> {
    return safeApiCall(
      `/api/leagues/${leagueId}/draft/pick`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, playerId }),
      },
      () => ClientStore.makeDraftPick(leagueId, memberId, playerId)
    );
  }

  public static async updateRosterSlot(
    leagueId: string,
    memberId: string,
    playerId: string,
    newSlot: string,
    isStarter: boolean
  ): Promise<League> {
    return safeApiCall(
      `/api/leagues/${leagueId}/roster/slot`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, playerId, newSlot, isStarter }),
      },
      () => ClientStore.updateRosterSlot(leagueId, memberId, playerId, newSlot, isStarter)
    );
  }

  public static async updateScoringRules(leagueId: string, scoringRules: ScoringRules): Promise<League> {
    return safeApiCall(
      `/api/leagues/${leagueId}/scoring`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoringRules }),
      },
      () => ClientStore.updateScoringRules(leagueId, scoringRules)
    );
  }

  public static async updateMemberName(
    leagueId: string,
    memberId: string,
    userName: string,
    teamName: string,
    avatar?: string
  ): Promise<League> {
    return safeApiCall(
      `/api/leagues/${leagueId}/member/update`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, userName, teamName, avatar }),
      },
      () => ClientStore.updateMemberName(leagueId, memberId, userName, teamName, avatar)
    );
  }

  public static async controlSim(mode: 'live' | 'fast' | 'pause'): Promise<{ simMode: string }> {
    return safeApiCall(
      '/api/sim/control',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      },
      () => ({ simMode: mode })
    );
  }

  public static async getDraftAiAssistant(
    leagueId: string,
    memberId: string
  ): Promise<{ recommendation: string; topPlayers: Player[] }> {
    return safeApiCall(
      '/api/ai/draft-assistant',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, memberId }),
      },
      () => {
        const league = ClientStore.getLeague(leagueId);
        const players = ClientStore.getPlayers();
        const draftedIds = new Set<string>();
        league.members.forEach((m) => m.roster.forEach((r) => draftedIds.add(r.playerId)));
        const available = players.filter((p) => !draftedIds.has(p.id)).slice(0, 6);
        const topPick = available[0];
        return {
          recommendation: topPick
            ? `I recommend picking **${topPick.name}** (${topPick.position} - ${topPick.team}). He averages ${topPick.seasonStats.fantasyAvg} fantasy pts/game and anchors your scoring and tempo.`
            : 'All top players have been drafted!',
          topPlayers: available,
        };
      }
    );
  }

  public static async getAiMatchupRecap(leagueId: string): Promise<{ recap: string }> {
    return safeApiCall(
      '/api/ai/matchup-recap',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId }),
      },
      () => {
        const league = ClientStore.getLeague(leagueId);
        const standings = [...league.members].sort((a, b) => b.totalPoints - a.totalPoints);
        return {
          recap: `🔥 **Week ${league.currentWeek} Recap**: ${standings[0]?.teamName || 'Leader'} leads the standings with ${standings[0]?.totalPoints || 0} FP! Keep tracking live game action and roster matchups!`,
        };
      }
    );
  }

  // WebSocket Subscription with seamless client fallback for static hosts like Vercel
  public static connectWs(
    leagueId: string,
    userId: string,
    onMessage: (msg: any) => void
  ): () => void {
    let isConnected = false;

    // Listen to custom client-side data updates
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        onMessage({
          type: 'INIT_STATE',
          payload: {
            players: customEvent.detail.players,
            games: customEvent.detail.games,
            league: customEvent.detail.leagues?.find((l: any) => l.id === leagueId) || ClientStore.getLeague(leagueId),
          },
        });
      }
    };
    window.addEventListener('COURTVISION_DATA_UPDATED', handleLocalUpdate);

    // Try WebSocket if supported by the host
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.ws = new WebSocket(wsUrl);
        this.ws.onopen = () => {
          isConnected = true;
          this.ws?.send(
            JSON.stringify({
              type: 'SUBSCRIBE_LEAGUE',
              leagueId,
              userId,
            })
          );
        };
      }
    } catch {
      // Host doesn't support raw WS (e.g. Vercel)
    }

    const wsListener = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    if (this.ws) {
      this.ws.addEventListener('message', wsListener);
    }

    // Client-side simulation loop (ticks plays & scores smoothly even on static hosting like Vercel)
    const clientTickerInterval = window.setInterval(() => {
      // If WS is actively connected, let WS drive
      if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

      const players = ClientStore.getPlayers();
      const games = ClientStore.getGames();
      const league = ClientStore.getLeague(leagueId);
      if (players.length === 0) return;

      const randomPlayer = players[Math.floor(Math.random() * Math.min(players.length, 25))];
      const actionTypes = [
        { type: 'pts2', desc: (p: Player) => `${p.name} executes a pull-up jumper inside the arc (+2 PTS)`, statKey: 'pts', val: 2 },
        { type: 'pts3', desc: (p: Player) => `${p.name} splashes a 3-pointer from deep (+3 PTS)`, statKey: 'pts', val: 3 },
        { type: 'reb', desc: (p: Player) => `${p.name} snatches down a rebound (+1 REB)`, statKey: 'reb', val: 1 },
        { type: 'ast', desc: (p: Player) => `${p.name} dishes out an assist (+1 AST)`, statKey: 'ast', val: 1 },
        { type: 'stl', desc: (p: Player) => `${p.name} picks the ball clean for a steal (+1 STL)`, statKey: 'stl', val: 1 },
        { type: 'blk', desc: (p: Player) => `${p.name} blocks the shot into the crowd (+1 BLK)`, statKey: 'blk', val: 1 },
      ];

      const chosenAction = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const affectedMembers: Array<{ memberId: string; memberName: string; teamName: string }> = [];

      league.members.forEach((m) => {
        const rosterItem = m.roster.find((r) => r.playerId === randomPlayer.id);
        if (rosterItem) {
          affectedMembers.push({
            memberId: m.id,
            memberName: m.userName,
            teamName: m.teamName,
          });
        }
      });

      const playAction: PlayByPlayAction = {
        id: `play-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        gameId: `game-sim`,
        timestamp: new Date().toLocaleTimeString(),
        quarter: 3,
        clock: '7:45',
        playerId: randomPlayer.id,
        playerName: randomPlayer.name,
        playerTeam: randomPlayer.team,
        actionType: chosenAction.type as any,
        description: chosenAction.desc(randomPlayer),
        fantasyPointsDelta: chosenAction.val * 1.2,
        affectedGroupMembers: affectedMembers,
      };

      // Emit play action
      onMessage({
        type: 'PLAY_ACTION',
        payload: {
          action: playAction,
          games,
          leagues: { [league.id]: league },
        },
      });
    }, 4000);

    return () => {
      window.removeEventListener('COURTVISION_DATA_UPDATED', handleLocalUpdate);
      if (this.ws) {
        this.ws.removeEventListener('message', wsListener);
      }
      window.clearInterval(clientTickerInterval);
    };
  }

  public static sendChatMessage(leagueId: string, chat: ChatMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'CHAT_MESSAGE',
          leagueId,
          chat,
        })
      );
    }
  }
}
