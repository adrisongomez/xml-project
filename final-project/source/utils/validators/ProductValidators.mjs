import { z } from 'zod';

export const CreateProductInputValidator = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string().optional(),
});
