import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MonetagService } from './monetag.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';

@Controller('ads')
export class AdsController {
  constructor(private readonly monetagService: MonetagService) {}

  /**
   * Called by the frontend to get the signed token and Zone ID
   * needed to initialize the Monetag Rewarded Interstitial.
   *
   * GET /api/ads/monetag-init
   * Requires: User JWT auth
   * Returns: { token, zoneId }
   */
  @UseGuards(UserJwtGuard)
  @Get('monetag-init')
  async getMonetagInit(@Request() req: any) {
    const { token, zoneId } = await this.monetagService.generateUserToken(req.user.id);
    return {
      success: true,
      data: {
        user_id: req.user.id,
        token,
        zone_id: zoneId,
      },
    };
  }

  /**
   * Called by Monetag's servers (NOT the user's browser) after a confirmed ad view.
   * Monetag hits this URL server-to-server, so no user JWT is needed.
   *
   * GET /api/ads/monetag-postback?uid={userId}&token={hmac}
   * Must return plain text "OK" on success (Monetag requirement).
   */
  @Get('monetag-postback')
  @HttpCode(HttpStatus.OK)
  async handleMonetagPostback(
    @Query('uid') userId: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const result = await this.monetagService.handlePostback(userId, token);
    // Monetag requires plain text "OK" response
    res.setHeader('Content-Type', 'text/plain');
    res.send(result);
  }
}
