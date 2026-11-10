import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateListingDto } from './create-listing.dto';
import { ListingStatus } from '../entities/listing.entity';

export class UpdateListingDto extends PartialType(CreateListingDto) {
  @ApiPropertyOptional({
    enum: ListingStatus,
    example: ListingStatus.ACTIVE,
    description:
      'Status of the listing (ACTIVE, INACTIVE, OUT_OF_STOCK, DRAFT)',
  })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}
