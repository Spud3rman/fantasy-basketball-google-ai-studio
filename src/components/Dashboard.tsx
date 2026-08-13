import React from 'react';
import {
  Trophy,
  Flame,
  Radio,
  Zap,
  TrendingUp,
  Filter,
  Activity,
  CheckCircle2,
  ChevronRight,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { League, GroupMember, LiveGame, PlayByPlayAction, Player, LivePlayerGameStats } from '../types';

interface DashboardProps {
  league: League | null;
  activeMember: GroupMember | null;
  games: LiveGame[];
  playHistory: PlayByPlayAction[];
  players: Player[];
  onNavigateToTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  league,
  activeMember,
  games,
  playHistory,
  players,
  onNavigateToTab,
}) => {
  const [playFilter, setPlayFilter] = React.useState<'all' | 'mine'>('all');

  if (!league) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No active league loaded.</p>
      </div>
    );
  }

  // Find user's rostered player IDs
  const userPlayerIds = new Set(activeMember?.roster.map((r) => r.playerId) || []);

  // Filter play history
  const filteredPlays =
    playFilter === 'mine'
      ? playHistory.filter((p) => p.affectedGroupMembers.some((m) => m.memberId === activeMember?.id))
      : playHistory;

  // Sorted members
  const sortedMembers = [...league.members].sort((a, b) => b.totalPoints - a.totalPoints);
  const leader = sortedMembers[0];
  const activeUserRank = sortedMembers.findIndex((m) => m.id === activeMember?.id) + 1;

  // Find primary matchup opponent
  const opponent = sortedMembers.find((m) => m.id !== activeMember?.id) || sortedMembers[1];

  return (
    <div className="space-y-8">
      {/* Draft Alert Banner if League is currently drafting */}
      {league.status === 'drafting' && (
        <div className="bg-orange-500 text-black p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl -skew-x-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-orange-500 flex items-center justify-center font-black italic text-xl">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="font-display font-black uppercase tracking-tight text-lg leading-none">
                LIVE DRAFT IN PROGRESS
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">
                Round {league.draftState.currentRound} • Turn: {league.members.find((m) => m.id === league.draftState.currentMemberId)?.userName}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('draft')}
            className="bg-black hover:bg-slate-900 text-white font-display font-black uppercase tracking-wider px-6 py-3 text-sm flex items-center gap-2 transition-all -skew-x-6"
          >
            <span>Enter Draft Room</span>
            <ChevronRight className="w-4 h-4 text-orange-500" />
          </button>
        </div>
      )}

      {/* Hero Section & Main Matchup Summary */}
      <section className="bg-black border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black leading-[0.8] uppercase tracking-tighter text-white">
              MATCHUP<br />
              <span className="text-orange-500">ACTION.</span>
            </h1>
            <p className="mt-6 text-xs md:text-sm font-bold uppercase tracking-widest text-white/60 max-w-md">
              Week {league.currentWeek}: Tracking active starters for {activeMember?.teamName || 'Your Team'} vs {opponent?.teamName || 'Opponent'}.
            </p>
          </div>

          <div className="bg-orange-500 text-black px-5 py-2.5 font-display font-black italic text-xl -skew-x-12 uppercase tracking-tight shadow-xl">
            GAMEDAY LIVE
          </div>
        </div>

        {/* 3 Metric Stat Blocks with Thick Left Borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10">
          <div className="border-l-4 border-white pl-4">
            <div className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white mb-1">
              {activeMember?.totalPoints || 0}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
              YOUR CURRENT FP ({activeMember?.userName})
            </div>
          </div>

          <div className="border-l-4 border-slate-700 pl-4">
            <div className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white/70 mb-1">
              {opponent?.totalPoints || 0}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
              OPPONENT FP ({opponent?.userName || 'N/A'})
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <div className="text-4xl md:text-5xl font-display font-black tracking-tighter text-orange-500 mb-1">
              {(activeMember?.totalPoints || 0) - (opponent?.totalPoints || 0) >= 0
                ? `+${((activeMember?.totalPoints || 0) - (opponent?.totalPoints || 0)).toFixed(1)}`
                : `${((activeMember?.totalPoints || 0) - (opponent?.totalPoints || 0)).toFixed(1)}`}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-500">
              LIVE LEAD MARGIN
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Live Starters & Leaderboard Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Starters Performance & Live Stream */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Starters Grid */}
          <div className="bg-black border border-white/10 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-white flex items-center gap-2">
                <span>Active Roster Starters</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('roster')}
                className="text-xs font-display font-bold uppercase tracking-widest text-orange-500 hover:underline"
              >
                Manage Lineup &rarr;
              </button>
            </div>

            {activeMember?.roster.filter((r) => r.isStarter).length === 0 ? (
              <div className="text-xs text-white/50 bg-white/5 p-6 text-center border border-white/10 uppercase tracking-widest font-mono">
                No active starters assigned.{' '}
                <button
                  onClick={() => onNavigateToTab('draft')}
                  className="text-orange-500 font-black underline ml-1"
                >
                  Draft your team now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeMember?.roster
                  .filter((r) => r.isStarter)
                  .map((item) => {
                    const p = players.find((x) => x.id === item.playerId);
                    let liveFp = 0;
                    games.forEach((g) => {
                      if (g.playerStats[item.playerId]) {
                        liveFp = g.playerStats[item.playerId].fantasyPoints;
                      }
                    });

                    return (
                      <div
                        key={item.playerId}
                        className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 hover:border-orange-500 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-orange-500 text-black font-display font-black text-xs uppercase -skew-x-6">
                            {item.slot}
                          </span>
                          <div>
                            <p className="font-bold text-white uppercase text-sm tracking-tight">{p?.name || 'Player'}</p>
                            <p className="text-[10px] text-white/50 font-mono uppercase">
                              {p?.team} • {p?.position}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <p className="font-black text-orange-500 text-base">{liveFp} FP</p>
                          <p className="text-[10px] text-white/40 uppercase">AVG {p?.seasonStats.fantasyAvg}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recent Scoring Plays Box */}
          <div className="bg-black border border-white/10 p-6 relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] text-8xl font-display font-black opacity-[0.03] uppercase pointer-events-none select-none text-white">
              PLAYS
            </div>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
              <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-orange-500">
                Recent Scoring Plays
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <button
                  onClick={() => setPlayFilter('all')}
                  className={`px-2.5 py-1 uppercase font-bold ${
                    playFilter === 'all' ? 'bg-orange-500 text-black font-black' : 'text-white/50 hover:text-white'
                  }`}
                >
                  All Games
                </button>
                <button
                  onClick={() => setPlayFilter('mine')}
                  className={`px-2.5 py-1 uppercase font-bold ${
                    playFilter === 'mine' ? 'bg-orange-500 text-black font-black' : 'text-white/50 hover:text-white'
                  }`}
                >
                  My Team
                </button>
              </div>
            </div>

            {filteredPlays.length === 0 ? (
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest py-6 text-center">
                NO PLAYS RECORDED YET
              </p>
            ) : (
              <div className="space-y-3 font-mono">
                {filteredPlays.slice(0, 10).map((play) => {
                  const isMine = play.affectedGroupMembers.some((m) => m.memberId === activeMember?.id);

                  return (
                    <div key={play.id} className="flex justify-between text-xs items-baseline gap-2">
                      <span className={`font-bold uppercase italic text-xs ${isMine ? 'text-orange-400' : 'text-white'}`}>
                        {play.playerName} ({play.playerTeam})
                      </span>
                      <span className="flex-grow border-b border-white/10 border-dashed"></span>
                      <span className="font-mono font-bold text-emerald-400">
                        +{play.fantasyPointsDelta} FP ({play.actionType})
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Standings & Live Games Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Leaderboard Card Inverted Theme */}
          <aside className="bg-black p-6 border border-white/10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-white">
                LEADERBOARD.
              </h2>
              <button
                onClick={() => onNavigateToTab('leaderboard')}
                className="text-[10px] font-display font-bold uppercase tracking-widest text-orange-500 hover:underline"
              >
                FULL TABLE &rarr;
              </button>
            </div>

            <div className="space-y-1">
              {sortedMembers.map((m, idx) => {
                const isMe = m.id === activeMember?.id;

                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3.5 transition-all ${
                      idx === 0 || isMe
                        ? 'bg-white text-black -mx-1'
                        : 'border-b border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-display font-black italic">
                        0{idx + 1}
                      </span>
                      <div>
                        <span className="font-black uppercase text-xs tracking-tight block">
                          {m.userName} {isMe ? '(You)' : ''}
                        </span>
                        <span className={`text-[10px] uppercase font-bold ${idx === 0 || isMe ? 'text-black/60' : 'text-white/40'}`}>
                          {m.teamName}
                        </span>
                      </div>
                    </div>
                    <span className="font-display font-black text-lg">
                      {m.totalPoints} FP
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                Active League Code
              </div>
              <div className="text-xl font-display font-black uppercase italic text-orange-500">
                {league.code}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Active NBA Games Grid */}
      <div className="bg-black border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-white flex items-center gap-2">
            <span>Live NBA Games Scoreboard</span>
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            SYNCED REAL-TIME
          </span>
        </div>

        {games.length === 0 ? (
          <div className="bg-white/5 border border-white/10 p-8 text-center font-mono">
            <p className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">
              NO LIVE GAMES SCHEDULED TODAY (OFFSEASON)
            </p>
            <p className="text-xs text-white/50 uppercase tracking-widest">
              Check back when the 2026-27 NBA regular season begins in October. Draft rooms, rosters, and official stats remain active.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-white/5 border border-white/10 p-4 hover:border-orange-500 transition-all"
              >
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2 mb-3 font-mono">
                  <span className="bg-orange-500 text-black px-2 py-0.5 font-black text-[10px] uppercase">
                    Q{game.quarter} {game.clock}
                  </span>
                  <span className="text-white/50 font-bold uppercase text-[10px]">NBA LIVE</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center py-2 bg-black border border-white/10">
                  <div>
                    <p className="font-display font-black text-white text-base uppercase">{game.homeTeam}</p>
                    <p className="text-3xl font-display font-black text-orange-500">{game.homeScore}</p>
                  </div>
                  <div className="border-l border-white/10">
                    <p className="font-display font-black text-white text-base uppercase">{game.awayTeam}</p>
                    <p className="text-3xl font-display font-black text-orange-500">{game.awayScore}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Top Performer</p>
                  {(() => {
                    const statsArr = Object.values(game.playerStats) as LivePlayerGameStats[];
                    if (statsArr.length === 0) return <p className="text-xs text-white/40 font-mono">NO STATS YET</p>;

                    const topStat = statsArr.sort((a, b) => b.fantasyPoints - a.fantasyPoints)[0];
                    const p = players.find((x) => x.id === topStat?.playerId);

                    return (
                      <div className="flex items-center justify-between text-xs bg-black p-2 border border-white/10 font-mono">
                        <span className="font-bold text-white uppercase">{p?.name || 'Player'}</span>
                        <span className="font-black text-orange-500">
                          {topStat.pts}P {topStat.reb}R {topStat.ast}A ({topStat.fantasyPoints}FP)
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
