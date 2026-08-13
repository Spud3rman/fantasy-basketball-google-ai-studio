import { League, LiveGame, PlayByPlayAction, Player, ScoringRules, ChatMessage } from '../types';

export class ApiService {
  private static ws: WebSocket | null = null;
  private static listeners: Set<(event: any) => void> = new Set();

  public static async syncRealNbaData(): Promise<{ message: string; syncedPlayersCount: number; syncedGamesCount: number }> {
    const res = await fetch('/api/sync-nba', {
      method: 'POST',
    });
    return res.json();
  }

  public static async simAllDraftPicks(leagueId: string): Promise<League> {
    const res = await fetch(`/api/leagues/${leagueId}/draft/sim-all`, {
      method: 'POST',
    });
    return res.json();
  }

  public static async resetDraft(leagueId: string): Promise<League> {
    const res = await fetch(`/api/leagues/${leagueId}/draft/reset`, {
      method: 'POST',
    });
    return res.json();
  }

  public static async getPlayers(): Promise<Player[]> {
    const res = await fetch('/api/players');
    return res.json();
  }

  public static async getLeagues(): Promise<League[]> {
    const res = await fetch('/api/leagues');
    return res.json();
  }

  public static async getLeague(id: string): Promise<League> {
    const res = await fetch(`/api/leagues/${id}`);
    return res.json();
  }

  public static async createLeague(data: {
    name: string;
    userName: string;
    teamName: string;
    maxTeams: number;
  }): Promise<League> {
    const res = await fetch('/api/leagues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  public static async joinLeague(data: {
    code: string;
    userName: string;
    teamName: string;
  }): Promise<{ league: League; member: any }> {
    const res = await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to join league');
    }
    return res.json();
  }

  public static async startDraft(leagueId: string): Promise<League> {
    const res = await fetch(`/api/leagues/${leagueId}/draft/start`, {
      method: 'POST',
    });
    return res.json();
  }

  public static async makeDraftPick(
    leagueId: string,
    memberId: string,
    playerId: string
  ): Promise<{ league: League; pickRecord: any }> {
    const res = await fetch(`/api/leagues/${leagueId}/draft/pick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, playerId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to make draft pick');
    }
    return res.json();
  }

  public static async updateRosterSlot(
    leagueId: string,
    memberId: string,
    playerId: string,
    newSlot: string,
    isStarter: boolean
  ): Promise<League> {
    const res = await fetch(`/api/leagues/${leagueId}/roster/slot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, playerId, newSlot, isStarter }),
    });
    return res.json();
  }

  public static async updateScoringRules(leagueId: string, scoringRules: ScoringRules): Promise<League> {
    const res = await fetch(`/api/leagues/${leagueId}/scoring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoringRules }),
    });
    return res.json();
  }

  public static async updateMemberName(
    leagueId: string,
    memberId: string,
    userName: string,
    teamName: string,
    avatar?: string
  ): Promise<League> {
    const res = await fetch(`/api/leagues/${leagueId}/member/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, userName, teamName, avatar }),
    });
    return res.json();
  }

  public static async controlSim(mode: 'live' | 'fast' | 'pause'): Promise<{ simMode: string }> {
    const res = await fetch('/api/sim/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    return res.json();
  }

  public static async getDraftAiAssistant(
    leagueId: string,
    memberId: string
  ): Promise<{ recommendation: string; topPlayers: Player[] }> {
    const res = await fetch('/api/ai/draft-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leagueId, memberId }),
    });
    return res.json();
  }

  public static async getAiMatchupRecap(leagueId: string): Promise<{ recap: string }> {
    const res = await fetch('/api/ai/matchup-recap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leagueId }),
    });
    return res.json();
  }

  // WebSocket Subscription
  public static connectWs(
    leagueId: string,
    userId: string,
    onMessage: (msg: any) => void
  ): () => void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        this.ws?.send(
          JSON.stringify({
            type: 'SUBSCRIBE_LEAGUE',
            leagueId,
            userId,
          })
        );
      };
    } else if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'SUBSCRIBE_LEAGUE',
          leagueId,
          userId,
        })
      );
    }

    const listener = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('WS parse listener error', e);
      }
    };

    this.ws.addEventListener('message', listener);

    return () => {
      this.ws?.removeEventListener('message', listener);
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
