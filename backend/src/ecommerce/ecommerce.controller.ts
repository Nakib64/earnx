import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { EcommerceService } from './ecommerce.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';
import { OrderStatus } from '@prisma/client';

const uploadStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'products');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `prod-${uniqueSuffix}${ext}`);
  },
});

@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) {}

  // ============================================================================
  // PUBLIC PRODUCT ENDPOINTS
  // ============================================================================

  /**
   * Get 10 latest products (for homepage)
   */
  @Get('products/latest')
  async getLatestProducts(@Query('limit') limit = '10') {
    return this.ecommerceService.getLatestProducts(parseInt(limit, 10) || 10);
  }

  /**
   * Get all active products with pagination & search (for shop catalog)
   */
  @Get('products')
  async getProducts(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search = '',
    @Query('category') category = '',
  ) {
    return this.ecommerceService.getProducts(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      search,
      category,
    );
  }

  /**
   * Get single product details
   */
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.ecommerceService.getProductById(id);
  }

  // ============================================================================
  // USER AUTHENTICATED ENDPOINTS
  // ============================================================================

  /**
   * Process checkout order via User Wallet Balance
   */
  @UseGuards(UserJwtGuard)
  @Post('orders/checkout')
  async checkoutOrder(
    @Request() req: any,
    @Body()
    body: {
      items: { product_id: string; quantity: number }[];
      customer_name: string;
      customer_phone: string;
      district: string;
      city?: string;
      delivery_address: string;
      notes?: string;
    },
  ) {
    return this.ecommerceService.checkoutOrder(req.user.id, body);
  }

  /**
   * Get current user's past orders
   */
  @UseGuards(UserJwtGuard)
  @Get('orders/my')
  async getUserOrders(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.ecommerceService.getUserOrders(
      req.user.id,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
  }

  // ============================================================================
  // ADMIN MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * Admin: Upload multiple product images
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: uploadStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }

    const urls = files.map((f) => `/uploads/products/${f.filename}`);
    return {
      success: true,
      urls,
    };
  }

  /**
   * Admin: Ecommerce overview statistics
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/stats')
  async getEcommerceStats() {
    return this.ecommerceService.getEcommerceStats();
  }

  /**
   * Admin: Get all products (active and inactive)
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/products')
  async getAdminProducts(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('search') search = '',
  ) {
    return this.ecommerceService.getAdminProducts(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 50,
      search,
    );
  }

  /**
   * Admin: Create new product
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/products')
  async createProduct(
    @Body()
    body: {
      name: string;
      description?: string;
      price: number;
      stock?: number;
      images?: string[];
      category?: string;
    },
  ) {
    return this.ecommerceService.createProduct(body);
  }

  /**
   * Admin: Update product
   */
  @UseGuards(AdminJwtGuard)
  @Patch('admin/products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.ecommerceService.updateProduct(id, body);
  }

  /**
   * Admin: Delete product
   */
  @UseGuards(AdminJwtGuard)
  @Delete('admin/products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.ecommerceService.deleteProduct(id);
  }

  /**
   * Admin: View all orders
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/orders')
  async getAdminOrders(
    @Query('page') page = '1',
    @Query('limit') limit = '30',
    @Query('status') status = '',
    @Query('search') search = '',
  ) {
    return this.ecommerceService.getAdminOrders(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 30,
      status,
      search,
    );
  }

  /**
   * Admin: Update order status
   */
  @UseGuards(AdminJwtGuard)
  @Patch('admin/orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
  ) {
    if (!body.status || !Object.values(OrderStatus).includes(body.status)) {
      throw new BadRequestException('Valid order status is required');
    }
    return this.ecommerceService.updateOrderStatus(id, body.status);
  }
}
