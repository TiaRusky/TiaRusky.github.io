// Smoke test for the markdown renderer — run with: node md.test.js
import { renderMarkdown } from '../assets/md.js';

const md = [
  '---',
  'title: Test',
  '---',
  '# Windows Prefetch',
  '',
  'Intro con **bold**, *italic*, `inline code`, [link](https://example.com) e wiki [[Windows Event Logs|event logs]].',
  '',
  '- primo',
  '- secondo',
  '  - nested',
  '- terzo',
  '',
  '1. uno',
  '2. due',
  '',
  '> citazione',
  '',
  '| Colonna A | Colonna B |',
  '| --------- | --------- |',
  '| 1         | 2         |',
  '',
  '```bash',
  'ls -la /var/log',
  'echo $HOME',
  '```',
  '',
  ':::artifact',
  'name: Windows Prefetch',
  'location: C:\\Windows\\Prefetch',
  'platform: Windows',
  'useful_for:',
  '  - Program execution',
  '  - Execution frequency',
  ':::',
  '',
  ':::command',
  'tool: hayabusa',
  'command: hayabusa csv-timeline -d ./logs',
  'description: Generate a timeline from Windows event logs.',
  ':::',
  '',
  ':::tip',
  'Event ID 4688 is only useful when auditing is configured.',
  ':::',
  '',
  '## Sezione due',
  'Testo con [[Link Inesistente]].',
  '',
].join('\n');

const { html, blocks } = renderMarkdown(md, {
  resolveWiki: (t) => (t.includes('Event Logs') ? 'windows-event-logs' : null),
});

console.log('=== BLOCKS ===');
console.log(JSON.stringify(blocks, null, 1));
console.log('=== HTML ===');
console.log(html);

// assertions
const assert = (cond, msg) => {
  if (!cond) {
    console.error('FAIL: ' + msg);
    process.exitCode = 1;
  } else {
    console.log('ok: ' + msg);
  }
};

assert(html.includes('<h1 id="windows-prefetch">Windows Prefetch</h1>'), 'h1 with id');
assert(html.includes('<strong>bold</strong>'), 'bold');
assert(html.includes('<em>italic</em>'), 'italic');
assert(html.includes('<code>inline code</code>'), 'inline code');
assert(html.includes('<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>'), 'external link');
assert(html.includes('<a class="wiki-link" href="#/entry/windows-event-logs" data-slug="windows-event-logs">event logs</a>'), 'wiki link resolved');
assert(html.includes('<span class="wiki-link broken"'), 'wiki link broken');
assert(html.includes('<ul>'), 'ul');
assert(html.includes('<ol>'), 'ol');
assert(html.includes('<blockquote>'), 'blockquote');
assert(html.includes('<table>'), 'table');
assert(html.includes('class="code-block"'), 'code block');
assert(html.includes('data-copy="ls -la /var/log'), 'code copy button data');
assert(html.includes('class="sem sem-artifact"'), 'artifact block');
assert(html.includes('C:\\Windows\\Prefetch'), 'artifact location escaped');
assert(html.includes('class="sem sem-command"'), 'command block');
assert(html.includes('data-copy="hayabusa csv-timeline -d ./logs"'), 'command copy data');
assert(html.includes('class="sem sem-tip"'), 'tip block');
assert(html.includes('<h2 id="sezione-due">'), 'h2 with id');
assert(blocks.length === 3, '3 semantic blocks extracted');
assert(blocks[0].fields.useful_for.length === 2, 'artifact useful_for list parsed');
