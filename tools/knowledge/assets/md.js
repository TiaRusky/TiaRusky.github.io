/**
 * md.js — minimal GFM-subset Markdown renderer for the Knowledge app.
 *
 * Pure module: no DOM access, works in the browser (ES module) and in Node
 * (for testing). Supports:
 *   - headings, paragraphs, lists (nested), tables, blockquotes, hr
 *   - fenced code blocks (with copy affordance markup)
 *   - inline: bold, italic, strikethrough, code spans, links, images, autolinks
 *   - wiki-style internal links [[Target]] and [[Target|label]]
 *   - semantic blocks :::artifact / :::tool / :::command / :::event /
 *     :::tip / :::warning / :::note
 *
 * All output HTML is escaped; no raw HTML passthrough.
 */

'use strict';

// ---------------------------------------------------------------------------
// Escaping
// ---------------------------------------------------------------------------
const ESC_RE = /[&<>"']/g;
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value).replace(ESC_RE, (c) => ESC_MAP[c]);
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-');
}

// ---------------------------------------------------------------------------
// Semantic block key/value parsing (shared with ::: blocks)
// ---------------------------------------------------------------------------
export function parseKeyValues(text) {
  const fields = {};
  const order = [];
  let currentKey = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      if (!currentKey) continue;
      const value = listMatch[1].trim().replace(/^["']|["']$/g, '');
      if (!Array.isArray(fields[currentKey])) fields[currentKey] = [];
      fields[currentKey].push(value);
      continue;
    }

    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    currentKey = m[1];
    if (!order.includes(currentKey)) order.push(currentKey);
    let value = m[2].trim();

    if (value === '') {
      fields[currentKey] = [];
      continue;
    }
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value.startsWith('[') && value.endsWith(']')) {
      fields[currentKey] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      continue;
    }
    fields[currentKey] = value;
  }

  return { fields, order };
}

// ---------------------------------------------------------------------------
// Block parsing
// ---------------------------------------------------------------------------
const FENCE_RE = /^(```|~~~)\s*([\w.+-]*)\s*$/;
const SEM_OPEN_RE = /^:::\s*([a-z0-9_-]+)\s*$/i;
const SEM_CLOSE_RE = /^:::\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const HR_RE = /^(\s*([-*_])\s*){3,}$/;
const LIST_RE = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const TABLE_SEP_RE = /^\s*\|?[\s:|-]+\|?\s*$/;

function splitFrontmatter(src) {
  const match = String(src).match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? src.slice(match[0].length) : src;
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

function parseBlocks(src) {
  const lines = splitFrontmatter(src).split(/\r?\n/);
  const blocks = [];
  let para = [];
  let i = 0;

  const flushParagraph = () => {
    if (para.length) {
      blocks.push({ t: 'p', lines: para });
      para = [];
    }
  };

  const parseList = (startIndex) => {
    const first = lines[startIndex].match(LIST_RE);
    const indent = first[1].length;
    const ordered = /\d/.test(first[2]);
    const items = [];
    let j = startIndex;

    while (j < lines.length) {
      const line = lines[j];
      if (line.trim() === '') break;
      const m = line.match(LIST_RE);
      if (!m || m[1].length !== indent) break;

      const item = { text: m[3], children: null };
      items.push(item);
      j++;

      // consume deeper-indented continuation lines (nested lists / wrapped text)
      while (j < lines.length) {
        const n = lines[j];
        if (n.trim() === '') break;
        const nm = n.match(LIST_RE);
        if (nm && nm[1].length > indent) {
          const nested = parseList(j);
          item.children = nested.block;
          j = nested.next;
        } else if (nm && nm[1].length === indent) {
          break;
        } else if (/^\s+/.test(n)) {
          item.text += '\n' + n.trim();
          j++;
        } else {
          break;
        }
      }
    }

    return { block: { t: ordered ? 'ol' : 'ul', items }, next: j };
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      i++;
      continue;
    }

    if (FENCE_RE.test(trimmed)) {
      flushParagraph();
      const lang = trimmed.match(FENCE_RE)[2];
      const buf = [];
      i++;
      while (i < lines.length && !FENCE_RE.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++; // consume closing fence
      blocks.push({ t: 'code', lang, text: buf.join('\n') });
      continue;
    }

    if (SEM_OPEN_RE.test(trimmed)) {
      flushParagraph();
      const type = trimmed.match(SEM_OPEN_RE)[1].toLowerCase();
      const buf = [];
      i++;
      while (i < lines.length && !SEM_CLOSE_RE.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++; // consume closing :::
      blocks.push({ t: 'sem', type, raw: buf.join('\n') });
      continue;
    }

    if (HEADING_RE.test(trimmed)) {
      flushParagraph();
      const m = trimmed.match(HEADING_RE);
      blocks.push({ t: 'h', level: m[1].length, text: m[2] });
      i++;
      continue;
    }

    if (HR_RE.test(trimmed)) {
      flushParagraph();
      blocks.push({ t: 'hr' });
      i++;
      continue;
    }

    // table: current line starts with | and next line is a separator
    if (
      trimmed.startsWith('|') &&
      i + 1 < lines.length &&
      TABLE_SEP_RE.test(lines[i + 1]) &&
      lines[i + 1].includes('-')
    ) {
      flushParagraph();
      const head = parseTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim() !== '') {
        rows.push(parseTableRow(lines[i]));
        i++;
      }
      blocks.push({ t: 'table', head, rows });
      continue;
    }

    if (QUOTE_RE.test(line)) {
      flushParagraph();
      const buf = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        buf.push(lines[i].replace(QUOTE_RE, '$1'));
        i++;
      }
      blocks.push({ t: 'quote', lines: buf });
      continue;
    }

    if (LIST_RE.test(line)) {
      flushParagraph();
      const res = parseList(i);
      blocks.push(res.block);
      i = res.next;
      continue;
    }

    para.push(line);
    i++;
  }

  flushParagraph();
  return blocks;
}

// ---------------------------------------------------------------------------
// Inline rendering
// ---------------------------------------------------------------------------
function splitOnce(str, sep) {
  const idx = str.indexOf(sep);
  return idx === -1 ? [str, null] : [str.slice(0, idx), str.slice(idx + sep.length)];
}

/**
 * Renders an already-escaped string with inline markup.
 * Runs inside a placeholder stash so raw constructs (code spans, links,
 * wiki links, images, autolinks) are never touched by later passes.
 */
function inlineCore(escapedText, ctx) {
  let s = escapedText.replace(/\r?\n/g, ' ');
  const tokens = [];
  const stash = (html) => {
    const key = `\u0000K${tokens.length}\u0000`;
    tokens.push(html);
    return key;
  };

  // code spans
  s = s.replace(/`([^`]+)`/g, (m, c) => stash(`<code>${c}</code>`));

  // images
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g,
    (m, alt, url, title) =>
      stash(
        `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"` +
          (title ? ` title="${escapeHtml(title)}"` : '') +
          ` loading="lazy">`
      )
  );

  // links
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g,
    (m, label, url, title) => {
      const external = /^https?:\/\//i.test(url);
      return stash(
        `<a href="${escapeHtml(url)}"` +
          (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
          (title ? ` title="${escapeHtml(title)}"` : '') +
          `>${inlineCore(label, ctx)}</a>`
      );
    }
  );

  // wiki-style internal links
  s = s.replace(/\[\[([^\[\]]+)\]\]/g, (m, inner) => {
    const [target, label] = splitOnce(inner, '|');
    const targetTrim = target.trim();
    const slug = ctx.resolveWiki ? ctx.resolveWiki(targetTrim) : null;
    const text = label ? label.trim() : targetTrim;
    if (slug) {
      return stash(
        `<a class="wiki-link" href="#/entry/${escapeHtml(slug)}" data-slug="${escapeHtml(slug)}">${inlineCore(escapeHtml(text), ctx)}</a>`
      );
    }
    return stash(
      `<span class="wiki-link broken" title="Not yet documented: ${escapeHtml(targetTrim)}">${inlineCore(escapeHtml(text), ctx)}</span>`
    );
  });

  // autolinks
  s = s.replace(/<((?:https?:)?\/\/[^>\s]+)>/g, (m, url) =>
    stash(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`)
  );

  // bold / italic / strikethrough
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // restore stashed constructs
  s = s.replace(/\u0000K(\d+)\u0000/g, (m, i) => tokens[+i]);
  return s;
}

function inline(raw, ctx) {
  return inlineCore(escapeHtml(raw), ctx);
}

// ---------------------------------------------------------------------------
// Semantic block rendering
// ---------------------------------------------------------------------------
const SEM_LABELS = {
  artifact: 'Artifact',
  tool: 'Tool',
  command: 'Command',
  event: 'Event ID',
  tip: 'Tip',
  warning: 'Warning',
  note: 'Note',
};

function renderSemFields(fields, order, ctx) {
  const rows = [];
  for (const key of order) {
    if (key === 'name' || key === 'description') continue;
    const value = fields[key];
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (!value.length) continue;
      rows.push(
        `<div class="sem-row"><dt>${escapeHtml(key.replace(/_/g, ' '))}</dt><dd><span class="sem-chips">` +
          value.map((v) => `<span class="chip">${inline(v, ctx)}</span>`).join('') +
          `</span></dd></div>`
      );
    } else {
      rows.push(
        `<div class="sem-row"><dt>${escapeHtml(key.replace(/_/g, ' '))}</dt><dd>${inline(value, ctx)}</dd></div>`
      );
    }
  }
  return rows.join('');
}

function renderSemBlock(type, raw, ctx) {
  const label = (SEM_LABELS[type] || type).toUpperCase();
  const trimmed = raw.trim();

  if (type === 'tip' || type === 'warning' || type === 'note') {
    return (
      `<div class="sem sem-${type}" role="note">` +
      `<span class="sem-label">${escapeHtml(label)}</span>` +
      `<div class="sem-body">${inline(trimmed, ctx)}</div>` +
      `</div>`
    );
  }

  const { fields, order } = parseKeyValues(trimmed);
  const title = fields.name ? inline(fields.name, ctx) : '';

  if (type === 'command') {
    const command = fields.command || '';
    return (
      `<div class="sem sem-command">` +
      `<div class="sem-head">` +
      `<span class="sem-label">${escapeHtml(label)}</span>` +
      (fields.tool ? `<span class="sem-title">${inline(fields.tool, ctx)}</span>` : '') +
      `</div>` +
      `<div class="command-block">` +
      `<pre><code>${escapeHtml(command)}</code></pre>` +
      (command
        ? `<button type="button" class="code-copy" data-copy="${escapeHtml(command)}" aria-label="Copy command">Copy</button>`
        : '') +
      `</div>` +
      (fields.description ? `<p class="sem-desc">${inline(fields.description, ctx)}</p>` : '') +
      `</div>`
    );
  }

  return (
    `<div class="sem sem-${type}">` +
    `<div class="sem-head">` +
    `<span class="sem-label">${escapeHtml(label)}</span>` +
    (title ? `<span class="sem-title">${title}</span>` : '') +
    `</div>` +
    (fields.description ? `<p class="sem-desc">${inline(fields.description, ctx)}</p>` : '') +
    `<dl class="sem-fields">${renderSemFields(fields, order, ctx)}</dl>` +
    `</div>`
  );
}

// ---------------------------------------------------------------------------
// Block rendering
// ---------------------------------------------------------------------------
function renderCodeBlock(lang, text) {
  const label = lang ? escapeHtml(lang) : 'text';
  return (
    `<div class="code-block" data-lang="${label}">` +
    `<div class="code-head"><span class="code-lang">${label}</span>` +
    (text
      ? `<button type="button" class="code-copy" data-copy="${escapeHtml(text)}" aria-label="Copy code">Copy</button>`
      : '') +
    `</div>` +
    `<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(text)}</code></pre>` +
    `</div>`
  );
}

function renderListBlock(block, ctx) {
  const tag = block.t === 'ol' ? 'ol' : 'ul';
  const items = block.items
    .map((it) => {
      let html = `<li>${inline(it.text, ctx)}`;
      if (it.children) html += renderListBlock(it.children, ctx);
      html += '</li>';
      return html;
    })
    .join('');
  return `<${tag}>${items}</${tag}>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * Renders a Markdown document to HTML.
 * opts:
 *   resolveWiki(targetText) -> slug | null   (wiki-link resolution)
 * Returns { html, blocks } where blocks are the parsed semantic blocks
 * ({ type, fields, order, text }) for the Quick Reference panel.
 */
export function renderMarkdown(src, opts = {}) {
  const ctx = {
    resolveWiki: typeof opts.resolveWiki === 'function' ? opts.resolveWiki : () => null,
  };
  const idCounts = {};
  const semBlocks = [];

  const uniqueId = (id) => {
    const base = id || 'section';
    const n = idCounts[base] || 0;
    idCounts[base] = n + 1;
    return n ? `${base}-${n + 1}` : base;
  };

  const blocks = parseBlocks(src);
  const html = blocks
    .map((b) => {
      switch (b.t) {
        case 'h':
          return `<h${b.level} id="${escapeHtml(uniqueId(slugify(b.text)))}">${inline(b.text, ctx)}</h${b.level}>`;
        case 'p':
          return `<p>${inline(b.lines.join('\n'), ctx)}</p>`;
        case 'ul':
        case 'ol':
          return renderListBlock(b, ctx);
        case 'code':
          return renderCodeBlock(b.lang, b.text);
        case 'quote':
          return `<blockquote>${inline(b.lines.join(' '), ctx)}</blockquote>`;
        case 'hr':
          return '<hr>';
        case 'table': {
          const head = b.head.map((c) => `<th>${inline(c, ctx)}</th>`).join('');
          const rows = b.rows
            .map((r) => `<tr>${r.map((c) => `<td>${inline(c, ctx)}</td>`).join('')}</tr>`)
            .join('');
          return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
        }
        case 'sem': {
          const { fields, order } = parseKeyValues(b.raw);
          const text = b.type === 'tip' || b.type === 'warning' || b.type === 'note'
            ? b.raw.trim()
            : '';
          semBlocks.push({ type: b.type, fields, order, text });
          return renderSemBlock(b.type, b.raw, ctx);
        }
        default:
          return '';
      }
    })
    .join('\n');

  return { html, blocks: semBlocks };
}
