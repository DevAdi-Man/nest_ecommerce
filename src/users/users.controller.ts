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

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Roles(Role.Admin)
  @Post()
  @ApiOperation({
    summary: 'Create a new user [Admin]',
    description: 'Creates a new user account. Requires Admin role.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.Admin)
  @Get()
  @ApiOperation({
    summary: 'Get all users [Admin]',
    description: 'Returns a paginated list of users. Requires Admin role.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'aditya' })
  @ApiQuery({ name: 'roleId', required: false, type: Number, example: 2 })
  @ApiQuery({ name: 'isVerifiedEmail', required: false, type: Boolean, example: true })
  @ApiResponse({ status: 200, description: 'Users fetched successfully.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Roles(Role.Admin)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID [Admin]',
    description: 'Returns a single user by its ID. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'User fetched successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user [Admin]',
    description: 'Updates an existing user. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user [Admin]',
    description: 'Deletes a user by ID. Requires Admin role.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiForbiddenResponse({ description: 'Requires Admin role.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
