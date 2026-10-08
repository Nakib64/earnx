'use client';

import React from 'react';
import { Image as ImageIcon, Send, X, RefreshCw } from 'lucide-react';

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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#005A36] text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden shadow-sm">
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
            className="w-full p-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] focus:bg-white resize-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Selected Image Preview */}
      {previewUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-72 flex items-center justify-center">
          <img src={previewUrl} alt="Upload preview" className="max-h-72 w-auto object-contain rounded-2xl" />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          <input
            type="file"
            ref={fileInputRef as any}
            onChange={onFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>Add Photo</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCreatePost}
          disabled={posting || (!newPostContent.trim() && !previewUrl)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-40 text-white text-xs font-black shadow-md shadow-emerald-950/10 transition-all cursor-pointer"
        >
          {posting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-emerald-200" />
              <span>Post</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
