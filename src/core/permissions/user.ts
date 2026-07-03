/** Whether a user id is the same as the owner id. */
export function isOwner(userId: string, ownerId: string): boolean {
  return ownerId === userId;
}

/** Whether a user id is in the configured privileged allow-list. */
export function isPrivileged(
  userId: string,
  privilegedIds: readonly string[],
): boolean {
  return privilegedIds.includes(userId);
}
