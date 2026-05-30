#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { stdin as input, stdout as output } from 'node:process';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultTarget = path.join(os.homedir(), '.codex', 'skills');

function parseArgs(argv) {
  const args = {
    all: false,
    list: false,
    help: false,
    force: false,
    target: defaultTarget,
    skills: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all' || arg === '-a') args.all = true;
    else if (arg === '--list' || arg === '-l') args.list = true;
    else if (arg === '--force' || arg === '-f') args.force = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--target' || arg === '-t') args.target = expandPath(argv[++i] ?? '');
    else if (arg === '--skill' || arg === '-s') args.skills.push(argv[++i]);
    else if (!arg.startsWith('-')) args.skills.push(arg);
    else throw new Error(`Unknown option: ${arg}`);
  }

  return args;
}

function expandPath(value) {
  if (!value) return value;
  if (value === '~') return os.homedir();
  if (value.startsWith(`~${path.sep}`) || value.startsWith('~/')) {
    return path.join(os.homedir(), value.slice(2));
  }
  return path.resolve(value);
}

function readSkillMetadata(skillPath) {
  const skillFile = path.join(skillPath, 'SKILL.md');
  const content = fs.readFileSync(skillFile, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (!name || !description) return null;

  return { name, description, path: skillPath };
}

function discoverSkills() {
  return fs.readdirSync(packageRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packageRoot, entry.name))
    .filter((skillPath) => fs.existsSync(path.join(skillPath, 'SKILL.md')))
    .map(readSkillMetadata)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function printHelp() {
  console.log(`3D Web Game Dev Skills

Usage:
  npx 3d-web-game-dev-skills
  npx 3d-web-game-dev-skills --all
  npx 3d-web-game-dev-skills --skill generate-low-poly-model
  npx 3d-web-game-dev-skills --target ~/.codex/skills

Options:
  -l, --list              List bundled skills.
  -a, --all               Install all bundled skills.
  -s, --skill <name>      Install a specific skill. Can be repeated.
  -t, --target <dir>      Target skills directory. Default: ~/.codex/skills
  -f, --force             Replace existing installed skill folders.
  -h, --help              Show this help.

Interactive selection accepts comma-separated numbers, skill names, or "all".`);
}

function printSkills(skills) {
  skills.forEach((skill, index) => {
    console.log(`${index + 1}. ${skill.name}`);
    console.log(`   ${skill.description}`);
  });
}

async function promptForSkills(skills) {
  printSkills(skills);
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('\nSelect skills to install (numbers, names, or all): ');
  rl.close();
  return selectSkills(skills, answer);
}

function selectSkills(skills, answer) {
  const normalized = answer.trim();
  if (!normalized) return [];
  if (normalized.toLowerCase() === 'all') return skills;

  const selected = new Map();
  for (const part of normalized.split(',').map((item) => item.trim()).filter(Boolean)) {
    const index = Number(part);
    const skill = Number.isInteger(index) && index > 0
      ? skills[index - 1]
      : skills.find((candidate) => candidate.name === part);

    if (!skill) {
      throw new Error(`Unknown skill selection: ${part}`);
    }
    selected.set(skill.name, skill);
  }
  return [...selected.values()];
}

function copySkill(skill, targetRoot, force) {
  const destination = path.join(targetRoot, skill.name);
  if (fs.existsSync(destination)) {
    if (!force) {
      console.log(`Skipped ${skill.name}: already exists at ${destination}. Use --force to replace it.`);
      return false;
    }
    fs.rmSync(destination, { recursive: true, force: true });
  }

  fs.mkdirSync(targetRoot, { recursive: true });
  fs.cpSync(skill.path, destination, {
    recursive: true,
    filter: (source) => !source.includes(`${path.sep}.git${path.sep}`),
  });
  console.log(`Installed ${skill.name} -> ${destination}`);
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const skills = discoverSkills();

  if (args.help) {
    printHelp();
    return;
  }

  if (args.list) {
    printSkills(skills);
    return;
  }

  let selected = [];
  if (args.all) {
    selected = skills;
  } else if (args.skills.length > 0) {
    selected = args.skills.map((name) => {
      const skill = skills.find((candidate) => candidate.name === name);
      if (!skill) throw new Error(`Unknown skill: ${name}`);
      return skill;
    });
  } else {
    selected = await promptForSkills(skills);
  }

  if (selected.length === 0) {
    console.log('No skills selected.');
    return;
  }

  const target = expandPath(args.target);
  let installed = 0;
  for (const skill of selected) {
    if (copySkill(skill, target, args.force)) installed += 1;
  }
  console.log(`\nDone. ${installed} skill(s) installed to ${target}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
