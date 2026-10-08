'use client';

import React from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { useMarketplaceOrchestrator } from '../../../hooks/orchestrators';
import {
  MarketplaceComposer,
  MarketplacePostCard,
} from '../../../components/marketplace';

export default function MarketplacePage() {
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Feed Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#005A36] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Community Marketplace Feed
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Share updates, coin offers, proof of earnings & interact with members
            </p>
          </div>
        </div>

        <button
          onClick={fetchPosts}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

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
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#005A36]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No Posts Yet</h3>
          <p className="text-xs text-slate-500">
            Be the first to post something exciting in the EarnX community!
          </p>
        </div>
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
