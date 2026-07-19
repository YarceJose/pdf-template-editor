import { Injectable } from '@angular/core';

/**
 * Coordinate Mapper Service — mm ↔ pt conversion
 *
 * Contract:
 * - Frontend canvas works in mm (A4 = 210×297 mm)
 * - Serialized JSON stores positions in mm (Option A: neutral unit)
 * - Backend PDF engine (C#) converts mm → pt when generating PDF
 * - 1 pt = 1/72 inch = 0.352778 mm
 * - 1 mm = 72/25.4 pt = 2.834646 pt
 *
 * This service exists so both frontend and backend use the SAME conversion.
 * If the backend uses a different formula, positions will be wrong.
 */
@Injectable({ providedIn: 'root' })
export class CoordinateMapperService {
  /** 1 mm in points */
  static readonly MM_TO_PT = 72 / 25.4; // 2.834645669...
  /** 1 pt in mm */
  static readonly PT_TO_MM = 25.4 / 72; // 0.352777778...

  /** A4 dimensions */
  static readonly A4_WIDTH_MM = 210;
  static readonly A4_HEIGHT_MM = 297;
  static readonly A4_WIDTH_PT = 595.28;
  static readonly A4_HEIGHT_PT = 841.89;

  /** Default margins (mm) */
  static readonly MARGIN_MM = 10;
  /** Default margins (pt) — 10mm ≈ 28.35pt */
  static readonly MARGIN_PT = 10 * CoordinateMapperService.MM_TO_PT;

  /** Convert mm to pt */
  static mmToPt(mm: number): number {
    return Math.round(mm * CoordinateMapperService.MM_TO_PT * 100) / 100;
  }

  /** Convert pt to mm */
  static ptToMm(pt: number): number {
    return Math.round(pt * CoordinateMapperService.PT_TO_MM * 100) / 100;
  }

  /** Convert a position object from mm to pt */
  static positionMmToPt(pos: { x: number; y: number }): { x: number; y: number } {
    return {
      x: CoordinateMapperService.mmToPt(pos.x),
      y: CoordinateMapperService.mmToPt(pos.y),
    };
  }

  /** Convert a size object from mm to pt */
  static sizeMmToPt(size: { width: number; height: number }): { width: number; height: number } {
    return {
      width: CoordinateMapperService.mmToPt(size.width),
      height: CoordinateMapperService.mmToPt(size.height),
    };
  }

  /** Round-trip test: mm → pt → mm within tolerance */
  static roundTripOk(originalMm: number, tolerance = 0.1): boolean {
    const asPt = CoordinateMapperService.mmToPt(originalMm);
    const backToMm = CoordinateMapperService.ptToMm(asPt);
    return Math.abs(originalMm - backToMm) <= tolerance;
  }
}
