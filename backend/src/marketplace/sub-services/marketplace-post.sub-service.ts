import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarketplacePostSubService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get paginated posts feed with likes count, comments, and nested replies
   */
  async getPosts(page = 1, limit = 20, currentUserId?: string) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.marketplacePost.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
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
              designation: { select: { name: true, stars: true } },
            },
          },
          likes: {
            select: {
              user_id: true,
            },
          },
          comments: {
            where: { parent_id: null }, // Top-level comments
            orderBy: { created_at: 'asc' },
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
              replies: {
                orderBy: { created_at: 'asc' },
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
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.marketplacePost.count(),
    ]);

    const formatted = posts.map((p) => {
      const isLiked = currentUserId
        ? p.likes.some((l) => l.user_id === currentUserId)
        : false;

      return {
        id: p.id,
        content: p.content,
        image_url: p.image_url,
        created_at: p.created_at,
        updated_at: p.updated_at,
        user: p.user,
        likes_count: p._count.likes,
        comments_count: p._count.comments,
        is_liked: isLiked,
        comments: p.comments,
      };
    });

    return {
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new marketplace post
   */
  async createPost(
    userId: string,
    data: { content: string; image_url?: string },
  ) {
    const cleanContent = data.content?.trim();
    if (!cleanContent && !data.image_url) {
      throw new BadRequestException('Post must contain either text content or an image');
    }

    const post = await this.prisma.marketplacePost.create({
      data: {
        user_id: userId,
        content: cleanContent || '',
        image_url: data.image_url || null,
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
            designation: { select: { name: true, stars: true } },
          },
        },
      },
    });

    return {
      success: true,
      message: 'Post published successfully!',
      post: {
        ...post,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        comments: [],
      },
    };
  }

  /**
   * Delete post (by author or admin)
   */
  async deletePost(userId: string, postId: string, isAdmin = false) {
    const post = await this.prisma.marketplacePost.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    if (!isAdmin && post.user_id !== userId) {
      throw new UnauthorizedException('You do not have permission to delete this post');
    }

    await this.prisma.marketplacePost.delete({ where: { id: postId } });

    return { success: true, message: 'Post deleted successfully' };
  }
}
