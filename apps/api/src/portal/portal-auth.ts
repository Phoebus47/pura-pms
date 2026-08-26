export const PORTAL_NOT_FOUND =
  'Reservation not found or last name does not match';

/**
 * Confirm-number + last-name gate stands in for guest identity in v1 (see
 * docs/adr/020-guest-portal.md). Case/whitespace insensitive so guests
 * typing "Smith" or "smith " still unlock their reservation.
 */
export function guestLastNameMatches(
  guestLastName: string | null | undefined,
  inputLastName: string | null | undefined,
): boolean {
  if (!guestLastName || !inputLastName) {
    return false;
  }
  return (
    guestLastName.trim().toLowerCase() === inputLastName.trim().toLowerCase()
  );
}
