import { customAlphabet } from "nanoid";

// Avoids ambiguous chars (0/O, 1/I) - random, non-sequential, per Backend Schema §3
const nanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

export function generateTrackingCode(): string {
  return `WH-${nanoid()}`;
}