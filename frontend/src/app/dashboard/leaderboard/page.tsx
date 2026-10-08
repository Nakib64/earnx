'use client';

import React from 'react';
import { useLeaderboardOrchestrator } from '../../../hooks/orchestrators';
import {
  LeaderboardPodium,
  LeaderboardGrid,
} from '../../../components/leaderboard';

export default function UserLeaderboardPage() {
  const {
    state: {
      leaderboard,
      loadingInitial,
      loadingMore,
      hasMore,
      searchQuery,
      observerTarget,
    },
    computed: {
      top1,
      top2,
      top3,
    },
    actions: {
      setSearchQuery,
      getPhotoUrl,
    },
  } = useLeaderboardOrchestrator();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top 3 Podium Cards */}
      <LeaderboardPodium
        top1={top1}
        top2={top2}
        top3={top3}
        getPhotoUrl={getPhotoUrl}
      />

      {/* Leader Cards Grid Container */}
      <LeaderboardGrid
        leaderboard={leaderboard}
        loadingInitial={loadingInitial}
        loadingMore={loadingMore}
        hasMore={hasMore}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        observerTarget={observerTarget}
        getPhotoUrl={getPhotoUrl}
      />
    </div>
  );
}
