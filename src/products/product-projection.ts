import { Category } from 'src/categories/entities/category.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { Seller, SellerStatus } from 'src/seller/entities/seller.entity';
import { ProductAttribute } from './entities/product.attribute.entity';
import { ProductVarient } from './entities/product.variant.entity';
import { ProductImage } from './entities/product.image.entity';
import { Listing, ListingStatus } from './entities/listing.entity';
export function getProductInclude() {
  return [
    {
      model: Category,
      attributes: ['id', 'name', 'slug'],
    },
    {
      model: Brand,
      attributes: ['id', 'name', 'slug', 'logoUrl'],
    },
    {
      model: ProductAttribute,
      attributes: ['id', 'attrName', 'attrValue'],
    },
    {
      model: ProductImage,
      attributes: ['id', 'imageUrl', 'isPrimary', 'sortOrder', 'varientId'],
    },
    {
      model: ProductVarient,
      attributes: [
        'id',
        'universalSku',
        'size',
        'color',
        'weight',
        'attributes',
      ],
      include: [
        {
          model: Listing,
          where: { status: ListingStatus.ACTIVE },
          required: false,
          attributes: [
            'id',
            'sellerId',
            'sellerSku',
            'price',
            'mrp',
            'stock',
            'condition',
            'fulfillmentType',
            'status',
          ],
          include: [
            {
              model: Seller,
              where: { status: SellerStatus.APPROVED },
              required: true,
              attributes: [
                'id',
                'legalBusinessName',
                'rating',
                'tier',
                'status',
              ],
            },
          ],
        },
      ],
    },
  ];
}

export function formatProductDetails(productInstance: any) {
  const raw =
    typeof productInstance.toJSON === 'function'
      ? productInstance.toJSON()
      : productInstance;

  const attributes = raw.productAttribute || [];
  const specifications: Record<string, string> = {};
  for (const attr of attributes) {
    if (attr.attrName) {
      specifications[attr.attrName] = attr.attrValue;
    }
  }

  const images = raw.productImage || [];
  const primaryImg =
    images.find((img: any) => img.isPrimary) || images[0] || null;
  const thumbnail = primaryImg ? primaryImg.imageUrl : null;

  const rawVariants = raw.productVarient || [];
  let globalMinPrice: number | null = null;
  let globalMaxPrice: number | null = null;
  let globalHasStock = false;
  let globalBestOffer: any = null;

  const formattedVariants = rawVariants.map((v: any) => {
    const variantListings = (v.listings || []).map((l: any) => ({
      id: l.id,
      sellerId: l.sellerId,
      sellerSku: l.sellerSku,
      price: Number(l.price),
      mrp: Number(l.mrp),
      stock: Number(l.stock),
      condition: l.condition,
      fulfillmentType: l.fulfillmentType,
      status: l.status,
      seller: l.seller
        ? {
            id: l.seller.id,
            legalBusinessName: l.seller.legalBusinessName,
            rating: l.seller.rating,
            tier: l.seller.tier,
          }
        : null,
    }));

    const inStockListings = variantListings
      .filter((l: any) => l.stock > 0 && l.status === ListingStatus.ACTIVE)
      .sort((a: any, b: any) => a.price - b.price);

    const winningListing = inStockListings[0] || null;
    const otherListings = inStockListings.slice(1);

    if (inStockListings.length > 0) {
      globalHasStock = true;
      for (const l of inStockListings) {
        if (globalMinPrice === null || l.price < globalMinPrice) {
          globalMinPrice = l.price;
        }
        if (globalMaxPrice === null || l.price > globalMaxPrice) {
          globalMaxPrice = l.price;
        }
        if (!globalBestOffer || l.price < globalBestOffer.price) {
          globalBestOffer = {
            listingId: l.id,
            variantId: v.id,
            universalSku: v.universalSku,
            price: l.price,
            mrp: l.mrp,
            discountPercentage:
              l.mrp > l.price
                ? Math.round(((l.mrp - l.price) / l.mrp) * 100)
                : 0,
            stock: l.stock,
            condition: l.condition,
            seller: l.seller,
          };
        }
      }
    }

    const variantImages = images.filter((img: any) => img.varientId === v.id);

    return {
      id: v.id,
      universalSku: v.universalSku,
      size: v.size,
      color: v.color,
      weight: v.weight ? Number(v.weight) : null,
      attributes: v.attributes || {},
      images: variantImages,
      inStock: inStockListings.length > 0,
      buyBox: winningListing
        ? {
            winningOffer: {
              listingId: winningListing.id,
              price: winningListing.price,
              mrp: winningListing.mrp,
              discountPercentage:
                winningListing.mrp > winningListing.price
                  ? Math.round(
                      ((winningListing.mrp - winningListing.price) /
                        winningListing.mrp) *
                        100,
                    )
                  : 0,
              stock: winningListing.stock,
              condition: winningListing.condition,
              seller: winningListing.seller,
            },
            otherOffersCount: otherListings.length,
            otherOffers: otherListings.map((ol: any) => ({
              listingId: ol.id,
              price: ol.price,
              mrp: ol.mrp,
              stock: ol.stock,
              condition: ol.condition,
              seller: ol.seller,
            })),
          }
        : null,
      listings: variantListings,
    };
  });

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    brand: raw.brand
      ? {
          id: raw.brand.id,
          name: raw.brand.name,
          slug: raw.brand.slug,
          logoUrl: raw.brand.logoUrl,
        }
      : null,
    category: raw.category
      ? {
          id: raw.category.id,
          name: raw.category.name,
          slug: raw.category.slug,
        }
      : null,
    thumbnail,
    images: images.map((img: any) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
      varientId: img.varientId,
    })),
    attributes: attributes.map((a: any) => ({
      id: a.id,
      attrName: a.attrName,
      attrValue: a.attrValue,
    })),
    specifications,
    priceSummary: {
      minPrice: globalMinPrice,
      maxPrice: globalMaxPrice,
      inStock: globalHasStock,
      currency: 'INR',
    },
    buyBox: globalBestOffer
      ? {
          winningOffer: globalBestOffer,
        }
      : null,
    variants: formattedVariants,
  };
}
