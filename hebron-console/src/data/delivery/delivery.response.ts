import type { SelectOption } from '@/components/select/AppSelect';
import type { ShipmentStatus, ShippingMethod } from '@/utils/enums/delivery.enum';
import type { ExportExcelRESP } from '@/utils/types/export.type';

export type ShipmentTrackingEvent = {
  status: string;
  description: string;
  location: string | null;
  alert: string | null;
  occurred_at: string;
  // SweetTracker 진행단계 — 0: no scan, 1: 배송준비중, 2: 집화완료, 3: 배송중, 4: 지점 도착, 5: 배송출발, 6: 배송완료.
  level?: number;
};

export type ShipmentRESP = {
  id: number;
  order_number: string;
  customer_name: string | null;
  product_name: string | null;
  quantity: number;
  delivery_manager: { id: number | null; name: string | null };
  status: ShipmentStatus;
  invoice_number: string | null;
  tracking_number: string | null;
  carrier_code: string | null;
  carrier_name: string | null;
  shipping_method: ShippingMethod;
  shipping_fee: number;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_postcode: string | null;
  shipping_address: string | null;
  shipping_address_detail: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
};

export type ShipmentListRESP = {
  shipments: ShipmentRESP[];
};

export type ShipmentTrackingEventsRESP = {
  events: ShipmentTrackingEvent[];
};

export type ShipmentDetailRESP = {
  shipment: ShipmentRESP;
};

export type ShipmentSearchFiltersRESP = {
  filters: {
    delivery_manager_options: SelectOption<number>[];
    shipping_manager_options: SelectOption<number>[];
  };
};

export type ShipmentExportExcelRESP = ExportExcelRESP;
