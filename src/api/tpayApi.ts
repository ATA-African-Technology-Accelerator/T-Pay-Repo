// src/api/tpayApi.ts
/**
 * Thin wrapper around the backend REST API.
 * Each function mirrors a domain use‑case and returns the JSON payload
 * produced by the corresponding controller (shape: { success: boolean, data?: any, error?: string }).
 */

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok || (json && json.success === false)) {
    throw new Error(json.error ?? `Request failed with status ${response.status}`);
  }
  return json.data as T;
}

/** Escrow */
export async function createEscrow(payload: {
  senderDeviceId: string;
  senderName: string;
  senderAccount: string;
  recipientDeviceId: string;
  recipientName: string;
  recipientAccount: string;
  amount: number;
  currency?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/escrow/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function syncEscrow(reportingDeviceId?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/escrow/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportingDeviceId }),
  });
  return handleResponse(res);
}

export async function getEscrowTokens(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/escrow/tokens`);
  return handleResponse(res);
}

/** Vault */
export async function lockVault(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/vault/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function meltVault(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/vault/melt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getActiveVault(userId?: string): Promise<any> {
  const url = userId ? `${API_BASE}/vault/status/${userId}` : `${API_BASE}/vault/status`;
  const res = await fetch(url);
  return handleResponse(res);
}

/** Inventory */
export async function getInventory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/inventory`);
  return handleResponse(res);
}

export async function processVoiceSale(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/inventory/voice-sale`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function bulkImport(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/inventory/bulk-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getReconciliation(): Promise<any> {
  const res = await fetch(`${API_BASE}/inventory/reconciliation`);
  return handleResponse(res);
}

/** Budget */
export async function getBudgetPlan(): Promise<any> {
  const res = await fetch(`${API_BASE}/budget/plan`);
  return handleResponse(res);
}

export async function deductExpense(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/budget/deduct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function resolveAmbiguity(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/budget/resolve-ambiguity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Transit */
export async function getActiveTrip(): Promise<any> {
  const res = await fetch(`${API_BASE}/transit/trip`);
  return handleResponse(res);
}

export async function collectFares(): Promise<any> {
  const res = await fetch(`${API_BASE}/transit/collect-fares`, {
    method: 'POST',
  });
  return handleResponse(res);
}

/** Assistant */
export async function processAssistantCommand(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/assistant/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

