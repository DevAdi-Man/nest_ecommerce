import { randomUUID } from 'node:crypto';
import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { RecordViewDto } from './dto/record-view.dto';
import { QueryRecommendationDto } from './dto/query-recommendation.dto';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  private sessionId(value?: string): string | undefined {
    if (value !== undefined && (!value.trim() || value.length > 128))
      throw new BadRequestException(
        'Session id must contain 1 to 128 characters.',
      );
    return value;
  }

  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post('view')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Record Product View Interaction',
    description:
      'Records a customer/guest product view event. Automatically updates category affinity and pairwise session co-occurrence.',
  })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Anonymous guest session identifier',
  })
  @ApiResponse({
    status: 201,
    description: 'Product view event recorded successfully.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  recordView(
    @Request() req: RequestWithUser,
    @Body() dto: RecordViewDto,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    const userId = req.user?.sub;
    const sessionId =
      dto.sessionId || this.sessionId(headerSessionId) || randomUUID();

    return this.recommendationsService.recordProductView(
      userId,
      sessionId,
      dto,
    );
  }

  @Get('frequently-viewed-categories')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Approach A: Frequently Viewed Categories Recommendations',
    description:
      'Recommends in-stock products from categories the shopper views most frequently, weighted by recency decay and product quality.',
  })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Anonymous guest session identifier',
  })
  @ApiResponse({
    status: 200,
    description:
      'Ranked list of products with category affinity and recency scores.',
  })
  getFrequentlyViewedCategories(
    @Request() req: RequestWithUser,
    @Query() query: QueryRecommendationDto,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    const userId = req.user?.sub;
    const sessionId = query.sessionId || this.sessionId(headerSessionId);

    return this.recommendationsService.getFrequentlyViewedCategories(
      userId,
      sessionId,
      query,
    );
  }

  @Get('similar/:productId')
  @ApiOperation({
    summary: 'Approach B: Similar Products Recommendations (Content-Based)',
    description:
      'Surfaces substitutes and similar products matching category (35%), brand (20%), specification Jaccard overlap (25%), and price proximity (20%). Strictly excludes out-of-stock items and the source product itself.',
  })
  @ApiParam({ name: 'productId', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description:
      'Ranked similar products with multidimensional similarity breakdown.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  getSimilarProducts(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: QueryRecommendationDto,
  ) {
    return this.recommendationsService.getSimilarProducts(productId, query);
  }

  @Get('viewed-together/:productId')
  @ApiOperation({
    summary: 'Approach C: Frequently Viewed Together Recommendations',
    description:
      'Collaborative filtering via session co-occurrence. Recommends products frequently browsed together in the same session with temporal recency weighting.',
  })
  @ApiParam({ name: 'productId', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Ranked co-viewed products with frequency and recency scores.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  getViewedTogether(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: QueryRecommendationDto,
  ) {
    return this.recommendationsService.getViewedTogether(productId, query);
  }

  @Get('personalized')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Hybrid Personalized Recommendations Feed',
    description:
      'Blends all three approaches (40% Category Affinity, 35% Similar Products, 25% Frequently Viewed Together) with anti-fatigue deduplication, seller shields, and strict in-stock filters.',
  })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Anonymous guest session identifier',
  })
  @ApiResponse({
    status: 200,
    description:
      'Composite ranked personalized product feed with scoring breakdown.',
  })
  getPersonalizedRecommendations(
    @Request() req: RequestWithUser,
    @Query() query: QueryRecommendationDto,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    const userId = req.user?.sub;
    const sessionId = query.sessionId || this.sessionId(headerSessionId);

    return this.recommendationsService.getPersonalizedRecommendations(
      userId,
      sessionId,
      query,
    );
  }
}
