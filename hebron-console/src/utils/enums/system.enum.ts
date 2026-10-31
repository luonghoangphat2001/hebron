export enum ConnectionLogType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ABNORMAL_ATTEMPT = 'ABNORMAL_ATTEMPT',
}

export enum ConnectionStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CUSTOMER = 'CUSTOMER',
}

export enum TargetMenu {
  ADMIN_PERMISSION = 'AdminPermission',
  BANNER = 'Banner',
  CATEGORY = 'Category',
  FAQ = 'Faq',
  GUIDE_CONTENT = 'GuideContent',
  INQUIRY = 'Inquiry',
  NOTICE = 'Notice',
  ORDER = 'Order',
  POPUP = 'Popup',
  TEMPLATE = 'Template',
  USER = 'User',
  USER_ADMIN_PERMISSION = 'UserAdminPermission',
}

export enum OperationField {
  PRODUCT_NAME = 'PRODUCT_NAME',
  BASE_PRICE = 'BASE_PRICE',
  STOCK = 'STOCK',
  TITLE = 'TITLE',
  STATUS = 'STATUS',
  CONTENT = 'CONTENT',
  QUESTION = 'QUESTION',
  ANSWER = 'ANSWER',
  START_DATE = 'START_DATE',
  END_DATE = 'END_DATE',
}

export enum TaskType {
  REGISTER = 'register',
  MODIFY = 'modify',
  DELETE = 'delete',
  APPROVAL = 'approval',
}

export enum TaskLogSortBy {
  CREATED_AT = 'created_at',
  MENU = 'menu',
  WORKER = 'worker',
  TASK_TYPE = 'task_type',
}

export enum AccessLogEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
}

export enum AccessLogSortBy {
  LOGIN_ID = 'login_id',
  IP_ADDRESS = 'ip_address',
  CONNECTION_TIME = 'connection_time',
  ACCESS_DATE = 'access_date',
}
