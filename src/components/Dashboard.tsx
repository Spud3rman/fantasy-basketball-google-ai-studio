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
import { League, GroupMember, LiveGame, PlayByPlayAction, Player, LivePlayerGameStats, CustomLeaderboard } from '../types';
import { ApiService } from '../services/api';
import { SeasonService, SeasonInfo } from '../services/seasonService';

interface DashboardProps {
  league: League | null;
  activeMember: GroupMember | null;
  games: LiveGame[];
  playHistory?: PlayByPlayAction[];
  players: Player[];
  onNavigateToTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  league,
  activeMember,
  games,
  playHistory = [],
  players,
  onNavigateToTab,
}) => {
  const [customBoard, setCustomBoard] = React.useState<CustomLeaderboard>(() => ApiService.getActiveLeaderboard());
  const [seasonInfo, setSeasonInfo] = React.useState<SeasonInfo>(() => SeasonService.getSeasonInfo());
  const [playFilter, setPlayFilter] = React.useState<'all' | 'roster'>('all');

  React.useEffect(() => {
    const handleUpdate = () => {
      setCustomBoard(ApiService.getActiveLeaderboard());
    };
    const unsubscribeSeason = SeasonService.onSeasonChange((info) => {
      setSeasonInfo(info);
    });

    window.addEventListener('COURTVISION_LEADERBOARDS_UPDATED', handleUpdate);
    window.addEventListener('COURTVISION_ACTIVE_LEADERBOARD_CHANGED', handleUpdate);
    return () => {
      unsubscribeSeason();
      window.removeEventListener('COURTVISION_LEADERBOARDS_UPDATED', handleUpdate);
      window.removeEventListener('COURTVISION_ACTIVE_LEADERBOARD_CHANGED', handleUpdate);
    };
  }, []);

  if (!league) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No active league loaded.</p>
      </div>
    );
  }

  // Find user's rostered player IDs
  const userPlayerIds = new Set(activeMember?.roster.map((r) => r.playerId) || []);

  // Sorted members
  const sortedMembers = [...league.members].sort((a, b) => b.totalPoints - a.totalPoints);
  const leader = sortedMembers[0];
  const activeUserRank = sortedMembers.findIndex((m) => m.id === activeMember?.id) + 1;

  // Find primary matchup opponent
  const opponent = sortedMembers.find((m) => m.id !== activeMember?.id) || sortedMembers[1];

  // User roster breakdown
  const userStarters = activeMember?.roster.filter((r) => r.isStarter) || [];
  const userBench = activeMember?.roster.filter((r) => !r.isStarter) || [];
  const opponentStarters = opponent?.roster.filter((r) => r.isStarter) || [];

  const userStarterPlayers = userStarters
    .map((r) => players.find((p) => p.id === r.playerId))
    .filter(Boolean) as Player[];

  const oppStarterPlayers = opponentStarters
    .map((r) => players.find((p) => p.id === r.playerId))
    .filter(Boolean) as Player[];

  const userProjFp = userStarterPlayers.reduce((acc, p) => acc + (p.seasonStats?.fantasyAvg || 0), 0);
  const oppProjFp = oppStarterPlayers.reduce((acc, p) => acc + (p.seasonStats?.fantasyAvg || 0), 0);
  const userProjPpg = userStarterPlayers.reduce((acc, p) => acc + (p.seasonStats?.pts || 0), 0);
  const oppProjPpg = oppStarterPlayers.reduce((acc, p) => acc + (p.seasonStats?.pts || 0), 0);
  const userProjRpg = userStarterPlayers.reduce((acc, p) => acc + (p.seasonStats?.reb || 0), 0);
  const oppProjRpg = oppStarterPlayers.reduce((acc, p) => acc + (p.seasonStats?.reb || 0), 0);
  const userProjApg = userStarterPlayers.reduce((acc, p) => acc + (p.seasonStats?.ast || 0), 0);
  const oppProjApg = oppStarterPlayers.reduce((acc, p) => acc + (p.seasonStats?.ast || 0), 0);

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
              {seasonInfo.isSeasonActive
                ? `Week ${league.currentWeek}: Tracking active starters for ${activeMember?.teamName || 'Your Team'} vs ${opponent?.teamName || 'Opponent'}.`
                : `2026-27 Offseason: Preparing roster and setting lineups for ${activeMember?.teamName || 'Your Team'}. Regular season tips off in ${seasonInfo.daysUntilTipoff} days (Oct 20).`}
            </p>
          </div>

          <div className="bg-orange-500 text-black px-5 py-2.5 font-display font-black italic text-xl -skew-x-12 uppercase tracking-tight shadow-xl">
            {seasonInfo.isSeasonActive ? 'GAMEDAY LIVE' : 'OFFSEASON ROSTER PREP'}
          </div>
        </div>

        {/* 3 Metric Stat Blocks with Thick Left Borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10">
          <div className="border-l-4 border-white pl-4">
            <div className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white mb-1">
              {seasonInfo.isSeasonActive ? (activeMember?.totalPoints || 0) : `${userProjFp.toFixed(1)} FP`}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
              {seasonInfo.isSeasonActive
                ? `YOUR CURRENT FP (${activeMember?.userName})`
                : `PROJECTED STARTER FP / GM (${activeMember?.userName})`}
            </div>
          </div>

          <div className="border-l-4 border-slate-700 pl-4">
            <div className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white/70 mb-1">
              {seasonInfo.isSeasonActive ? (opponent?.totalPoints || 0) : `${oppProjFp.toFixed(1)} FP`}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
              {seasonInfo.isSeasonActive
                ? `OPPONENT FP (${opponent?.userName || 'N/A'})`
                : `OPPONENT PROJECTED FP / GM (${opponent?.userName || 'N/A'})`}
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <div className="text-4xl md:text-5xl font-display font-black tracking-tighter text-orange-500 mb-1">
              {seasonInfo.isSeasonActive
                ? ((activeMember?.totalPoints || 0) - (opponent?.totalPoints || 0) >= 0
                    ? `+${((activeMember?.totalPoints || 0) - (opponent?.totalPoints || 0)).toFixed(1)}`
                    : `${((activeMember?.totalPoints || 0) - (opponent?.totalPoints || 0)).toFixed(1)}`)
                : (userProjFp - oppProjFp >= 0
                    ? `+${(userProjFp - oppProjFp).toFixed(1)}`
                    : `${(userProjFp - oppProjFp).toFixed(1)}`)}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-500">
              {seasonInfo.isSeasonActive ? 'LIVE LEAD MARGIN' : 'PROJECTED LEAD MARGIN (TIPOFF OCT 20)'}
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
                    if (seasonInfo.isSeasonActive) {
                      games.forEach((g) => {
                        if (g.playerStats[item.playerId]) {
                          liveFp = g.playerStats[item.playerId].fantasyPoints;
                        }
                      });
                    }

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
                          {seasonInfo.isSeasonActive ? (
                            <>
                              <p className="font-black text-orange-500 text-base">{liveFp} FP</p>
                              <p className="text-[10px] text-white/40 uppercase">AVG {p?.seasonStats.fantasyAvg}</p>
                            </>
                          ) : (
                            <>
                              <p className="font-black text-white text-base">{p?.seasonStats.fantasyAvg || 0} FP</p>
                              <p className="text-[10px] text-white/40 uppercase">SEASON AVG</p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Matchup Projections & ESPN Stat Comparison */}
          <div className="bg-black border border-white/10 p-6 relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] text-8xl font-display font-black opacity-[0.03] uppercase pointer-events-none select-none text-white">
              STATS
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-orange-500">
                  Head-to-Head Projections (ESPN Official Stats)
                </h3>
                <p className="text-[10px] font-mono text-white/40 uppercase mt-0.5">
                  Starters Projected Averages: {activeMember?.teamName || 'Your Team'} vs {opponent?.teamName || 'Opponent'}
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('players')}
                className="text-[10px] font-display font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300"
              >
                All NBA Stats &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-white/5 border border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-white/50 block mb-1">
                  Projected FP / Gm
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-display font-black text-orange-500">{userProjFp.toFixed(1)}</span>
                  <span className="text-xs text-white/40 font-bold">vs {oppProjFp.toFixed(1)}</span>
                </div>
                <div className="w-full bg-white/10 h-1 mt-2 overflow-hidden flex">
                  <div
                    className="bg-orange-500 h-full"
                    style={{
                      width: `${userProjFp + oppProjFp > 0 ? (userProjFp / (userProjFp + oppProjFp)) * 100 : 50}%`,
                    }}
                  />
                  <div
                    className="bg-white/30 h-full"
                    style={{
                      width: `${userProjFp + oppProjFp > 0 ? (oppProjFp / (userProjFp + oppProjFp)) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-white/50 block mb-1">
                  Points (PPG)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-display font-black text-white">{userProjPpg.toFixed(1)}</span>
                  <span className="text-xs text-white/40 font-bold">vs {oppProjPpg.toFixed(1)}</span>
                </div>
                <div className="w-full bg-white/10 h-1 mt-2 overflow-hidden flex">
                  <div
                    className="bg-orange-500 h-full"
                    style={{
                      width: `${userProjPpg + oppProjPpg > 0 ? (userProjPpg / (userProjPpg + oppProjPpg)) * 100 : 50}%`,
                    }}
                  />
                  <div
                    className="bg-white/30 h-full"
                    style={{
                      width: `${userProjPpg + oppProjPpg > 0 ? (oppProjPpg / (userProjPpg + oppProjPpg)) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-white/50 block mb-1">
                  Rebounds (RPG)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-display font-black text-white">{userProjRpg.toFixed(1)}</span>
                  <span className="text-xs text-white/40 font-bold">vs {oppProjRpg.toFixed(1)}</span>
                </div>
                <div className="w-full bg-white/10 h-1 mt-2 overflow-hidden flex">
                  <div
                    className="bg-orange-500 h-full"
                    style={{
                      width: `${userProjRpg + oppProjRpg > 0 ? (userProjRpg / (userProjRpg + oppProjRpg)) * 100 : 50}%`,
                    }}
                  />
                  <div
                    className="bg-white/30 h-full"
                    style={{
                      width: `${userProjRpg + oppProjRpg > 0 ? (oppProjRpg / (userProjRpg + oppProjRpg)) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-white/50 block mb-1">
                  Assists (APG)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-display font-black text-white">{userProjApg.toFixed(1)}</span>
                  <span className="text-xs text-white/40 font-bold">vs {oppProjApg.toFixed(1)}</span>
                </div>
                <div className="w-full bg-white/10 h-1 mt-2 overflow-hidden flex">
                  <div
                    className="bg-orange-500 h-full"
                    style={{
                      width: `${userProjApg + oppProjApg > 0 ? (userProjApg / (userProjApg + oppProjApg)) * 100 : 50}%`,
                    }}
                  />
                  <div
                    className="bg-white/30 h-full"
                    style={{
                      width: `${userProjApg + oppProjApg > 0 ? (oppProjApg / (userProjApg + oppProjApg)) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bench Reserves Quick Row */}
            {userBench.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-white/50 font-bold tracking-wider">
                    Bench Reserves ({userBench.length} Players)
                  </span>
                  <button
                    onClick={() => onNavigateToTab('roster')}
                    className="text-[10px] font-mono text-orange-400 hover:underline uppercase"
                  >
                    Set Starters &rarr;
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userBench.map((benchSlot) => {
                    const bp = players.find((p) => p.id === benchSlot.playerId);
                    return (
                      <div
                        key={benchSlot.playerId}
                        className="bg-white/5 border border-white/10 px-2.5 py-1.5 flex items-center gap-2 text-xs font-mono"
                      >
                        <span className="text-[10px] bg-white/10 px-1 py-0.5 text-white/70 font-bold uppercase">
                          BN
                        </span>
                        <span className="font-bold text-white uppercase">{bp?.name || 'Player'}</span>
                        <span className="text-orange-400 text-[11px] font-bold">
                          {bp?.seasonStats?.fantasyAvg || 0} FP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Standings & Live Games Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Custom Leaderboard Card */}
          <aside className="bg-black p-6 border border-white/10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-xl font-display font-black uppercase tracking-tighter text-white">
                  {customBoard?.title || 'CUSTOM LEADERBOARD'}
                </h2>
                <span className="text-[10px] font-mono uppercase text-orange-400 font-bold block mt-0.5">
                  {customBoard?.category || 'Custom'} • {customBoard?.metricLabel || 'Points'}
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('leaderboard')}
                className="text-[10px] font-display font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 bg-orange-500/10 px-2.5 py-1.5 border border-orange-500/30 rounded"
              >
                MANAGE &rarr;
              </button>
            </div>

            <div className="space-y-1.5 flex-1">
              {!customBoard || customBoard.entries.length === 0 ? (
                <div className="p-6 text-center text-white/50 space-y-3 font-mono text-xs">
                  <p>No entries on this leaderboard yet.</p>
                  <button
                    onClick={() => onNavigateToTab('leaderboard')}
                    className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-4 py-2 text-xs uppercase tracking-wider -skew-x-6"
                  >
                    + Make Your Leaderboard
                  </button>
                </div>
              ) : (
                customBoard.entries.slice(0, 6).map((entry, idx) => {
                  const isTop = idx === 0;

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 transition-all ${
                        isTop
                          ? 'bg-white text-black -mx-1 shadow-md'
                          : 'border-b border-white/10 text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-base font-display font-black italic ${isTop ? 'text-black' : 'text-orange-500'}`}>
                          0{entry.rank || idx + 1}
                        </span>
                        <img
                          src={entry.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={entry.name}
                          className="w-8 h-8 object-cover border border-white/20 shrink-0 bg-neutral-900"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black uppercase text-xs tracking-tight block">
                              {entry.name}
                            </span>
                            {entry.badge && (
                              <span
                                className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                                  isTop
                                    ? 'bg-black text-orange-400'
                                    : 'bg-orange-500/20 text-orange-400'
                                }`}
                              >
                                {entry.badge}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] uppercase font-bold block ${isTop ? 'text-black/60' : 'text-white/40'}`}>
                            {entry.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-display font-black text-base block">
                          {entry.score}
                        </span>
                        <span className={`text-[9px] uppercase font-bold block ${isTop ? 'text-black/50' : 'text-white/40'}`}>
                          {customBoard.metricLabel}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => onNavigateToTab('leaderboard')}
                className="text-xs font-display font-bold uppercase tracking-wider text-white/60 hover:text-orange-400 flex items-center gap-1"
              >
                + Add / Customize Leaderboard &rarr;
              </button>
              <div className="text-[10px] font-mono text-white/40">
                Code: <span className="text-orange-400 font-bold">{league.code}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Offseason Status Notice: Live Games and Scoring Plays activate when the season starts */}
      {!seasonInfo.isSeasonActive && (
        <div className="bg-black border border-white/10 p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-black font-display font-black text-[10px] uppercase -skew-x-6">
                  NBA OFFSEASON
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-white/50">
                  {seasonInfo.seasonName}
                </span>
              </div>
              <h3 className="text-2xl font-display font-black uppercase text-white tracking-tight">
                Live NBA Games &amp; Scoring Plays Inactive
              </h3>
              <p className="text-xs font-mono text-white/60 max-w-2xl leading-relaxed">
                The 2026-27 NBA regular season tips off on Tuesday, October 20, 2026 ({seasonInfo.daysUntilTipoff} days until opening night). Live NBA game scoreboards, box scores, and real-time scoring play feeds are currently inactive and will automatically activate on opening night.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigateToTab('draft')}
                className="bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase px-4 py-2.5 transition-all -skew-x-6 border border-white/10 text-center"
              >
                Draft Roster &rarr;
              </button>
              <button
                onClick={() => SeasonService.setSeasonMode('in_season')}
                className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase px-5 py-2.5 transition-all -skew-x-6 text-center flex items-center justify-center gap-1.5 shadow-xl"
              >
                <span>Test Season Mode (Bring Back Now)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active NBA Games Scoreboard - Brought back when season starts! */}
      {seasonInfo.isSeasonActive && (
        <div className="bg-black border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
                Live NBA Games Scoreboard
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 border border-emerald-500/30">
                LIVE IN-SEASON
              </span>
              {seasonInfo.mode === 'in_season' && (
                <button
                  onClick={() => SeasonService.setSeasonMode('auto')}
                  className="text-[10px] font-mono text-white/40 hover:text-white underline uppercase"
                >
                  Reset to Offseason
                </button>
              )}
            </div>
          </div>

          {games.length === 0 ? (
            <div className="bg-white/5 border border-white/10 p-8 text-center font-mono">
              <p className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">
                NO LIVE GAMES SCHEDULED TODAY
              </p>
              <p className="text-xs text-white/50 uppercase tracking-widest">
                Check back during tonight's scheduled matchups.
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
      )}

      {/* Live Scoring Plays & Play-by-Play Feed - Brought back when season starts! */}
      {seasonInfo.isSeasonActive && (
        <div className="bg-black border border-white/10 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
                Live Scoring Plays &amp; Fantasy Impact
              </h3>
              <span className="px-2 py-0.5 bg-orange-500 text-black text-[10px] font-display font-black uppercase -skew-x-6">
                REAL-TIME
              </span>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlayFilter('all')}
                className={`text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-1 transition-all ${
                  playFilter === 'all'
                    ? 'bg-orange-500 text-black font-black'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                All NBA Plays
              </button>
              <button
                onClick={() => setPlayFilter('roster')}
                className={`text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-1 transition-all ${
                  playFilter === 'roster'
                    ? 'bg-orange-500 text-black font-black'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                My Roster Only
              </button>
            </div>
          </div>

          {(() => {
            const displayPlays = playHistory.filter((play) => {
              if (playFilter === 'roster') {
                return userPlayerIds.has(play.playerId);
              }
              return true;
            });

            if (displayPlays.length === 0) {
              return (
                <div className="bg-white/5 border border-white/10 p-8 text-center font-mono">
                  <p className="text-xs text-white/50 uppercase tracking-widest">
                    {playFilter === 'roster'
                      ? 'No active scoring plays for your roster yet. Live plays will appear as games progress.'
                      : 'Waiting for live scoring plays from active NBA matchups...'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {displayPlays.slice(0, 8).map((play) => {
                  const isUserPlay = userPlayerIds.has(play.playerId);

                  return (
                    <div
                      key={play.id}
                      className={`flex flex-wrap items-center justify-between gap-3 p-3 font-mono transition-all border ${
                        isUserPlay
                          ? 'bg-orange-950/20 border-orange-500/40 text-orange-200'
                          : 'bg-white/5 border-white/10 text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 text-white font-bold uppercase shrink-0">
                          Q{play.quarter} {play.clock}
                        </span>
                        <span className="font-bold text-orange-400 shrink-0">[{play.playerTeam}]</span>
                        <span className="text-xs font-bold text-white uppercase tracking-tight truncate">
                          {play.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 ml-auto text-xs shrink-0">
                        <span className="bg-white text-black px-2 py-0.5 font-display font-black text-xs uppercase">
                          {play.fantasyPointsDelta > 0 ? `+${play.fantasyPointsDelta}` : play.fantasyPointsDelta} FP
                        </span>
                        {play.affectedGroupMembers.length > 0 && (
                          <span className="text-[10px] text-white/50 uppercase hidden md:inline">
                            {play.affectedGroupMembers.map((m) => m.teamName).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
