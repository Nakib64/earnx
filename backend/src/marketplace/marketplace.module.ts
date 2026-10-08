import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketplacePostSubService } from './sub-services/marketplace-post.sub-service';
import { MarketplaceInteractionSubService } from './sub-services/marketplace-interaction.sub-service';

@Module({
  imports: [PrismaModule],
  controllers: [MarketplaceController],
  providers: [
    MarketplacePostSubService,
    MarketplaceInteractionSubService,
    MarketplaceService,
  ],
  exports: [
    MarketplacePostSubService,
    MarketplaceInteractionSubService,
    MarketplaceService,
  ],
})
export class MarketplaceModule {}
