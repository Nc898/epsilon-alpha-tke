import { describe, expect, it } from 'vitest';
import { exoticsRegistrationSchema } from './exoticsRegistrationSchema';

const valid = {
  name: 'Alex Driver',
  email: 'alex@example.com',
  phone: '314-555-0100',
  car_year: '2024',
  car_make: 'Ferrari',
  car_model: '296 GTB',
  car_color: 'Rosso Corsa',
  instagram: '@alexcars',
  notes: '',
  attendance_acknowledged: true,
};

describe('exoticsRegistrationSchema', () => {
  it('accepts a complete vehicle application', () => {
    expect(exoticsRegistrationSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a four-digit vehicle year', () => {
    expect(exoticsRegistrationSchema.safeParse({ ...valid, car_year: '24' }).success).toBe(false);
  });

  it('requires the applicant to acknowledge the arrival window', () => {
    expect(exoticsRegistrationSchema.safeParse({ ...valid, attendance_acknowledged: false }).success).toBe(false);
  });
});
