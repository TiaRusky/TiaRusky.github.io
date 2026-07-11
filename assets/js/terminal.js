/**
 * terminal.js - Interactive Linux Shell for TiaRuskii Portfolio
 * Theme: Retro CRT, electric blue/azure, centered glass window
 */

(function () {
  'use strict';

  // =========================================================
  // Virtual File System
  // =========================================================
  const VFS = {
    type: 'dir',
    name: '/',
    children: {
      home: {
        type: 'dir',
        name: 'home',
        children: {            tiarusky: {
            type: 'dir',
            name: 'tiarusky',
            children: {
              writeups: {
                type: 'dir',
                name: 'writeups',
                children: {
                  'campfire-1.md': {
                    type: 'file',
                    content: '# Campfire-1\n\nA DFIR Sherlock from Hack The Box.\n\n## Summary\nInvestigation of a memory dump showing svch0st.exe injection.'
                  },
                  'bumblebee.md': {
                    type: 'file',
                    content: '# Bumblebee\n\nA medium DFIR Sherlock.\n\n## Summary\nRansomware deployment via compromised GPO.'
                  }
                }
              },
              docs: {
                type: 'dir',
                name: 'docs',
                children: {
                  'intro-dfir.md': {
                    type: 'file',
                    content: '# Introduzione alla DFIR\n\nDigital Forensics & Incident Response.'
                  },
                  'memory-dump.md': {
                    type: 'file',
                    content: '# Memory Dump Analysis\n\nAnalyzing volatile memory with Volatility.'
                  }
                }
              }
            }
          }
        }
      },
      etc: {
        type: 'dir',
        name: 'etc',
        children: {
          'motd': {
            type: 'file',
            content: 'Welcome to TiaRuskii portfolio shell.\nType "help" for available commands.'
          }
        }
      }
    }
  };

  // =========================================================
  // Profile Data (for interactive whoami)
  // =========================================================
  const PROFILE_DATA = {
    identita: {
      nome: 'TiaRuskii',
      ruolo: 'Cybersecurity Learner',
      descrizione: 'Appassionato di DFIR, penetration testing e threat intelligence.'
    },
    studi: {
      universita: 'Politecnico di Torino',
      laurea: 'Ingegneria Informatica',
      materie: 'Sicurezza Informatica, Reti, Sistemi Operativi',
      competenze: 'Analisi forense, Reverse engineering, Network security'
    },
    ambiti: [
      'Cybersecurity', 'Sistemi Operativi', 'Linux', 'Backend', 'AI',
      'Computer Vision', 'Machine Learning', 'Cloud', 'DevOps'
    ],
    stack: [
      { name: 'C++', pct: 85 },
      { name: 'Python', pct: 92 },
      { name: 'Java', pct: 70 },
      { name: 'Linux', pct: 95 },
      { name: 'Docker', pct: 72 },
      { name: 'Git', pct: 88 }
    ],
    esperienze: [
      '2022-Oggi: Studi in Ingegneria Informatica',
      '2023: Risoluzione di casi DFIR su Hack The Box',
      '2024: Sviluppo di tool di network monitoring',
      '2025: Partecipazione a CTF e challenge di sicurezza'
    ],
    progetti: ['portfolio', 'vision-ai', 'network-monitor', 'dfir-toolkit'],
    filosofia: 'I like building things that solve real problems.',
    curiosita: [
      { label: 'Favorite OS', value: 'Ubuntu' },
      { label: 'Coffee Level', value: '100%' }
    ]
  };

  // =========================================================
  // Boot / Loading Sequence
  // =========================================================
  function runBootSequence(onComplete) {
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.getElementById('boot-text');
    const bootBar = document.getElementById('boot-bar');

    const texts = ['Loading cisanini...', 'Loading knowledge...', 'Almost there...', 'Ready!'];
    const duration = 3000;
    const fadeDuration = 500;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let textIdx = 0;
    let textInterval = null;

    function updateBar(percent) {
      const hashes = '#'.repeat(Math.floor(percent / 5));
      const spaces = ' '.repeat(20 - Math.floor(percent / 5));
      bootBar.textContent = `[${hashes}${spaces}] ${Math.floor(percent)}%`;
    }

    if (isReducedMotion) {
      bootText.textContent = texts[texts.length - 1];
      bootBar.textContent = '[####################] 100%';
    } else {
      bootText.textContent = texts[0];
      bootBar.textContent = '[                    ] 0%';

      textInterval = setInterval(() => {
        textIdx++;
        if (textIdx < texts.length) {
          bootText.textContent = texts[textIdx];
        }
      }, duration / texts.length);

      let progress = 0;
      const barInterval = setInterval(() => {
        progress += Math.random() * 5 + 2;
        if (progress > 100) progress = 100;
        updateBar(progress);
      }, 100);

      setTimeout(() => {
        clearInterval(barInterval);
        updateBar(100);
      }, duration - 100);
    }

    setTimeout(() => {
      if (textInterval) clearInterval(textInterval);
      bootScreen.classList.add('hidden');
      setTimeout(() => {
        bootScreen.classList.add('removed');
        onComplete();
      }, fadeDuration);
    }, duration);
  }

  // =========================================================
  // Starfield / Nebula Background
  // =========================================================
  function initSpaceBackground() {
    const canvas = document.getElementById('space-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let shootingStars = [];
    let nebulaOffset = 0;
    let rafId = null;
    let isActive = true;
    let lastShootingStarTime = 0;

    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    motionMediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        isActive = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        renderStatic();
      } else {
        isActive = true;
        if (!rafId) render();
      }
    });

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      createStars();
    }

    function createStars() {
      stars = [];
      const count = Math.min(Math.floor((width * height) / 6000), 220);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.3,
          alpha: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.15 + 0.03,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    }

    function drawNebula() {
      // Soft animated nebula blobs
      const gradient = ctx.createRadialGradient(
        width * 0.25 + Math.sin(nebulaOffset * 0.0003) * 60,
        height * 0.35 + Math.cos(nebulaOffset * 0.0004) * 40,
        0,
        width * 0.25,
        height * 0.35,
        width * 0.7
      );
      gradient.addColorStop(0, 'rgba(0, 85, 255, 0.14)');
      gradient.addColorStop(0.5, 'rgba(0, 40, 120, 0.08)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const gradient2 = ctx.createRadialGradient(
        width * 0.75 + Math.cos(nebulaOffset * 0.00035) * 50,
        height * 0.65 + Math.sin(nebulaOffset * 0.00045) * 50,
        0,
        width * 0.75,
        height * 0.65,
        width * 0.6
      );
      gradient2.addColorStop(0, 'rgba(0, 229, 255, 0.10)');
      gradient2.addColorStop(0.6, 'rgba(0, 60, 120, 0.05)');
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);
    }

    function drawStars() {
      stars.forEach((star) => {
        const twinkle = Math.sin(nebulaOffset * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.alpha + twinkle * 0.15;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(179, 255, 255, ${Math.max(0.05, alpha)})`;
        ctx.fill();
      });
    }

    function updateStars() {
      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });
    }

    function createShootingStar() {
      // Choose a diagonal direction: down-right or down-left
      const direction = Math.random() < 0.5 ? 1 : -1;
      const startSide = Math.random() < 0.5 ? 'top' : (direction === 1 ? 'left' : 'right');
      let x, y;
      const speed = Math.random() * 6 + 4; // medium speed
      const baseAngle = direction === 1 ? Math.PI / 4 : (3 * Math.PI) / 4;
      const angle = baseAngle + (Math.random() * 0.3 - 0.15);

      if (startSide === 'top') {
        x = Math.random() * width;
        y = -50;
      } else if (startSide === 'right') {
        x = width + 50;
        y = Math.random() * (height * 0.4);
      } else {
        x = -50;
        y = Math.random() * (height * 0.4);
      }

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const length = Math.random() * 80 + 60;

      shootingStars.push({ x, y, vx, vy, length, speed, life: 1 });
    }

    function drawShootingStars() {
      shootingStars.forEach((s) => {
        const tailX = s.x - s.vx * (s.length / s.speed);
        const tailY = s.y - s.vy * (s.length / s.speed);
        const fade = Math.max(0, s.life);
        const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(179, 255, 255, ${0.95 * fade})`);
        gradient.addColorStop(0.4, `rgba(0, 229, 255, ${0.6 * fade})`);
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Small glowing head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * fade})`;
        ctx.fill();
      });
    }

    function updateShootingStars() {
      // Spawn a new shooting star every ~2 seconds on average (medium intensity)
      const now = performance.now();
      if (now - lastShootingStarTime > 1800 + Math.random() * 1200) {
        createShootingStar();
        lastShootingStarTime = now;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.008;
        const buffer = s.length + 50;
        if (s.x > width + buffer || s.x < -buffer || s.y > height + buffer || s.life <= 0) {
          shootingStars.splice(i, 1);
        }
      }
    }

    function render() {
      if (!isActive) return;
      ctx.clearRect(0, 0, width, height);
      drawNebula();
      drawStars();
      updateStars();
      drawShootingStars();
      updateShootingStars();
      nebulaOffset++;
      rafId = requestAnimationFrame(render);
    }

    function renderStatic() {
      ctx.clearRect(0, 0, width, height);
      drawNebula();
      drawStars();
      // Shooting stars are disabled for reduced motion
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    if (prefersReducedMotion) {
      renderStatic();
    } else {
      render();
    }

    // Pause when tab is hidden to save battery
    document.addEventListener('visibilitychange', () => {
      if (prefersReducedMotion) return;
      if (document.hidden) {
        isActive = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!rafId) {
        isActive = true;
        lastShootingStarTime = performance.now();
        render();
      }
    });
  }

  // =========================================================
  // Terminal Class
  // =========================================================
  class Terminal {
    constructor() {
      this.output = document.getElementById('output');
      this.inputLine = document.getElementById('input-line');
      this.promptEl = document.getElementById('prompt');
      this.typedText = document.getElementById('typed-text');
      this.hiddenInput = document.getElementById('hidden-input');
      this.terminal = document.getElementById('terminal');
      this.trainContainer = document.getElementById('train-container');

      this.username = 'user';
      this.hostname = 'tiaruskii';
      this.cwd = '/home/tiarusky';
      this.history = [];
      this.historyIndex = -1;
      this.isRoot = false;
      this.isAnimating = false;

      this.init();
    }

    init() {
      this.bindEvents();
      this.focusInput();
      this.printWelcome();
      this.updatePrompt();
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
        if (this.isAnimating) return;
        if (e.target.closest('a, button, input, select, textarea, [role="button"], [contenteditable]')) return;
        this.focusInput();
      });
      document.addEventListener('keydown', (e) => this.handleKey(e));
      this.hiddenInput.addEventListener('input', () => this.updateTypedText());
    }

    focusInput() {
      this.hiddenInput.focus();
    }

    updateTypedText() {
      this.typedText.textContent = this.hiddenInput.value;
      this.scrollToBottom();
    }

    scrollToBottom() {
      this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    getPrompt() {
      const user = this.isRoot ? 'root' : this.username;
      const symbol = this.isRoot ? '#' : '$';
      const shortCwd = this.cwd === '/' ? '/' : this.cwd.replace('/home/tiarusky', '~');
      return `${user}@${this.hostname}:${shortCwd}${symbol}`;
    }

    updatePrompt() {
      this.promptEl.textContent = this.getPrompt();
      this.promptEl.classList.toggle('root', this.isRoot);
    }

    printWelcome() {
      const lines = [
        'Debian GNU/Linux 12 (bookworm) tty1',
        '',
        'Welcome to TiaRuskii portfolio shell.',
        'Type "help" for a list of available commands.',
        ''
      ];
      lines.forEach((line) => this.printLine(line));
    }

    printLine(text, className) {
      const line = document.createElement('div');
      line.className = 'line' + (className ? ' ' + className : '');
      line.textContent = text;
      this.output.appendChild(line);
      this.scrollToBottom();
      return line;
    }

    createLine(text, className) {
      return this.printLine(text, className);
    }

    updateLine(el, text) {
      if (el) el.textContent = text;
      this.scrollToBottom();
    }

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    isReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    async animateProgressBar(el, durationMs, finalText) {
      const totalBlocks = 20;
      const steps = 20;
      const stepDuration = durationMs / steps;
      const reduced = this.isReducedMotion();

      for (let i = 0; i <= steps; i++) {
        const percent = Math.floor((i / steps) * 100);
        const filled = Math.floor((i / steps) * totalBlocks);
        const empty = totalBlocks - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        this.updateLine(el, `Scanning profile...\n[${bar}] ${percent}%`);
        if (!reduced) await this.sleep(stepDuration);
      }
      if (finalText) this.updateLine(el, finalText);
    }

    async animateSkillBar(el, name, pct) {
      const totalBlocks = 15;
      const steps = 15;
      const stepDuration = 30;
      const reduced = this.isReducedMotion();
      const targetBlocks = Math.round((pct / 100) * totalBlocks);

      for (let i = 0; i <= steps; i++) {
        const currentPct = Math.min(Math.round((i / steps) * pct), pct);
        const filled = Math.min(Math.round((i / steps) * targetBlocks), targetBlocks);
        const empty = totalBlocks - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        this.updateLine(el, `${name.padEnd(10)} [${bar}] ${currentPct}%`);
        if (!reduced) await this.sleep(stepDuration);
      }
    }

    async animateCoffeeBar(el, pct) {
      const totalBlocks = 10;
      const steps = 10;
      const stepDuration = 40;
      const reduced = this.isReducedMotion();

      for (let i = 0; i <= steps; i++) {
        const currentPct = Math.min(Math.round((i / steps) * pct), pct);
        const filled = Math.min(Math.round((i / steps) * totalBlocks), totalBlocks);
        const empty = totalBlocks - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        this.updateLine(el, `Coffee Level: [${bar}] ${currentPct}%`);
        if (!reduced) await this.sleep(stepDuration);
      }
    }

    async printAnimatedLine(text, delayMs) {
      const line = this.printLine(text);
      if (!this.isReducedMotion()) await this.sleep(delayMs);
      return line;
    }

    handleKey(e) {
      if (this.isAnimating) {
        e.preventDefault();
        return;
      }
      if (e.key === 'Enter') {
        const value = this.hiddenInput.value.trim();
        if (value) {
          this.history.push(value);
          this.historyIndex = this.history.length;
        }
        this.printLine(this.getPrompt() + ' ' + value, 'command-line');
        this.execute(value);
        this.hiddenInput.value = '';
        this.typedText.textContent = '';
        this.updatePrompt();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.hiddenInput.value = this.history[this.historyIndex];
          this.updateTypedText();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.hiddenInput.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.hiddenInput.value = '';
        }
        this.updateTypedText();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autocomplete();
      }
    }

    async execute(input) {
      if (!input) return;
      const args = input.split(/\s+/);
      const command = args.shift().toLowerCase();

      switch (command) {
        case 'help': this.cmdHelp(); break;
        case 'ls': this.cmdLs(args); break;
        case 'cd': this.cmdCd(args); break;
        case 'pwd': this.cmdPwd(); break;
        case 'cat': this.cmdCat(args); break;
        case 'whoami': await this.cmdWhoami(); break;
        case 'clear': this.cmdClear(); break;
        case 'sudo': this.cmdSudo(args); break;
        case 'rm': this.cmdRm(args); break;
        case 'sl': this.cmdSl(); break;
        default:
          this.printLine(command + ': command not found', 'error');
      }
    }

    cmdHelp() {
      const helpText = [
        'Available commands:',
        '  help        Show this help message',
        '  ls          List directory contents',
        '  cd          Change directory',
        '  pwd         Print working directory',
        '  cat         Display file contents',
        '  whoami      Print current user',
        '  clear       Clear the terminal',
        ''
      ];
      helpText.forEach((line) => this.printLine(line));
    }

    resolvePath(path) {
      if (!path || path === '~') return '/home/tiarusky';
      if (path.startsWith('/')) return path;
      if (path === '.') return this.cwd;
      if (path === '..') {
        const parts = this.cwd.split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/');
      }
      const base = this.cwd === '/' ? '' : this.cwd;
      return (base + '/' + path).replace(/\/+/g, '/');
    }

    getNode(path) {
      const parts = path.split('/').filter(Boolean);
      let node = VFS;
      for (const part of parts) {
        if (node.type !== 'dir' || !node.children[part]) return null;
        node = node.children[part];
      }
      return node;
    }

    cmdLs(args) {
      const path = this.resolvePath(args[0] || '.');
      const node = this.getNode(path);
      if (!node) {
        this.printLine("ls: cannot access '" + (args[0] || '.') + "': No such file or directory", 'error');
        return;
      }
      if (node.type === 'file') {
        this.printLine(path.split('/').pop());
        return;
      }
      const names = Object.keys(node.children).sort();
      names.forEach((name) => {
        const child = node.children[name];
        const suffix = child.type === 'dir' ? '/' : '';
        this.printLine(name + suffix, child.type === 'dir' ? 'info' : '');
      });
    }

    cmdCd(args) {
      if (!args[0] || args[0] === '~') {
        this.cwd = '/home/tiarusky';
        return;
      }
      const path = this.resolvePath(args[0]);
      const node = this.getNode(path);
      if (!node) {
        this.printLine('cd: ' + args[0] + ': No such file or directory', 'error');
        return;
      }
      if (node.type !== 'dir') {
        this.printLine('cd: ' + args[0] + ': Not a directory', 'error');
        return;
      }
      this.cwd = path;
    }

    cmdPwd() {
      this.printLine(this.cwd);
    }

    cmdCat(args) {
      if (!args[0]) {
        this.printLine('cat: missing file operand', 'error');
        return;
      }
      const path = this.resolvePath(args[0]);
      const node = this.getNode(path);
      if (!node) {
        this.printLine('cat: ' + args[0] + ': No such file or directory', 'error');
        return;
      }
      if (node.type !== 'file') {
        this.printLine('cat: ' + args[0] + ': Is a directory', 'error');
        return;
      }
      this.printLine(node.content);
    }

    async cmdWhoami() {
      this.isAnimating = true;
      this.hiddenInput.disabled = true;

      try {
        await this.runWhoamiAnimation();
      } catch (err) {
        this.printLine('Error loading profile: ' + err.message, 'error');
      } finally {
        this.isAnimating = false;
        this.hiddenInput.disabled = false;
        this.focusInput();
      }
    }

    async runWhoamiAnimation() {
      const reduced = this.isReducedMotion();
      const stepDelay = reduced ? 0 : 600;

      // Scanning phase
      const scanLine = this.printLine('Scanning profile...\n[░░░░░░░░░░░░░░░░░░░░] 0%');
      await this.animateProgressBar(scanLine, reduced ? 0 : 1200, 'Scanning profile...\n[████████████████████] 100%');
      await this.sleep(stepDelay);

      this.printLine('Loading personal information...');
      await this.sleep(stepDelay);
      this.printLine('Done.', 'success');
      await this.sleep(stepDelay);

      // Profile panel
      const panelWidth = 50;
      const makeLine = (text, cls) => this.printLine('| ' + text.padEnd(panelWidth - 2) + ' |', cls);
      const makeHeader = (text) => {
        const padded = (' ' + text + ' ').padStart((panelWidth + text.length) / 2, ' ').padEnd(panelWidth, ' ');
        this.printLine('|' + padded + '|', 'profile-header');
      };

      this.printLine('┌' + '─'.repeat(panelWidth) + '┐', 'profile-box');
      makeHeader('USER PROFILE');
      this.printLine('└' + '─'.repeat(panelWidth) + '┘', 'profile-box');
      await this.sleep(stepDelay);

      // Identità
      makeLine('Identità', 'profile-section');
      makeLine('  Nome:  ' + PROFILE_DATA.identita.nome);
      makeLine('  Ruolo: ' + PROFILE_DATA.identita.ruolo);
      makeLine('  ' + PROFILE_DATA.identita.descrizione);
      await this.sleep(stepDelay);

      // Studi
      makeLine('Studi', 'profile-section');
      makeLine('  Università: ' + PROFILE_DATA.studi.universita);
      makeLine('  Laurea:     ' + PROFILE_DATA.studi.laurea);
      makeLine('  Materie:    ' + PROFILE_DATA.studi.materie);
      makeLine('  Competenze: ' + PROFILE_DATA.studi.competenze);
      await this.sleep(stepDelay);

      // Ambiti di interesse
      makeLine('Ambiti di interesse', 'profile-section');
      for (const ambito of PROFILE_DATA.ambiti) {
        makeLine('  - ' + ambito);
        if (!reduced) await this.sleep(150);
      }
      await this.sleep(stepDelay);

      // Stack tecnologico
      makeLine('Stack tecnologico', 'profile-section');
      for (const skill of PROFILE_DATA.stack) {
        const skillLine = this.printLine(`${skill.name.padEnd(10)} [░░░░░░░░░░░░░░░] 0%`, 'profile-skill');
        await this.animateSkillBar(skillLine, skill.name, skill.pct);
        await this.sleep(reduced ? 0 : 200);
      }
      await this.sleep(stepDelay);

      // Esperienze
      makeLine('Esperienze', 'profile-section');
      for (const exp of PROFILE_DATA.esperienze) {
        makeLine('  ' + exp);
        if (!reduced) await this.sleep(250);
      }
      await this.sleep(stepDelay);

      // Progetti preferiti
      makeLine('Progetti preferiti', 'profile-section');
      this.printLine('> ls ~/projects', 'info');
      for (const proj of PROFILE_DATA.progetti) {
        makeLine('  ' + proj + '/', 'info');
        if (!reduced) await this.sleep(200);
      }
      await this.sleep(stepDelay);

      // Filosofia
      makeLine('Filosofia', 'profile-section');
      makeLine('  "' + PROFILE_DATA.filosofia + '"');
      await this.sleep(stepDelay);

      // Curiosità
      makeLine('Curiosità', 'profile-section');
      for (const cur of PROFILE_DATA.curiosita) {
        if (cur.label === 'Coffee Level') {
          const coffeeLine = this.printLine('Coffee Level: [░░░░░░░░░░] 0%', 'profile-skill');
          await this.animateCoffeeBar(coffeeLine, 100);
        } else {
          makeLine('  ' + cur.label + ': ' + cur.value);
        }
        if (!reduced) await this.sleep(200);
      }

      this.printLine('');
      this.printLine('Profile loaded successfully.', 'success');
    }

    cmdClear() {
      this.output.innerHTML = '';
    }

    cmdSudo(args) {
      if (args[0] === 'su' || args[0] === '-i') {
        this.printLine('[sudo] password for user:');
        this.isRoot = true;
        this.printLine('You are now root. Be careful!', 'warning');
      } else {
        this.printLine('sudo: command not allowed', 'error');
      }
    }

    cmdRm(args) {
      if (args.indexOf('-rf') !== -1 && (args.indexOf('/') !== -1 || args.some(a => a.indexOf('/*') !== -1))) {
        this.printLine('rm: it is dangerous to operate recursively on /', 'error');
        this.printLine('rm: use --no-preserve-root to override this failsafe', 'error');
        setTimeout(() => {
          this.printLine('', 'error');
          this.printLine('...just kidding. Reloading in 3 seconds...', 'warning');
          setTimeout(() => location.reload(), 3000);
        }, 800);
      } else {
        this.printLine('rm: missing operand', 'error');
      }
    }

    cmdSl() {
      this.printLine('Choo choo!', 'warning');
      const train = document.createElement('div');
      train.className = 'train';
      train.textContent = '      ====        ________                ___________ \n  _D _|  |_______/        \\__I_I_____===__|_________| \n   |(_)---  |   H\\________/ |   |        =|___ ___|   \n    /     |  |   H  |  |     |   |         ||_| |_||   \n   |      |  |   H  |__--------------------| [___] |   \n   | ________|___H__/__|_____[][][][]_[][]_[][]_[][]  \n   |/ |   |===========|____|_________________________  \n__/ =(_|__|_-----------|____|    ^^    ^^    ^^    ^^  ';
      this.trainContainer.appendChild(train);
      this.trainContainer.classList.add('active');
      setTimeout(() => {
        this.trainContainer.classList.remove('active');
        this.trainContainer.innerHTML = '';
      }, 6500);
    }

    autocomplete() {
      const value = this.hiddenInput.value;
      const parts = value.split(/\s+/);
      const last = parts.pop();
      if (!last) return;
      const dirPath = last.indexOf('/') !== -1 ? last.substring(0, last.lastIndexOf('/') + 1) : '';
      const search = last.indexOf('/') !== -1 ? last.substring(last.lastIndexOf('/') + 1) : last;
      const basePath = this.resolvePath(dirPath || '.');
      const node = this.getNode(basePath);
      if (!node || node.type !== 'dir') return;
      const matches = Object.keys(node.children).filter((name) => name.startsWith(search));
      if (matches.length === 1) {
        const completed = dirPath + matches[0];
        parts.push(completed);
        this.hiddenInput.value = parts.join(' ');
        this.updateTypedText();
      }
    }
  }

  function initApp() {
    initSpaceBackground();
    runBootSequence(() => {
      window.term = new Terminal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
