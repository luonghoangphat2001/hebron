import { ShipmentStatus } from '../enums/delivery.enum';

export const SHIPMENT_STATUS_BADGE: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: 'bg-amber-100 text-amber-600 rounded-sm',
  [ShipmentStatus.IN_TRANSIT]: 'bg-blue-100 text-blue-600 rounded-sm',
  [ShipmentStatus.DELIVERED]: 'bg-green-100 text-green-600 rounded-sm',
};
