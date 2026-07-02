import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { generateUniqueSlug } from 'src/common/utils/slug.utils';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private readonly categoryModel: typeof Category,
  ) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryModel.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exist.');
    }

    const slug = await generateUniqueSlug(
      createCategoryDto.name,
      async (slug) => {
        return !!(
          await this.categoryModel.findOne({ where: { slug } })
        );
      },
    );

    if (createCategoryDto.parentId !== undefined) {
      const parent = await this.categoryModel.findByPk(createCategoryDto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent Category does not exist.');
      }
    }

    const category = await this.categoryModel.create({
      ...createCategoryDto,
      slug,
    });

    return {
      message: 'Category created successfully.',
      category,
    };
  }

  // findAll — includes parent and direct children associations
  async findAll() {
    const categories = await this.categoryModel.findAll({
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
        { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] },
      ],
      order: [['name', 'ASC']],
    });

    return {
      message: 'Found All the categories successfully.',
      categories,
    };
  }

  // findOne by id — includes parent and children
  async findOne(id: number) {
    const category = await this.categoryModel.findByPk(id, {
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
        { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] },
      ],
    });

    if (!category) throw new NotFoundException('Category not found.');

    return {
      message: 'Category fetched successfully.',
      category,
    };
  }

  // update by id
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByPk(id);
    if (!category) throw new NotFoundException('Category not found.');

    const updateData: Partial<Category> = { ...updateCategoryDto };

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryModel.findOne({
        where: { name: updateCategoryDto.name },
      });
      if (existingCategory) throw new ConflictException('Category already exists.');

      updateData.slug = await generateUniqueSlug(
        updateCategoryDto.name,
        async (slug) => {
          return !!(await this.categoryModel.findOne({ where: { slug } }));
        },
      );
    }

    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent.');
      }
      const parent = await this.categoryModel.findByPk(updateCategoryDto.parentId);
      if (!parent) throw new NotFoundException('Parent category not found.');
    }

    await category.update(updateData);

    return {
      message: 'Category updated successfully.',
      category,
    };
  }

  // soft-delete by id (paranoid: true keeps the row with deletedAt set)
  async remove(id: number) {
    const category = await this.categoryModel.findByPk(id);
    if (!category) throw new NotFoundException('Category not found.');

    const hasChildren = await this.categoryModel.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      throw new ConflictException(
        'Cannot delete a category that has child categories.',
      );
    }

    await category.destroy();

    return {
      message: 'Category deleted successfully.',
    };
  }

  // findBySlug
  async findBySlug(slug: string) {
    const category = await this.categoryModel.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
        { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] },
      ],
    });

    if (!category) throw new NotFoundException('Category not found.');

    return {
      message: 'Category found successfully.',
      category,
    };
  }

  // getTree — returns nested category tree from roots (bug fix: parent.current → parent.children)
  async getTree() {
    const categories = await this.categoryModel.findAll({
      order: [['name', 'ASC']],
    });

    const categoryMap = new Map<number, any>();
    const roots: any[] = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category.toJSON(),
        children: [],
      });
    });

    categories.forEach((category) => {
      const current = categoryMap.get(category.id);
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(current); // fixed: was parent.current
        }
      } else {
        roots.push(current);
      }
    });

    return {
      message: 'Category tree fetched successfully.',
      categories: roots,
    };
  }

  // findRoots — top-level categories (no parent)
  async findRoots() {
    const categories = await this.categoryModel.findAll({
      where: { parentId: null },
      include: [
        { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] },
      ],
      order: [['name', 'ASC']],
    });

    return {
      message: 'Root categories fetched successfully.',
      categories,
    };
  }

  // findChildren — all direct children of a given parent id
  async findChildren(parentId: number) {
    const parent = await this.categoryModel.findByPk(parentId);
    if (!parent) throw new NotFoundException('Parent category not found.');

    const categories = await this.categoryModel.findAll({
      where: { parentId },
      order: [['name', 'ASC']],
    });

    return {
      message: 'Child categories fetched successfully.',
      categories,
    };
  }

  // search — find categories by name (case-insensitive partial match)
  async search(query: string) {
    const categories = await this.categoryModel.findAll({
      where: {
        name: { [Op.iLike]: `%${query}%` },
      },
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
      ],
      order: [['name', 'ASC']],
    });

    return {
      message: 'Search results fetched successfully.',
      categories,
    };
  }

  // restore — un-soft-delete a category (paranoid: true)
  async restore(id: number) {
    const category = await this.categoryModel.findOne({
      where: { id },
      paranoid: false, // include soft-deleted rows
    });

    if (!category) throw new NotFoundException('Category not found.');
    if (!category.deletedAt) throw new ConflictException('Category is not deleted.');

    await category.restore();

    return {
      message: 'Category restored successfully.',
      category,
    };
  }

  // findDeleted — list all soft-deleted categories (Admin only)
  async findDeleted() {
    const categories = await this.categoryModel.findAll({
      paranoid: false,
      where: {
        deletedAt: { [Op.ne]: null },
      },
      order: [['deletedAt', 'DESC']],
    });

    return {
      message: 'Deleted categories fetched successfully.',
      categories,
    };
  }
}
