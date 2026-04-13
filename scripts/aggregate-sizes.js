import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = path.join(__dirname, "../packages");

/**
 * Converts size-limit limit strings (e.g., "2 kB", "500 B") to numbers
 * @param {string|number|undefined} limit
 * @returns {number}
 */
const parseLimitToBytes = (limit) => {
  if (limit === undefined || limit === null) return 0;
  if (typeof limit === "number") return limit;

  const value = parseFloat(limit);
  if (typeof limit === "string" && limit.includes("kB")) {
    return value * 1024;
  }
  return value;
};

/**
 * Formats bytes to a human-readable string (B or kB)
 * @param {number} bytes
 * @returns {string}
 */
const formatSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(2)} kB`;
};

let markdown = `## 📊 Package Size Report\n\n`;
markdown += `| Package / Export | Limit | Size (Gzip) | Status |\n`;
markdown += `| :--- | :--- | :--- | :---: |\n`;

let hasErrors = false;
let totalSize = 0;
const packages = fs.readdirSync(PACKAGES_DIR);

for (const pkg of packages) {
  const reportPath = path.join(PACKAGES_DIR, pkg, ".size-report.json");

  if (fs.existsSync(reportPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(reportPath, "utf8"));

      results.forEach((result) => {
        const limitInBytes = parseLimitToBytes(result.sizeLimit);
        const isOverLimit = limitInBytes > 0 && result.size > limitInBytes;
        totalSize += result.size;

        if (isOverLimit) hasErrors = true;

        const statusIcon = isOverLimit ? "🔴" : "🟢";
        const name = result.name || pkg;
        const limitDisplay = limitInBytes > 0 ? formatSize(limitInBytes) : "∞";

        markdown += `| **${name}** | ${limitDisplay} | **${formatSize(result.size)}** | ${statusIcon} |\n`;
      });
    } catch (error) {
      console.error(`Error parsing report for ${pkg}: ${error.message}`);
    }
  }
}

markdown += `\n`;
markdown += `**Total Bundle Weight:** ${formatSize(totalSize)}  \n`;
markdown += `✅ **Zero Dependencies** | 🛡️ **Type Safe** | ⚡ **Ultra Lightweight** \n\n`;
markdown += `*Generated on ${new Date().toUTCString()}*\n`;

try {
  fs.writeFileSync(path.join(__dirname, "../.size-summary.md"), markdown);
  console.log("✅ Size summary generated successfully.");
} catch (error) {
  console.error("❌ Failed to write size summary:", error.message);
  process.exit(1);
}

console.log("✨ Cleaning up temporary reports...");
for (const pkg of packages) {
  const reportPath = path.join(PACKAGES_DIR, pkg, ".size-report.json");
  if (fs.existsSync(reportPath)) {
    try {
      fs.unlinkSync(reportPath);
    } catch (err) {
      console.warn(`⚠️ Could not remove ${reportPath}: ${err.message}`);
    }
  }
}

if (hasErrors) {
  console.error("❌ Size limit exceeded in one or more packages.");
  process.exit(1);
}
