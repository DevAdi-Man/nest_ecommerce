import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

interface RequestWithUser extends ExpressRequest {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

@ApiTags('Address')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a new Address',
    description: 'Creates a new address for the authenticated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Address already exists.',
  })
  create(
    @Request() req: RequestWithUser,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(req.user.sub, createAddressDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Fetched all the addresses.',
    description: 'feching all the address for  authenticated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Address feching successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Address already exists.',
  })
  findAll(@Request() req: RequestWithUser) {
    return this.addressesService.findAll(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a single address by ID' })
  @ApiResponse({ status: 200, description: 'Address fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.addressesService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update an address.' })
  @ApiResponse({ status: 200, description: 'Updating address successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, req.user.sub, updateAddressDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Deleting an address.' })
  @ApiResponse({ status: 200, description: 'Deleting address successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.addressesService.remove(id, req.user.sub);
  }
}
