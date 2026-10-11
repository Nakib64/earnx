'use client';

import React from 'react';
import { Users, RefreshCw } from 'lucide-react';
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
      newPostContent,
      previewUrl,
      posting,
      fileInputRef,
      commentInputs,
      replyingTo,
      submittingComment,
      expandedComments,
    },
    computed: { user },
    actions: {
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
    <div className="space-y-6 max-w-3xl mx-auto pb-16 animate-fade-in">
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
          onClick={fetchPosts}
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
        <GlassCard className="p-12 text-center space-y-2 specular-rim">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No Posts Yet</h3>
          <p className="text-xs text-slate-500">
            Be the first to post something exciting in the EarnX community!
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <MarketplacePostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
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
