'use client';

import React from 'react';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { MarketplacePost } from '../../types';
import { MarketplaceCommentSection } from './MarketplaceCommentSection';
import { GlassCard } from '../design-system/GlassCard';

interface MarketplacePostCardProps {
  post: MarketplacePost;
  currentUserId?: string;
  currentUserAvatar?: string | null;
  currentUserName?: string | null;
  isCommentsOpen: boolean;
  replyingToTarget: { commentId: string; name: string } | null;
  commentInput: string;
  submittingComment: boolean;
  onToggleLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onSetCommentInput: (val: string) => void;
  onSetReplyingTo: (target: { commentId: string; name: string } | null) => void;
  onAddComment: (postId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onShare: () => void;
  getMediaUrl: (url?: string | null) => string;
  formatTimeAgo: (dateStr: string) => string;
}

export function MarketplacePostCard({
  post,
  currentUserId,
  currentUserAvatar,
  currentUserName,
  isCommentsOpen,
  replyingToTarget,
  commentInput,
  submittingComment,
  onToggleLike,
  onToggleComments,
  onDeletePost,
  onSetCommentInput,
  onSetReplyingTo,
  onAddComment,
  onDeleteComment,
  onShare,
  getMediaUrl,
  formatTimeAgo,
}: MarketplacePostCardProps) {
  const isAuthor = currentUserId === post.user_id;
  const commentsCount = post.comments?.length || 0;

  return (
    <GlassCard className="specular-rim overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Post Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white ring-2 ring-slate-200 text-slate-700 flex items-center justify-center font-black text-sm shrink-0 overflow-hidden shadow-xs">
            {post.user?.avatar_url ? (
              <img
                src={getMediaUrl(post.user.avatar_url)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              (post.user?.full_name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 ">
                {post.user?.full_name || 'EarnX Member'}
              </span>
              {post.user?.designation?.title && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                  {post.user.designation.title}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {formatTimeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={() => onDeletePost(post.id)}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50/80 transition-colors cursor-pointer"
            title="Delete Post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Body */}
      {post.content && (
        <div className="px-4 sm:px-5 pb-3.5">
          <p className="text-xs sm:text-sm font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>
      )}

      {/* Post Image */}
      {post.image_url && (
        <div className="border-t border-b border-slate-200/60 bg-slate-900/5 flex items-center justify-center max-h-[500px] overflow-hidden">
          <img
            src={getMediaUrl(post.image_url)}
            alt="Post attachment"
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Stats Counter Bar */}
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-200/60">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span className="">{post.likes_count || 0} Likes</span>
        </div>
        <div className="flex items-center gap-3 ">
          <span>{commentsCount} Comments</span>
        </div>
      </div>

      {/* Actions: Like, Comment, Share */}
      <div className="px-4 py-1.5 flex items-center justify-around border-b border-slate-200/60 text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => onToggleLike(post.id)}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${post.is_liked_by_me
            ? 'text-rose-600 hover:bg-rose-50/80 font-black'
            : 'hover:bg-slate-100/60 text-slate-600'
            }`}
        >
          <Heart
            className={`w-4 h-4 ${post.is_liked_by_me ? 'fill-rose-600 text-rose-600' : 'text-slate-500'
              }`}
          />
          <span>{post.is_liked_by_me ? 'Liked' : 'Like'}</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleComments(post.id)}
          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-100/60 text-slate-600 transition-all active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-slate-500" />
          <span>Comment</span>
        </button>

        <button
          type="button"
          onClick={onShare}
          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-100/60 text-slate-600 transition-all active:scale-95 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments & Replies */}
      {isCommentsOpen && (
        <MarketplaceCommentSection
          postId={post.id}
          comments={post.comments || []}
          currentUserId={currentUserId}
          isPostAuthor={isAuthor}
          currentUserAvatar={currentUserAvatar}
          currentUserName={currentUserName}
          replyingToTarget={replyingToTarget}
          commentInput={commentInput}
          submitting={submittingComment}
          onSetCommentInput={onSetCommentInput}
          onSetReplyingTo={onSetReplyingTo}
          onAddComment={() => onAddComment(post.id)}
          onDeleteComment={onDeleteComment}
          getMediaUrl={getMediaUrl}
          formatTimeAgo={formatTimeAgo}
        />
      )}
    </GlassCard>
  );
}
