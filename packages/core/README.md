# @rut-toolkit/core

[![npm version](https://img.shields.io/npm/v/@rut-toolkit/core.svg)](https://www.npmjs.com/package/@rut-toolkit/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@rut-toolkit/core.svg)](https://bundlephobia.com/package/@rut-toolkit/core)
[![license](https://img.shields.io/npm/l/@rut-toolkit/core.svg)](https://github.com/matcastaneda/rut-toolkit/blob/main/packages/core/LICENSE)

> Zero-dependency, strictly typed utilities for Chilean RUT/RUN validation, formatting, cleaning, masking, and ID-card barcode parsing.

Branded types (`ValidRut`, `FormattedRut`) catch invalid values at compile time, while modulo-11 validation and structured error codes handle them at runtime. Works in Node.js, edge runtimes, and the browser.

## ✨ Features

- **Zero Dependencies ⚡** — Lightweight and fast, no transitive installs.
- **Branded Types 🎯** — `ValidRut` and `FormattedRut` guarantee correctness at the compiler level.
- **Barcode Parsing 📸** — Extract RUTs from Chilean ID card barcodes (QR front and PDF417 rear).
- **Structured Errors 🛡️** — Machine-readable error codes, severity metadata, and i18n messages (es/en).
- **Business Rules 🏢** — Classify RUTs as person, company, or provisional and enforce constraints.
- **Isomorphic 🌐** — Runs in Node.js, Deno, Bun, Cloudflare Workers, and the browser.

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

// Type guard — narrows to ValidRut
if (isRut(input)) {
  console.log("Valid:", input); // input: ValidRut
}

// Non-throwing — returns a discriminated union
const result = tryParseRut(input);
if (result.ok) {
  console.log(result.rut); // ValidRut "123456785"
} else {
  console.log(result.code); // "RUT_DV_MISMATCH"
  console.log(result.meta); // { category, severity, httpStatus }
}

// Throwing — returns ValidRut or throws RutError
const rut = toValidRut(input);
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
toCompactRut("12.345.678-5");  // "12345678-5"
fromCompactRut("12345678-5");  // "12.345.678-5"

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

### Business Rules

```ts
import {
  isCompanyRut,
  isPersonRut,
  isProvisionalRut,
  ensureCompanyRut,
} from "@rut-toolkit/core";

isCompanyRut("76.123.456-7");   // true  (50M–99M range)
isPersonRut("12.345.678-5");    // true  (below 50M)
isProvisionalRut("100200300-4"); // true  (100M+ IPE range)

// Throws RutError "RUT_COMPANY_REQUIRED" if not a company RUT
ensureCompanyRut(rut);
```

### Structured Errors

```ts
import { RutError, toValidRut } from "@rut-toolkit/core";
import { getRutErrorMessage } from "@rut-toolkit/core/errors";

try {
  toValidRut("12345678-0");
} catch (err) {
  if (err instanceof RutError) {
    err.code;            // "RUT_DV_MISMATCH"
    err.meta.category;   // "validation"
    err.meta.severity;   // "error"
    err.meta.httpStatus; // 422
  }
}

// i18n error messages (available from the /errors subpath)
getRutErrorMessage("RUT_DV_MISMATCH", "es");
// "El dígito verificador no coincide."
getRutErrorMessage("RUT_DV_MISMATCH", "en");
// "Check digit does not match."
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

## 📦 Exports

| Category | Functions | Description |
| :--- | :--- | :--- |
| **Validation** | `isRut`, `toValidRut`, `tryParseRut`, `calculateDv`, `verifyDv` | Type guard, branded parser, discriminated union, DV math. |
| **Cleaning** | `cleanRut`, `splitRut`, `padRut` | Strip formatting, split body/DV, zero-pad. |
| **Formatting** | `formatRut`, `buildRut`, `toCompactRut`, `fromCompactRut`, `toSiiRut` | Dots, hyphens, SII DTE format. |
| **Masking** | `maskRut` | Pattern-based obfuscation for UI display. |
| **Business** | `isCompanyRut`, `isPersonRut`, `isProvisionalRut`, `ensureCompanyRut`, `ensurePersonRut`, `ensureNotProvisionalRut` | Range classification and enforcement. |
| **Suspicious** | `isPlaceholderRut`, `ensureRealRut` | Detect and reject known fake RUTs. |
| **Barcode** | `analyzeRutBarcode`, `parseRutFromBarcode`, `isRegistroCivilQrUrl` | Chilean ID card scanner (QR and PDF417). |
| **Errors** | `RutError` | Structured error class (main export). |
| **Errors (subpath)** | `RUT_ERROR_META`, `RUT_ERROR_CODES`, `getRutErrorMessage`, `RUT_ERROR_MESSAGES` | Metadata registry, i18n messages — via `@rut-toolkit/core/errors`. |
| **Types** | `ValidRut`, `FormattedRut`, `RutDv`, `RutParseResult`, `RutComponents`, `RutErrorCode`, `RutErrorMeta`, `RutErrorHttpStatus`, `BarcodeScanResult`, `BarcodeSource`, … | Branded types, barcode results, literals, and discriminated unions. |

## 🌲 Subpath Imports

For smaller bundles, import only the module you need:

```ts
import { cleanRut, splitRut } from "@rut-toolkit/core/clean";
import { formatRut, maskRut } from "@rut-toolkit/core/format";
import { isRut, toValidRut } from "@rut-toolkit/core/validate";
import { isCompanyRut } from "@rut-toolkit/core/business";
import { analyzeRutBarcode } from "@rut-toolkit/core/barcode";
import { RutError, getRutErrorMessage } from "@rut-toolkit/core/errors";
```

Each subpath is independently tree-shakeable and has its own type declarations.

## 📖 Documentation

Full API docs: [rut-toolkit.dev](https://rut-toolkit.dev)

## 📝 License

MIT © [Matías Castañeda](https://github.com/matcastaneda)
