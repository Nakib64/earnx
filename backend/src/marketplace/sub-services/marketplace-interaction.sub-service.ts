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
}
