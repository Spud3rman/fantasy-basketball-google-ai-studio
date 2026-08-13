import React, { useState } from 'react';
import { Award, Trophy, Sparkles, Bot, TrendingUp, Users, Flame, RefreshCw, Edit2, Check, X } from 'lucide-react';
import { League, GroupMember } from '../types';
import { ApiService } from '../services/api';
import { AvatarPicker } from './AvatarPicker';

interface LeaderboardProps {
  league: League | null;
  activeMember: GroupMember | null;
  onUpdateMemberName?: (memberId: string, userName: string, teamName: string, avatar?: string) => Promise<void>;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ league, activeMember, onUpdateMemberName }) => {
  const [recapText, setRecapText] = React.useState<string | null>(null);
  const [isGeneratingRecap, setIsGeneratingRecap] = React.useState(false);

  // Edit state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!league) return null;

  const standings = [...league.members].sort((a, b) => b.totalPoints - a.totalPoints);

  const handleGenerateRecap = async () => {
    setIsGeneratingRecap(true);
    try {
      const res = await ApiService.getAiMatchupRecap(league.id);
      setRecapText(res.recap);
    } catch (e) {
      setRecapText('Unable to generate AI recap at this time.');
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  const handleStartEdit = (member: GroupMember) => {
    setEditingMemberId(member.id);
    setEditUserName(member.userName);
    setEditTeamName(member.teamName);
    setEditAvatar(member.avatar);
  };

  const handleSaveEdit = async (memberId: string) => {
    if (!editUserName.trim() || !editTeamName.trim() || !league) return;
    setIsSaving(true);
    try {
      if (onUpdateMemberName) {
        await onUpdateMemberName(memberId, editUserName.trim(), editTeamName.trim(), editAvatar);
      } else {
        await ApiService.updateMemberName(league.id, memberId, editUserName.trim(), editTeamName.trim(), editAvatar);
      }
      setEditingMemberId(null);
    } catch (err) {
      console.error('Failed to update member:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-black border border-white/10 p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 text-black flex items-center justify-center font-display font-black text-2xl -skew-x-6">
              🏆
            </div>
            <div>
              <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">
                {league.name} STANDINGS.
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">
                LEAGUE LEADERBOARD • MEMBER COUNT: {league.members.length} • EDIT ANY TEAM NAME BELOW
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateRecap}
            disabled={isGeneratingRecap}
            className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-6 py-3 text-xs uppercase tracking-wider transition-all -skew-x-6"
          >
            {isGeneratingRecap ? 'Generating...' : 'Generate AI Weekly Commentary'}
          </button>
        </div>

        {/* AI Commentary Card */}
        {recapText && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 p-4 border border-white/10 text-xs text-white leading-relaxed font-mono">
              <div className="font-bold text-orange-500 mb-1 uppercase tracking-wider">
                Gemini League Recap & Commentary:
              </div>
              <p>{recapText}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-black border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 font-mono font-bold uppercase tracking-wider">
                <th className="p-4">Rank</th>
                <th className="p-4">Group Member</th>
                <th className="p-4">Team Name</th>
                <th className="p-4 text-center">Roster Size</th>
                <th className="p-4 text-right">Week 1 FP</th>
                <th className="p-4 text-right">Total FP</th>
                <th className="p-4 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {standings.map((member, idx) => {
                const isMe = member.id === activeMember?.id;
                const isEditing = editingMemberId === member.id;

                return (
                  <tr
                    key={member.id}
                    className={`transition-all ${
                      isMe
                        ? 'bg-orange-500/10 font-bold text-white'
                        : 'bg-black hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <td className="p-4 font-mono font-extrabold">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-8 h-8 font-display font-black text-xs flex items-center justify-center ${
                            idx === 0
                              ? 'bg-orange-500 text-black -skew-x-6'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Member Name Column */}
                    <td className="p-4" colSpan={isEditing ? 2 : 1}>
                      {isEditing ? (
                        <div className="space-y-3 p-2 bg-black/60 border border-orange-500/50 rounded">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider text-orange-500 font-bold block">
                                Manager Name
                              </label>
                              <input
                                type="text"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className="bg-white/10 border border-orange-500 text-white px-2 py-1 text-xs font-mono font-bold rounded focus:outline-none w-full"
                                placeholder="Manager name..."
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider text-orange-500 font-bold block">
                                Team Name
                              </label>
                              <input
                                type="text"
                                value={editTeamName}
                                onChange={(e) => setEditTeamName(e.target.value)}
                                className="bg-white/10 border border-orange-500 text-white px-2 py-1 text-xs font-mono font-bold rounded focus:outline-none w-full"
                                placeholder="Team name..."
                              />
                            </div>
                          </div>
                          <AvatarPicker
                            currentAvatar={editAvatar}
                            onSelectAvatar={(url) => setEditAvatar(url)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.userName}
                            className="w-8 h-8 object-cover border border-white/20"
                          />
                          <div>
                            <p className="font-bold text-white uppercase tracking-tight">
                              {member.userName} {isMe && <span className="text-orange-500">(YOU)</span>}
                            </p>
                            {member.isHost && (
                              <span className="text-[10px] text-white/40 font-mono uppercase">League Host</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Team Name Column */}
                    {!isEditing && (
                      <td className="p-4 font-bold text-white uppercase">
                        {member.teamName}
                      </td>
                    )}

                    <td className="p-4 text-center font-mono">
                      {member.roster.filter((r) => r.isStarter).length} Starters / {member.roster.length} Total
                    </td>

                    <td className="p-4 text-right font-mono font-bold text-white">
                      {member.weeklyPoints[1] || 0} FP
                    </td>

                    <td className="p-4 text-right font-mono font-black text-orange-500 text-base">
                      {member.totalPoints} FP
                    </td>

                    {/* Edit Actions Column */}
                    <td className="p-4 text-center font-mono">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(member.id)}
                            disabled={isSaving}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black p-1.5 rounded transition-all font-bold"
                            title="Save Changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingMemberId(null)}
                            className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded transition-all"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(member)}
                          className="bg-white/5 hover:bg-orange-500 hover:text-black text-white/60 p-2 rounded transition-all border border-white/10"
                          title="Edit Manager / Team Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

