import React from 'react';
import { X, Copy, Check, UserPlus, LogIn, PlusCircle, Users } from 'lucide-react';
import { League } from '../types';
import { cleanLeagueCode } from '../services/clientStore';

interface LeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  league?: League | null;
  onCreateLeague: (data: {
    name: string;
    userName: string;
    teamName: string;
    maxTeams: number;
  }) => Promise<void>;
  onJoinLeagueByCode: (data: {
    code: string;
    userName: string;
    teamName: string;
  }) => Promise<void>;
  onAddMemberToCurrentLeague?: (userName: string, teamName: string) => Promise<void>;
}

export const LeagueModal: React.FC<LeagueModalProps> = ({
  isOpen,
  onClose,
  league,
  onCreateLeague,
  onJoinLeagueByCode,
  onAddMemberToCurrentLeague,
}) => {
  const [tab, setTab] = React.useState<'invite' | 'join' | 'create'>('invite');

  // Direct add member state
  const [addUserName, setAddUserName] = React.useState('');
  const [addTeamName, setAddTeamName] = React.useState('');
  const [addSuccessMsg, setAddSuccessMsg] = React.useState<string | null>(null);

  // Join by code state
  const [joinCode, setJoinCode] = React.useState('');
  const [joinUserName, setJoinUserName] = React.useState('');
  const [joinTeamName, setJoinTeamName] = React.useState('');

  // Create league state
  const [createLeagueName, setCreateLeagueName] = React.useState('');
  const [createUserName, setCreateUserName] = React.useState('');
  const [createTeamName, setCreateTeamName] = React.useState('');
  const [createMaxTeams, setCreateMaxTeams] = React.useState(4);

  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setAddSuccessMsg(null);
      if (league) {
        setTab('invite');
      } else {
        setTab('join');
      }
    }
  }, [isOpen, league]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (league?.code) {
      navigator.clipboard.writeText(league.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserName.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setAddSuccessMsg(null);

    try {
      if (onAddMemberToCurrentLeague) {
        await onAddMemberToCurrentLeague(
          addUserName.trim(),
          addTeamName.trim() || `${addUserName.trim()}'s Squad`
        );
      } else if (league) {
        await onJoinLeagueByCode({
          code: league.code,
          userName: addUserName.trim(),
          teamName: addTeamName.trim() || `${addUserName.trim()}'s Squad`,
        });
      }
      setAddSuccessMsg(`Successfully added ${addUserName.trim()} to ${league?.name || 'the league'}!`);
      setAddUserName('');
      setAddTeamName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add member to league');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCode = cleanLeagueCode(joinCode);
    if (!cleanedCode || !joinUserName.trim()) {
      setErrorMessage('Please provide both a league code and your name');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onJoinLeagueByCode({
        code: cleanedCode,
        userName: joinUserName.trim(),
        teamName: joinTeamName.trim() || `${joinUserName.trim()}'s Ballers`,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to join league. Please double-check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createLeagueName.trim() || !createUserName.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onCreateLeague({
        name: createLeagueName.trim(),
        userName: createUserName.trim(),
        teamName: createTeamName.trim() || `${createUserName.trim()}'s Legends`,
        maxTeams: createMaxTeams,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create league');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Fantasy League Management
            </h3>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Success Feedback Alerts */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 text-xs font-mono">
            <span className="font-bold uppercase tracking-wider block mb-0.5">Note:</span>
            {errorMessage}
          </div>
        )}

        {addSuccessMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{addSuccessMsg}</span>
          </div>
        )}

        {/* 3 Tabs: Invite / Add Member, Join by Code, Create League */}
        <div className="grid grid-cols-3 p-1 bg-white/5 border border-white/10 text-xs font-display font-black uppercase tracking-wider">
          <button
            onClick={() => {
              setTab('invite');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 text-center transition-all ${
              tab === 'invite' ? 'bg-orange-500 text-black -skew-x-6' : 'text-white/60 hover:text-white'
            }`}
          >
            Add / Invite
          </button>
          <button
            onClick={() => {
              setTab('join');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 text-center transition-all ${
              tab === 'join' ? 'bg-orange-500 text-black -skew-x-6' : 'text-white/60 hover:text-white'
            }`}
          >
            Join League
          </button>
          <button
            onClick={() => {
              setTab('create');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 text-center transition-all ${
              tab === 'create' ? 'bg-orange-500 text-black -skew-x-6' : 'text-white/60 hover:text-white'
            }`}
          >
            New League
          </button>
        </div>

        {/* Tab 1: Add Someone to Active League / Share Code */}
        {tab === 'invite' && (
          <div className="space-y-4">
            {league ? (
              <>
                {/* Active League Shareable Banner */}
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/30 p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400">
                        Active League
                      </div>
                      <div className="font-display font-black text-lg text-white uppercase tracking-tight">
                        {league.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-white/50">Teams</div>
                      <div className="font-mono text-sm font-bold text-white">
                        {league.members.length} / {league.maxTeams}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/60 border border-white/10 p-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-wider text-white/50">
                        Share This Join Code With Friends:
                      </div>
                      <div className="font-mono font-black text-xl text-orange-400 tracking-widest uppercase">
                        {league.code}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs px-3 py-1.5 -skew-x-6 transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY CODE</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-white/60 mt-2">
                    Anyone with this code can click <strong className="text-white">"Join League"</strong> and enter{' '}
                    <span className="text-orange-400 font-bold">{league.code}</span> to join this draft and scoreboard.
                  </p>
                </div>

                {/* Direct Add Member Form */}
                <div className="border-t border-white/10 pt-3">
                  <h4 className="font-display font-black text-sm uppercase tracking-wider text-white mb-1 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-orange-500" />
                    <span>Directly Add Someone To This League</span>
                  </h4>
                  <p className="text-[11px] font-mono text-white/50 mb-3">
                    Add a friend or teammate directly without them needing to enter the code:
                  </p>

                  <form onSubmit={handleAddMemberSubmit} className="space-y-3 text-xs font-mono">
                    <div>
                      <label className="block text-white/60 mb-1 font-bold uppercase">
                        Friend / Player Name
                      </label>
                      <input
                        type="text"
                        placeholder="E.G. BOB"
                        value={addUserName}
                        onChange={(e) => setAddUserName(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 mb-1 font-bold uppercase">
                        Team Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="E.G. BOB'S BUCKETS"
                        value={addTeamName}
                        onChange={(e) => setAddTeamName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-orange-500 hover:bg-orange-400 text-black font-display font-black py-2.5 text-xs uppercase tracking-wider transition-all -skew-x-6 mt-1 flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isLoading ? 'ADDING TO LEAGUE...' : `ADD TO ${league.name.toUpperCase()}`}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-white/60 font-mono text-xs">
                No active league selected. Use the tabs above to join or create a league.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Join League with Code */}
        {tab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-white/60 font-bold uppercase">League Join Code</label>
                <button
                  type="button"
                  onClick={() => setJoinCode('SWOOSH1')}
                  className="text-[10px] text-orange-400 hover:underline uppercase font-bold"
                >
                  Use Default (SWOOSH1)
                </button>
              </div>
              <input
                type="text"
                placeholder="E.G. SWOOSH1"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-mono font-bold focus:outline-none focus:border-orange-500 tracking-wider"
              />
              <p className="text-[10px] text-white/40 mt-1">
                Accepts codes like SWOOSH1, SWOOSH77, or any custom league code (case-insensitive).
              </p>
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-bold uppercase">Your Name</label>
              <input
                type="text"
                placeholder="E.G. JORDAN"
                value={joinUserName}
                onChange={(e) => setJoinUserName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-bold uppercase">Team Name</label>
              <input
                type="text"
                placeholder="E.G. COAST TO COAST"
                value={joinTeamName}
                onChange={(e) => setJoinTeamName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-display font-black py-3 text-xs uppercase tracking-wider transition-all -skew-x-6 mt-3 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'JOINING LEAGUE...' : 'JOIN GROUP LEAGUE'}
            </button>
          </form>
        )}

        {/* Tab 3: Create Brand New League */}
        {tab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-white/60 mb-1 font-bold uppercase">League Name</label>
              <input
                type="text"
                placeholder="E.G. FRIDAY NIGHT HOOPS"
                value={createLeagueName}
                onChange={(e) => setCreateLeagueName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-bold uppercase">Your Name (Host)</label>
              <input
                type="text"
                placeholder="E.G. ALEX"
                value={createUserName}
                onChange={(e) => setCreateUserName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-bold uppercase">Team Name</label>
              <input
                type="text"
                placeholder="E.G. DOWNTOWN DAGGERS"
                value={createTeamName}
                onChange={(e) => setCreateTeamName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-bold uppercase">Max Teams Limit</label>
              <select
                value={createMaxTeams}
                onChange={(e) => setCreateMaxTeams(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-orange-500"
              >
                <option value={4} className="bg-black text-white">4 Teams</option>
                <option value={6} className="bg-black text-white">6 Teams</option>
                <option value={8} className="bg-black text-white">8 Teams</option>
                <option value={10} className="bg-black text-white">10 Teams</option>
                <option value={12} className="bg-black text-white">12 Teams</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-display font-black py-3 text-xs uppercase tracking-wider transition-all -skew-x-6 mt-3 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {isLoading ? 'CREATING...' : 'CREATE NEW LEAGUE'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
