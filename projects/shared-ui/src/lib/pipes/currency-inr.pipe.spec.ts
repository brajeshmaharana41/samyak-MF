import { CurrencyInrPipe } from './currency-inr.pipe';

describe('CurrencyInrPipe', () => {
  const pipe = new CurrencyInrPipe();

  it('formats with Indian digit grouping and no decimals', () => {
    expect(pipe.transform(1250000)).toBe('₹12,50,000');
    expect(pipe.transform(999.6)).toBe('₹1,000');
  });

  it('accepts numeric strings', () => {
    expect(pipe.transform('500000')).toBe('₹5,00,000');
  });

  it('shows "-" for empty values', () => {
    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
    expect(pipe.transform('')).toBe('-');
  });

  it('returns text that is not a number unchanged', () => {
    expect(pipe.transform('n/a')).toBe('n/a');
  });
});
