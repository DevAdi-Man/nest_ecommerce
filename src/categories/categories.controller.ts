import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  // PUBLIC ROUTES (no auth required)

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns all categories with their parent and direct children.',
  })
  @ApiResponse({ status: 200, description: 'Categories fetched successfully.' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Get category tree',
    description: 'Returns a nested tree structure of all categories from root to leaves.',
  })
  @ApiResponse({ status: 200, description: 'Category tree fetched successfully.' })
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get('roots')
  @ApiOperation({
    summary: 'Get root categories',
    description: 'Returns only top-level categories (those without a parent).',
  })
  @ApiResponse({ status: 200, description: 'Root categories fetched successfully.' })
  findRoots() {
    return this.categoriesService.findRoots();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search categories by name',
    description: 'Case-insensitive partial name match.',
  })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'shirt' })
  @ApiResponse({ status: 200, description: 'Search results fetched successfully.' })
  search(@Query('q') query: string) {
    return this.categoriesService.search(query);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Returns a single category matched by its URL-friendly slug.',
  })
  @ApiParam({ name: 'slug', type: String, example: 'mens-clothing' })
  @ApiResponse({ status: 200, description: 'Category found successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Returns a single category with its parent and children.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Category fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({
    summary: 'Get children of a category',
    description: 'Returns all direct child categories for the given parent ID.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Child categories fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Parent category not found.' })
  findChildren(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findChildren(id);
  }

  // ADMIN-ONLY ROUTES

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a new category [Admin]',
    description: 'Creates a new category. Optionally assign a parent for sub-categories. Requires Admin role.',
  })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Parent category not found.' })
  @ApiResponse({ status: 409, description: 'Category already exists.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update a category [Admin]',
    description: 'Updates name, image, or parent of a category. Slug is auto-regenerated on name change. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'Category name already exists or circular parent.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete a category [Admin]',
    description: 'Soft-deletes a category. Cannot delete if it has child categories. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'Category has child categories.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

  @Get('deleted/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all soft-deleted categories [Admin]',
    description: 'Returns all categories that have been soft-deleted. Requires Admin role.',
  })
  @ApiResponse({ status: 200, description: 'Deleted categories fetched successfully.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  findDeleted() {
    return this.categoriesService.findDeleted();
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Restore a soft-deleted category [Admin]',
    description: 'Restores a previously soft-deleted category back to active state. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Category restored successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'Category is not deleted.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.restore(id);
  }
}
