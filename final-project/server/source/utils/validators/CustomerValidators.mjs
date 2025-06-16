import { z } from "zod";

export const CreateCustomerInputValidator = z.object({
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().regex(/\+1\d+/),
});
