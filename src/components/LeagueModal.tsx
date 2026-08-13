import React from 'react';
import { X, Plus, Users, ArrowRight, ShieldCheck, Copy } from 'lucide-react';

interface LeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const LeagueModal: React.FC<LeagueModalProps> = ({
  isOpen,
  onClose,
  onCreateLeague,
  onJoinLeagueByCode,
}) => {
  const [tab, setTab] = React.useState<'join' | 'create'>('join');

  const [joinCode, setJoinCode] = React.useState('');
  const [joinUserName, setJoinUserName] = React.useState('');
  const [joinTeamName, setJoinTeamName] = React.useState('');

  const [createLeagueName, setCreateLeagueName] = React.useState('');
  const [createUserName, setCreateUserName] = React.useState('');
  const [createTeamName, setCreateTeamName] = React.useState('');
  const [createMaxTeams, setCreateMaxTeams] = React.useState(4);

  const [isLoading, setIsLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || !joinUserName) return;
    setIsLoading(true);
    try {
      await onJoinLeagueByCode({
        code: joinCode,
        userName: joinUserName,
        teamName: joinTeamName || `${joinUserName}'s Ballers`,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to join league');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createLeagueName || !createUserName) return;
    setIsLoading(true);
    try {
      await onCreateLeague({
        name: createLeagueName,
        userName: createUserName,
        teamName: createTeamName || `${createUserName}'s Legends`,
        maxTeams: createMaxTeams,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create league');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
            Fantasy League Setup
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 text-xs font-display font-black uppercase tracking-wider">
          <button
            onClick={() => setTab('join')}
            className={`py-2 transition-all ${
              tab === 'join' ? 'bg-orange-500 text-black -skew-x-6' : 'text-white/50 hover:text-white'
            }`}
          >
            Join League
          </button>
          <button
            onClick={() => setTab('create')}
            className={`py-2 transition-all ${
              tab === 'create' ? 'bg-orange-500 text-black -skew-x-6' : 'text-white/50 hover:text-white'
            }`}
          >
            Create League
          </button>
        </div>

        {tab === 'join' ? (
          <form onSubmit={handleJoinSubmit} className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-white/50 mb-1 font-bold uppercase">Join Code</label>
              <input
                type="text"
                placeholder="E.G. SWOOSH1"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-mono font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 font-bold uppercase">Your Name</label>
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
              <label className="block text-white/50 mb-1 font-bold uppercase">Team Name</label>
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
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-display font-black py-3 text-xs uppercase tracking-wider transition-all -skew-x-6 mt-3"
            >
              {isLoading ? 'JOINING...' : 'JOIN GROUP LEAGUE'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-white/50 mb-1 font-bold uppercase">League Name</label>
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
              <label className="block text-white/50 mb-1 font-bold uppercase">Your Name (Host)</label>
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
              <label className="block text-white/50 mb-1 font-bold uppercase">Team Name</label>
              <input
                type="text"
                placeholder="E.G. DOWNTOWN DAGGERS"
                value={createTeamName}
                onChange={(e) => setCreateTeamName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white uppercase font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 font-bold uppercase">Max Teams Limit</label>
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
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-display font-black py-3 text-xs uppercase tracking-wider transition-all -skew-x-6 mt-3"
            >
              {isLoading ? 'CREATING...' : 'CREATE NEW LEAGUE'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
