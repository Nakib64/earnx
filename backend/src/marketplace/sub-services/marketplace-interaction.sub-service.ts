import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarketplaceInteractionSubService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Toggle like on a post
   */
  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.marketplacePost.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const existingLike = await this.prisma.marketplaceLike.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    let isLiked = false;
    if (existingLike) {
      try {
        await this.prisma.marketplaceLike.delete({
          where: { id: existingLike.id },
        });
      } catch {
        // Ignored if already deleted concurrently
      }
      isLiked = false;
    } else {
      try {
        await this.prisma.marketplaceLike.create({
          data: {
            post_id: postId,
            user_id: userId,
          },
        });
        isLiked = true;
      } catch (err: any) {
        if (err.code === 'P2002') {
          // Already created concurrently by rapid click
          isLiked = true;
        } else {
          throw err;
        }
      }
    }

    const likesCount = await this.prisma.marketplaceLike.count({
      where: { post_id: postId },
    });

    // Notification handling for Like / Unlike
    if (isLiked) {
      if (post.user_id !== userId) {
        try {
          const actor = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { full_name: true, phone: true },
          });
          const actorName = actor?.full_name || actor?.phone || 'Someone';

          await this.prisma.notification.create({
            data: {
              user_id: post.user_id,
              actor_id: userId,
              type: 'MARKETPLACE_LIKE',
              title: 'New Like',
              message: `${actorName} liked your post.`,
              entity_id: postId,
            },
          });
        } catch {}
      }
    } else {
      // Clean up previous like notification if unliked
      try {
        await this.prisma.notification.deleteMany({
          where: {
            user_id: post.user_id,
            actor_id: userId,
            type: 'MARKETPLACE_LIKE',
            entity_id: postId,
          },
        });
      } catch {}
    }

    return {
      success: true,
      is_liked: isLiked,
      likes_count: likesCount,
    };
  }

  /**
   * Add a top-level comment or a nested reply to a comment
   */
  async addComment(
    userId: string,
    postId: string,
    data: { content: string; parent_id?: string },
  ) {
    const cleanContent = data.content?.trim();
    if (!cleanContent) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    const post = await this.prisma.marketplacePost.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    if (data.parent_id) {
      const parent = await this.prisma.marketplaceComment.findUnique({
        where: { id: data.parent_id },
      });
      if (!parent || parent.post_id !== postId) {
        throw new BadRequestException('Invalid parent comment');
      }
    }

    const comment = await this.prisma.marketplaceComment.create({
      data: {
        post_id: postId,
        user_id: userId,
        parent_id: data.parent_id || null,
        content: cleanContent,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            avatar_url: true,
            referral_code: true,
            is_premium: true,
          },
        },
        replies: true,
      },
    });

    // Notification handling for Comments and Replies
    try {
      const actorName = comment.user?.full_name || comment.user?.phone || 'Someone';
      const snippet = cleanContent.length > 55 ? `${cleanContent.slice(0, 52)}...` : cleanContent;

      if (data.parent_id) {
        // 1. Reply: Notify author of the parent comment
        const parentComment = await this.prisma.marketplaceComment.findUnique({
          where: { id: data.parent_id },
          select: { user_id: true },
        });

        if (parentComment && parentComment.user_id !== userId) {
          await this.prisma.notification.create({
            data: {
              user_id: parentComment.user_id,
              actor_id: userId,
              type: 'MARKETPLACE_REPLY',
              title: 'New Reply',
              message: `${actorName} replied: "${snippet}"`,
              entity_id: postId,
            },
          });
        }

        // 2. Also notify the post author if different from commenter and parent author
        if (post.user_id !== userId && post.user_id !== parentComment?.user_id) {
          await this.prisma.notification.create({
            data: {
              user_id: post.user_id,
              actor_id: userId,
              type: 'MARKETPLACE_COMMENT',
              title: 'New Comment',
              message: `${actorName} commented on your post: "${snippet}"`,
              entity_id: postId,
            },
          });
        }
      } else {
        // Top-level comment: Notify the post author
        if (post.user_id !== userId) {
          await this.prisma.notification.create({
            data: {
              user_id: post.user_id,
              actor_id: userId,
              type: 'MARKETPLACE_COMMENT',
              title: 'New Comment',
              message: `${actorName} commented on your post: "${snippet}"`,
              entity_id: postId,
            },
          });
        }
      }
    } catch {}

    return {
      success: true,
      message: 'Comment added successfully',
      comment,
    };
  }

  /**
   * Delete comment (by author or admin)
   */
  async deleteComment(userId: string, commentId: string, isAdmin = false) {
    const comment = await this.prisma.marketplaceComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    if (!isAdmin && comment.user_id !== userId) {
      throw new UnauthorizedException('You do not have permission to delete this comment');
    }

    try {
      await this.prisma.marketplaceComment.delete({ where: { id: commentId } });
    } catch (err: any) {
      if (err.code !== 'P2025') throw err;
    }

    return { success: true, message: 'Comment deleted successfully' };
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  /**
   * Get user's notifications
   */
  async getNotifications(userId: string, limit = 30) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              full_name: true,
              phone: true,
              avatar_url: true,
              is_premium: true,
            },
          },
        },
      }),
      this.prisma.notification.count({
        where: { user_id: userId, is_read: false },
      }),
    ]);

    return {
      success: true,
      notifications,
      unread_count: unreadCount,
    };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  /**
   * Mark a single notification as read
   */
  async markNotificationRead(userId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: { is_read: true },
    });

    return {
      success: true,
      message: 'Notification marked as read',
    };
  }
}
