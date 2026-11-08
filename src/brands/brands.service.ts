import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { generateUniqueSlug } from 'src/common/utils/slug.utils';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/query-brand.dto';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand)
    private readonly brandModel: typeof Brand,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async create(dto: CreateBrandDto) {
    const existingBrand = await this.brandModel.findOne({
      where: { name: dto.name },
    });

    if (existingBrand) {
      throw new ConflictException('Brand already exist.');
    }

    const slug = await generateUniqueSlug(dto.slug || dto.name, async (s) => {
      return !!(await this.brandModel.findOne({ where: { slug: s } }));
    });

    const brand = await this.brandModel.create({
      name: dto.name,
      slug,
      logoUrl: dto.logoUrl,
    });

    return {
      message: 'Brand created successfully.',
      brand,
    };
  }

  async findAll(query: BrandQueryDto) {
    const { page, limit, search, sortBy, order } = query;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where[Op.or] = [
        {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          slug: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const { rows, count } = await this.brandModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, order]],
    });

    return {
      message: 'Brands fetched successfully.',
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number) {
    const brand = await this.brandModel.findByPk(id, {
      include: [
        {
          model: Product,
          attributes: ['id', 'title', 'slug', 'status'],
        },
      ],
    });

    if (!brand) throw new NotFoundException('Brand not found.');

    return {
      message: 'Brand fetched successfully.',
      brand,
    };
  }

  async findBySlug(slug: string) {
    const brand = await this.brandModel.findOne({
      where: { slug },
      include: [
        {
          model: Product,
          attributes: ['id', 'title', 'slug', 'status'],
        },
      ],
    });

    if (!brand) throw new NotFoundException('Brand not found.');

    return {
      message: 'Brand fetched successfully.',
      brand,
    };
  }

  async update(id: number, dto: UpdateBrandDto) {
    const { brand } = await this.findOne(id);
    if (!brand) throw new NotFoundException('Brand not found.');

    const updateData: Partial<Brand> = { ...dto };

    if (dto.name && dto.name !== brand.name) {
      const existingBrand = await this.brandModel.findOne({
        where: { name: dto.name },
      });

      if (existingBrand) {
        throw new ConflictException('Brand already exist.');
      }

      updateData.slug = await generateUniqueSlug(dto.name, async (s) => {
        return !!(await this.brandModel.findOne({ where: { slug: s } }));
      });
    }

    await brand.update(updateData);

    return {
      message: 'Brand updated successfully.',
      brand,
    };
  }

  async remove(id: number) {
    const { brand } = await this.findOne(id);
    if (!brand) throw new NotFoundException('Brand not found.');

    const productsCount = await this.productModel.count({
      where: { brandId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `Cannot delete brand. ${productsCount} product(s) are associated with this brand.`,
      );
    }

    await brand.destroy();

    return {
      message: 'Brand deleted successfully.',
    };
  }
}
