import { RECORDS } from '../data/records';
import { buildCertificatePdf } from './certificate-pdf';

describe('buildCertificatePdf', () => {
  const record = RECORDS[0];
  const pdf = new TextDecoder().decode(buildCertificatePdf(record));

  it('produces a complete PDF document', () => {
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('prints the bank details', () => {
    expect(pdf).toContain(record.bankName);
    expect(pdf).toContain(record.regNo);
    expect(pdf).toContain(record.id);
  });

  it('points startxref at the cross-reference table', () => {
    const offset = Number(pdf.match(/startxref\n(\d+)/)![1]);
    expect(pdf.slice(offset, offset + 4)).toBe('xref');
  });
});
