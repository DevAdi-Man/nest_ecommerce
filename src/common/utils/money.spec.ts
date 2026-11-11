import { fromMinorUnits, toMinorUnits } from './money';

describe('monetary amounts', () => {
  it('adds decimal prices as exact minor units', () => {
    expect(fromMinorUnits(toMinorUnits('0.10') + toMinorUnits(0.2))).toBe(
      '0.30',
    );
  });
  it.each(['-1', '1.001', 'Infinity', 'NaN', '1e20', '10000000000'])(
    'rejects invalid monetary value %s',
    (value) => {
      expect(() => toMinorUnits(value)).toThrow();
    },
  );
});
