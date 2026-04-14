import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = path.join(__dirname, "../packages");
const SNAPSHOT_PATH = path.join(__dirname, "../.size-snapshot.json");

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

/**
 * Formats the difference between old and new size
 */
const formatSizeDifference = (diff) => {
  if (diff === 0) return "_unchanged_";
  const formatted = formatSize(Math.abs(diff));
  if (diff > 0) return `**+${formatted}** 📈🟡`;
  return `**-${formatted}** 📉🟢`;
};

// Load previous snapshot if available
let snapshot = {};
if (fs.existsSync(SNAPSHOT_PATH)) {
  try {
    snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
  } catch {
    console.warn("⚠️ Could not read .size-snapshot.json");
  }
}

const snapshotMeta = snapshot._meta;
const previousSizes = snapshot.sizes || snapshot;

// Prepare markdown structure
let markdown = `## 📊 Package Size Report\n\n`;

if (snapshotMeta?.commitSha) {
  const shortSha = snapshotMeta.commitSha.substring(0, 7);
  const actor = snapshotMeta.actor || "system";
  markdown += `> *Compared against base \`main\` (Commit: **${shortSha}** by @${actor})*\n\n`;
}

markdown += `| Package / Export | Limit | Size (Gzip) | Trend | Status |\n`;
markdown += `| :--- | :--- | :--- | :--- | :---: |\n`;

let hasErrors = false;
let totalSize = 0;
const newSnapshot = { sizes: {} };
const packages = fs.readdirSync(PACKAGES_DIR);

// Collect all package size data before generating markdown to allow sorting
const allPackageSizes = [];

for (const pkg of packages) {
  const reportPath = path.join(PACKAGES_DIR, pkg, ".size-report.json");

  if (fs.existsSync(reportPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(reportPath, "utf8"));

      results.forEach((result) => {
        const name = result.name || pkg;
        const limitInBytes = parseLimitToBytes(result.sizeLimit);
        const isOverLimit = limitInBytes > 0 && result.size > limitInBytes;

        const previousSize =
          previousSizes[name] !== undefined ? previousSizes[name] : result.size;
        const diff = result.size - previousSize;

        allPackageSizes.push({
          name,
          size: result.size,
          limitInBytes,
          isOverLimit,
          diff,
        });
      });
    } catch (error) {
      console.error(`Error parsing report for ${pkg}: ${error.message}`);
    }
  }
}

// Generate table rows and populate new snapshot
allPackageSizes.forEach((pkgData) => {
  totalSize += pkgData.size;
  if (pkgData.isOverLimit) hasErrors = true;

  const statusIcon = pkgData.isOverLimit ? "🔴" : "🟢";
  const limitDisplay =
    pkgData.limitInBytes > 0 ? formatSize(pkgData.limitInBytes) : "∞";
  const trendDisplay = formatSizeDifference(pkgData.diff);

  newSnapshot.sizes[pkgData.name] = pkgData.size;

  markdown += `| **${pkgData.name}** | ${limitDisplay} | **${formatSize(pkgData.size)}** | ${trendDisplay} | ${statusIcon} |\n`;
});

markdown += `\n`;
markdown += `**Total Bundle Weight:** ${formatSize(totalSize)}  \n`;
markdown += `✅ **Zero Dependencies** | 🛡️ **Type Safe** | ⚡ **Ultra Lightweight** \n\n`;
markdown += `*Generated on ${new Date().toUTCString()}*\n`;

// Write markdown summary and update snapshot if requested
try {
  fs.writeFileSync(path.join(__dirname, "../.size-summary.md"), markdown);

  if (process.env.UPDATE_SNAPSHOT === "true") {
    newSnapshot._meta = {
      updatedAt: new Date().toISOString(),
      commitSha: process.env.GITHUB_SHA || "local",
      actor: process.env.GITHUB_ACTOR || "local",
      runId: process.env.GITHUB_RUN_ID || "unknown",
    };

    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(newSnapshot, null, 2));
    console.log("📸 Snapshot updated successfully with traceability metadata.");
  }
  console.log("✅ Size summary generated successfully.");
} catch (error) {
  console.error("❌ Failed to write size summary:", error.message);
  process.exit(1);
}

// Cleanup temporary size reports
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
