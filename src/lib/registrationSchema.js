import { z } from 'zod';

export const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Valid email required'),
  phone: z.string().trim().optional(),
  car_year: z.string().trim().min(2, 'Year required'),
  car_make: z.string().trim().min(1, 'Make required'),
  car_model: z.string().trim().min(1, 'Model required'),
  car_class: z.enum(['classic', 'exotic', 'performance', 'other']),
  donation_dollars: z.coerce.number().min(0).max(10000).transform(v => Math.round(v)).default(0),
});
