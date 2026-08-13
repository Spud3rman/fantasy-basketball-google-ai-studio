import React from 'react';
import { X, UserCheck, Plus, Check, Edit2 } from 'lucide-react';
import { GroupMember, League } from '../types';
import { AvatarPicker } from './AvatarPicker';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League | null;
  activeMember: GroupMember | null;
  onSelectMember: (member: GroupMember) => void;
  onJoinLeague: (userName: string, teamName: string) => Promise<void>;
  onUpdateMemberName?: (memberId: string, userName: string, teamName: string, avatar?: string) => Promise<void>;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  league,
  activeMember,
  onSelectMember,
  onJoinLeague,
  onUpdateMemberName,
}) => {
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState('');
  const [newTeamName, setNewTeamName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Editing state inside switcher
  const [editingMemberId, setEditingMemberId] = React.useState<string | null>(null);
  const [editUserName, setEditUserName] = React.useState('');
  const [editTeamName, setEditTeamName] = React.useState('');
  const [editAvatar, setEditAvatar] = React.useState('');

  if (!isOpen || !league) return null;

  const handleStartEdit = (e: React.MouseEvent, member: GroupMember) => {
    e.stopPropagation();
    setEditingMemberId(member.id);
    setEditUserName(member.userName);
    setEditTeamName(member.teamName);
    setEditAvatar(member.avatar);
  };

  const handleSaveEdit = async (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    if (!editUserName.trim() || !editTeamName.trim() || !onUpdateMemberName) return;
    setIsSubmitting(true);
    try {
      await onUpdateMemberName(memberId, editUserName.trim(), editTeamName.trim(), editAvatar);
      setEditingMemberId(null);
    } catch (err) {
      console.error('Failed to update member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    setIsSubmitting(true);
    try {
      await onJoinLeague(newUserName, newTeamName || `${newUserName}'s Ballers`);
      setNewUserName('');
      setNewTeamName('');
      setIsAddingNew(false);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error joining league');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
            Select Member Identity
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-white/50 font-mono uppercase">
          Switch which group team you are managing on this device, or join as a new member in "{league.name}".
        </p>

        {/* Existing Members List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {league.members.map((member) => {
            const isSelected = member.id === activeMember?.id;
            const isEditing = editingMemberId === member.id;

            return (
              <div
                key={member.id}
                className={`p-3 border text-left flex items-center justify-between gap-3 transition-all ${
                  isSelected
                    ? 'bg-orange-500/10 border-orange-500 text-orange-500 font-bold'
                    : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                }`}
              >
                {isEditing ? (
                  <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
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
                      <div>
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => setEditingMemberId(null)}
                        className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 text-[10px] uppercase tracking-wider font-mono rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => handleSaveEdit(e, member.id)}
                        disabled={isSubmitting}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 text-[10px] uppercase tracking-wider font-mono font-bold rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onSelectMember(member);
                        onClose();
                      }}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <img src={member.avatar} alt={member.userName} className="w-8 h-8 object-cover border border-white/20" />
                      <div>
                        <p className="text-xs font-bold uppercase flex items-center gap-1.5">
                          <span>{member.userName}</span>
                          {isSelected && <span className="text-[9px] text-orange-500 font-mono">(Active)</span>}
                        </p>
                        <p className="text-[10px] text-white/40 font-mono uppercase">{member.teamName}</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleStartEdit(e, member)}
                        className="p-1.5 bg-white/5 hover:bg-orange-500 hover:text-black text-white/60 rounded border border-white/10 transition-colors"
                        title="Edit Manager / Team Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isSelected && <Check className="w-4 h-4 text-orange-500" />}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!isAddingNew ? (
          <button
            onClick={() => setIsAddingNew(true)}
            className="w-full bg-orange-500 hover:bg-orange-400 text-black font-display font-black py-3 text-xs uppercase tracking-wider transition-all -skew-x-6"
          >
            + Add / Join As New Member
          </button>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-3 pt-3 border-t border-white/10 text-xs font-mono">
            <div>
              <label className="block text-white/50 mb-1 font-bold uppercase">Your Name</label>
              <input
                type="text"
                placeholder="E.G. CHRIS"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 font-bold uppercase">Team Name</label>
              <input
                type="text"
                placeholder="E.G. SKY HOOKERS"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 uppercase font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-display font-black text-xs uppercase tracking-wider transition-all -skew-x-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider transition-all -skew-x-6"
              >
                {isSubmitting ? 'JOINING...' : 'JOIN GROUP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
