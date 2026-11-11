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
  Request,
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
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { UpdateListingDto } from './dto/update-listing.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create or onboard a Product [Admin, Seller]',
    description:
      'Sellers create new catalog products; only admins may extend an existing master. Use POST /products/listings to offer an existing variant.',
  })
  @ApiResponse({ status: 201, description: 'Product processed successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Brand or Category not found.' })
  @ApiResponse({ status: 409, description: 'Product or Variant conflict.' })
  @ApiForbiddenResponse({ description: 'Requires Admin or Seller role.' })
  create(
    @Request() req: RequestWithUser,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(
      req.user.sub,
      createProductDto,
      req.user.role,
    );
  }

  // Seller Listing & Inventory Management

  @Post('listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Add Listing for a Variant [Seller]',
    description:
      'Directly list against an existing product variant with price, MRP, stock, and seller SKU.',
  })
  @ApiResponse({ status: 201, description: 'Listing created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or price exceeds MRP.',
  })
  @ApiResponse({
    status: 404,
    description: 'Variant not found or seller profile missing.',
  })
  @ApiResponse({
    status: 409,
    description: 'Product variant already listed by this seller.',
  })
  @ApiForbiddenResponse({ description: 'Requires Seller role.' })
  createListing(
    @Request() req: RequestWithUser,
    @Body() dto: CreateListingDto,
  ) {
    return this.productsService.addListing(req.user.sub, dto);
  }

  @Post('listing/:productId/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Add Listing via URL params [Seller]',
    description:
      'Add listing by specifying productId and variantId in URL params.',
  })
  @ApiParam({ name: 'productId', type: Number, example: 1 })
  @ApiParam({ name: 'variantId', type: Number, example: 101 })
  @ApiResponse({ status: 201, description: 'Listing created successfully.' })
  @ApiResponse({ status: 404, description: 'Product or Variant not found.' })
  @ApiForbiddenResponse({ description: 'Requires Seller role.' })
  addProductListing(
    @Request() req: RequestWithUser,
    @Param('productId', ParseIntPipe) productId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: CreateListingDto,
  ) {
    return this.productsService.addListing(
      req.user.sub,
      dto,
      productId,
      variantId,
    );
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get My Listings [Seller]',
    description:
      'Fetch all products, variants and listings of the logged-in seller with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller listings fetched successfully.',
  })
  @ApiForbiddenResponse({ description: 'Requires Seller role.' })
  myListings(@Request() req: RequestWithUser, @Query() query: QueryListingDto) {
    return this.productsService.myListings(req.user.sub, query);
  }

  @Patch('listings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update My Listing [Seller]',
    description:
      'Update price, MRP, stock, SKU, condition, or status of seller listing.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Listing updated successfully.' })
  @ApiResponse({ status: 404, description: 'Listing not found.' })
  @ApiForbiddenResponse({ description: 'Requires Seller role.' })
  updateListing(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
  ) {
    return this.productsService.updateListing(req.user.sub, id, dto);
  }

  @Patch('listing/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update My Listing (alias) [Seller]',
    description: 'Alias for PATCH /products/listings/:id.',
  })
  updateListingAlias(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
  ) {
    return this.productsService.updateListing(req.user.sub, id, dto);
  }

  @Patch('listings/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Deactivate My Listing [Seller]',
    description: 'Deactivates seller listing without deleting the record.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Listing deactivated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Listing not found.' })
  @ApiForbiddenResponse({ description: 'Requires Seller role.' })
  deactivateListing(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.deactivateListing(req.user.sub, id);
  }

  @Patch('listings/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Activate My Listing [Seller]',
    description: 'Reactivates an inactive seller listing.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Listing activated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Listing not found.' })
  @ApiForbiddenResponse({ description: 'Requires Seller role.' })
  activateListing(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.activateListing(req.user.sub, id);
  }

  @Delete('listings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete My Listing [Seller]',
    description: 'Soft-deletes a seller listing.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Listing deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Listing not found.' })
  @ApiForbiddenResponse({ description: 'Requires Seller role.' })
  deleteListing(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.deleteListing(req.user.sub, id);
  }

  @Delete('listing/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Seller)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete My Listing (alias) [Seller]',
    description: 'Alias for DELETE /products/listings/:id.',
  })
  deleteListingAlias(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.deleteListing(req.user.sub, id);
  }

  // Catalog Product Routes

  @Get()
  @ApiOperation({
    summary: 'Get all Products',
    description: 'Returns all Products.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'puma' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'title' })
  @ApiQuery({ name: 'order', required: false, type: String, example: 'ASC' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'brandId', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Products fetched successfully.' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get Product by Slug [SEO / Customer View]',
    description:
      'Returns a single product with full specifications, images, variants, seller listings, and Buy Box winner.',
  })
  @ApiParam({ name: 'slug', type: String, example: 'iphone-15-pro' })
  @ApiResponse({ status: 200, description: 'Product fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get products by ID',
    description: 'Returns a single products.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Product fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update a product [Admin]',
    description:
      'Updates name, image of a product. Slug is auto-regenerated on name change. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({
    status: 409,
    description: 'Product name already exists.',
  })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete a product [Admin]',
    description: 'Soft-deletes a product. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete a product image [Admin]',
    description: 'Deletes a specific image from a product.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiParam({ name: 'imageId', type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Product image deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Image or product not found.' })
  @ApiForbiddenResponse({ description: 'Requires Admin or Seller role.' })
  deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.productsService.deleteProductImage(id, imageId);
  }
}
