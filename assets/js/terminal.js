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
        children: {
          tiarusky: {
            type: 'dir',
            name: 'tiarusky',
            children: {
              'about.txt': {
                type: 'file',
                content: 'TiaRuskii - Cybersecurity learner\nPassionate about DFIR, penetration testing and threat intelligence.\nCurrently studying and solving Hack The Box Sherlocks.'
              },
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
  // Starfield / Nebula Background
  // =========================================================
  function initSpaceBackground() {
    const canvas = document.getElementById('space-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let nebulaOffset = 0;
    let rafId = null;
    let isActive = true;

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

    function render() {
      if (!isActive) return;
      ctx.clearRect(0, 0, width, height);
      drawNebula();
      drawStars();
      updateStars();
      nebulaOffset++;
      rafId = requestAnimationFrame(render);
    }

    function renderStatic() {
      ctx.clearRect(0, 0, width, height);
      drawNebula();
      drawStars();
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
    }

    handleKey(e) {
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

    execute(input) {
      if (!input) return;
      const args = input.split(/\s+/);
      const command = args.shift().toLowerCase();

      switch (command) {
        case 'help': this.cmdHelp(); break;
        case 'ls': this.cmdLs(args); break;
        case 'cd': this.cmdCd(args); break;
        case 'pwd': this.cmdPwd(); break;
        case 'cat': this.cmdCat(args); break;
        case 'whoami': this.cmdWhoami(); break;
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

    cmdWhoami() {
      this.printLine(this.isRoot ? 'root' : this.username);
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
    window.term = new Terminal();
    initSpaceBackground();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
