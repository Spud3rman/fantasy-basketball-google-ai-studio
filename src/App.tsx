import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LivePlayTicker } from './components/LivePlayTicker';
import { Dashboard } from './components/Dashboard';
import { MyRoster } from './components/MyRoster';
import { DraftRoom } from './components/DraftRoom';
import { Leaderboard } from './components/Leaderboard';
import { NbaPlayers } from './components/NbaPlayers';
import { ScoringRulesModal } from './components/ScoringRulesModal';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { LeagueModal } from './components/LeagueModal';
import { ApiService } from './services/api';
import { League, GroupMember, LiveGame, PlayByPlayAction, Player, ScoringRules } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [league, setLeague] = useState<League | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<LiveGame[]>([]);
  const [playHistory, setPlayHistory] = useState<PlayByPlayAction[]>([]);
  const [simMode, setSimMode] = useState<'live' | 'fast' | 'pause'>('live');

  // Active Member state
  const [activeMemberId, setActiveMemberId] = useState<string>('usr-1');

  // Modals state
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const pList = await ApiService.getPlayers();
        setPlayers(pList);

        const lList = await ApiService.getLeagues();
        if (lList && lList.length > 0) {
          setLeague(lList[0]);
          if (lList[0].members.length > 0) {
            setActiveMemberId(lList[0].members[0].id);
          }
        }
      } catch (err) {
        console.error('Init error:', err);
      }
    }
    init();
  }, []);

  // WebSocket Subscription
  useEffect(() => {
    if (!league) return;

    const unsubscribe = ApiService.connectWs(league.id, activeMemberId, (msg) => {
      if (msg.type === 'INIT_STATE') {
        if (msg.payload.league) setLeague(msg.payload.league);
        if (msg.payload.games) setGames(msg.payload.games);
        if (msg.payload.playHistory) setPlayHistory(msg.payload.playHistory);
        if (msg.payload.simMode) setSimMode(msg.payload.simMode);
        if (msg.payload.players) setPlayers(msg.payload.players);
      } else if (msg.type === 'LEAGUE_UPDATED') {
        setLeague(msg.payload);
      } else if (msg.type === 'PLAYERS_UPDATED') {
        setPlayers(msg.payload);
      } else if (msg.type === 'DRAFT_PICKED') {
        setLeague(msg.payload.league);
      } else if (msg.type === 'PLAY_ACTION') {
        const { action, games: updatedGames, leagues: updatedLeagues } = msg.payload;
        if (action) {
          setPlayHistory((prev) => [action, ...prev].slice(0, 50));
        }
        if (updatedGames) setGames(updatedGames);
        if (updatedLeagues && updatedLeagues[league.id]) {
          setLeague(updatedLeagues[league.id]);
        }
      } else if (msg.type === 'SIMULATION_STATE') {
        if (msg.payload.simMode) setSimMode(msg.payload.simMode);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [league?.id, activeMemberId]);

  const activeMember: GroupMember | null =
    league?.members.find((m) => m.id === activeMemberId) || league?.members[0] || null;

  // Handlers
  const handleSimControl = async (mode: 'live' | 'fast' | 'pause') => {
    setSimMode(mode);
    await ApiService.controlSim(mode);
  };

  const handleStartDraft = async () => {
    if (!league) return;
    const updated = await ApiService.startDraft(league.id);
    setLeague(updated);
  };

  const handleMakeDraftPick = async (playerId: string) => {
    if (!league || !activeMember) return;
    const res = await ApiService.makeDraftPick(league.id, activeMember.id, playerId);
    setLeague(res.league);
  };

  const handleUpdateRosterSlot = async (playerId: string, newSlot: string, isStarter: boolean) => {
    if (!league || !activeMember) return;
    const updated = await ApiService.updateRosterSlot(league.id, activeMember.id, playerId, newSlot, isStarter);
    setLeague(updated);
  };

  const handleSaveScoringRules = async (rules: ScoringRules) => {
    if (!league) return;
    const updated = await ApiService.updateScoringRules(league.id, rules);
    setLeague(updated);
  };

  const handleCreateLeague = async (data: { name: string; userName: string; teamName: string; maxTeams: number }) => {
    const newLeague = await ApiService.createLeague(data);
    setLeague(newLeague);
    setActiveMemberId(newLeague.members[0].id);
  };

  const handleJoinLeagueByCode = async (data: { code: string; userName: string; teamName: string }) => {
    const res = await ApiService.joinLeague(data);
    setLeague(res.league);
    setActiveMemberId(res.member.id);
  };

  const handleJoinMemberToCurrentLeague = async (userName: string, teamName: string) => {
    if (!league) return;
    const res = await ApiService.joinLeague({ code: league.code, userName, teamName });
    setLeague(res.league);
    setActiveMemberId(res.member.id);
  };

  const handleUpdateMemberName = async (memberId: string, userName: string, teamName: string, avatar?: string) => {
    if (!league) return;
    const updated = await ApiService.updateMemberName(league.id, memberId, userName, teamName, avatar);
    setLeague(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        league={league}
        activeMember={activeMember}
        simMode={simMode}
        onSimControl={handleSimControl}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenLeagueModal={() => setIsLeagueModalOpen(true)}
        onOpenScoringModal={() => setIsScoringModalOpen(true)}
      />

      {/* Real-time Live Ticker Banner */}
      <LivePlayTicker playHistory={playHistory} activeMemberId={activeMemberId} />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            league={league}
            activeMember={activeMember}
            games={games}
            playHistory={playHistory}
            players={players}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'roster' && (
          <MyRoster
            league={league}
            activeMember={activeMember}
            players={players}
            onUpdateRosterSlot={handleUpdateRosterSlot}
            onNavigateToTab={setActiveTab}
            onUpdateMemberName={handleUpdateMemberName}
          />
        )}

        {activeTab === 'draft' && (
          <DraftRoom
            league={league}
            activeMember={activeMember}
            players={players}
            onMakeDraftPick={handleMakeDraftPick}
            onStartDraft={handleStartDraft}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            league={league}
            activeMember={activeMember}
            onUpdateMemberName={handleUpdateMemberName}
          />
        )}

        {activeTab === 'players' && (
          <NbaPlayers players={players} games={games} />
        )}
      </main>

      {/* Modals */}
      {league && (
        <ScoringRulesModal
          isOpen={isScoringModalOpen}
          onClose={() => setIsScoringModalOpen(false)}
          rules={league.scoringRules}
          onSave={handleSaveScoringRules}
        />
      )}

      <UserSwitcherModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        league={league}
        activeMember={activeMember}
        onSelectMember={(m) => setActiveMemberId(m.id)}
        onJoinLeague={handleJoinMemberToCurrentLeague}
        onUpdateMemberName={handleUpdateMemberName}
      />

      <LeagueModal
        isOpen={isLeagueModalOpen}
        onClose={() => setIsLeagueModalOpen(false)}
        onCreateLeague={handleCreateLeague}
        onJoinLeagueByCode={handleJoinLeagueByCode}
      />
    </div>
  );
}
