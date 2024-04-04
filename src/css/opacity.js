#!/usr/bin/env node

/**
 * @file opacity.js
 * @description This script generates CSS variables for different opacities from a CSS file.
 * @version 1.0.0
 * @license MIT
 * @example
 *    ./opacity.js -s ./variables.css -o ./variables2.css
 *    ./opacity.js --source ./variables.css --output ./variables2.css
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
let options;

function usage(message = "") {
  if (message) console.error(`  Error: ${message}`);

  console.log(`
  Usage: ./main.js [options]

  Options:
    -s, --source <file>     Source CSS file
    -o, --output <file>     Output CSS file
    -h, --help              Display help`);
}

options = args.reduce((acc, arg, i, arr) => {
  if (arg.startsWith("-")) {
    acc[arg] = arr[i + 1];
  }
  return acc;
}, {});

if (options["-h"] || options["--help"]) {
  usage();
  process.exit(0);
} else if (!options["-s"] && !options["--source"]) {
  usage("The source CSS file must be provided.");
  process.exit(1);
} else if (!options["-o"] && !options["--output"]) {
  usage("The output CSS file must be provided.");
  process.exit(1);
}

let source = options["--source"] || options["-s"];
let output = options["--output"] || options["-o"];

if (!fs.existsSync(source)) {
  console.error(`Error: Source file ${source} does not exist`);
  process.exit(1);
}

const OPACITIES = [10, 20, 30, 40, 50, 60, 70, 80, 90].reverse();

const setOpacity = (hex, alpha) =>
  `${hex}${Math.floor(alpha * 255)
    .toString(16)
    .padStart(2, 0)}`;

const readCssFile = (filePath) =>
  fs.readFileSync(path.resolve(__dirname, filePath), "utf8");

const writeCssFile = (filePath, content) =>
  fs.writeFileSync(path.resolve(__dirname, filePath), content);

const mapLineToOpacity = (line) => {
  if (!line.includes(": #")) return line;

  let [varName, hex] = line.split(": ");
  hex = hex.replace(";", "");
  varName = varName.trim().replace("--", "");

  const varNameBase = varName.split("-").slice(0, -1).join("-");
  const varNameSuffix = varName.split("-").pop();

  for (let opacity of OPACITIES) {
    const newVarName = `--${varNameBase}-${varNameSuffix}-${opacity}`;
    const newHex = setOpacity(hex, opacity / 100);
    line += `\n\t\t${newVarName}: ${newHex};`;
  }

  return line + "\n\t";
};

const css = readCssFile(source);
const newCss = css.split("\n").map(mapLineToOpacity).join("\n");
writeCssFile(output, newCss);
