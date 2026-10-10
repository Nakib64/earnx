'use client';

import React from 'react';
import { Send, CornerDownRight, X } from 'lucide-react';
import { MarketplaceComment } from '../../types';

interface MarketplaceCommentSectionProps {
  postId: string;
  comments: MarketplaceComment[];
  currentUserId?: string;
  isPostAuthor: boolean;
  currentUserAvatar?: string | null;
  currentUserName?: string | null;
  replyingToTarget: { commentId: string; name: string } | null;
  commentInput: string;
  submitting: boolean;
  onSetCommentInput: (val: string) => void;
  onSetReplyingTo: (target: { commentId: string; name: string } | null) => void;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
  getMediaUrl: (url?: string | null) => string;
  formatTimeAgo: (dateStr: string) => string;
}

export function MarketplaceCommentSection({
  postId,
  comments,
  currentUserId,
  isPostAuthor,
  currentUserAvatar,
  currentUserName,
  replyingToTarget,
  commentInput,
  submitting,
  onSetCommentInput,
  onSetReplyingTo,
  onAddComment,
  onDeleteComment,
  getMediaUrl,
  formatTimeAgo,
}: MarketplaceCommentSectionProps) {
  return (
    <div className="p-4 sm:p-5 bg-slate-50/50 backdrop-blur-xs space-y-4 border-t border-slate-200/50">
      {/* Comments List */}
      {comments && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Top-Level Comment */}
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden shadow-2xs">
                  {comment.user?.avatar_url ? (
                    <img
                      src={getMediaUrl(comment.user.avatar_url)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (comment.user?.full_name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-white/90 backdrop-blur-md border border-white/95 rounded-2xl p-3 inline-block max-w-full shadow-2xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-slate-900">
                        {comment.user?.full_name || 'Member'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pl-2 pt-1 text-[11px] font-bold text-slate-400">
                    <button
                      type="button"
                      onClick={() =>
                        onSetReplyingTo({
                          commentId: comment.id,
                          name: comment.user?.full_name || 'Member',
                        })
                      }
                      className="hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      Reply
                    </button>
                    {(currentUserId === comment.user_id || isPostAuthor) && (
                      <button
                        type="button"
                        onClick={() => onDeleteComment(comment.id)}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Threaded Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-9 space-y-2.5">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-[10px] shrink-0 overflow-hidden mt-0.5">
                        {reply.user?.avatar_url ? (
                          <img
                            src={getMediaUrl(reply.user.avatar_url)}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (reply.user?.full_name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white/90 backdrop-blur-md border border-white/95 rounded-2xl p-2.5 inline-block max-w-full shadow-2xs">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] font-black text-slate-900">
                              {reply.user?.full_name || 'Member'}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {formatTimeAgo(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-800 mt-0.5 whitespace-pre-wrap leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                        {(currentUserId === reply.user_id || isPostAuthor) && (
                          <div className="pl-2 pt-0.5 text-[10px] font-bold text-slate-400">
                            <button
                              type="button"
                              onClick={() => onDeleteComment(reply.id)}
                              className="hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Replying Banner (if active) */}
      {replyingToTarget && (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-xs text-emerald-800 font-bold">
          <span className="flex items-center gap-1.5">
            <CornerDownRight className="w-3.5 h-3.5 text-emerald-600" />
            Replying to <strong>{replyingToTarget.name}</strong>
          </span>
          <button
            type="button"
            onClick={() => onSetReplyingTo(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Comment Input Box */}
      <div className="flex items-center space-x-2 pt-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-xs shrink-0 overflow-hidden shadow-2xs">
          {currentUserAvatar ? (
            <img
              src={getMediaUrl(currentUserAvatar)}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            (currentUserName || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={
              replyingToTarget
                ? `Reply to ${replyingToTarget.name}...`
                : 'Write a comment...'
            }
            value={commentInput}
            onChange={(e) => onSetCommentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onAddComment();
              }
            }}
            className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
          />
          <button
            type="button"
            onClick={onAddComment}
            disabled={submitting || !commentInput?.trim()}
            className="absolute right-2 top-2 p-1 text-emerald-700 hover:text-emerald-800 disabled:opacity-30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
