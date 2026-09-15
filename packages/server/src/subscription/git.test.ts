import { describe, it, expect } from 'vitest';

import { buildBranchName } from './git';

describe('buildBranchName', () => {
  it('builds the username-date-iid mask', () => {
    const date = new Date('2026-09-14T10:00:00Z');

    expect(buildBranchName('bmazur', 42, date)).toBe('bmazur-20260914-42');
  });

  it('lower-cases and sanitizes an unsafe username to [a-z0-9-]', () => {
    const date = new Date('2026-01-05T00:00:00Z');

    expect(buildBranchName('Bogdan.Mazur@Ex', 7, date)).toBe('bogdan-mazur-ex-20260105-7');
  });

  it('falls back to "user" when the username sanitizes to nothing', () => {
    const date = new Date('2026-01-05T00:00:00Z');

    expect(buildBranchName('...', 1, date)).toBe('user-20260105-1');
  });
});
