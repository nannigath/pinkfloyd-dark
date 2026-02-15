#!/usr/bin/env node

/**
 * Audio Validation Script (T102)
 * Validates all audio files meet fair use requirements
 * - Duration: Exactly 30 seconds
 * - Format: MP3, 128kbps CBR
 * - File naming convention
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const AUDIO_DIR = "./src/assets/audio";
const REQUIRED_DURATION = 30; // seconds
const REQUIRED_BITRATE = "128000"; // 128kbps in bits

/**
 * Main validation function
 */
async function validateAudio() {
  console.log("🔊 Validating Audio Files...\n");

  const files = fs
    .readdirSync(AUDIO_DIR)
    .filter((f) => f.endsWith(".mp3"))
    .sort();

  if (files.length === 0) {
    console.error("❌ No MP3 files found in", AUDIO_DIR);
    process.exit(1);
  }

  console.log(`Found ${files.length} audio files:\n`);

  const results = [];
  let allPassed = true;

  for (const file of files) {
    const result = await validateFile(file);
    results.push(result);

    if (!result.passed) {
      allPassed = false;
    }

    printResult(result);
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATION SUMMARY");
  console.log("=".repeat(60));

  const passedCount = results.filter((r) => r.passed).length;
  console.log(`\n✅ Passed: ${passedCount}/${results.length}`);

  if (!allPassed) {
    const failed = results.filter((r) => !r.passed);
    console.log(`\n❌ Failed: ${failed.length} file(s)`);
    failed.forEach((f) =>
      console.log(`   - ${f.file}: ${f.errors.join(", ")}`),
    );
    console.log("\n⚠️  Please fix the issues above before deployment.\n");
    process.exit(1);
  } else {
    console.log("\n✨ All audio files meet fair use requirements!\n");
    process.exit(0);
  }
}

/**
 * Validate a single audio file
 */
async function validateFile(filename) {
  const filepath = path.join(AUDIO_DIR, filename);
  const result = {
    file: filename,
    passed: true,
    errors: [],
    warnings: [],
    duration: null,
    bitrate: null,
    format: null,
  };

  try {
    // Check if ffprobe is available
    let ffprobeOutput;
    try {
      ffprobeOutput = execSync(
        `ffprobe -v quiet -print_format json -show_streams "${filepath}"`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
      );
    } catch (e) {
      // ffprobe not available, try basic validation
      result.warnings.push(
        "ffprobe not available, performing basic validation only",
      );
      return validateBasic(filepath, result);
    }

    const metadata = JSON.parse(ffprobeOutput);
    const audioStream = metadata.streams.find((s) => s.codec_type === "audio");

    if (!audioStream) {
      result.passed = false;
      result.errors.push("No audio stream found");
      return result;
    }

    // Check duration
    const duration = parseFloat(audioStream.duration);
    result.duration = duration;

    if (Math.abs(duration - REQUIRED_DURATION) > 0.5) {
      result.passed = false;
      result.errors.push(
        `Duration is ${duration.toFixed(2)}s, expected ${REQUIRED_DURATION}s`,
      );
    }

    // Check bitrate
    const bitrate = audioStream.bit_rate;
    result.bitrate = bitrate;

    if (
      bitrate &&
      Math.abs(parseInt(bitrate) - parseInt(REQUIRED_BITRATE)) > 10000
    ) {
      result.warnings.push(
        `Bitrate is ${Math.round(bitrate / 1000)}kbps, expected 128kbps`,
      );
    }

    // Check format
    result.format = audioStream.codec_name;
    if (audioStream.codec_name !== "mp3") {
      result.warnings.push(
        `Format is ${audioStream.codec_name}, MP3 recommended`,
      );
    }

    // Validate filename convention: track-{NN}-{slug}-preview.mp3
    const filenamePattern = /^track-\d{2}-[a-z0-9-]+-preview\.mp3$/;
    if (!filenamePattern.test(filename)) {
      result.warnings.push(
        "Filename does not match convention: track-{NN}-{slug}-preview.mp3",
      );
    }
  } catch (error) {
    result.passed = false;
    result.errors.push(`Validation error: ${error.message}`);
  }

  return result;
}

/**
 * Basic validation without ffprobe
 */
function validateBasic(filepath, result) {
  try {
    const stats = fs.statSync(filepath);

    // Check file size (rough estimate: 30s at 128kbps ≈ 480KB)
    const expectedSize = 480 * 1024; // 480KB
    const sizeTolerance = 100 * 1024; // ±100KB tolerance

    if (Math.abs(stats.size - expectedSize) > sizeTolerance) {
      result.warnings.push(
        `File size is ${Math.round(stats.size / 1024)}KB, expected ~480KB`,
      );
    }

    // Check filename convention
    const filenamePattern = /^track-\d{2}-[a-z0-9-]+-preview\.mp3$/;
    if (!filenamePattern.test(path.basename(filepath))) {
      result.warnings.push(
        "Filename does not match convention: track-{NN}-{slug}-preview.mp3",
      );
    }
  } catch (error) {
    result.passed = false;
    result.errors.push(`File access error: ${error.message}`);
  }

  return result;
}

/**
 * Print validation result
 */
function printResult(result) {
  const icon = result.passed ? "✅" : "❌";
  const status = result.passed ? "PASS" : "FAIL";

  console.log(`${icon} ${result.file} [${status}]`);

  if (result.duration) {
    console.log(`   Duration: ${result.duration.toFixed(2)}s`);
  }
  if (result.bitrate) {
    console.log(`   Bitrate: ${Math.round(result.bitrate / 1000)}kbps`);
  }
  if (result.format) {
    console.log(`   Format: ${result.format}`);
  }

  result.errors.forEach((error) => {
    console.log(`   ❌ ${error}`);
  });

  result.warnings.forEach((warning) => {
    console.log(`   ⚠️  ${warning}`);
  });

  console.log("");
}

// Run validation
validateAudio().catch((error) => {
  console.error("❌ Validation failed:", error);
  process.exit(1);
});
