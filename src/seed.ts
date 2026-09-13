import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/sequelize';
import { Category } from './categories/entities/category.entity';
import { Brand } from './brands/entities/brand.entity';
import { Product } from './products/entities/product.entity';
import { ProductVariant } from './products/entities/product-variant.entity';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryModel = app.get(getModelToken(Category));
  const brandModel = app.get(getModelToken(Brand));
  const productModel = app.get(getModelToken(Product));
  const productVariantModel = app.get(getModelToken(ProductVariant));
  const roleModel = app.get(getModelToken(Role));
  const userModel = app.get(getModelToken(User));

  console.log('Seeding mock data...');

  try {
    const [electronics] = await categoryModel.findOrCreate({
      where: { slug: 'electronics' },
      defaults: { name: 'Electronics', slug: 'electronics' }
    });

    const [techBrand] = await brandModel.findOrCreate({
      where: { name: 'TechBrand' },
      defaults: { name: 'TechBrand', description: 'Tech leader' }
    });

    const [product] = await productModel.findOrCreate({
      where: { slug: 'smartphone-x' },
      defaults: {
        name: 'Smartphone X',
        slug: 'smartphone-x',
        description: 'A great smartphone',
        brandId: techBrand.id,
        categoryId: electronics.id,
        price: 699,
      }
    });

    await productVariantModel.findOrCreate({
      where: { sku: 'SMARTX-128-BLK' },
      defaults: {
        productId: product.id,
        sku: 'SMARTX-128-BLK',
        price: 699,
        stock: 100,
        attributes: { color: 'Black', storage: '128GB' },
      }
    });

    const sellerRole = await roleModel.findOne({ where: { name: 'Seller' } });
    if (sellerRole) {
      const [seller] = await userModel.findOrCreate({
        where: { email: 'seller@example.com' },
        defaults: {
          firstName: 'Test',
          lastName: 'Seller',
          dateOfBirth: '1990-01-01',
          email: 'seller@example.com',
          password: await bcrypt.hash('Seller@123', 10),
          roleId: sellerRole.id,
          isVerifiedEmail: true,
        }
      });
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
  }

  await app.close();
}

bootstrap();
