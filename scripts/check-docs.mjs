import {
  access,
  readFile,
} from "node:fs/promises";

const requiredFiles = [
  "PROJECT_STATUS.md",
  "VERSION.md",
  "docs/canon/design-philosophy.md",
  "docs/canon/founding-principles.md",
  "docs/canon/apex-values.md",
  "docs/build-log/future-enhancements.md",
  "docs/development/apex-startup-protocol.md",
  "docs/canon/apex-canon.md",
  "docs/canon/apex-philosophy.md",
  "docs/canon/master-vision.md",
  "docs/canon/non-negotiables.md",
  "docs/canon/architecture-principles.md",
  "docs/roadmap/master-roadmap.md",
  "docs/roadmap/feature-stage-map.md",
  "docs/architecture/ai-architecture.md",
  "docs/architecture/decision-memory.md",
  "docs/architecture/event-system.md",
  "docs/architecture/database.md",
  "docs/architecture/cloud-sync.md",
  "docs/game-systems/pvp.md",
  "docs/game-systems/bloodlines.md",
  "docs/coaching/recovery-and-constraints.md",
  "docs/development/developer-handbook.md",
  "docs/development/testing-standards.md",
  "docs/development/git-workflow.md",
  "docs/development/checkpoint-checklist.md",
  "docs/build-log/current.md",
  "docs/releases/changelog.md",
];

const requiredStatusHeadings = [
  "## Current branch",
  "## Current architectural stage",
  "## Latest completed checkpoint",
  "## Current test status",
  "## Current build target",
  "## Agreed next development order",
  "## Next-session instruction",
];

async function main() {
  const missingFiles = [];

  for (const file of requiredFiles) {
    try {
      await access(file);
    } catch {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(
      `Missing required Apex documentation:\n${missingFiles
        .map((file) => `- ${file}`)
        .join("\n")}`,
    );
  }

  const projectStatus = await readFile(
    "PROJECT_STATUS.md",
    "utf8",
  );

  const missingHeadings =
    requiredStatusHeadings.filter(
      (heading) =>
        !projectStatus.includes(heading),
    );

  if (missingHeadings.length > 0) {
    throw new Error(
      `PROJECT_STATUS.md is missing required headings:\n${missingHeadings
        .map((heading) => `- ${heading}`)
        .join("\n")}`,
    );
  }

  const unresolvedMarkers = [
    "TODO: UPDATE",
    "TBC: UPDATE",
    "CURRENT_STAGE_HERE",
    "NEXT_TASK_HERE",
  ];

  const filesWithMarkers = [];

  for (const file of requiredFiles) {
    const contents = await readFile(
      file,
      "utf8",
    );

    if (
      unresolvedMarkers.some(
        (marker) =>
          contents.includes(marker),
      )
    ) {
      filesWithMarkers.push(file);
    }
  }

  if (filesWithMarkers.length > 0) {
    throw new Error(
      `Documentation contains unresolved status markers:\n${filesWithMarkers
        .map((file) => `- ${file}`)
        .join("\n")}`,
    );
  }

  console.log(
    `Apex documentation check passed (${requiredFiles.length} files verified).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
