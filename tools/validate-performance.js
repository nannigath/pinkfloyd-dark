/**
 * Performance Budget Validation (T095)
 * Validates site meets performance requirements:
 * - FCP < 1.5s
 * - TTI < 3.5s
 * - LCP < 2.5s
 * - Lighthouse 90+ all categories
 */

import { execSync } from "child_process";
import fs from "fs";

const PERFORMANCE_BUDGETS = {
  fcp: 1.5, // First Contentful Paint (seconds)
  tti: 3.5, // Time to Interactive (seconds)
  lcp: 2.5, // Largest Contentful Paint (seconds)
  cls: 0.1, // Cumulative Layout Shift
  fid: 100, // First Input Delay (ms)
  lighthouse: 90, // Minimum Lighthouse score
};

/**
 * Validate performance budgets using Lighthouse CI
 */
async function validatePerformanceBudgets() {
  console.log("🚀 Validating Performance Budgets...\n");
  console.log(
    `Budgets: FCP < ${PERFORMANCE_BUDGETS.fcp}s, TTI < ${PERFORMANCE_BUDGETS.tti}s, LCP < ${PERFORMANCE_BUDGETS.lcp}s\n`,
  );

  try {
    // Run Lighthouse CI
    console.log("Running Lighthouse audit...");

    // Check if build exists
    if (!fs.existsSync("./dist")) {
      console.log("Building project first...");
      execSync("npm run build", { stdio: "inherit" });
    }

    // Run lighthouse on the built site
    const lighthouseResult = execSync(
      `npx lighthouse http://localhost:4173 --output=json --chrome-flags="--headless --no-sandbox"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] },
    );

    const results = JSON.parse(lighthouseResult);
    const categories = results.categories;
    const audits = results.audits;

    let allPassed = true;

    // Check Lighthouse scores
    console.log("\n📊 Lighthouse Scores:");
    console.log("-".repeat(40));

    Object.entries(categories).forEach(([key, category]) => {
      const score = Math.round(category.score * 100);
      const passed = score >= PERFORMANCE_BUDGETS.lighthouse;
      const icon = passed ? "✅" : "❌";

      console.log(`${icon} ${category.title}: ${score}/100`);

      if (!passed) {
        allPassed = false;
      }
    });

    // Check Core Web Vitals
    console.log("\n⚡ Core Web Vitals:");
    console.log("-".repeat(40));

    const metrics = {
      "first-contentful-paint": {
        name: "FCP",
        budget: PERFORMANCE_BUDGETS.fcp,
        unit: "s",
      },
      interactive: { name: "TTI", budget: PERFORMANCE_BUDGETS.tti, unit: "s" },
      "largest-contentful-paint": {
        name: "LCP",
        budget: PERFORMANCE_BUDGETS.lcp,
        unit: "s",
      },
      "cumulative-layout-shift": {
        name: "CLS",
        budget: PERFORMANCE_BUDGETS.cls,
        unit: "",
      },
      "max-potential-fid": {
        name: "FID",
        budget: PERFORMANCE_BUDGETS.fid,
        unit: "ms",
      },
    };

    Object.entries(metrics).forEach(([auditKey, metric]) => {
      const audit = audits[auditKey];
      if (audit) {
        const value = audit.numericValue;
        const displayValue = audit.displayValue || value;
        const passed = value <= metric.budget;
        const icon = passed ? "✅" : "❌";

        console.log(
          `${icon} ${metric.name}: ${displayValue} (budget: <${metric.budget}${metric.unit})`,
        );

        if (!passed) {
          allPassed = false;
        }
      }
    });

    // Check asset sizes
    console.log("\n📦 Asset Size Budgets:");
    console.log("-".repeat(40));

    const sizeBudgets = {
      total: 5 * 1024 * 1024, // 5MB total
      javascript: 500 * 1024, // 500KB JS
      css: 100 * 1024, // 100KB CSS
      images: 2 * 1024 * 1024, // 2MB images
    };

    // Calculate actual sizes from build output
    const jsFiles = getFilesInDir("./dist/assets", ".js");
    const cssFiles = getFilesInDir("./dist/assets", ".css");
    const imageFiles = getFilesInDir("./dist/assets", [
      ".webp",
      ".png",
      ".jpg",
      ".svg",
    ]);

    const jsSize = calculateTotalSize(jsFiles);
    const cssSize = calculateTotalSize(cssFiles);
    const imageSize = calculateTotalSize(imageFiles);
    const totalSize = jsSize + cssSize + imageSize;

    console.log(
      `${jsSize <= sizeBudgets.javascript ? "✅" : "❌"} JavaScript: ${formatBytes(jsSize)} / ${formatBytes(sizeBudgets.javascript)}`,
    );
    console.log(
      `${cssSize <= sizeBudgets.css ? "✅" : "❌"} CSS: ${formatBytes(cssSize)} / ${formatBytes(sizeBudgets.css)}`,
    );
    console.log(
      `${imageSize <= sizeBudgets.images ? "✅" : "❌"} Images: ${formatBytes(imageSize)} / ${formatBytes(sizeBudgets.images)}`,
    );
    console.log(
      `${totalSize <= sizeBudgets.total ? "✅" : "❌"} Total: ${formatBytes(totalSize)} / ${formatBytes(sizeBudgets.total)}`,
    );

    if (
      jsSize > sizeBudgets.javascript ||
      cssSize > sizeBudgets.css ||
      imageSize > sizeBudgets.images ||
      totalSize > sizeBudgets.total
    ) {
      allPassed = false;
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    if (allPassed) {
      console.log("✅ All performance budgets met!");
      console.log("=".repeat(60) + "\n");
      process.exit(0);
    } else {
      console.log("❌ Some performance budgets exceeded");
      console.log("=".repeat(60) + "\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Performance validation failed:", error.message);
    console.log(
      "\n⚠️  Note: Make sure the site is running (npm run preview) before testing\n",
    );
    process.exit(1);
  }
}

/**
 * Get all files in directory with given extension(s)
 */
function getFilesInDir(dir, extensions) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  const exts = Array.isArray(extensions) ? extensions : [extensions];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach((item) => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (exts.some((ext) => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  traverse(dir);
  return files;
}

/**
 * Calculate total size of files
 */
function calculateTotalSize(files) {
  return files.reduce((total, file) => {
    try {
      return total + fs.statSync(file).size;
    } catch {
      return total;
    }
  }, 0);
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Run validation
validatePerformanceBudgets();
