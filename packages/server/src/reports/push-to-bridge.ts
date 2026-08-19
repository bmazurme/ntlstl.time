import type { BridgeReportEntry } from '@reports/shared';

import { getSettings } from '../settings/props';

export async function pushReportToBridge(year: number, month: number, entries: BridgeReportEntry[]) {
  const { bridgeApiUrl, bridgeApiKey } = getSettings();

  if (!bridgeApiUrl || !bridgeApiKey) {
    throw new Error('Интеграция с bridge не настроена: укажите адрес и ключ на странице Settings');
  }

  const { origin } = new URL(bridgeApiUrl);

  const response = await fetch(`${origin}/api/v1/time/import/reports`, {
    method: 'POST',
    headers: {
      'X-Api-Key': bridgeApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ year, month, entries }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join('; ') : body?.message;

    throw new Error(`Bridge API вернул ошибку ${response.status}${message ? `: ${message}` : ''}`);
  }

  return response.json();
}
