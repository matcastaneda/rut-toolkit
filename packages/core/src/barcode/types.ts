import type { ValidRut } from "../types";

/** Identifies the physical source of the scanned barcode data. */
export type BarcodeSource = "QR_FRONT" | "PDF417_REAR" | "UNKNOWN";

/** Metadata returned when analyzing an ID card barcode. */
export type BarcodeScanResult =
  | {
      readonly ok: true;
      readonly rut: ValidRut;
      readonly source: Exclude<BarcodeSource, "UNKNOWN">;
    }
  | {
      readonly ok: false;
      readonly rut: null;
      readonly source: BarcodeSource;
    };
