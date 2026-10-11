'use client';

import React from 'react';
import { Users, RefreshCw, Globe, User, FileText, Plus } from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useMarketplaceOrchestrator } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import { GlassCard } from '../../../components/design-system/GlassCard';
import { GlassButton } from '../../../components/design-system/GlassButton';
import {
  MarketplaceComposer,
  MarketplacePostCard,
  MarketplaceSkeleton,
} from '../../../components/marketplace';

export default function MarketplacePage() {
  const { isLoading: forceSkeletonLoading } = useDesignSystem();
  const {
    state: {
      posts,
      loading,
      alertMsg,
      feedTab,
      newPostContent,
      previewUrl,
      posting,
      fileInputRef,
      commentInputs,
      replyingTo,
      submittingComment,
      expandedComments,
    },
    computed: { user, isAdmin, myPostsCount },
    actions: {
      setFeedTab,
      handleTabChange,
      setNewPostContent,
      setAlertMsg,
      setCommentInputs,
      setReplyingTo,
      setExpandedComments,
      handleFileChange,
      handleRemoveImage,
      handleCreatePost,
      handleToggleLike,
      handleSendComment,
      handleDeletePost,
      handleDeleteComment,
      fetchPosts,
    },
  } = useMarketplaceOrchestrator();

  const getMediaUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (forceSkeletonLoading || (loading && posts.length === 0)) {
    return <MarketplaceSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 animate-fade-in font-[family-name:var(--font-montserrat)]">
      {/* Feed Header */}
      <GlassCard className="p-5 sm:p-6 flex items-center justify-between specular-rim" glow>
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 ">
              Community Marketplace Feed
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Share updates, coin offers, proof of earnings &amp; interact with members
            </p>
          </div>
        </div>

        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => fetchPosts()}
          className="p-2.5 h-auto min-h-0 rounded-xl"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </GlassButton>
      </GlassCard>

      {alertMsg && (
        <AlertBanner
          type={alertMsg.type}
          message={alertMsg.text}
          onClose={() => setAlertMsg(null)}
        />
      )}

      {/* Feed Segmented Filter Tabs: All Posts vs My Posts */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-100/80 backdrop-blur-md border border-white/80 shadow-[inset_2px_2px_5px_rgba(15,23,42,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]">
        <button
          type="button"
          onClick={() => handleTabChange('all')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            feedTab === 'all'
              ? 'bg-white text-slate-900 shadow-[3px_3px_10px_rgba(15,23,42,0.06),-2px_-2px_8px_rgba(255,255,255,1)] border border-white/90'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Globe className={`w-4 h-4 ${feedTab === 'all' ? 'text-[#009F6B]' : 'text-slate-400'}`} />
          <span>All Community Posts</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('mine')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            feedTab === 'mine'
              ? 'bg-[#009F6B] text-white shadow-[0_4px_14px_rgba(0,159,107,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Posts</span>
          {feedTab === 'mine' && (
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold tracking-wide">
              {posts.length}
            </span>
          )}
        </button>
      </div>

      {/* Create Post Composer */}
      <MarketplaceComposer
        userAvatar={user?.avatar_url}
        userName={user?.full_name}
        newPostContent={newPostContent}
        setNewPostContent={setNewPostContent}
        previewUrl={previewUrl}
        fileInputRef={fileInputRef}
        posting={posting}
        onFileChange={handleFileChange}
        onRemoveImage={handleRemoveImage}
        onCreatePost={handleCreatePost}
        getMediaUrl={getMediaUrl}
      />

      {/* Feed Posts */}
      {posts.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3 specular-rim">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] mx-auto">
            {feedTab === 'mine' ? (
              <FileText className="w-6 h-6 text-[#009F6B]" />
            ) : (
              <Users className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <h3 className="text-base font-black text-slate-800">
            {feedTab === 'mine' ? "You Haven't Posted Anything Yet" : 'No Posts Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {feedTab === 'mine'
              ? 'Share your updates, proof of earnings, or coin offers with fellow members using the composer above!'
              : 'Be the first to post something exciting in the EarnX community!'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <MarketplacePostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              currentUserAvatar={user?.avatar_url}
              currentUserName={user?.full_name}
              isCommentsOpen={expandedComments[post.id] ?? true}
              replyingToTarget={replyingTo[post.id]}
              commentInput={commentInputs[post.id] || ''}
              submittingComment={!!submittingComment[post.id]}
              onToggleLike={handleToggleLike}
              onToggleComments={(id) =>
                setExpandedComments((prev) => ({
                  ...prev,
                  [id]: !(prev[id] ?? true),
                }))
              }
              onDeletePost={handleDeletePost}
              onSetCommentInput={(val) =>
                setCommentInputs((prev) => ({ ...prev, [post.id]: val }))
              }
              onSetReplyingTo={(target) =>
                setReplyingTo((prev) => ({ ...prev, [post.id]: target }))
              }
              onAddComment={handleSendComment}
              onDeleteComment={handleDeleteComment}
              onShare={() => {
                navigator.clipboard.writeText(window.location.href);
                setAlertMsg({ type: 'success', text: 'Feed link copied to clipboard!' });
              }}
              getMediaUrl={getMediaUrl}
              formatTimeAgo={formatTimeAgo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
