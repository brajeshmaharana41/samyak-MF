import { StatusLabelPipe } from './status-label.pipe';

describe('StatusLabelPipe', () => {
  const pipe = new StatusLabelPipe();

  it.each([
    ['UNDER_REVIEW', 'Under Review'],
    ['under-review', 'Under Review'],
    ['underReview', 'Under Review'],
    ['Approved', 'Approved'],
  ])('turns %s into %s', (input, expected) => {
    expect(pipe.transform(input)).toBe(expected);
  });

  it('shows "-" for empty values', () => {
    expect(pipe.transform('')).toBe('-');
    expect(pipe.transform(null)).toBe('-');
  });
});
