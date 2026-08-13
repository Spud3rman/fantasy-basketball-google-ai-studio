import React, { useState } from 'react';
import { Layers, Star, ArrowUpDown, ChevronDown, CheckCircle, Shield, TrendingUp, Edit2, Check, X, Camera } from 'lucide-react';
import { League, GroupMember, Player, RosterPlayer } from '../types';
import { AvatarPicker } from './AvatarPicker';

interface MyRosterProps {
  league: League | null;
  activeMember: GroupMember | null;
  players: Player[];
  onUpdateRosterSlot: (playerId: string, newSlot: string, isStarter: boolean) => void;
  onNavigateToTab: (tab: string) => void;
  onUpdateMemberName?: (memberId: string, userName: string, teamName: string, avatar?: string) => Promise<void>;
}

export const MyRoster: React.FC<MyRosterProps> = ({
  league,
  activeMember,
  players,
  onUpdateRosterSlot,
  onNavigateToTab,
  onUpdateMemberName,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = React.useState<string | null>(null);

  // Name & avatar editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    if (!activeMember) return;
    setEditUserName(activeMember.userName);
    setEditTeamName(activeMember.teamName);
    setEditAvatar(activeMember.avatar);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!activeMember || !editUserName.trim() || !editTeamName.trim() || !onUpdateMemberName) return;
    setIsSaving(true);
    try {
      await onUpdateMemberName(activeMember.id, editUserName.trim(), editTeamName.trim(), editAvatar);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeMember) {
    return (
      <div className="p-8 text-center text-white/50 font-mono uppercase tracking-widest bg-black border border-white/10">
        <p>Please select or join as a group member first.</p>
      </div>
    );
  }

  const rosterItems = activeMember.roster;
  const starters = rosterItems.filter((r) => r.isStarter);
  const bench = rosterItems.filter((r) => !r.isStarter);

  const handleToggleStarter = (item: RosterPlayer) => {
    if (item.isStarter) {
      onUpdateRosterSlot(item.playerId, 'BENCH', false);
    } else {
      const p = players.find((x) => x.id === item.playerId);
      const targetSlot = p?.position || 'UTIL';
      onUpdateRosterSlot(item.playerId, targetSlot, true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-black border border-white/10 p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={isEditing ? editAvatar : activeMember.avatar}
              alt={activeMember.userName}
              className="w-16 h-16 object-cover border-2 border-orange-500 shadow-md"
            />
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase tracking-wider text-orange-500 font-bold block">Team Name</label>
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        className="bg-white/10 border border-orange-500 text-white px-2 py-1 text-sm font-mono font-bold rounded focus:outline-none"
                        placeholder="Team name..."
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase tracking-wider text-orange-500 font-bold block">Manager Name</label>
                      <input
                        type="text"
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        className="bg-white/10 border border-orange-500 text-white px-2 py-1 text-sm font-mono font-bold rounded focus:outline-none"
                        placeholder="Manager name..."
                      />
                    </div>
                    <div className="flex items-center gap-1 self-end pb-1">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-white/10 hover:bg-white/20 text-white px-2 py-1.5 rounded text-xs font-bold uppercase tracking-wider"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">
                    {activeMember.teamName}
                  </h2>
                  <span className="bg-orange-500 text-black text-xs px-2 py-0.5 font-black italic -skew-x-12 tracking-widest uppercase">
                    {activeMember.userName}
                  </span>
                  <button
                    onClick={handleStartEdit}
                    className="bg-white/10 hover:bg-orange-500 hover:text-black text-white px-2.5 py-1.5 rounded transition-all border border-white/20 ml-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    title="Edit Team Name, Manager Name & Photo"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                </div>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">
                ACTIVE STARTERS: {starters.length}/5 • TOTAL ROSTER: {rosterItems.length} PLAYERS
              </p>
            </div>
          </div>

          <div className="bg-white/5 px-6 py-3 border border-white/10 font-mono">
            <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Team Score</div>
            <div className="text-2xl font-black text-orange-500">{activeMember.totalPoints} FP</div>
          </div>
        </div>

        {isEditing && (
          <div className="pt-2 border-t border-white/10">
            <AvatarPicker
              currentAvatar={editAvatar}
              onSelectAvatar={(url) => setEditAvatar(url)}
            />
          </div>
        )}
      </div>

      {rosterItems.length === 0 ? (
        <div className="bg-black border border-white/10 p-12 text-center space-y-4">
          <div className="text-4xl font-display font-black italic text-orange-500">
            EMPTY ROSTER.
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 max-w-md mx-auto">
            Draft NBA star players in the live draft board to populate your fantasy roster and compete with your group!
          </p>
          <button
            onClick={() => onNavigateToTab('draft')}
            className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-6 py-3 text-sm uppercase tracking-wider transition-all -skew-x-6"
          >
            Go to Live Draft Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Starting Lineup Slots */}
          <div className="lg:col-span-2 space-y-6">
            {/* Starters Block */}
            <div className="bg-black border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white flex items-center gap-2">
                  <span>Starting Lineup (5 Starters)</span>
                </h3>
                <span className="text-[10px] text-orange-500 font-mono font-bold uppercase tracking-widest">
                  ACCUMULATES FANTASY PTS
                </span>
              </div>

              <div className="space-y-3">
                {starters.map((item) => {
                  const player = players.find((p) => p.id === item.playerId);
                  if (!player) return null;

                  return (
                    <div
                      key={item.playerId}
                      className="bg-white/5 border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4 hover:border-orange-500 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="bg-orange-500 text-black font-display font-black text-xs uppercase -skew-x-6 px-3 py-1">
                          {item.slot}
                        </span>
                        <img
                          src={player.avatarUrl}
                          alt={player.name}
                          className="w-12 h-12 object-cover border border-white/20"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base uppercase tracking-tight">{player.name}</h4>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/10 text-white">
                              {player.team}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 font-mono uppercase mt-0.5">
                            {player.position} • RANK #{player.rank} • SEASON AVG: {player.seasonStats.fantasyAvg} FP
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right font-mono pr-2">
                          <p className="text-base font-black text-orange-500">
                            {player.seasonStats.fantasyAvg} FP/g
                          </p>
                          <p className="text-[10px] text-white/40 uppercase">
                            {player.seasonStats.pts}P {player.seasonStats.reb}R {player.seasonStats.ast}A
                          </p>
                        </div>

                        <button
                          onClick={() => handleToggleStarter(item)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-display font-black text-xs uppercase tracking-wider transition-all -skew-x-6"
                        >
                          Bench
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bench Block */}
            <div className="bg-black border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white/70">
                  Bench Reserves
                </h3>
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">RESERVE PLAYERS</span>
              </div>

              {bench.length === 0 ? (
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest text-center py-4">No reserves on bench.</p>
              ) : (
                <div className="space-y-3">
                  {bench.map((item) => {
                    const player = players.find((p) => p.id === item.playerId);
                    if (!player) return null;

                    return (
                      <div
                        key={item.playerId}
                        className="bg-white/5 border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4 hover:border-white/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span className="bg-white/20 text-white font-display font-black text-xs uppercase -skew-x-6 px-3 py-1">
                            BN
                          </span>
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            className="w-11 h-11 object-cover border border-white/10"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm uppercase tracking-tight">{player.name}</h4>
                              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/10 text-white/60">
                                {player.team}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 font-mono uppercase mt-0.5">
                              {player.position} • AVG: {player.seasonStats.fantasyAvg} FP
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                          <button
                            onClick={() => handleToggleStarter(item)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider transition-all -skew-x-6"
                          >
                            Set Starter
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Roster Stat Totals & Category Projections */}
          <div className="bg-black border border-white/10 p-6 space-y-5 h-fit">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-white border-b border-white/10 pb-3">
              Roster Averages
            </h3>

            {(() => {
              const rosterPlayers = rosterItems
                .map((r) => players.find((p) => p.id === r.playerId))
                .filter(Boolean) as Player[];

              if (rosterPlayers.length === 0) return null;

              const avgPts = Math.round((rosterPlayers.reduce((a, b) => a + b.seasonStats.pts, 0) / rosterPlayers.length) * 10) / 10;
              const avgReb = Math.round((rosterPlayers.reduce((a, b) => a + b.seasonStats.reb, 0) / rosterPlayers.length) * 10) / 10;
              const avgAst = Math.round((rosterPlayers.reduce((a, b) => a + b.seasonStats.ast, 0) / rosterPlayers.length) * 10) / 10;
              const avgStl = Math.round((rosterPlayers.reduce((a, b) => a + b.seasonStats.stl, 0) / rosterPlayers.length) * 10) / 10;
              const avgBlk = Math.round((rosterPlayers.reduce((a, b) => a + b.seasonStats.blk, 0) / rosterPlayers.length) * 10) / 10;

              return (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                    <span className="text-white/60 font-bold uppercase">Points (PTS)</span>
                    <span className="font-black text-orange-500 text-base">{avgPts} avg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                    <span className="text-white/60 font-bold uppercase">Rebounds (REB)</span>
                    <span className="font-black text-orange-500 text-base">{avgReb} avg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                    <span className="text-white/60 font-bold uppercase">Assists (AST)</span>
                    <span className="font-black text-orange-500 text-base">{avgAst} avg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                    <span className="text-white/60 font-bold uppercase">Steals (STL)</span>
                    <span className="font-black text-orange-500 text-base">{avgStl} avg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                    <span className="text-white/60 font-bold uppercase">Blocks (BLK)</span>
                    <span className="font-black text-orange-500 text-base">{avgBlk} avg</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
