import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Flame,
  Crown,
  Copy,
  Check,
  Sparkles,
  Search,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Snowflake,
  Sliders,
  X,
  Layers,
} from 'lucide-react';
import { League, GroupMember, Player, CustomLeaderboard, CustomLeaderboardEntry, LeaderboardTrend } from '../types';
import { ApiService } from '../services/api';
import { AvatarPicker } from './AvatarPicker';

interface LeaderboardProps {
  league?: League | null;
  activeMember?: GroupMember | null;
  players?: Player[];
  onUpdateMemberName?: (memberId: string, userName: string, teamName: string, avatar?: string) => Promise<void>;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  league,
  activeMember,
  players = [],
}) => {
  const [leaderboards, setLeaderboards] = useState<CustomLeaderboard[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Modals
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [isEditBoardModalOpen, setIsEditBoardModalOpen] = useState(false);
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CustomLeaderboardEntry | null>(null);

  // Create Board Form State
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardCategory, setNewBoardCategory] = useState('Power Rankings');
  const [newBoardMetric, setNewBoardMetric] = useState('Fantasy Points (FP)');
  const [newBoardStarter, setNewBoardStarter] = useState<'blank' | 'nba' | 'league'>('blank');

  // Edit Board Form State
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');
  const [editBoardCategory, setEditBoardCategory] = useState('');
  const [editBoardMetric, setEditBoardMetric] = useState('');

  // Add Entry Form State
  const [addEntryMode, setAddEntryMode] = useState<'custom' | 'nba' | 'league'>('custom');
  const [entryName, setEntryName] = useState('');
  const [entrySubtitle, setEntrySubtitle] = useState('');
  const [entryAvatar, setEntryAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80');
  const [entryScore, setEntryScore] = useState<string>('100.0');
  const [entryTrend, setEntryTrend] = useState<LeaderboardTrend>('same');
  const [entryBadge, setEntryBadge] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  // Load custom leaderboards
  useEffect(() => {
    const loadBoards = () => {
      const boards = ApiService.getCustomLeaderboards();
      const activeId = ApiService.getActiveLeaderboardId();
      setLeaderboards(boards);
      setActiveBoardId(activeId || boards[0]?.id || '');
    };

    loadBoards();

    const handleUpdate = () => loadBoards();
    window.addEventListener('COURTVISION_LEADERBOARDS_UPDATED', handleUpdate);
    window.addEventListener('COURTVISION_ACTIVE_LEADERBOARD_CHANGED', handleUpdate);
    return () => {
      window.removeEventListener('COURTVISION_LEADERBOARDS_UPDATED', handleUpdate);
      window.removeEventListener('COURTVISION_ACTIVE_LEADERBOARD_CHANGED', handleUpdate);
    };
  }, []);

  const activeBoard = leaderboards.find((b) => b.id === activeBoardId) || leaderboards[0];

  const handleSelectBoard = (id: string) => {
    setActiveBoardId(id);
    ApiService.setActiveLeaderboardId(id);
  };

  // Open Create Board Modal
  const handleOpenCreateModal = () => {
    setNewBoardTitle('');
    setNewBoardDescription('');
    setNewBoardCategory('Power Rankings');
    setNewBoardMetric('Fantasy Points (FP)');
    setNewBoardStarter('blank');
    setIsCreateBoardModalOpen(true);
  };

  // Submit Create Board
  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    let initialEntries: CustomLeaderboardEntry[] = [];

    if (newBoardStarter === 'nba' && players.length > 0) {
      // Pick top 8 players by fantasyAvg
      const sorted = [...players].sort((a, b) => (b.seasonStats?.fantasyAvg || 0) - (a.seasonStats?.fantasyAvg || 0)).slice(0, 8);
      initialEntries = sorted.map((p, idx) => ({
        id: `entry-${Date.now()}-${p.id}`,
        name: p.name,
        subtitle: `${p.teamName} • ${p.position}`,
        avatar: p.avatarUrl,
        score: p.seasonStats?.fantasyAvg || 45.0,
        rank: idx + 1,
        trend: idx === 0 ? 'crown' : idx < 3 ? 'fire' : 'same',
        badge: idx === 0 ? 'MVP Leader' : idx === 1 ? 'Hot Streak' : '',
        notes: `Averaging ${p.seasonStats?.pts || 0} PPG, ${p.seasonStats?.reb || 0} RPG, ${p.seasonStats?.ast || 0} APG (ESPN Stats)`,
      }));
    } else if (newBoardStarter === 'league' && league?.members?.length) {
      const sorted = [...league.members].sort((a, b) => b.totalPoints - a.totalPoints);
      initialEntries = sorted.map((m, idx) => ({
        id: `entry-${Date.now()}-${m.id}`,
        name: m.userName,
        subtitle: `${m.teamName} • Manager`,
        avatar: m.avatar,
        score: m.totalPoints,
        rank: idx + 1,
        trend: idx === 0 ? 'crown' : 'same',
        badge: idx === 0 ? '👑 #1 Contender' : '',
        notes: `Roster: ${m.roster.length} players. Week 1: ${m.weeklyPoints[1] || 0} FP`,
      }));
    }

    const created = ApiService.createCustomLeaderboard({
      title: newBoardTitle.trim(),
      description: newBoardDescription.trim() || 'Custom ranked leaderboard',
      category: newBoardCategory.trim() || 'Custom',
      metricLabel: newBoardMetric.trim() || 'Points',
      entries: initialEntries,
    });

    const refreshed = ApiService.getCustomLeaderboards();
    setLeaderboards(refreshed);
    setActiveBoardId(created.id);
    setIsCreateBoardModalOpen(false);
  };

  // Open Edit Board Modal
  const handleOpenEditBoardModal = () => {
    if (!activeBoard) return;
    setEditBoardTitle(activeBoard.title);
    setEditBoardDescription(activeBoard.description);
    setEditBoardCategory(activeBoard.category);
    setEditBoardMetric(activeBoard.metricLabel);
    setIsEditBoardModalOpen(true);
  };

  // Save Edit Board
  const handleSaveEditBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBoard || !editBoardTitle.trim()) return;

    ApiService.updateCustomLeaderboard(activeBoard.id, {
      title: editBoardTitle.trim(),
      description: editBoardDescription.trim(),
      category: editBoardCategory.trim(),
      metricLabel: editBoardMetric.trim(),
    });

    const refreshed = ApiService.getCustomLeaderboards();
    setLeaderboards(refreshed);
    setIsEditBoardModalOpen(false);
  };

  // Delete Board
  const handleDeleteBoard = () => {
    if (!activeBoard) return;
    if (leaderboards.length <= 1) {
      alert('You must have at least one leaderboard.');
      return;
    }
    if (confirm(`Are you sure you want to delete the leaderboard "${activeBoard.title}"?`)) {
      const remaining = ApiService.deleteCustomLeaderboard(activeBoard.id);
      setLeaderboards(remaining);
      setActiveBoardId(remaining[0]?.id || '');
    }
  };

  // Reorder Entries
  const handleReorder = (entryId: string, direction: 'up' | 'down') => {
    if (!activeBoard) return;
    const updated = ApiService.reorderLeaderboardEntries(activeBoard.id, entryId, direction);
    if (updated) {
      const refreshed = ApiService.getCustomLeaderboards();
      setLeaderboards(refreshed);
    }
  };

  // Sort by score
  const handleSortByScore = () => {
    if (!activeBoard) return;
    const sortedEntries = [...activeBoard.entries].sort((a, b) => b.score - a.score);
    sortedEntries.forEach((e, i) => {
      e.rank = i + 1;
    });
    ApiService.updateCustomLeaderboard(activeBoard.id, { entries: sortedEntries });
    const refreshed = ApiService.getCustomLeaderboards();
    setLeaderboards(refreshed);
  };

  // Open Add Entry Modal
  const handleOpenAddEntryModal = () => {
    setAddEntryMode('custom');
    setEntryName('');
    setEntrySubtitle('');
    setEntryAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80');
    setEntryScore('100.0');
    setEntryTrend('same');
    setEntryBadge('');
    setEntryNotes('');
    setPlayerSearchQuery('');
    setIsAddEntryModalOpen(true);
  };

  // Save New Entry
  const handleSaveAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBoard || !entryName.trim()) return;

    const numScore = parseFloat(entryScore) || 0;
    ApiService.addEntryToLeaderboard(activeBoard.id, {
      name: entryName.trim(),
      subtitle: entrySubtitle.trim() || 'Custom Team',
      avatar: entryAvatar,
      score: numScore,
      rank: activeBoard.entries.length + 1,
      trend: entryTrend,
      badge: entryBadge.trim(),
      notes: entryNotes.trim(),
    });

    const refreshed = ApiService.getCustomLeaderboards();
    setLeaderboards(refreshed);
    setIsAddEntryModalOpen(false);
  };

  // Quick Add NBA Player
  const handleAddNbaPlayer = (player: Player) => {
    if (!activeBoard) return;
    ApiService.addEntryToLeaderboard(activeBoard.id, {
      name: player.name,
      subtitle: `${player.teamName} • ${player.position}`,
      avatar: player.avatarUrl,
      score: player.seasonStats?.fantasyAvg || 40.0,
      rank: activeBoard.entries.length + 1,
      trend: 'fire',
      badge: 'NBA Pro',
      notes: `ESPN: ${player.seasonStats?.pts || 0} PTS, ${player.seasonStats?.reb || 0} REB, ${player.seasonStats?.ast || 0} AST`,
    });
    const refreshed = ApiService.getCustomLeaderboards();
    setLeaderboards(refreshed);
    setIsAddEntryModalOpen(false);
  };

  // Quick Add League Member
  const handleAddLeagueMember = (member: GroupMember) => {
    if (!activeBoard) return;
    ApiService.addEntryToLeaderboard(activeBoard.id, {
      name: member.userName,
      subtitle: `${member.teamName} • Manager`,
      avatar: member.avatar,
      score: member.totalPoints,
      rank: activeBoard.entries.length + 1,
      trend: 'same',
      badge: 'League Manager',
      notes: `Total Points: ${member.totalPoints} FP`,
    });
    const refreshed = ApiService.getCustomLeaderboards();
    setLeaderboards(refreshed);
    setIsAddEntryModalOpen(false);
  };

  // Edit Entry
  const handleOpenEditEntry = (entry: CustomLeaderboardEntry) => {
    setEditingEntry({ ...entry });
  };

  const handleSaveEditEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBoard || !editingEntry) return;

    ApiService.updateLeaderboardEntry(activeBoard.id, editingEntry.id, {
      name: editingEntry.name,
      subtitle: editingEntry.subtitle,
      score: Number(editingEntry.score) || 0,
      rank: Number(editingEntry.rank) || 1,
      trend: editingEntry.trend,
      badge: editingEntry.badge,
      notes: editingEntry.notes,
      avatar: editingEntry.avatar,
    });

    const refreshed = ApiService.getCustomLeaderboards();
    setLeaderboards(refreshed);
    setEditingEntry(null);
  };

  // Delete Entry
  const handleDeleteEntry = (entryId: string) => {
    if (!activeBoard) return;
    ApiService.deleteLeaderboardEntry(activeBoard.id, entryId);
    const refreshed = ApiService.getCustomLeaderboards();
    setLeaderboards(refreshed);
  };

  // Copy Leaderboard to Clipboard
  const handleCopyStandings = () => {
    if (!activeBoard) return;
    const lines = [
      `🏆 ${activeBoard.title.toUpperCase()}`,
      activeBoard.description ? `   ${activeBoard.description}` : '',
      `   Category: ${activeBoard.category} | Metric: ${activeBoard.metricLabel}`,
      '--------------------------------------------------',
      ...activeBoard.entries.map(
        (e) =>
          `#${e.rank}  ${e.name.padEnd(20)} | ${e.score} ${activeBoard.metricLabel} ${
            e.badge ? `[${e.badge}]` : ''
          } ${e.subtitle ? `(${e.subtitle})` : ''}`
      ),
      '--------------------------------------------------',
      'Created with CourtVision Custom Leaderboard Builder',
    ];

    navigator.clipboard.writeText(lines.filter(Boolean).join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Helper to render trend icon
  const renderTrendIcon = (trend: LeaderboardTrend) => {
    switch (trend) {
      case 'crown':
        return <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" title="Leader Crown" />;
      case 'fire':
        return <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" title="On Fire" />;
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" title="Rising" />;
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5 text-rose-400" title="Falling" />;
      case 'cold':
        return <Snowflake className="w-3.5 h-3.5 text-sky-400" title="Cold Streak" />;
      case 'same':
      default:
        return <Minus className="w-3.5 h-3.5 text-white/40" title="Neutral" />;
    }
  };

  // Filtered NBA players for modal search
  const filteredPlayers = players
    .filter((p) => {
      const q = playerSearchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q);
    })
    .slice(0, 12);

  if (!activeBoard) {
    return (
      <div className="p-12 text-center bg-black border border-white/10 text-white">
        <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-black uppercase">Create Your Custom Leaderboard</h2>
        <p className="text-white/60 text-xs mt-2 max-w-md mx-auto">
          You can design, rank, and track your own custom leaderboards with any teams, players, scores, and hot takes.
        </p>
        <button
          onClick={handleOpenCreateModal}
          className="mt-6 bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-6 py-3 text-xs uppercase tracking-wider -skew-x-6"
        >
          + Create My First Leaderboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-black border border-white/10 p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500 text-black flex items-center justify-center font-display font-black text-3xl -skew-x-6 shrink-0 shadow-lg shadow-orange-500/20">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase bg-orange-500/20 text-orange-400 px-2 py-0.5 border border-orange-500/40 font-bold">
                  {activeBoard.category}
                </span>
                <span className="text-[10px] font-mono uppercase text-white/50">
                  {activeBoard.entries.length} Entries • Metric: {activeBoard.metricLabel}
                </span>
              </div>
              <h1 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white mt-1">
                {activeBoard.title}
              </h1>
              <p className="text-xs font-mono text-white/60 mt-0.5">{activeBoard.description}</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddEntryModal}
              className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-4 py-2.5 text-xs uppercase tracking-wider transition-all -skew-x-6 flex items-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" /> Add Entry
            </button>

            <button
              onClick={handleSortByScore}
              className="bg-white/10 hover:bg-white/20 text-white font-mono font-bold px-3 py-2 text-xs uppercase transition-all flex items-center gap-1.5 border border-white/10"
              title="Sort entries by highest score"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sort by Score
            </button>

            <button
              onClick={handleCopyStandings}
              className="bg-white/10 hover:bg-white/20 text-white font-mono font-bold px-3 py-2 text-xs uppercase transition-all flex items-center gap-1.5 border border-white/10"
              title="Copy formatted text to share on Discord, Slack, or iMessage"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white/70" /> Share / Copy
                </>
              )}
            </button>

            <button
              onClick={handleOpenEditBoardModal}
              className="bg-white/10 hover:bg-white/20 text-white/80 p-2 transition-all border border-white/10"
              title="Edit Board Settings (Title, Metric, Category)"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="bg-white/10 hover:bg-white/20 text-white/80 font-mono text-xs px-3 py-2 transition-all border border-white/10 flex items-center gap-1"
              title="Create another custom leaderboard"
            >
              <Layers className="w-3.5 h-3.5" /> New Board
            </button>

            {leaderboards.length > 1 && (
              <button
                onClick={handleDeleteBoard}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 p-2 transition-all border border-rose-500/30"
                title="Delete this Leaderboard"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Board Switcher Pills (If multiple leaderboards exist) */}
        {leaderboards.length > 1 && (
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono uppercase text-white/40 font-bold shrink-0">Switch Board:</span>
            {leaderboards.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBoard(b.id)}
                className={`text-xs font-display font-black uppercase px-3 py-1.5 tracking-wider transition-all shrink-0 -skew-x-6 flex items-center gap-1.5 ${
                  b.id === activeBoard.id
                    ? 'bg-orange-500 text-black'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                }`}
              >
                <span>{b.title}</span>
                <span className="text-[10px] font-mono opacity-60">({b.entries.length})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Leaderboard Card */}
      <div className="bg-black border border-white/10 overflow-hidden">
        {activeBoard.entries.length === 0 ? (
          <div className="py-16 px-6 text-center text-white/70 space-y-4">
            <Trophy className="w-12 h-12 text-white/20 mx-auto" />
            <h3 className="text-xl font-display font-black uppercase text-white">This Leaderboard Is Empty</h3>
            <p className="text-xs font-mono text-white/50 max-w-sm mx-auto">
              Add your own custom entries, or import top NBA players with authentic ESPN statistics with 1 click.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleOpenAddEntryModal}
                className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-5 py-2.5 text-xs uppercase tracking-wider -skew-x-6"
              >
                + Add Custom Entry
              </button>
              {players.length > 0 && (
                <button
                  onClick={() => {
                    const topPlayers = [...players]
                      .sort((a, b) => (b.seasonStats?.fantasyAvg || 0) - (a.seasonStats?.fantasyAvg || 0))
                      .slice(0, 5);
                    topPlayers.forEach((p, idx) => {
                      ApiService.addEntryToLeaderboard(activeBoard.id, {
                        name: p.name,
                        subtitle: `${p.teamName} • ${p.position}`,
                        avatar: p.avatarUrl,
                        score: p.seasonStats?.fantasyAvg || 45.0,
                        rank: idx + 1,
                        trend: idx === 0 ? 'crown' : 'fire',
                        badge: idx === 0 ? 'ESPN #1' : 'Star',
                        notes: `Authentic ESPN Stats: ${p.seasonStats?.pts || 0} PPG, ${p.seasonStats?.reb || 0} RPG`,
                      });
                    });
                    const refreshed = ApiService.getCustomLeaderboards();
                    setLeaderboards(refreshed);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-mono font-bold px-4 py-2.5 text-xs uppercase border border-white/10"
                >
                  Import Top 5 ESPN NBA Superstars
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-white/50 font-mono font-bold uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="p-4 w-16 text-center">Reorder</th>
                  <th className="p-4">Entry / Team / Player</th>
                  <th className="p-4 text-center">Trend & Tag</th>
                  <th className="p-4">Notes / Hot Takes</th>
                  <th className="p-4 text-right">{activeBoard.metricLabel}</th>
                  <th className="p-4 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {activeBoard.entries.map((entry, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === activeBoard.entries.length - 1;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors hover:bg-white/[0.04] ${
                        idx === 0
                          ? 'bg-orange-500/5'
                          : idx === 1
                          ? 'bg-amber-500/[0.02]'
                          : ''
                      }`}
                    >
                      {/* Rank Number */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex w-8 h-8 font-display font-black text-sm items-center justify-center -skew-x-6 shadow ${
                            idx === 0
                              ? 'bg-orange-500 text-black shadow-orange-500/30'
                              : idx === 1
                              ? 'bg-white/20 text-white'
                              : idx === 2
                              ? 'bg-amber-700/60 text-white'
                              : 'bg-white/5 text-white/60 border border-white/10'
                          }`}
                        >
                          #{entry.rank || idx + 1}
                        </span>
                      </td>

                      {/* Manual Up/Down Reorder Arrows */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <button
                            onClick={() => handleReorder(entry.id, 'up')}
                            disabled={isFirst}
                            className={`p-1 rounded transition-colors ${
                              isFirst
                                ? 'text-white/10 cursor-not-allowed'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorder(entry.id, 'down')}
                            disabled={isLast}
                            className={`p-1 rounded transition-colors ${
                              isLast
                                ? 'text-white/10 cursor-not-allowed'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                            alt={entry.name}
                            className="w-10 h-10 object-cover border border-white/20 shrink-0 bg-neutral-900"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-sm uppercase tracking-wide text-white">
                                {entry.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-white/50 block">
                              {entry.subtitle}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Trend & Badge */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            {renderTrendIcon(entry.trend)}
                          </div>
                          {entry.badge && (
                            <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                              {entry.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Notes / Commentary */}
                      <td className="p-4 font-mono text-xs text-white/70 max-w-xs">
                        {entry.notes ? (
                          <span className="line-clamp-2 italic">"{entry.notes}"</span>
                        ) : (
                          <span className="text-white/20 italic">No notes added</span>
                        )}
                      </td>

                      {/* Score Value */}
                      <td className="p-4 text-right font-mono">
                        <div className="font-black text-base text-orange-500">
                          {entry.score}
                        </div>
                        <span className="text-[10px] uppercase text-white/40 block font-bold">
                          {activeBoard.metricLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditEntry(entry)}
                            className="bg-white/5 hover:bg-orange-500 hover:text-black text-white/60 p-2 rounded transition-all border border-white/10"
                            title="Edit entry details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="bg-white/5 hover:bg-rose-500 hover:text-white text-white/40 p-2 rounded transition-all border border-white/10"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: CREATE NEW LEADERBOARD                                 */}
      {/* ============================================================== */}
      {isCreateBoardModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/20 w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsCreateBoardModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 text-black flex items-center justify-center font-display font-black text-xl -skew-x-6">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black uppercase text-white">Create Custom Leaderboard</h3>
                <p className="text-xs font-mono text-white/50">Build and rank your own custom board from scratch</p>
              </div>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-orange-500 font-bold block mb-1">
                  Leaderboard Title *
                </label>
                <input
                  type="text"
                  required
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="e.g. My Fantasy Power Rankings, All-Time GOATs..."
                  className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  placeholder="e.g. Weekly power rankings based on recent form and roster depth"
                  className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={newBoardCategory}
                    onChange={(e) => setNewBoardCategory(e.target.value)}
                    placeholder="e.g. Power Rankings, NBA Superstars..."
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Score / Metric Unit
                  </label>
                  <input
                    type="text"
                    value={newBoardMetric}
                    onChange={(e) => setNewBoardMetric(e.target.value)}
                    placeholder="e.g. Fantasy Points (FP), PPG, Score..."
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                  Starter Template
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBoardStarter('blank')}
                    className={`p-3 text-left border rounded transition-all text-xs font-mono ${
                      newBoardStarter === 'blank'
                        ? 'border-orange-500 bg-orange-500/10 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="font-bold mb-0.5 text-white">✨ Blank</div>
                    <div className="text-[10px] opacity-70">Start completely empty</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewBoardStarter('nba')}
                    className={`p-3 text-left border rounded transition-all text-xs font-mono ${
                      newBoardStarter === 'nba'
                        ? 'border-orange-500 bg-orange-500/10 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="font-bold mb-0.5 text-white">🏀 ESPN Stars</div>
                    <div className="text-[10px] opacity-70">Auto-fill top NBA players</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewBoardStarter('league')}
                    className={`p-3 text-left border rounded transition-all text-xs font-mono ${
                      newBoardStarter === 'league'
                        ? 'border-orange-500 bg-orange-500/10 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="font-bold mb-0.5 text-white">👥 League</div>
                    <div className="text-[10px] opacity-70">Auto-fill league managers</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateBoardModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-6 py-2.5 text-xs uppercase tracking-wider -skew-x-6"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT LEADERBOARD SETTINGS                              */}
      {/* ============================================================== */}
      {isEditBoardModalOpen && activeBoard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/20 w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsEditBoardModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 text-black flex items-center justify-center font-display font-black text-xl -skew-x-6">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black uppercase text-white">Edit Leaderboard Settings</h3>
                <p className="text-xs font-mono text-white/50">Update board title, metric unit, or category</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditBoard} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-orange-500 font-bold block mb-1">
                  Leaderboard Title
                </label>
                <input
                  type="text"
                  required
                  value={editBoardTitle}
                  onChange={(e) => setEditBoardTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  value={editBoardDescription}
                  onChange={(e) => setEditBoardDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={editBoardCategory}
                    onChange={(e) => setEditBoardCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Metric Unit (e.g. FP, PPG, Score)
                  </label>
                  <input
                    type="text"
                    value={editBoardMetric}
                    onChange={(e) => setEditBoardMetric(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditBoardModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-6 py-2.5 text-xs uppercase tracking-wider -skew-x-6"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD ENTRY TO LEADERBOARD                                */}
      {/* ============================================================== */}
      {isAddEntryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/20 w-full max-w-xl p-6 space-y-5 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddEntryModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 text-black flex items-center justify-center font-display font-black text-xl -skew-x-6">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black uppercase text-white">Add Entry to Leaderboard</h3>
                <p className="text-xs font-mono text-white/50">Add a custom player, manager, or import directly</p>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-white/10 gap-2">
              <button
                type="button"
                onClick={() => setAddEntryMode('custom')}
                className={`pb-2 px-3 text-xs font-mono font-bold uppercase transition-all ${
                  addEntryMode === 'custom'
                    ? 'border-b-2 border-orange-500 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                ✏️ Custom Entry
              </button>
              <button
                type="button"
                onClick={() => setAddEntryMode('nba')}
                className={`pb-2 px-3 text-xs font-mono font-bold uppercase transition-all ${
                  addEntryMode === 'nba'
                    ? 'border-b-2 border-orange-500 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                🏀 Pick NBA Player (ESPN Stats)
              </button>
              <button
                type="button"
                onClick={() => setAddEntryMode('league')}
                className={`pb-2 px-3 text-xs font-mono font-bold uppercase transition-all ${
                  addEntryMode === 'league'
                    ? 'border-b-2 border-orange-500 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                👥 Pick League Member
              </button>
            </div>

            {/* MODE 1: CUSTOM ENTRY FORM */}
            {addEntryMode === 'custom' && (
              <form onSubmit={handleSaveAddEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-orange-500 font-bold block mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={entryName}
                      onChange={(e) => setEntryName(e.target.value)}
                      placeholder="e.g. Alex (You), Michael Jordan..."
                      className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                      Subtitle / Team
                    </label>
                    <input
                      type="text"
                      value={entrySubtitle}
                      onChange={(e) => setEntrySubtitle(e.target.value)}
                      placeholder="e.g. Downtown Daggers, Chicago Bulls..."
                      className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-orange-500 font-bold block mb-1">
                      Score ({activeBoard.metricLabel}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={entryScore}
                      onChange={(e) => setEntryScore(e.target.value)}
                      placeholder="e.g. 350.5"
                      className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                      Trend Indicator
                    </label>
                    <select
                      value={entryTrend}
                      onChange={(e) => setEntryTrend(e.target.value as LeaderboardTrend)}
                      className="w-full bg-neutral-900 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                    >
                      <option value="crown">👑 Crown (#1 Leader)</option>
                      <option value="fire">🔥 On Fire</option>
                      <option value="up">⬆️ Rising</option>
                      <option value="same">➖ Neutral</option>
                      <option value="down">⬇️ Falling</option>
                      <option value="cold">❄️ Cold Streak</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={entryBadge}
                      onChange={(e) => setEntryBadge(e.target.value)}
                      placeholder="e.g. #1 Seed, MVP..."
                      className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Notes / Trash Talk / Hot Take
                  </label>
                  <input
                    type="text"
                    value={entryNotes}
                    onChange={(e) => setEntryNotes(e.target.value)}
                    placeholder="e.g. Dominant scoring performance in week 1"
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>

                <div>
                  <AvatarPicker
                    currentAvatar={entryAvatar}
                    onSelectAvatar={(url) => setEntryAvatar(url)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddEntryModalOpen(false)}
                    className="px-4 py-2 text-xs font-mono text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-6 py-2.5 text-xs uppercase tracking-wider -skew-x-6"
                  >
                    Add to Leaderboard
                  </button>
                </div>
              </form>
            )}

            {/* MODE 2: NBA PLAYER PICKER */}
            {addEntryMode === 'nba' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    value={playerSearchQuery}
                    onChange={(e) => setPlayerSearchQuery(e.target.value)}
                    placeholder="Search NBA players by name or team..."
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white pl-9 pr-3 py-2 text-xs font-mono rounded focus:outline-none"
                  />
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredPlayers.length === 0 ? (
                    <div className="text-center py-6 text-white/40 font-mono text-xs">
                      No matching NBA players found
                    </div>
                  ) : (
                    filteredPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all rounded"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-9 h-9 object-cover border border-white/20 rounded bg-neutral-900"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-xs text-white">{p.name}</div>
                            <div className="text-[10px] font-mono text-white/50">
                              {p.teamName} • {p.position} • ESPN PPG: {p.seasonStats?.pts || 0}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-orange-400">
                            {p.seasonStats?.fantasyAvg || 0} FP
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddNbaPlayer(p)}
                            className="bg-orange-500 hover:bg-orange-400 text-black text-[11px] font-display font-black px-3 py-1.5 uppercase -skew-x-6"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MODE 3: LEAGUE MEMBER PICKER */}
            {addEntryMode === 'league' && (
              <div className="space-y-3">
                {!league?.members?.length ? (
                  <div className="text-center py-6 text-white/40 font-mono text-xs">
                    No active league members available
                  </div>
                ) : (
                  league.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all rounded"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar}
                          alt={m.userName}
                          className="w-9 h-9 object-cover border border-white/20 rounded bg-neutral-900"
                        />
                        <div>
                          <div className="font-bold text-xs text-white">
                            {m.userName} {m.id === activeMember?.id ? '(You)' : ''}
                          </div>
                          <div className="text-[10px] font-mono text-white/50">
                            {m.teamName} • {m.roster.length} Players
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-orange-400">
                          {m.totalPoints} FP
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddLeagueMember(m)}
                          className="bg-orange-500 hover:bg-orange-400 text-black text-[11px] font-display font-black px-3 py-1.5 uppercase -skew-x-6"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT ENTRY                                              */}
      {/* ============================================================== */}
      {editingEntry && activeBoard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/20 w-full max-w-lg p-6 space-y-5 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingEntry(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 text-black flex items-center justify-center font-display font-black text-xl -skew-x-6">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black uppercase text-white">Edit Entry</h3>
                <p className="text-xs font-mono text-white/50">Update ranking, score, badge, or custom note</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-orange-500 font-bold block mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEntry.name}
                    onChange={(e) => setEditingEntry({ ...editingEntry, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Subtitle / Team
                  </label>
                  <input
                    type="text"
                    value={editingEntry.subtitle}
                    onChange={(e) => setEditingEntry({ ...editingEntry, subtitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-orange-500 font-bold block mb-1">
                    Score ({activeBoard.metricLabel}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingEntry.score}
                    onChange={(e) => setEditingEntry({ ...editingEntry, score: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Rank #
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingEntry.rank}
                    onChange={(e) => setEditingEntry({ ...editingEntry, rank: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Trend Indicator
                  </label>
                  <select
                    value={editingEntry.trend}
                    onChange={(e) => setEditingEntry({ ...editingEntry, trend: e.target.value as LeaderboardTrend })}
                    className="w-full bg-neutral-900 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  >
                    <option value="crown">👑 Crown (#1)</option>
                    <option value="fire">🔥 On Fire</option>
                    <option value="up">⬆️ Rising</option>
                    <option value="same">➖ Neutral</option>
                    <option value="down">⬇️ Falling</option>
                    <option value="cold">❄️ Cold Streak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={editingEntry.badge || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, badge: e.target.value })}
                    placeholder="e.g. #1 Contender, Hot Streak"
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 font-bold block mb-1">
                    Notes / Commentary
                  </label>
                  <input
                    type="text"
                    value={editingEntry.notes || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                    placeholder="e.g. Top scorer this week"
                    className="w-full bg-white/5 border border-white/20 focus:border-orange-500 text-white px-3 py-2 text-sm font-mono rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <AvatarPicker
                  currentAvatar={editingEntry.avatar}
                  onSelectAvatar={(url) => setEditingEntry({ ...editingEntry, avatar: url })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 text-xs font-mono text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-400 text-black font-display font-black px-6 py-2.5 text-xs uppercase tracking-wider -skew-x-6"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
