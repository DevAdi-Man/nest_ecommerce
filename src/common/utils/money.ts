import { BadRequestException } from '@nestjs/common';

/** Convert database decimal strings or API numbers into exact paise. */
export function toMinorUnits(value: string | number): number {
  const text = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text))
    throw new BadRequestException(
      'Money must be non-negative with at most two decimal places.',
    );
  const [whole, fraction = ''] = text.split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(amount) || amount > 999999999999)
    throw new BadRequestException('Money exceeds the supported range.');
  return amount;
}

export function fromMinorUnits(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new BadRequestException('Invalid monetary amount.');
  return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, '0')}`;
}
