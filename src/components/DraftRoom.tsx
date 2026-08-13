import React from 'react';
import confetti from 'canvas-confetti';
import {
  Zap,
  Clock,
  Search,
  Filter,
  Bot,
  Sparkles,
  Check,
  User,
  Shield,
  Play,
  TrendingUp,
  Award,
} from 'lucide-react';
import { League, GroupMember, Player, Position } from '../types';
import { ApiService } from '../services/api';

interface DraftRoomProps {
  league: League | null;
  activeMember: GroupMember | null;
  players: Player[];
  onMakeDraftPick: (playerId: string) => Promise<void>;
  onStartDraft: () => Promise<void>;
}

export const DraftRoom: React.FC<DraftRoomProps> = ({
  league,
  activeMember,
  players,
  onMakeDraftPick,
  onStartDraft,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [posFilter, setPosFilter] = React.useState<string>('ALL');
  const [aiAdvice, setAiAdvice] = React.useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = React.useState(false);
  const [autoDraftCpu, setAutoDraftCpu] = React.useState(true);
  const [isSimulating, setIsSimulating] = React.useState(false);

  if (!league) return null;

  const draftState = league.draftState;

  const draftedPlayerIds = new Set<string>();
  league.members.forEach((m) => m.roster.forEach((r) => draftedPlayerIds.add(r.playerId)));

  const availablePlayers = players.filter((p) => {
    if (draftedPlayerIds.has(p.id)) return false;
    if (posFilter !== 'ALL' && p.position !== posFilter) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.team.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const isMyTurn = draftState.currentMemberId === activeMember?.id && draftState.isStarted && !draftState.isCompleted;
  const currentOnClockMember = league.members.find((m) => m.id === draftState.currentMemberId);
  const isOnClockCpu = currentOnClockMember?.userName.includes('CPU') || draftState.currentMemberId !== activeMember?.id;

  // Auto-pick effect for CPU turns
  React.useEffect(() => {
    if (!draftState.isStarted || draftState.isCompleted || !autoDraftCpu) return;

    if (isOnClockCpu) {
      const timer = setTimeout(async () => {
        try {
          await ApiService.makeDraftPick(league.id, draftState.currentMemberId, 'AUTO');
        } catch (e) {
          console.warn('Auto-pick error:', e);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [draftState.currentMemberId, draftState.isStarted, draftState.isCompleted, autoDraftCpu, activeMember, league.id, isOnClockCpu]);

  const handlePickPlayer = async (player: Player) => {
    if (!isMyTurn) return;
    try {
      await onMakeDraftPick(player.id);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e: any) {
      alert(e.message || 'Draft pick error');
    }
  };

  const handleSimCpuPick = async () => {
    try {
      await ApiService.makeDraftPick(league.id, draftState.currentMemberId, 'AUTO');
    } catch (e: any) {
      alert(e.message || 'Sim pick error');
    }
  };

  const handleSimAllPicks = async () => {
    setIsSimulating(true);
    try {
      await ApiService.simAllDraftPicks(league.id);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch (e: any) {
      alert(e.message || 'Sim all error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetDraft = async () => {
    if (confirm('Are you sure you want to reset the draft room and clear all picked rosters?')) {
      try {
        await ApiService.resetDraft(league.id);
      } catch (e: any) {
        alert(e.message || 'Reset draft error');
      }
    }
  };

  const handleFetchAiAdvice = async () => {
    if (!league || !activeMember) return;
    setIsLoadingAi(true);
    try {
      const res = await ApiService.getDraftAiAssistant(league.id, activeMember.id);
      setAiAdvice(res.recommendation);
    } catch (e) {
      setAiAdvice('Unable to fetch AI recommendation at this moment.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft Status Banner */}
      <div className="bg-black border border-white/10 p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">
                LIVE DRAFT BOARD.
              </h2>
              {draftState.isCompleted ? (
                <span className="bg-emerald-500 text-black text-xs px-2 py-0.5 font-black italic -skew-x-12 uppercase">
                  COMPLETE
                </span>
              ) : isMyTurn ? (
                <span className="bg-orange-500 text-black text-xs px-2 py-0.5 font-black italic -skew-x-12 uppercase animate-pulse">
                  YOUR TURN!
                </span>
              ) : null}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">
              SNAKE FORMAT • 6 ROUNDS • AUTO POSITION ASSIGNMENT
            </p>
          </div>

          {!draftState.isStarted ? (
            <div className="flex items-center gap-3">
              {activeMember?.isHost ? (
                <>
                  <button
                    onClick={onStartDraft}
                    className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-6 py-3 text-sm uppercase tracking-wider transition-all -skew-x-6"
                  >
                    Start Live Draft Board
                  </button>
                  <button
                    onClick={handleSimAllPicks}
                    disabled={isSimulating}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-display font-black px-4 py-3 text-xs uppercase tracking-wider transition-all -skew-x-6"
                  >
                    {isSimulating ? 'Simulating...' : 'Instant Auto-Draft'}
                  </button>
                </>
              ) : (
                <div className="bg-white/5 px-4 py-2 border border-white/10 text-xs text-orange-500 font-mono font-bold uppercase tracking-wider">
                  Waiting for host to launch draft...
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-6 bg-white/5 px-5 py-2.5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${isMyTurn ? 'bg-orange-500 animate-ping' : 'bg-blue-400 animate-pulse'}`} />
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">ON THE CLOCK</p>
                    <p className="text-base font-display font-black text-orange-500 uppercase">
                      {currentOnClockMember?.userName} ({currentOnClockMember?.teamName})
                    </p>
                  </div>
                </div>

                <div className="border-l border-white/10 pl-6 font-mono">
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">ROUND / PICK</p>
                  <p className="text-sm font-black text-white">
                    R{draftState.currentRound} • PICK #{draftState.pickHistory.length + 1}
                  </p>
                </div>
              </div>

              {/* Draft Control Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoDraftCpu(!autoDraftCpu)}
                  className={`px-3 py-2 font-mono text-xs font-bold border -skew-x-6 transition-all ${
                    autoDraftCpu
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-white/5 border-white/20 text-white/60'
                  }`}
                  title="Automatically execute picks for CPU members"
                >
                  CPU Auto-Pick: {autoDraftCpu ? 'ON' : 'OFF'}
                </button>

                {!draftState.isCompleted && (
                  <>
                    <button
                      onClick={handleSimCpuPick}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-2 text-xs font-mono font-bold -skew-x-6"
                    >
                      Sim Pick
                    </button>
                    <button
                      onClick={handleSimAllPicks}
                      disabled={isSimulating}
                      className="bg-orange-500 hover:bg-orange-400 text-black px-3 py-2 text-xs font-display font-black uppercase -skew-x-6"
                    >
                      {isSimulating ? 'Simulating...' : 'Sim All'}
                    </button>
                  </>
                )}

                {activeMember?.isHost && (
                  <button
                    onClick={handleResetDraft}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-2 text-xs font-mono font-bold -skew-x-6"
                  >
                    Reset Draft
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Draft Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Player Pool & AI Assistant */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Draft Assistant Box */}
          <div className="bg-black border border-white/10 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-white flex items-center gap-2">
                <span>Gemini AI Draft Advisor</span>
              </h3>
              <button
                onClick={handleFetchAiAdvice}
                disabled={isLoadingAi}
                className="bg-orange-500 text-black font-display font-black px-4 py-1.5 text-xs uppercase tracking-wider -skew-x-6 hover:bg-orange-400 transition-all"
              >
                {isLoadingAi ? 'Analyzing...' : 'Get AI Recommendation'}
              </button>
            </div>

            {aiAdvice ? (
              <div className="bg-white/5 p-4 border border-white/10 text-xs text-white leading-relaxed font-mono">
                {aiAdvice}
              </div>
            ) : (
              <p className="text-xs text-white/50 font-mono uppercase">
                Let Gemini analyze your current roster gaps and recommend high-value available picks.
              </p>
            )}
          </div>

          {/* Player Search & Filters */}
          <div className="bg-black border border-white/10 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="SEARCH PLAYER OR TEAM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 font-mono focus:outline-none focus:border-orange-500 uppercase"
                />
              </div>

              {/* Position Filter Buttons */}
              <div className="flex items-center gap-1">
                {['ALL', 'PG', 'SG', 'SF', 'PF', 'C'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosFilter(pos)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                      posFilter === pos
                        ? 'bg-orange-500 text-black font-black'
                        : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Players List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {availablePlayers.length === 0 ? (
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest text-center py-8">
                  No available players matching criteria.
                </p>
              ) : (
                availablePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-white/5 border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3 hover:border-orange-500 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-black text-orange-500 font-mono font-black text-xs flex items-center justify-center border border-white/10">
                        #{player.rank}
                      </span>
                      <img
                        src={player.avatarUrl}
                        alt={player.name}
                        className="w-10 h-10 object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm uppercase">{player.name}</h4>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/10 text-white">
                            {player.team}
                          </span>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-orange-500 text-black">
                            {player.position}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 font-mono uppercase mt-0.5">
                          {player.seasonStats.pts}P • {player.seasonStats.reb}R • {player.seasonStats.ast}A
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right font-mono pr-2">
                        <p className="font-black text-orange-500 text-sm">
                          {player.seasonStats.fantasyAvg} FP
                        </p>
                        <p className="text-[10px] text-white/40">ADP: {player.adp}</p>
                      </div>

                      <button
                        onClick={() => handlePickPlayer(player)}
                        disabled={!isMyTurn}
                        className={`px-4 py-2 font-display font-black text-xs uppercase tracking-wider transition-all -skew-x-6 ${
                          isMyTurn
                            ? 'bg-orange-500 hover:bg-orange-400 text-black'
                            : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                        }`}
                      >
                        {isMyTurn ? 'DRAFT PLAYER' : 'WAIT FOR TURN'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Pick History Board */}
        <div className="bg-black border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Pick History
            </h3>
            <span className="text-xs text-orange-500 font-mono font-bold">
              {draftState.pickHistory.length} Picks
            </span>
          </div>

          {draftState.pickHistory.length === 0 ? (
            <p className="text-xs text-white/40 font-mono uppercase tracking-widest text-center py-8">
              No picks made yet.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {draftState.pickHistory.map((pick) => (
                <div
                  key={pick.pickNumber}
                  className="bg-white/5 p-3 border border-white/10 text-xs flex items-center justify-between gap-2 font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-bold text-orange-500">
                        R{pick.round}•#{pick.pickNumber}
                      </span>
                      <span className="text-white/70 font-semibold uppercase">{pick.teamName}</span>
                    </div>
                    <p className="font-bold text-white uppercase mt-0.5">{pick.player.name}</p>
                  </div>
                  <span className="text-[10px] text-white/40">{pick.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
