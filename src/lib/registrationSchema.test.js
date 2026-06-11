import { describe, it, expect } from 'vitest';
import { registrationSchema } from './registrationSchema';

const valid = {
  name: 'Nick Childs',
  email: 'nick@example.com',
  phone: '314-555-1234',
  car_year: '1969',
  car_make: 'Ford',
  car_model: 'Mustang',
  car_class: 'classic',
  donation_dollars: 10,
};

describe('registrationSchema', () => {
  it('accepts a complete valid registration', () => {
    expect(registrationSchema.parse(valid)).toMatchObject({ name: 'Nick Childs' });
  });
  it('rejects a bad email', () => {
    expect(() => registrationSchema.parse({ ...valid, email: 'nope' })).toThrow();
  });
  it('rejects an unknown car class', () => {
    expect(() => registrationSchema.parse({ ...valid, car_class: 'spaceship' })).toThrow();
  });
  it('defaults donation to 0 when omitted', () => {
    const { donation_dollars, ...rest } = valid;
    expect(registrationSchema.parse(rest).donation_dollars).toBe(0);
  });
  it('rejects negative donations', () => {
    expect(() => registrationSchema.parse({ ...valid, donation_dollars: -5 })).toThrow();
  });
  it('coerces string donation input from the form', () => {
    expect(registrationSchema.parse({ ...valid, donation_dollars: '25' }).donation_dollars).toBe(25);
  });
  it('rounds decimal donations to the nearest dollar', () => {
    expect(registrationSchema.parse({ ...valid, donation_dollars: 5.5 }).donation_dollars).toBe(6);
  });
  it('requires phone to be omittable', () => {
    const { phone, ...rest } = valid;
    expect(() => registrationSchema.parse(rest)).not.toThrow();
  });
});
