export enum ProductStatus {
  SOLD = 'sold',
  HIDDEN = 'hidden',
}

export enum ProductSort {
  CREATED_AT = 'created_at',
  STATUS = 'status',
  CATEGORY = 'category',
  NAME = 'name',
}

export enum ProductBadge {
  BEST = 'BEST',
  NEW = 'NEW',
  HOT = 'HOT',
  MD_PICK = 'MD PICK',
}

export enum ProductVisibleRole {
  ALL = 'ALL',
  MEMBER = 'MEMBER',
  MANAGER = 'MANAGER',
}

export enum ProductAvailability {
  OUT_OF_STOCK = 'out_of_stock',
  IN_STOCK = 'in_stock',
}
