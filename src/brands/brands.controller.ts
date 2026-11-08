import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/query-brand.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // PUBLIC ROUTES

  @Get()
  @ApiOperation({
    summary: 'Get all brands',
    description: 'Returns all brands with pagination and search filters.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'nike' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'name' })
  @ApiQuery({ name: 'order', required: false, type: String, example: 'ASC' })
  @ApiResponse({ status: 200, description: 'Brands fetched successfully.' })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get brand by slug',
    description: 'Returns a single brand by its unique URL slug.',
  })
  @ApiParam({ name: 'slug', type: String, example: 'nike' })
  @ApiResponse({ status: 200, description: 'Brand fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Brand not found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get brand by ID',
    description: 'Returns a single brand by its numeric ID.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Brand fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Brand not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }

  // PROTECTED ROUTES

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a new brand [Admin, Seller]',
    description:
      'Creates a new brand. Requires Admin or Seller role. Slug is auto-generated if omitted.',
  })
  @ApiResponse({ status: 201, description: 'Brand created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Brand already exists.' })
  @ApiForbiddenResponse({ description: 'Requires Admin or Seller role.' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update a brand [Admin]',
    description:
      'Updates name, slug, or logoUrl of a brand. Slug is auto-regenerated if name changes. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Brand updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Brand not found.' })
  @ApiResponse({ status: 409, description: 'Brand name already exists.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete a brand [Admin]',
    description:
      'Soft-deletes a brand if no products are associated with it. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Brand not found.' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete brand with associated products.',
  })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }
}
