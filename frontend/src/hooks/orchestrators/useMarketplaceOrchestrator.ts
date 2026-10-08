'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { MarketplacePost, MarketplaceComment } from '../../types';

export function useMarketplaceOrchestrator() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<MarketplacePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Post Composer state
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment input states per post: { [postId]: string }
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  // Replying state: { [postId]: { commentId: string; name: string } | null }
  const [replyingTo, setReplyingTo] = useState<Record<string, { commentId: string; name: string } | null>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Expanded comments section toggles: { [postId]: boolean }
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<any>(
      `/marketplace/posts?page=1&limit=30${user?.id ? `&user_id=${user.id}` : ''}`,
    );
    if (res.success && res.data) {
      setPosts(res.data.data || []);
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to load community feed.' });
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAlertMsg({ type: 'error', text: 'Image size cannot exceed 10MB.' });
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Post
  const handleCreatePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPostContent.trim() && !selectedFile) {
      setAlertMsg({ type: 'error', text: 'Please write something or select an image to post.' });
      return;
    }

    setPosting(true);
    setAlertMsg(null);

    let uploadedImageUrl: string | undefined = undefined;

    // 1. Upload image if selected
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await apiFetch<{ success: boolean; url: string }>('/marketplace/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.success || !uploadRes.data?.url) {
        setAlertMsg({ type: 'error', text: uploadRes.error?.message || 'Image upload failed.' });
        setPosting(false);
        return;
      }
      uploadedImageUrl = uploadRes.data.url;
    }

    // 2. Create post
    const res = await apiFetch('/marketplace/posts', {
      method: 'POST',
      body: JSON.stringify({
        content: newPostContent.trim(),
        image_url: uploadedImageUrl,
      }),
    });

    if (res.success) {
      setNewPostContent('');
      handleRemoveImage();
      fetchPosts();
      setAlertMsg({ type: 'success', text: 'Your post was published successfully!' });
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to publish post.' });
    }
    setPosting(false);
  };

  // Toggle Like (Optimistic UI)
  const handleToggleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const wasLiked = post.is_liked;
          return {
            ...post,
            is_liked: !wasLiked,
            likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1,
          };
        }
        return post;
      }),
    );

    const res = await apiFetch<any>(`/marketplace/posts/${postId}/like`, { method: 'POST' });
    if (!res.success) {
      fetchPosts();
    }
  };

  // Submit Comment / Reply
  const handleSendComment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    const replyData = replyingTo[postId];
    const res = await apiFetch<any>(`/marketplace/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content: text,
        parent_id: replyData ? replyData.commentId : undefined,
      }),
    });

    if (res.success) {
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setReplyingTo((prev) => ({ ...prev, [postId]: null }));
      fetchPosts();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to post comment.' });
    }
    setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const res = await apiFetch(`/marketplace/posts/${postId}`, { method: 'DELETE' });
    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Post deleted successfully.' });
      fetchPosts();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to delete post.' });
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    const res = await apiFetch(`/marketplace/comments/${commentId}`, { method: 'DELETE' });
    if (res.success) {
      fetchPosts();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to delete comment.' });
    }
  };

  return {
    state: {
      posts,
      loading,
      alertMsg,
      newPostContent,
      selectedFile,
      previewUrl,
      posting,
      fileInputRef,
      commentInputs,
      replyingTo,
      submittingComment,
      expandedComments,
    },
    computed: {
      user,
    },
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
  };
}
