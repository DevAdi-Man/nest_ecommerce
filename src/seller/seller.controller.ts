import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { UpgradeSellerDto } from './dto/upgade-seller.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

import type { Request as ExpressRequest } from 'express';
import { SellerQueryDto } from './dto/query-seller.dto';

interface RequestWithUser extends ExpressRequest {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

@ApiTags('Seller')
@Controller('seller')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Roles(Role.Admin)
  @Post()
  @ApiOperation({
    summary: 'Create a new seller [Admin]',
    description: 'Creates a new seller account. Requires Admin role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Seller created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Required resource not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Seller already exists.',
  })
  @ApiForbiddenResponse({
    description: 'Requires Admin role.',
  })
  create(@Body() createSellerDto: CreateSellerDto) {
    return this.sellerService.create(createSellerDto);
  }

  @Roles(Role.Admin)
  @Get()
  @ApiOperation({
    summary: 'Get all sellers [Admin]',
    description: 'Returns all sellers. Requires Admin role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sellers fetched successfully.',
  })
  @ApiForbiddenResponse({
    description: 'Requires Admin role.',
  })
  findAll(@Query() query: SellerQueryDto) {
    return this.sellerService.findAll(query);
  }

  @Roles(Role.Seller)
  @Get('me')
  @ApiOperation({
    summary: 'Get Seller Profile',
    description: 'Seller Profile Details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Get Seller Profile Successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found.',
  })
  @ApiForbiddenResponse({
    description: 'Requires Seller role.',
  })
  findMe(@Request() req: RequestWithUser) {
    return this.sellerService.findMe(req.user.sub);
  }

  @Roles(Role.Seller)
  @Patch('me')
  @ApiOperation({
    summary: 'Seller profile update',
    description: 'Seller Profile update. Requires Seller role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller profile update successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found.',
  })
  @ApiForbiddenResponse({
    description: 'Requires Seller role.',
  })
  updateMe(
    @Request() req: RequestWithUser,
    @Body() updateSellerDto: UpdateSellerDto,
  ) {
    return this.sellerService.updateMe(req.user.sub, updateSellerDto);
  }

  @Roles(Role.Admin)
  @Get(':id')
  @ApiOperation({
    summary: 'Get seller by ID [Admin]',
    description: 'Returns a single seller by ID. Requires Admin role.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Seller fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found.',
  })
  @ApiForbiddenResponse({
    description: 'Requires Admin role.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sellerService.findOne(id);
  }

  @Post('upgrade')
  @ApiOperation({
    summary: 'Upgrade seller',
    description: 'Requests an upgrade for the currently authenticated seller.',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller upgrade processed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid upgrade request.',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found.',
  })
  upgrade(
    @Request() req: RequestWithUser,
    @Body() upgradeSellerDto: UpgradeSellerDto,
  ) {
    return this.sellerService.upgrade(req.user.sub, upgradeSellerDto);
  }

  @Roles(Role.Admin)
  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve seller [Admin]',
    description: 'Approves a seller account. Requires Admin role.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Seller approved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found.',
  })
  @ApiForbiddenResponse({
    description: 'Requires Admin role.',
  })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.sellerService.approve(id);
  }

  @Roles(Role.Admin)
  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject seller [Admin]',
    description: 'Reject a seller account. Requires Admin role.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Seller rejected successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found.',
  })
  @ApiForbiddenResponse({
    description: 'Requires Admin role.',
  })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.sellerService.reject(id);
  }
}
