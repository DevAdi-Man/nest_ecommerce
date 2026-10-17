import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Seller } from './entities/seller.entity';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { SellerPayOut } from './entities/seller-payout-account.entity';
import { SellerLedgerEntry } from './entities/seller-ledger-entry.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Seller,
      User,
      Role,
      SellerPayOut,
      SellerLedgerEntry,
    ]),
  ],
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
