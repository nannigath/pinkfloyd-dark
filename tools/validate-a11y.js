#!/usr/bin/env node

/**
 * Accessibility Audit Script (T096)
 * Automated WCAG 2.1 AA compliance testing using axe-core
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const REPORT_DIR = "./tests/accessibility";

/**
 * Run accessibility audit
 */
async function runAccessibilityAudit() {
  console.log("♿ Running Accessibility Audit (WCAG 2.1 AA)...\n");

  // Ensure report directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  try {
    // Check if build exists
    if (!fs.existsSync("./dist")) {
      console.log("Building project first...\n");
      execSync("npm run build", { stdio: "inherit" });
    }

    // Start preview server
    console.log("Starting preview server...");
    const previewProcess = execSync("npm run preview &", {
      stdio: "ignore",
      detached: true,
    });

    // Wait for server to start
    await sleep(3000);

    // Run axe-core CLI
    console.log("Running axe-core audit...\n");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportFile = path.join(REPORT_DIR, `audit-${timestamp}.json`);

    try {
      const axeOutput = execSync(
        `npx axe http://localhost:4173 --tags wcag2aa --reporter json`,
        { encoding: "utf8", timeout: 60000 },
      );

      const results = JSON.parse(axeOutput);
      fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));

      // Analyze results
      let totalViolations = 0;
      let criticalViolations = 0;
      let seriousViolations = 0;
      let moderateViolations = 0;
      let minorViolations = 0;

      results.forEach((pageResult) => {
        totalViolations += pageResult.violations.length;

        pageResult.violations.forEach((violation) => {
          switch (violation.impact) {
            case "critical":
              criticalViolations++;
              break;
            case "serious":
              seriousViolations++;
              break;
            case "moderate":
              moderateViolations++;
              break;
            case "minor":
              minorViolations++;
              break;
          }
        });
      });

      // Print summary
      console.log("=".repeat(60));
      console.log("ACCESSIBILITY AUDIT RESULTS");
      console.log("=".repeat(60));
      console.log(`\n📄 Report saved to: ${reportFile}`);
      console.log(`\n📊 Summary:`);
      console.log(`   Total Violations: ${totalViolations}`);
      console.log(`   🔴 Critical: ${criticalViolations}`);
      console.log(`   🟠 Serious: ${seriousViolations}`);
      console.log(`   🟡 Moderate: ${moderateViolations}`);
      console.log(`   🔵 Minor: ${minorViolations}`);

      // Print detailed violations
      if (totalViolations > 0) {
        console.log("\n❌ Violations Found:\n");

        results.forEach((pageResult, index) => {
          if (pageResult.violations.length > 0) {
            console.log(`Page ${index + 1}: ${pageResult.url}`);

            pageResult.violations.forEach((violation) => {
              console.log(
                `\n  [${violation.impact.toUpperCase()}] ${violation.id}`,
              );
              console.log(`  Description: ${violation.description}`);
              console.log(`  Help: ${violation.help}`);
              console.log(`  Help URL: ${violation.helpUrl}`);
              console.log(`  Nodes affected: ${violation.nodes.length}`);

              violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
                console.log(`\n    Node ${nodeIndex + 1}:`);
                console.log(`    Target: ${node.target.join(" ")}`);
                console.log(
                  `    HTML: ${node.html.substring(0, 100)}${node.html.length > 100 ? "..." : ""}`,
                );

                if (node.failureSummary) {
                  console.log(`    Issue: ${node.failureSummary}`);
                }
              });

              if (violation.nodes.length > 3) {
                console.log(
                  `\n    ... and ${violation.nodes.length - 3} more nodes`,
                );
              }
            });

            console.log("\n" + "-".repeat(60));
          }
        });
      }

      // Pass/Fail
      console.log("\n" + "=".repeat(60));
      if (criticalViolations === 0 && seriousViolations === 0) {
        console.log("✅ WCAG 2.1 AA Compliance: PASS");
        console.log("   No critical or serious violations found");
        console.log("=".repeat(60) + "\n");
        process.exit(0);
      } else {
        console.log("❌ WCAG 2.1 AA Compliance: FAIL");
        console.log(
          `   ${criticalViolations} critical and ${seriousViolations} serious violations must be fixed`,
        );
        console.log("=".repeat(60) + "\n");
        process.exit(1);
      }
    } catch (axeError) {
      // axe-core returns non-zero exit code when violations found
      // Check if report was still generated
      if (fs.existsSync(reportFile)) {
        console.log("✅ Audit completed with violations - see report");
        process.exit(1);
      } else {
        throw axeError;
      }
    }
  } catch (error) {
    console.error("\n❌ Accessibility audit failed:", error.message);
    console.log("\n⚠️  Troubleshooting:");
    console.log("   1. Make sure Chrome/Chromium is installed");
    console.log("   2. Try running: npm run preview (in another terminal)");
    console.log("   3. Then run: npx axe http://localhost:4173\n");
    process.exit(1);
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run audit
runAccessibilityAudit();
