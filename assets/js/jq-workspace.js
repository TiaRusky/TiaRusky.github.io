(function () {
  'use strict';

  const input = document.getElementById('jq-input');
  const filter = document.getElementById('jq-filter');
  const output = document.getElementById('jq-output');
  const status = document.getElementById('jq-output-status');
  const inputSize = document.getElementById('jq-input-size');
  const fileInfo = document.getElementById('jq-file-info');
  const download = document.getElementById('jq-download');
  const workspace = document.getElementById('jq-workspace');
  const open = document.getElementById('jq-open');
  if (!input || !filter || !workspace) return;

  const worker = new Worker(new URL('assets/js/jq-worker.js', document.baseURI));
  let requestId = 0;
  let outputText = '';

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
  }

  function updateSize() {
    inputSize.textContent = formatBytes(new Blob([input.value]).size);
  }

  function setError(message) {
    outputText = '';
    output.textContent = `✕ ${message}`;
    status.textContent = 'Error';
    status.className = 'jq-error';
    download.disabled = true;
  }

  function run() {
    if (!input.value.trim()) return setError('Add JSON input first.');
    if (!filter.value.trim()) return setError('Add a jq filter first.');
    const id = ++requestId;
    output.textContent = 'Running jq…';
    status.textContent = 'Processing';
    status.className = '';
    download.disabled = true;
    worker.postMessage({ id, json: input.value, filter: filter.value });
  }

  worker.addEventListener('message', (event) => {
    const { id, ok, result, error } = event.data;
    if (id !== requestId) return;
    if (!ok) return setError(error || 'jq could not process this input.');
    outputText = result || '';
    output.textContent = outputText || '(empty)';
    status.textContent = outputText ? 'Complete' : 'Empty result';
    status.className = '';
    download.disabled = !outputText;
  });

  document.getElementById('jq-run').addEventListener('click', run);
  input.addEventListener('input', updateSize);
  [input, filter].forEach((element) => element.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') run();
  }));
  document.querySelectorAll('[data-jq-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      filter.value = button.dataset.jqFilter;
      filter.focus();
    });
  });
  document.getElementById('jq-format').addEventListener('click', () => {
    try {
      input.value = JSON.stringify(JSON.parse(input.value), null, 2);
      updateSize();
    } catch (error) {
      setError(`Invalid JSON: ${error.message}`);
    }
  });
  document.getElementById('jq-clear').addEventListener('click', () => {
    input.value = '';
    output.textContent = 'Run a filter to see the result.';
    outputText = '';
    status.textContent = 'Ready';
    status.className = '';
    download.disabled = true;
    fileInfo.textContent = 'Paste JSON or load a file · processed locally with jq 1.6 WASM';
    updateSize();
  });
  document.getElementById('jq-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    fileInfo.textContent = `${file.name} · ${formatBytes(file.size)}`;
    const reader = new FileReader();
    reader.onload = () => {
      input.value = reader.result;
      updateSize();
      run();
    };
    reader.onerror = () => setError('Could not read this file.');
    reader.readAsText(file);
  });
  download.addEventListener('click', () => {
    const blob = new Blob([outputText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jq-output.json';
    link.click();
    URL.revokeObjectURL(url);
  });
  open.addEventListener('click', () => {
    workspace.classList.toggle('jq-visible');
    if (workspace.classList.contains('jq-visible')) input.focus();
  });
  document.getElementById('jq-close').addEventListener('click', () => workspace.classList.remove('jq-visible'));
  updateSize();
})();
