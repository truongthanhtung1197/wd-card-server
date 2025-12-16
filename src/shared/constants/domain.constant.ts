export enum DOMAIN_STATUS {
  REQUEST_BUY = 'REQUEST_BUY', // yêu cầu mua domain
  BUYING = 'BUYING', // đang mua domain
  PURCHASED = 'PURCHASED', // đã mua domain
  DNS = 'DNS', // dns
  SEOING = 'SEOING', // đang seo domain
  STOPPED = 'STOPPED', // ngừng seo domain
  SATELLITE = 'SATELLITE', // domain phụ
  AUDIT = 'AUDIT', // domain cần audit
  DIE = 'DIE', // domain chết
  CANCEL_BUY = 'CANCEL_BUY', // hủy mua domain
}

export enum DOMAIN_TYPE {
  NORMAL = 'NORMAL', // domain thông thường
  THREE_ZERO_ONE = '301', // domain 301
  PBN = 'PBN', // domain PBN
}

export enum DOMAIN_PATTERN {
  PATTERN_69VN = '69vn',
  PATTERN_NH88 = 'nh88',
  PATTERN_RR99 = 'rr99',
}
