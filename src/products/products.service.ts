import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './entities/product.entity';
import { generateUniqueSlug } from 'src/common/utils/slug.utils';
import { ProductQueryDto } from './dto/query-product.dto';
import { Op } from 'sequelize';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const existingProduct = await this.productModel.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new ConflictException('Product already exist.');
    }
    const slug = await generateUniqueSlug(
      createProductDto.name,
      async (slug) => {
        return !!(await this.productModel.findOne({ where: { slug } }));
      },
    );

    const product = await this.productModel.create({
      ...createProductDto,
      slug,
    });

    return {
      message: 'Product created successfully.',
      product,
    };
  }

  async findAll(query: ProductQueryDto) {
    const { page, limit, search, sortBy, order, categoryId } = query;

    // offset btata hai kitne items ke baad skip kr na hai
    /*
        page = 1, limit = 10 → offset = (1-1) × 10 = 0 → pehle 10 records
        page = 2, limit = 10 → offset = 10 → pehle 10 skip, next 10
        page = 3, limit = 10 → offset = 20 → pehle 20 skip, next 10
     */
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
    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }

    const { rows, count } = await this.productModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, order]],
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    return {
      message: 'Found All the products successfully.',
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
    const product = await this.productModel.findByPk(id, {
      include: [Category],
    });

    if (!product) throw new NotFoundException('Product not found.');
    return {
      message: 'Product fetched successfully.',
      product,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { product } = await this.findOne(id);
    if (!product) throw new NotFoundException('Product not found.');

    const updateData: Partial<Product> = { ...updateProductDto };

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProduct = await this.productModel.findOne({
        where: { name: updateProductDto.name },
      });

      if (existingProduct) {
        throw new ConflictException('Product already exist.');
      }

      updateData.slug = await generateUniqueSlug(
        updateProductDto.name,
        async (slug) => {
          return !!(await this.productModel.findOne({ where: { slug } }));
        },
      );
    }

    await product.update(updateData);
    return {
      message: 'Product updated successfully.',
      product,
    };
  }

  async remove(id: number) {
    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundException('Product not found.');

    await product.destroy();

    return {
      message: 'Product destroy successfully.',
    };
  }
}
