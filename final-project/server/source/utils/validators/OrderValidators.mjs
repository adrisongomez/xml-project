import { z } from "zod";

export const OrderLineItemInput = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const OrderInput = z.object({
  customerId: z.string().uuid(),
  lineItems: z.array(OrderLineItemInput).min(1),
});
