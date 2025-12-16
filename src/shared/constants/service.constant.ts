import { CreateServiceDto } from 'src/service/dto/create-service.dto';

export enum SERVICE_TYPE {
  GP = 'GP', // guestPostPrice
  TEXTLINK = 'TEXTLINK', // textLinkPrice
  BANNER = 'BANNER', //bannerPrice
  TRAFFIC = 'TRAFFIC', // price
  ENTITY = 'ENTITY', // price
  BACKLINK = 'BACKLINK', // price
  TOOL = 'TOOL', // price
  CONTENT = 'CONTENT', // priceAdjustment
}

export enum TYPE_PACK {
  DOMAIN = 'DOMAIN', // GP, TEXTLINK, BANNER
  PACK = 'PACK', // TRAFFIC, ENTITY, BACKLINK, TOOL
  CONTENT = 'CONTENT', // CONTENT
}

export enum SERVICE_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum SERVICE_FIELD_TYPE {
  TECHNICAL = 'TECHNICAL',
  SPORT = 'SPORT',
  BUSINESS = 'BUSINESS',
  GENERAL = 'GENERAL',
}

export const DOMAIN_HEADER_KEY_MAP: Record<string, keyof CreateServiceDto> = {
  'TÊN DOMAIN': 'name',
  'LOẠI LĨNH VỰC': 'fieldType',
  'GIÁ TEXTLINK': 'textLinkPrice',
  'THỜI HẠN TEXTLINK (tháng)': 'textLinkDuration',
  'GHI CHÚ TEXTLINK': 'textLinkNote',
  'DOFOLLOW TEXTLINK': 'isFollowTextLink',
  'HOME TEXTLINK': 'isHomeTextLink',
  'FOOTER TEXTLINK': 'isFooterTextLink',
  'GIẢM GIÁ TEXTLINK': 'discountTextLinkService',
  'GIÁ GUESTPOST': 'guestPostPrice',
  'GHI CHÚ GUESTPOST': 'guestPostNote',
  'INDEX GUESTPOST': 'isIndexGuestPost',
  'DOFOLLOW GUESTPOST': 'isFollowGuestPost',
  'GIẢM GIÁ GUESTPOST': 'discountGuestPostService',
  'GIÁ BANNER': 'bannerPrice',
  'THỜI HẠN BANNER (tháng)': 'bannerDuration',
  'GIẢM GIÁ BANNER': 'discountBannerService',
  'BÁN TEXTLINK': 'isSaleTextLink',
  'BÁN GUESTPOST': 'isSaleGuestPost',
  'BÁN BANNER': 'isSaleBanner',
  'HIỂN THỊ TRÊN SÀN': 'isShow',
};

export const DOMAIN_BOOLEAN_COLUMNS = [
  'isFollowTextLink',
  'isHomeTextLink',
  'isFooterTextLink',
  'isIndexGuestPost',
  'isFollowGuestPost',
  'isSaleTextLink',
  'isSaleGuestPost',
  'isSaleBanner',
  'isShow',
];

export const DOMAIN_NUMBER_COLUMNS = [
  'textLinkPrice',
  'textLinkDuration',
  'discountTextLinkService',
  'guestPostPrice',
  'discountGuestPostService',
  'bannerPrice',
  'bannerDuration',
  'discountBannerService',
];

export function domainMapHeaderToKey(
  header: string,
): keyof CreateServiceDto | undefined {
  return DOMAIN_HEADER_KEY_MAP[header];
}

export const PACK_HEADER_KEY_MAP: Record<string, keyof CreateServiceDto> = {
  'TÊN PACK': 'name',
  'LOẠI DỊCH VỤ': 'type',
  'GIÁ (VND)': 'price',
  'DEMO URL': 'urlDemo',
  'GHI CHÚ': 'note',
  'ƯU ĐÃI KÈM THEO': 'complimentaries',
  'HIỂN THỊ TRÊN MARKET': 'isShow',
  'GIẢM GIÁ (VND)': 'discountPackService',
};

export const PACK_BOOLEAN_FIELDS: (keyof CreateServiceDto)[] = ['isShow'];
export const PACK_NUMBER_FIELDS: (keyof CreateServiceDto)[] = [
  'price',
  'discountPackService',
];
