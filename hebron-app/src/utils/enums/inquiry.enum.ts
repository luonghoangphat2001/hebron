export enum InquiryCategory {
  PRODUCT = 'product',
  QUOTE = 'quote',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REWORK = 'rework',
  REFUND = 'refund',
  DELIVERY = 'delivery',
}

export enum QuantityType {
  ONE_TO_TEN = 'one_to_ten',
  TEN_TO_FIFTY = 'ten_to_fifty',
  FIFTY_TO_ONE_HUNDRED = 'fifty_to_one_hundred',
  ONE_HUNDRED_PLUS = 'one_hundred_plus',
  UNDETERMINED = 'undetermined',
}

export enum BudgetType {
  UP_TO_FIVE_HUNDRED = 'up_to_five_hundred',
  FIVE_HUNDRED_TO_ONE_MILLION = 'five_hundred_to_one_million',
  ONE_MILLION_TO_THREE_MILLION = 'one_million_to_three_million',
  THREE_MILLION_PLUS = 'three_million_plus',
  TO_BE_DISCUSSED = 'to_be_discussed',
}

/** Inquiry list status — adjust if backend uses different values. */
export enum InquiryStatus {
  PENDING = 'pending',
  ANSWERED = 'answered',
}
