'use client';

import React from 'react';
import { Image as ImageIcon, Send, X, RefreshCw } from 'lucide-react';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface MarketplaceComposerProps {
  userAvatar?: string | null;
  userName?: string | null;
  newPostContent: string;
  setNewPostContent: (val: string) => void;
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  posting: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onCreatePost: () => void;
  getMediaUrl: (url?: string | null) => string;
}

export function MarketplaceComposer({
  userAvatar,
  userName,
  newPostContent,
  setNewPostContent,
  previewUrl,
  fileInputRef,
  posting,
  onFileChange,
  onRemoveImage,
  onCreatePost,
  getMediaUrl,
}: MarketplaceComposerProps) {
  return (
    <GlassCard className="p-5 sm:p-6 space-y-4 specular-rim">
      <div className="flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden shadow-xs ring-2 ring-emerald-500/20">
          {userAvatar ? (
            <img src={getMediaUrl(userAvatar)} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            (userName || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <textarea
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder={`What's on your mind, ${userName?.split(' ')[0] || 'member'}? Share with the community...`}
            className="w-full p-3.5 bg-white/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white resize-none transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Selected Image Preview */}
      {previewUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900/5 max-h-72 flex items-center justify-center shadow-xs">
          <img src={previewUrl} alt="Upload preview" className="max-h-72 w-auto object-contain rounded-2xl" />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors cursor-pointer shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
        <div>
          <input
            type="file"
            ref={fileInputRef as any}
            onChange={onFileChange}
            accept="image/*"
            className="hidden"
          />
          <GlassButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>Add Photo</span>
          </GlassButton>
        </div>

        <GlassButton
          type="button"
          variant="primary"
          size="sm"
          onClick={onCreatePost}
          disabled={posting || (!newPostContent.trim() && !previewUrl)}
          className="gap-2 px-6 shadow-md shadow-emerald-950/15"
        >
          {posting ? (
            <>
              <span>Posting...</span>
            </>
          ) : (
            <>
              <span>Publish Post</span>
            </>
          )}
        </GlassButton>
      </div>
    </GlassCard>
  );
}
