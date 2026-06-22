import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role as RoleEnum } from 'src/auth/enums/role.enum';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
  ) {}

  async onModuleInit() {
    const defaultRoles = [
      { name: RoleEnum.Admin, description: 'Full system access' },
      { name: RoleEnum.Customer, description: 'Regular buyer' },
      { name: RoleEnum.Seller, description: 'Product seller' },
      { name: RoleEnum.Guest, description: 'Limited access' },
      { name: RoleEnum.Delivery, description: 'Delivery personnel' },
    ];

    for (const role of defaultRoles) {
      await this.roleModel.findOrCreate({ where: { name: role.name }, defaults: role });
    }
  }

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.roleModel.findOne({ where: { name: createRoleDto.name } });
    if (existing) throw new ConflictException('Role already exists.');
    return this.roleModel.create(createRoleDto as any);
  }

  findAll() {
    return this.roleModel.findAll();
  }

  async findOne(id: number) {
    const role = await this.roleModel.findByPk(id);
    if (!role) throw new NotFoundException('Role not found.');
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    return role.update(updateRoleDto);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    await role.destroy();
    return { message: 'Role deleted successfully.' };
  }
}
