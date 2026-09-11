import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Add an item to the cart' })
  create(
    @Request() req: RequestWithUser,
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartService.create(req.user.id, createCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  findOne(@Request() req: RequestWithUser) {
    return this.cartService.findOne(req.user.id);
  }

  @Patch(':cartItemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  update(
    @Request() req: RequestWithUser,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.update(req.user.id, cartItemId, updateCartDto);
  }

  @Delete(':cartItemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  remove(
    @Request() req: RequestWithUser,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
  ) {
    return this.cartService.remove(req.user.id, cartItemId);
  }
}
