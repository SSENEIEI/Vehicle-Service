// Lightweight client-side fetch utilities with timeout, retries, and safe JSON parsing
// Usage: import { fetchJSON, postJSON } from '@/lib/http'

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function getAuthHeader() {
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function parseResponse(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  if (res.status === 204) return null;
  try { return await res.text(); } catch { return null; }
}

function createHttpError(res, data) {
  let message = '';
  if (typeof data === 'string') {
    message = data.trim();
  } else if (data && typeof data === 'object') {
    message = data.error || data.message || '';
  }
  const finalMessage = message ? String(message) : `HTTP ${res.status}`;
  const err = {
    name: "HttpError",
    message: finalMessage,
    status: res.status,
  };
  if (data !== undefined) {
    err.details = data;
    err.response = data;
  }
  return err;
}

export async function fetchJSON(url, options = {}, extra = {}) {
  const {
    retries = 2,
    timeout = 10000,
    signal: externalSignal,
    retryOn = (res) => !res.ok,
    cache = 'no-store',
  } = extra;

  // Merge headers with auth if not present
  const baseHeaders = { ...(options.headers || {}), ...getAuthHeader() };

  let attempt = 0;
  let lastError = null;
  let controller;

  while (attempt <= retries) {
    attempt += 1;
    controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        ...options,
        headers: baseHeaders,
        signal: externalSignal || controller.signal,
        cache,
      });
      clearTimeout(tid);
      if (retryOn && retryOn(res) && attempt <= retries && (options.method || 'GET').toUpperCase() === 'GET') {
        // backoff: 200ms * 2^(attempt-1)
        await sleep(200 * Math.pow(2, attempt - 1));
        continue;
      }
      const data = await parseResponse(res);
      if (!res.ok) {
        throw createHttpError(res, data);
      }
      return data;
    } catch (err) {
      clearTimeout(tid);
      lastError = err;
      // Only retry GETs and only on network/timeouts or 5xx
      const method = (options.method || 'GET').toUpperCase();
      const status = err?.status || 0;
      const isRetryableStatus = status >= 500 || status === 0; // network/timeout
      if (method !== 'GET' || attempt > retries || !isRetryableStatus) break;
      await sleep(200 * Math.pow(2, attempt - 1));
    }
  }
  // Return null to let callers decide fallbacks without breaking UI
  return null;
}

export async function postJSON(url, body, options = {}, extra = {}) {
  const { timeout = 10000, signal: externalSignal } = extra;
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}), ...getAuthHeader() },
      body: JSON.stringify(body || {}),
      signal: externalSignal || controller.signal,
    });
    clearTimeout(tid);
    const data = await parseResponse(res);
    if (!res.ok) {
      throw createHttpError(res, data);
    }
    return data;
  } catch (err) {
    clearTimeout(tid);
    throw err;
  }
}

export async function putJSON(url, body, options = {}, extra = {}) {
  const { timeout = 10000, signal: externalSignal } = extra;
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}), ...getAuthHeader() },
      body: JSON.stringify(body || {}),
      signal: externalSignal || controller.signal,
    });
    clearTimeout(tid);
    const data = await parseResponse(res);
    if (!res.ok) {
      throw createHttpError(res, data);
    }
    return data;
  } catch (err) {
    clearTimeout(tid);
    throw err;
  }
}

export async function deleteJSON(url, body = undefined, options = {}, extra = {}) {
  const { timeout = 10000, signal: externalSignal } = extra;
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}), ...getAuthHeader() },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: externalSignal || controller.signal,
    });
    clearTimeout(tid);
    const data = await parseResponse(res);
    if (!res.ok) {
      throw createHttpError(res, data);
    }
    return data;
  } catch (err) {
    clearTimeout(tid);
    throw err;
  }
}
