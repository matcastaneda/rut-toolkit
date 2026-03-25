# @rut-toolkit/core

> Zero-dependency, strictly typed utilities for Chilean RUT/RUN validation, parsing, formatting, masking, and ID barcode analysis.

Built for modern TypeScript environments, `@rut-toolkit/core` provides a strictly typed, high-performance engine to handle Chilean national identification numbers (RUT/RUN). Designed for performance and developer experience.

## ✨ Features

- **Zero Dependencies ⚡** - Extremely lightweight and fast.
- **Strictly Typed 🎯** - Uses Branded Types (`ValidRut`) and strict literals (`RutDv`) to guarantee validity at the compiler level.
- **Barcode Parsing 📸** - Natively decodes and extracts RUTs from Chilean ID barcodes (Front QR and Rear PDF417).
- **100% Test Coverage 🧪** - Bulletproof mathematical validation and edge-case handling.
- **Isomorphic 🌐** - Runs flawlessly in Node.js, Edge runtimes (Vercel/Cloudflare), and the Browser.

## 📦 Installation

```bash
npm install @rut-toolkit/core
# or
pnpm add @rut-toolkit/core
# or
yarn add @rut-toolkit/core
# or
bun add @rut-toolkit/core
```

## 🚀 Quick Start

### Validate and Parse

```ts
import { isRut, toValidRut, tryParseRut } from "@rut-toolkit/core";

const input = "12.345.678-5";

if (isRut(input)) {
  // input is narrowed to ValidRut
  console.log("Valid:", input);
}

const parsed = tryParseRut(input);
if (parsed.ok) {
  console.log(parsed.rut);  // ValidRut, e.g. "123456785"
} else {
  console.log(parsed.code); // e.g. "RUT_DV_MISMATCH"
}

// Throwing variant
const validRut = toValidRut(input);
```

### Clean and Format

```ts
import {
  cleanRut,
  formatRut,
  fromCompactRut,
  toCompactRut,
} from "@rut-toolkit/core";

cleanRut(" 12.345.678 - 5 "); // "123456785"
toCompactRut("12.345.678-5"); // "12345678-5"
fromCompactRut("12345678-5"); // "12.345.678-5"

formatRut("123456785", { withDots: true, withHyphen: true });   // "12.345.678-5"
formatRut("123456785", { withDots: false, withHyphen: false }); // "123456785"
```

### Mask for UI

```ts
import { maskRut } from "@rut-toolkit/core";

maskRut("12.345.678-5");                              // "12.***.***-5"
maskRut("12.345.678-5", { maskChar: "•" });           // "12.•••.•••-5"
maskRut("12.345.678-5", { pattern: "XX.XXX.XXX-*" }); // "12.345.678-*"
```

### Analyze Barcode Data

```ts
import { analyzeRutBarcode } from "@rut-toolkit/core";

const raw =
  "https://portal.nuevosidiv.registrocivil.cl/document-validity?RUN=12345678-5&type=CEDULA";

const scan = analyzeRutBarcode(raw);
if (scan.ok) {
  console.log(scan.source); // "QR_FRONT" | "PDF417_REAR"
  console.log(scan.rut);    // ValidRut
}
```

## 📦 Main Exports

| Category | Exports | Description |
| :--- | :--- | :--- |
| **Validation** | `isRut`, `toValidRut`, `tryParseRut`, `calculateDv`, `verifyDv` | Type guards, parsing (throws/union), and math validation. |
| **Cleaning** | `cleanRut`, `splitRut`, `padRut` | Sanitization, component splitting, and length padding. |
| **Formatting** | `formatRut`, `buildRut`, `toCompactRut`, `fromCompactRut`, `toSiiRut` | Visual output transforms (dots, hyphens, SII standard). |
| **Masking** | `maskRut` | String obfuscation for secure UI display. |
| **Barcode** | `analyzeRutBarcode`, `parseRutFromBarcode`, `isRegistroCivilQrUrl` | ID card scanner utilities (QR and PDF417). |
| **Errors & i18n** | `RutError`, `RUT_ERROR_META`, `getRutErrorMessage` | Custom errors, severity metadata, and localization. |

## 📖 Documentation

Full API docs: [https://docs.rut-toolkit.dev](https://docs.rut-toolkit.dev)

## 📝 License

MIT © [Matías Castañeda](https://github.com/matcastaneda)