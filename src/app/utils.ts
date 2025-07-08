import { z } from 'zod';
export interface FormInterface {
  email: string;
    password: string;
}

export const userSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
}); 