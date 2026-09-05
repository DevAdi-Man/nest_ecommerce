import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './carts/cart.module';
import { WishlistModule } from './wishlists/wishlist.module';
import { CouponsModule } from './coupons/coupons.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AddressesModule } from './addresses/addresses.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { envValidationSchema } from './config/env.validation';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL')!,
            limit: config.get<number>('THROTTLE_LIMIT')!,
          },
        ],
      }),
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('Host:', config.get('DB_HOST'));
        console.log('Port:', config.get('DB_PORT'));
        console.log('Database:', config.get('DB_NAME'));

        return {
          dialect: 'postgres',
          host: config.get('DB_HOST'),
          port: Number(config.get('DB_PORT')),
          username: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadModels: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    WishlistModule,
    CouponsModule,
    PaymentsModule,
    ReviewsModule,
    AddressesModule,
    OtpModule,
    MailModule,
    MediaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
