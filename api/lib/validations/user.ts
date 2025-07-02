import { z } from "zod";

/**
 * Zod schema to validate user update input data.
 * All fields are optional to allow partial updates.
 */
export const userSchema = z.object({
  // Optional email, must be valid if provided
  email: z.string().email("Invalid email address").optional(),

  // Optional name, must be between 2 and 50 characters if provided
  name: z.string().min(2, "Name too short").max(50, "Name too long").optional(),

  // Optional user role, restricted to 'admin' or 'user'
  role: z.enum(["admin", "user"]).optional(),

  // Optional subscription plan, either 'free' or 'premium'
  plan: z.enum(["free", "premium"]).optional(),

  // Optional account status, one of 'active', 'banned', or 'suspended'
  status: z.enum(["active", "banned", "suspended"]).optional(),
});

/**
 * TypeScript type inferred from the Zod userSchema.
 * Useful for type-safe function parameters and API inputs.
 */
export type UserUpdateInput = z.infer<typeof userSchema>;
