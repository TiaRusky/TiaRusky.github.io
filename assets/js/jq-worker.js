/* global importScripts */
'use strict';

importScripts('../jq/jq.js');

let jqPromise = null;

function loadJq() {
  if (!jqPromise) jqPromise = self.jq;
  return jqPromise;
}

self.onmessage = async function (event) {
  const { id, json, filter } = event.data;
  try {
    const jq = await loadJq();
    const result = await jq.promised.raw(json, filter, '');
    self.postMessage({ id, ok: true, result });
  } catch (error) {
    self.postMessage({ id, ok: false, error: error && error.message ? error.message : String(error) });
  }
};
