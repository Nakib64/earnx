import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, TransactionType } from '@prisma/client';

@Injectable()
export class EcommerceService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  /**
   * Get all active products for shop catalog (paginated, searchable)
   */
  async getProducts(page = 1, limit = 20, search?: string, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = { is_active: true };

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'All' && category.trim()) {
      where.category = { equals: category.trim(), mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get 10 latest active products for homepage showcase
   */
  async getLatestProducts(limit = 10) {
    const products = await this.prisma.product.findMany({
      where: { is_active: true },
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: products,
    };
  }

  /**
   * Get single product details
   */
  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      data: product,
    };
  }

  /**
   * Admin: Create new product
   */
  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    images?: string[];
    category?: string;
  }) {
    if (!data.name || !data.price || data.price <= 0) {
      throw new BadRequestException('Product name and valid price are required');
    }

    const product = await this.prisma.product.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price,
        stock: data.stock !== undefined ? Number(data.stock) : 100,
        images: Array.isArray(data.images) ? data.images : [],
        category: data.category?.trim() || 'General',
        is_active: true,
      },
    });

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  /**
   * Admin: Update product
   */
  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      price: number;
      stock: number;
      images: string[];
      category: string;
      is_active: boolean;
    }>,
  ) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.description !== undefined) updatePayload.description = data.description.trim();
    if (data.price !== undefined) updatePayload.price = data.price;
    if (data.stock !== undefined) updatePayload.stock = Number(data.stock);
    if (data.images !== undefined) updatePayload.images = data.images;
    if (data.category !== undefined) updatePayload.category = data.category.trim();
    if (data.is_active !== undefined) updatePayload.is_active = data.is_active;

    const product = await this.prisma.product.update({
      where: { id },
      data: updatePayload,
    });

    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  /**
   * Admin: Delete product
   */
  async deleteProduct(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({ where: { id } });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  /**
   * Admin: Get all products (including inactive)
   */
  async getAdminProducts(page = 1, limit = 50, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { category: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================================
  // ORDERS & WALLET CHECKOUT
  // ============================================================================

  /**
   * Process Checkout: strictly clears payment via User Wallet Balance
   */
  async checkoutOrder(
    userId: string,
    data: {
      items: { product_id: string; quantity: number }[];
      customer_name: string;
      customer_phone: string;
      district: string;
      city?: string;
      delivery_address: string;
      notes?: string;
    },
  ) {
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequestException('Your cart is empty. Please add items before checking out.');
    }

    if (!data.customer_name?.trim() || !data.customer_phone?.trim() || !data.district?.trim() || !data.delivery_address?.trim()) {
      throw new BadRequestException('Please complete all required shipping details (Full Name, Phone, District, Address).');
    }

    // Verify user exists and fetch current wallet balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, full_name: true, phone: true, wallet_balance: true },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    // Fetch product records from DB for authoritative pricing & stock
    const productIds = data.items.map((i) => i.product_id);
    const dbProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds }, is_active: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedTotal = 0;
    const orderItemsPayload: {
      product_id: string;
      product_name: string;
      product_image: string | null;
      unit_price: number;
      quantity: number;
      total_price: number;
    }[] = [];

    for (const item of data.items) {
      const prod = productMap.get(item.product_id);
      if (!prod) {
        throw new BadRequestException(`Product with ID "${item.product_id}" is no longer available.`);
      }

      const qty = Math.max(1, parseInt(String(item.quantity), 10) || 1);
      if (prod.stock < qty) {
        throw new BadRequestException(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${qty}.`);
      }

      const unitPrice = Number(prod.price);
      const lineTotal = Number((unitPrice * qty).toFixed(2));
      calculatedTotal += lineTotal;

      orderItemsPayload.push({
        product_id: prod.id,
        product_name: prod.name,
        product_image: prod.images && prod.images.length > 0 ? prod.images[0] : null,
        unit_price: unitPrice,
        quantity: qty,
        total_price: lineTotal,
      });
    }

    calculatedTotal = Number(calculatedTotal.toFixed(2));
    const currentBalance = Number(user.wallet_balance);

    if (currentBalance < calculatedTotal) {
      throw new BadRequestException(
        `Insufficient wallet balance. Total is ৳${calculatedTotal}, but your wallet balance is ৳${currentBalance.toFixed(2)}. Please deposit funds first.`,
      );
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Atomic execution: Deduct wallet balance, record transaction, decrement stock, create order & items
    const result = await this.prisma.$transaction(async (tx) => {
      const balanceBefore = currentBalance;
      const balanceAfter = Number((balanceBefore - calculatedTotal).toFixed(2));

      // 1. Deduct user wallet balance
      await tx.user.update({
        where: { id: userId },
        data: { wallet_balance: balanceAfter },
      });

      // 2. Create Wallet Transaction record
      await tx.walletTransaction.create({
        data: {
          user_id: userId,
          type: TransactionType.ECOMMERCE_ORDER,
          amount: calculatedTotal,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: `Order payment for ${orderNumber} (${orderItemsPayload.length} item${orderItemsPayload.length > 1 ? 's' : ''})`,
        },
      });

      // 3. Decrement product stock
      for (const item of orderItemsPayload) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 4. Create Order with Items
      const createdOrder = await tx.order.create({
        data: {
          order_number: orderNumber,
          user_id: userId,
          total_amount: calculatedTotal,
          status: OrderStatus.PENDING,
          customer_name: data.customer_name.trim(),
          customer_phone: data.customer_phone.trim(),
          district: data.district.trim(),
          city: data.city?.trim() || null,
          delivery_address: data.delivery_address.trim(),
          notes: data.notes?.trim() || null,
          payment_method: 'WALLET',
          paid_at: new Date(),
          items: {
            create: orderItemsPayload.map((it) => ({
              product_id: it.product_id,
              product_name: it.product_name,
              product_image: it.product_image,
              unit_price: it.unit_price,
              quantity: it.quantity,
              total_price: it.total_price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return {
        order: createdOrder,
        balance_after: balanceAfter,
      };
    });

    return {
      success: true,
      message: `Order #${orderNumber} placed and paid successfully from your wallet!`,
      data: result.order,
      balance_after: result.balance_after,
    };
  }

  /**
   * User: View their own past orders
   */
  async getUserOrders(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          items: true,
        },
      }),
      this.prisma.order.count({ where: { user_id: userId } }),
    ]);

    return {
      success: true,
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: View all orders with customer details and items
   */
  async getAdminOrders(page = 1, limit = 30, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status && status !== 'ALL' && Object.values(OrderStatus).includes(status as any)) {
      where.status = status as OrderStatus;
    }

    if (search && search.trim()) {
      where.OR = [
        { order_number: { contains: search.trim(), mode: 'insensitive' } },
        { customer_name: { contains: search.trim(), mode: 'insensitive' } },
        { customer_phone: { contains: search.trim(), mode: 'insensitive' } },
        { district: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
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
            },
          },
          items: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Update order status (Pending -> Processing -> Shipped -> Delivered -> Cancelled)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    // If changing to CANCELLED from a non-cancelled status, optionally refund to wallet
    if (status === OrderStatus.CANCELLED && existing.status !== OrderStatus.CANCELLED) {
      const refundAmount = Number(existing.total_amount);
      const user = await this.prisma.user.findUnique({ where: { id: existing.user_id } });

      if (user) {
        const balanceBefore = Number(user.wallet_balance);
        const balanceAfter = Number((balanceBefore + refundAmount).toFixed(2));

        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: existing.user_id },
            data: { wallet_balance: balanceAfter },
          }),
          this.prisma.walletTransaction.create({
            data: {
              user_id: existing.user_id,
              type: TransactionType.ADMIN_ADJUSTMENT,
              amount: refundAmount,
              balance_before: balanceBefore,
              balance_after: balanceAfter,
              description: `Refund for cancelled order #${existing.order_number}`,
            },
          }),
          // Restore stock
          ...existing.items.map((it) =>
            this.prisma.product.update({
              where: { id: it.product_id || '' },
              data: { stock: { increment: it.quantity } },
            }),
          ),
          this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.CANCELLED },
          }),
        ]);

        return {
          success: true,
          message: `Order #${existing.order_number} marked as Cancelled and ৳${refundAmount} was refunded to the user's wallet.`,
        };
      }
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return {
      success: true,
      message: `Order #${existing.order_number} status updated to ${status}.`,
      data: updated,
    };
  }

  /**
   * Admin: Overview ecommerce stats
   */
  async getEcommerceStats() {
    const [totalProducts, totalOrders, pendingOrders, revenueAggr] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.aggregate({
        _sum: { total_amount: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
    ]);

    return {
      success: true,
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: Number(revenueAggr._sum.total_amount || 0),
      },
    };
  }
}
