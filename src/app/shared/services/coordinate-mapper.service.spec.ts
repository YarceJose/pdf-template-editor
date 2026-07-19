import { CoordinateMapperService } from './coordinate-mapper.service';

describe('CoordinateMapperService', () => {
  describe('mm ↔ pt conversion', () => {
    it('mmToPt: 10mm ≈ 28.35pt', () => {
      expect(CoordinateMapperService.mmToPt(10)).toBeCloseTo(28.35, 1);
    });

    it('ptToMm: 28.35pt ≈ 10mm', () => {
      expect(CoordinateMapperService.ptToMm(28.35)).toBeCloseTo(10, 1);
    });

    it('round-trip: mm → pt → mm within ±0.1mm', () => {
      const testValues = [0, 1, 10, 50, 100, 210, 297, 0.5, 123.456];
      for (const mm of testValues) {
        expect(CoordinateMapperService.roundTripOk(mm, 0.1)).toBeTruthy();
      }
    });

    it('A4 width: 210mm = 595.28pt', () => {
      expect(CoordinateMapperService.mmToPt(210)).toBeCloseTo(595.28, 0);
    });

    it('A4 height: 297mm = 841.89pt', () => {
      expect(CoordinateMapperService.mmToPt(297)).toBeCloseTo(841.89, 0);
    });
  });

  describe('position/size conversion', () => {
    it('positionMmToPt converts both axes', () => {
      const result = CoordinateMapperService.positionMmToPt({ x: 10, y: 20 });
      expect(result.x).toBeCloseTo(28.35, 1);
      expect(result.y).toBeCloseTo(56.69, 1);
    });

    it('sizeMmToPt converts both axes', () => {
      const result = CoordinateMapperService.sizeMmToPt({ width: 40, height: 8 });
      expect(result.width).toBeCloseTo(113.39, 0);
      expect(result.height).toBeCloseTo(22.68, 0);
    });
  });

  describe('constants', () => {
    it('A4 dimensions match', () => {
      expect(CoordinateMapperService.A4_WIDTH_MM).toBe(210);
      expect(CoordinateMapperService.A4_HEIGHT_MM).toBe(297);
      expect(CoordinateMapperService.A4_WIDTH_PT).toBe(595.28);
      expect(CoordinateMapperService.A4_HEIGHT_PT).toBe(841.89);
    });

    it('margin conversion: 10mm ≈ 28.35pt', () => {
      expect(CoordinateMapperService.MARGIN_MM).toBe(10);
      expect(CoordinateMapperService.MARGIN_PT).toBeCloseTo(28.35, 1);
    });
  });
});
