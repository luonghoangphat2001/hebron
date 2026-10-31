import { z } from 'zod';

export const shipmentUpdateSchema = z.object({
  invoice_number: z.string().trim().min(1, 'FIELD_REQUIRED'),
  tracking_number: z.string().trim().min(1, 'FIELD_REQUIRED'),
  carrier_name: z.string().trim().min(1, 'FIELD_REQUIRED'),
});

export type ShipmentUpdateInput = z.infer<typeof shipmentUpdateSchema>;
