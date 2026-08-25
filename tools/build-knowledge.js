#!/usr/bin/env node
/**
 * build-knowledge.js
 * ============================================================
 * Generates assets/data/knowledge-index.json from the Markdown
 * files in the knowledge/ directory.
 *
 * The Markdown files are the source of truth. This script is the
 * "knowledge parser / index" step of the pipeline:
 *
 *   Repository
 *     ↓
 *   Markdown + YAML metadata  (knowledge/**​/*.md)
 *     ↓
 *   build-knowledge.js        (frontmatter parsing, index, dates)
 *     ↓
 *   knowledge-index.json      (the compiled archive the site reads)
 *     ↓
 *   Frontend renderer         (tools/knowledge/)
 *
 * Usage:
 *   node tools/build-knowledge.js
 *
 * Requirements:
 *   - Node.js (no dependencies)
 *   - git available in PATH (used to derive dateAdded/dateModified;
 *     falls back to file timestamps when git is unavailable)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const KNOWLEDGE_DIR = path.join(ROOT, 'knowledge');
const OUT_DIR = path.join(ROOT, 'assets', 'data');
const OUT_FILE = path.join(OUT_DIR, 'knowledge-index.json');

// ---------------------------------------------------------------------------
// YAML frontmatter (subset) parsing
// Supports the fields used by knowledge entries:
//   key: value
//   key: "quoted value"
//   key: [a, b, c]
//   key:
//     - item
//     - item
// Unknown keys are preserved verbatim in the entry metadata.
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const meta = {};
  let currentKey = null;

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // list item: - value
    const listMatch = line.match(/^-\s+(.*)$/);
    if (listMatch) {
      if (!currentKey) continue;
      const value = listMatch[1].trim().replace(/^["']|["']$/g, '');
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(value);
      continue;
    }

    // key: value
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    currentKey = m[1];
    let value = m[2].trim();

    // empty value -> start of a list (items follow with "- ")
    if (value === '') {
      meta[currentKey] = [];
      continue;
    }

    // strip matching quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // inline list: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      meta[currentKey] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      continue;
    }

    meta[currentKey] = value;
  }

  return meta;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-');
}

function stripMarkdown(src) {
  return String(src)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[\[([^\[\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)\s]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^:::\s*[a-z0-9_-]+\s*$/gim, '')
    .replace(/^:::\s*$/gim, '')
    .replace(/[*_~]/g, '');
}

function makeExcerpt(body) {
  const text = stripMarkdown(body)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= 200) return text;
  const cut = text.slice(0, 200);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut) + '…';
}

function collectWikiLinks(body) {
  const targets = [];
  const re = /\[\[([^\[\]]+)\]\]/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const inner = m[1];
    const target = inner.includes('|') ? inner.slice(0, inner.indexOf('|')) : inner;
    const t = target.trim();
    if (t && !targets.includes(t)) targets.push(t);
  }
  return targets;
}

// ---------------------------------------------------------------------------
// Git-derived dates (Recently Acquired)
// ---------------------------------------------------------------------------
function gitLogDate(file, args) {
  try {
    const out = execFileSync('git', ['log', ...args, '--format=%ct', '--', file], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!out) return null;
    const secs = parseInt(out.split('\n')[0], 10);
    return Number.isFinite(secs) ? secs * 1000 : null;
  } catch {
    return null;
  }
}

function entryDates(absPath) {
  const rel = path.relative(ROOT, absPath).split(path.sep).join('/');
  let added = gitLogDate(rel, ['--diff-filter=A']);
  let modified = gitLogDate(rel, ['-1']);
  try {
    const stat = fs.statSync(absPath);
    if (added === null) added = stat.birthtimeMs;
    if (modified === null) modified = stat.mtimeMs;
  } catch {
    /* keep nulls */
  }
  return { dateAdded: added, dateModified: modified };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.') || name.startsWith('_')) continue;
    const abs = path.join(dir, name);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) walk(abs, out);
    else if (name.toLowerCase().endsWith('.md')) out.push(abs);
  }
}

function build() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`knowledge/ directory not found at ${KNOWLEDGE_DIR}`);
    process.exit(1);
  }

  const files = [];
  walk(KNOWLEDGE_DIR, files);
  files.sort();

  const entries = [];
  const seenSlugs = new Map();

  for (const abs of files) {
    const raw = fs.readFileSync(abs, 'utf8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) {
      console.log(`  skip (no frontmatter): ${path.relative(KNOWLEDGE_DIR, abs)}`);
      continue;
    }

    const meta = parseFrontmatter(match[1]);
    const body = raw.slice(match[0].length);

    if (!meta.title) {
      console.warn(`  warn (missing title): ${path.relative(KNOWLEDGE_DIR, abs)}`);
    }

    const relDir = path.dirname(path.relative(KNOWLEDGE_DIR, abs));
    const defaultDomain = relDir === '.'
      ? 'General'
      : relDir
          .split(path.sep)
          .map((p) => p.replace(/[-_]/g, ' '))
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' / ');

    const title = String(meta.title || path.basename(abs, '.md')).trim();
    const slug = String(meta.slug || slugify(title) || path.basename(abs, '.md'));
    const type = String(meta.type || 'concept').toLowerCase();
    const domain = String(meta.domain || defaultDomain);

    if (seenSlugs.has(slug)) {
      console.warn(`  warn (duplicate slug "${slug}"): ${path.relative(KNOWLEDGE_DIR, abs)}`);
    }
    seenSlugs.set(slug, abs);

    const tags = Array.isArray(meta.tags) ? meta.tags.map(String) : [];
    const related = Array.isArray(meta.related) ? meta.related.map(String) : [];
    const dates = entryDates(abs);

    entries.push({
      slug,
      title,
      type,
      domain,
      tags,
      related,
      wikilinks: collectWikiLinks(body),
      file: path.relative(KNOWLEDGE_DIR, abs).split(path.sep).join('/'),
      dateAdded: dates.dateAdded,
      dateModified: dates.dateModified,
      excerpt: makeExcerpt(body),
      body: body.trim(),
    });
  }

  entries.sort((a, b) => a.file.localeCompare(b.file));

  const index = {
    version: 1,
    count: entries.length,
    entries,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2) + '\n');

  console.log(`\nKnowledge index built: ${OUT_FILE}`);
  console.log(`  entries: ${entries.length}`);
  for (const e of entries) {
    console.log(`    ${e.type.padEnd(10)} ${e.domain.padEnd(16)} ${e.slug}`);
  }
}

build();
