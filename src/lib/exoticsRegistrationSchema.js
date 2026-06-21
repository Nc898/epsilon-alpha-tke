import { z } from 'zod';

export const exoticsRegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('A valid email is required').max(254),
  phone: z.string().trim().min(7, 'Phone number is required').max(30),
  car_year: z.string().trim().regex(/^\d{4}$/, 'Enter a four-digit year'),
  car_make: z.string().trim().min(1, 'Make is required').max(80),
  car_model: z.string().trim().min(1, 'Model is required').max(80),
  car_color: z.string().trim().min(1, 'Color is required').max(50),
  instagram: z.string().trim().max(100).optional().default(''),
  notes: z.string().trim().max(1000).optional().default(''),
  attendance_acknowledged: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm the arrival window' }),
  }),
});
