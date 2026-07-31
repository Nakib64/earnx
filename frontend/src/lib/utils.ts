/**
 * Common formatting and helper functions.
 */

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

export function filterUsersByQuery<T extends { phone: string; full_name?: string | null; referral_code: string }>(
  users: T[],
  query: string,
): T[] {
  if (!query || !query.trim()) return users;
  const q = query.toLowerCase().trim();
  return users.filter(
    (u) =>
      u.phone.includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      u.referral_code.toLowerCase().includes(q),
  );
}

export function getMaxLevelFromDesignations(designations: Array<{ max_level: number }>): number {
  if (!designations || designations.length === 0) return 1;
  return Math.max(...designations.map((d) => d.max_level));
}

export function getTotalAssignedUsersFromDesignations(
  designations: Array<{ _count?: { users: number } }>,
): number {
  if (!designations) return 0;
  return designations.reduce((sum, d) => sum + (d._count?.users || 0), 0);
}
