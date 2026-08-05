import {
  existsSync,
  readFileSync,
} from "node:fs";

import {
  execFileSync,
} from "node:child_process";

function runGit(args) {
  try {
    return execFileSync(
      "git",
      args,
      {
        encoding: "utf8",
      },
    ).trim();
  } catch {
    return "Unavailable";
  }
}

function printSection(
  title,
  content,
) {
  console.log();
  console.log(
    `=== ${title} ===`,
  );

  console.log(
    content.trim() ||
    "No content available.",
  );
}

function readProjectFile(path) {
  if (!existsSync(path)) {
    return `Missing file: ${path}`;
  }

  return readFileSync(
    path,
    "utf8",
  );
}

console.log(
  "APEX DEVELOPMENT RESUME REPORT",
);

console.log(
  `Generated: ${new Date().toISOString()}`,
);

printSection(
  "REPOSITORY",
  [
    `Branch: ${runGit([
      "branch",
      "--show-current",
    ])}`,

    `Latest commit: ${runGit([
      "log",
      "-1",
      "--oneline",
    ])}`,

    `Remote status: ${runGit([
      "status",
      "-sb",
    ])}`,
  ].join("\n"),
);

printSection(
  "WORKING TREE",
  runGit([
    "status",
    "--short",
  ]) || "Working tree clean.",
);

const sections = [
  [
    "VERSION",
    "VERSION.md",
  ],
  [
    "PROJECT STATUS",
    "PROJECT_STATUS.md",
  ],
  [
    "CURRENT BUILD LOG",
    "docs/build-log/current.md",
  ],
  [
    "MASTER ROADMAP",
    "docs/roadmap/master-roadmap.md",
  ],
  [
    "FEATURE STAGE MAP",
    "docs/roadmap/feature-stage-map.md",
  ],
  [
    "MASTER VISION",
    "docs/canon/master-vision.md",
  ],
  [
    "APEX CANON",
    "docs/canon/apex-canon.md",
  ],
  [
    "FUTURE ENHANCEMENTS",
    "docs/build-log/future-enhancements.md",
  ],
  [
    "STARTUP PROTOCOL",
    "docs/development/apex-startup-protocol.md",
  ],
];

for (const [
  title,
  path,
] of sections) {
  printSection(
    title,
    readProjectFile(path),
  );
}

console.log();
console.log(
  "=== NEXT ACTION ===",
);

console.log(
  [
    "Read the report above.",
    "Preserve the complete pillars and staged roadmap.",
    "Inspect contracts relevant to the active milestone.",
    "Continue only with the documented current checkpoint.",
    "Use Foundations → Features → Intelligence.",
  ].join(" "),
);
