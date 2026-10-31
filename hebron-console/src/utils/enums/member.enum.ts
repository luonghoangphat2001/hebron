export enum MemberApprovalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum LedgerType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum MemberSortBy {
  CREATED_AT = 'created_at',
  NAME = 'name',
  STATUS = 'status',
  USERNAME = 'username',
  EMAIL = 'email',
}
