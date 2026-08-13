import React from 'react';
import {
  Trophy,
  Users,
  Play,
  Zap,
  Pause,
  Award,
  Layers,
  Settings,
  PlusCircle,
  Copy,
  Check,
  UserCheck,
  Radio,
} from 'lucide-react';
import { League, GroupMember } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  league: League | null;
  activeMember: GroupMember | null;
  simMode: 'live' | 'fast' | 'pause';
  onSimControl: (mode: 'live' | 'fast' | 'pause') => void;
  onOpenUserModal: () => void;
  onOpenLeagueModal: () => void;
  onOpenScoringModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  league,
  activeMember,
  simMode,
  onSimControl,
  onOpenUserModal,
  onOpenLeagueModal,
  onOpenScoringModal,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    if (league?.code) {
      navigator.clipboard.writeText(league.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="bg-black border-b border-white/10 sticky top-0 z-40 shadow-2xl">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
        {/* Logo and League Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-display font-black italic tracking-tighter uppercase text-white flex items-center gap-2">
              <span>COURTVISION.</span>
              <span className="bg-orange-500 text-black text-xs px-2 py-0.5 font-black italic -skew-x-12 tracking-widest">
                FANTASY
              </span>
            </div>
          </div>

          {/* Active League Badge */}
          {league && (
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1 border border-white/10 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">LEAGUE:</span>
              <span className="font-bold uppercase tracking-tight text-orange-500">{league.name}</span>
              <span className="text-white/20">|</span>
              <button
                onClick={handleCopyCode}
                title="Copy League Join Code"
                className="flex items-center gap-1 font-mono text-xs font-bold text-white/70 hover:text-orange-500 transition-colors uppercase tracking-wider"
              >
                <span>CODE: {league.code}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Right Action Tools: Simulation Speed, User Identity, League Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Simulator Speed Controls */}
          <div className="flex items-center bg-white/5 rounded-none p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => onSimControl('live')}
              className={`px-2.5 py-1 flex items-center gap-1.5 transition-all font-display text-xs font-bold uppercase tracking-wider ${
                simMode === 'live'
                  ? 'bg-emerald-500 text-black font-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>LIVE</span>
            </button>
            <button
              onClick={() => onSimControl('fast')}
              className={`px-2.5 py-1 flex items-center gap-1.5 transition-all font-display text-xs font-bold uppercase tracking-wider ${
                simMode === 'fast'
                  ? 'bg-orange-500 text-black font-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>5X FAST</span>
            </button>
            <button
              onClick={() => onSimControl('pause')}
              className={`px-2.5 py-1 flex items-center gap-1.5 transition-all font-display text-xs font-bold uppercase tracking-wider ${
                simMode === 'pause'
                  ? 'bg-rose-600 text-white font-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Pause className="w-3 h-3" />
              <span>PAUSE</span>
            </button>
          </div>

          {/* User Selector Button */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 bg-black hover:bg-white/10 px-3 py-1.5 border border-white/20 text-xs font-bold uppercase tracking-wider text-white transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-orange-500" />
            <span>{activeMember ? activeMember.userName : 'Select User'}</span>
          </button>

          {/* New / Join League Button */}
          <button
            onClick={onOpenLeagueModal}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 px-3.5 py-1.5 text-black font-display font-black text-xs uppercase tracking-wider transition-all -skew-x-6"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>MY LEAGUE</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto no-scrollbar gap-8 border-t border-white/10 pt-1 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`font-display text-xs font-bold uppercase tracking-widest transition-all pb-1 ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-orange-500 text-white'
              : 'opacity-50 hover:opacity-100 text-white'
          }`}
        >
          Matchup & Live
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`font-display text-xs font-bold uppercase tracking-widest transition-all pb-1 flex items-center gap-1.5 ${
            activeTab === 'roster'
              ? 'border-b-2 border-orange-500 text-white'
              : 'opacity-50 hover:opacity-100 text-white'
          }`}
        >
          <span>My Roster</span>
          {activeMember && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono font-black bg-orange-500 text-black">
              {activeMember.roster.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('draft')}
          className={`font-display text-xs font-bold uppercase tracking-widest transition-all pb-1 flex items-center gap-1.5 ${
            activeTab === 'draft'
              ? 'border-b-2 border-orange-500 text-white'
              : 'opacity-50 hover:opacity-100 text-white'
          }`}
        >
          <span>Draft Board</span>
          {league?.status === 'drafting' && (
            <span className="px-1.5 py-0.5 text-[10px] bg-orange-500 text-black font-black animate-pulse">
              LIVE
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`font-display text-xs font-bold uppercase tracking-widest transition-all pb-1 ${
            activeTab === 'leaderboard'
              ? 'border-b-2 border-orange-500 text-white'
              : 'opacity-50 hover:opacity-100 text-white'
          }`}
        >
          Leaderboard
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`font-display text-xs font-bold uppercase tracking-widest transition-all pb-1 ${
            activeTab === 'players'
              ? 'border-b-2 border-orange-500 text-white'
              : 'opacity-50 hover:opacity-100 text-white'
          }`}
        >
          NBA Players
        </button>

        <button
          onClick={onOpenScoringModal}
          className="ml-auto text-xs font-display font-bold uppercase tracking-widest opacity-50 hover:opacity-100 text-white flex items-center gap-1.5 transition-opacity"
          title="Scoring Rules Customizer"
        >
          <Settings className="w-3.5 h-3.5 text-orange-500" />
          <span className="hidden sm:inline">Scoring Rules</span>
        </button>
      </div>
    </header>
  );
};
