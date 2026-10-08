import { Injectable } from '@nestjs/common';
import { MarketplacePostSubService } from './sub-services/marketplace-post.sub-service';
import { MarketplaceInteractionSubService } from './sub-services/marketplace-interaction.sub-service';

/**
 * MarketplaceService acts as a Facade orchestrating marketplace sub-services:
 * - MarketplacePostSubService: Post feeds, creations, author deletions
 * - MarketplaceInteractionSubService: Likes, threaded comments, replies
 */
@Injectable()
export class MarketplaceService {
  constructor(
    private readonly postSubService: MarketplacePostSubService,
    private readonly interactionSubService: MarketplaceInteractionSubService,
  ) {}

  // ==========================================
  // POSTS
  // ==========================================
  async getPosts(page = 1, limit = 20, currentUserId?: string) {
    return this.postSubService.getPosts(page, limit, currentUserId);
  }

  async createPost(
    userId: string,
    data: { content: string; image_url?: string },
  ) {
    return this.postSubService.createPost(userId, data);
  }

  async deletePost(userId: string, postId: string, isAdmin = false) {
    return this.postSubService.deletePost(userId, postId, isAdmin);
  }

  // ==========================================
  // INTERACTIONS
  // ==========================================
  async toggleLike(userId: string, postId: string) {
    return this.interactionSubService.toggleLike(userId, postId);
  }

  async addComment(
    userId: string,
    postId: string,
    data: { content: string; parent_id?: string },
  ) {
    return this.interactionSubService.addComment(userId, postId, data);
  }

  async deleteComment(userId: string, commentId: string, isAdmin = false) {
    return this.interactionSubService.deleteComment(userId, commentId, isAdmin);
  }
}
