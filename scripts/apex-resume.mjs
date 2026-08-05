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
    return (
      `Missing file: ${path}`
    );
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

printSection(
  "VERSION",
  readProjectFile(
    "VERSION.md",
  ),
);

printSection(
  "PROJECT STATUS",
  readProjectFile(
    "PROJECT_STATUS.md",
  ),
);

printSection(
  "CURRENT BUILD LOG",
  readProjectFile(
    "docs/build-log/current.md",
  ),
);

printSection(
  "STARTUP PROTOCOL",
  readProjectFile(
    "docs/development/apex-startup-protocol.md",
  ),
);

console.log();
console.log(
  "=== NEXT ACTION ===",
);

console.log(
  "Read the report above, inspect the relevant architecture and contracts, then continue only with the documented current milestone.",
);
