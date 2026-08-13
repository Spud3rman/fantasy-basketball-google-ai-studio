export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface Player {
  id: string;
  name: string;
  team: string; // NBA team code e.g., 'DEN', 'LAL', 'GSW', 'MIL', 'BOS'
  teamName: string; // e.g. 'Denver Nuggets'
  position: Position;
  avatarUrl: string;
  rank: number;
  adp: number; // Average Draft Position
  seasonStats: {
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    fg3m: number;
    to: number;
    fantasyAvg: number;
  };
}

export interface ScoringRules {
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg3m: number;
  to: number;
  doubleDoubleBonus: number;
  tripleDoubleBonus: number;
}

export interface LineupSlot {
  slotType: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'UTIL' | 'BENCH';
  playerId: string | null;
}

export interface RosterPlayer {
  playerId: string;
  draftRound: number;
  draftPick: number;
  isStarter: boolean;
  slot: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'UTIL' | 'BENCH';
}

export interface GroupMember {
  id: string;
  userName: string;
  teamName: string;
  avatar: string;
  isHost: boolean;
  roster: RosterPlayer[];
  weeklyPoints: Record<number, number>; // week -> total points
  totalPoints: number;
  isReadyForDraft?: boolean;
}

export interface DraftPick {
  round: number;
  pickNumber: number;
  memberId: string;
  memberName: string;
  teamName: string;
  player: Player;
  timestamp: string;
}

export interface DraftState {
  isStarted: boolean;
  isCompleted: boolean;
  currentRound: number;
  currentPickIndex: number;
  currentMemberId: string;
  pickHistory: DraftPick[];
  pickTimeSeconds: number;
  timerActive: boolean;
}

export interface League {
  id: string;
  name: string;
  code: string;
  maxTeams: number;
  status: 'setup' | 'drafting' | 'active' | 'completed';
  currentWeek: number;
  scoringRules: ScoringRules;
  draftState: DraftState;
  members: GroupMember[];
  createdAt: string;
}

export interface LivePlayerGameStats {
  playerId: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg3m: number;
  to: number;
  fantasyPoints: number;
}

export interface LiveGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarter: number; // 1, 2, 3, 4, 5 (OT)
  clock: string; // e.g. "04:32"
  status: 'upcoming' | 'live' | 'final';
  playerStats: Record<string, LivePlayerGameStats>;
}

export interface PlayByPlayAction {
  id: string;
  gameId: string;
  timestamp: string;
  quarter: number;
  clock: string;
  playerId: string;
  playerName: string;
  playerTeam: string;
  actionType: 'pts2' | 'pts3' | 'ft' | 'reb' | 'ast' | 'stl' | 'blk' | 'to';
  description: string;
  fantasyPointsDelta: number;
  affectedGroupMembers: {
    memberId: string;
    memberName: string;
    teamName: string;
  }[];
}

export interface WsMessage {
  type:
    | 'INIT_STATE'
    | 'LEAGUE_UPDATED'
    | 'PLAY_ACTION'
    | 'DRAFT_PICKED'
    | 'SIMULATION_STATE'
    | 'CHAT_MESSAGE';
  payload: any;
}

export interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  teamName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}
