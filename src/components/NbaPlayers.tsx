import React from 'react';
import { Search, Users, Activity, RefreshCw, Check } from 'lucide-react';
import { Player, LiveGame } from '../types';
import { ApiService } from '../services/api';

interface NbaPlayersProps {
  players: Player[];
  games: LiveGame[];
  onPlayersUpdated?: (players: Player[]) => void;
}

export const NbaPlayers: React.FC<NbaPlayersProps> = ({ players, games, onPlayersUpdated }) => {
  const [search, setSearch] = React.useState('');
  const [posFilter, setPosFilter] = React.useState('ALL');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);
  const [syncError, setSyncError] = React.useState<string | null>(null);

  const handleSyncRealData = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    setSyncError(null);
    try {
      const res = await ApiService.syncRealNbaData();
      setSyncStatus(`Synced ${res.syncedPlayersCount} real players & ${res.syncedGamesCount} games!`);
      const updatedPlayers = await ApiService.getPlayers();
      if (onPlayersUpdated) {
        onPlayersUpdated(updatedPlayers);
      }
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err: any) {
      setSyncError(err?.message || 'Failed to sync with ESPN API');
      setTimeout(() => setSyncError(null), 6000);
    } finally {
      setIsSyncing(false);
    }
  };

  const filtered = players.filter((p) => {
    if (posFilter !== 'ALL' && p.position !== posFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.team.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-black border border-white/10 p-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">
              NBA PLAYERS DIRECTORY.
            </h2>
            <button
              onClick={handleSyncRealData}
              disabled={isSyncing}
              className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase px-3 py-1.5 transition-all -skew-x-6 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing ESPN Live...' : 'Sync ESPN Official NBA Data'}</span>
            </button>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">
            STATISTICS, RANKINGS & LIVE GAME PERFORMANCE • OFFICIAL ESPN API INTEGRATED
          </p>
          {syncStatus && (
            <p className="text-xs font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{syncStatus}</span>
            </p>
          )}
          {syncError && (
            <p className="text-xs font-mono font-bold text-rose-400 mt-1 flex items-center gap-1">
              <span>⚠️ {syncError}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="SEARCH PLAYER..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 font-mono focus:outline-none focus:border-orange-500 uppercase"
            />
          </div>

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
      </div>

      {/* Players Grid / Table */}
      <div className="bg-black border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 font-mono font-bold uppercase tracking-wider">
                <th className="p-4">Rank</th>
                <th className="p-4">Player</th>
                <th className="p-4">Team</th>
                <th className="p-4">Pos</th>
                <th className="p-4 text-right">PTS</th>
                <th className="p-4 text-right">REB</th>
                <th className="p-4 text-right">AST</th>
                <th className="p-4 text-right">STL</th>
                <th className="p-4 text-right">BLK</th>
                <th className="p-4 text-right">3PM</th>
                <th className="p-4 text-right">Fantasy Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono">
              {filtered.map((player) => (
                <tr key={player.id} className="hover:bg-white/5 transition-colors text-white/80">
                  <td className="p-4 font-bold text-white/40">#{player.rank}</td>

                  <td className="p-4 font-bold text-white uppercase tracking-tight">
                    <div className="flex items-center gap-3">
                      <img
                        src={player.avatarUrl}
                        alt={player.name}
                        className="w-8 h-8 object-cover border border-white/20"
                      />
                      <span>{player.name}</span>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-white/70">{player.team}</td>

                  <td className="p-4">
                    <span className="bg-orange-500 text-black font-display font-black text-xs uppercase -skew-x-6 px-2.5 py-0.5">
                      {player.position}
                    </span>
                  </td>

                  <td className="p-4 text-right font-bold text-white">{player.seasonStats.pts}</td>
                  <td className="p-4 text-right">{player.seasonStats.reb}</td>
                  <td className="p-4 text-right">{player.seasonStats.ast}</td>
                  <td className="p-4 text-right">{player.seasonStats.stl}</td>
                  <td className="p-4 text-right">{player.seasonStats.blk}</td>
                  <td className="p-4 text-right">{player.seasonStats.fg3m}</td>

                  <td className="p-4 text-right font-black text-orange-500 text-base">
                    {player.seasonStats.fantasyAvg} FP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
