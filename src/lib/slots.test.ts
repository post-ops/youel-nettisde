import { describe, expect, it, vi, beforeEach } from "vitest";

// In-memory mock av Prisma — overstyrer db før vi importerer slots.ts.
// Bruker vi.hoisted så mock-fnene eksisterer når vi.mock kjøres.
const mocks = vi.hoisted(() => ({
  bookingFindMany: vi.fn(),
  blockFindMany: vi.fn(),
  bookingFindFirst: vi.fn(),
  blockFindFirst: vi.fn(),
}));

vi.mock("./db", () => ({
  db: {
    booking: {
      findMany: mocks.bookingFindMany,
      findFirst: mocks.bookingFindFirst,
    },
    block: {
      findMany: mocks.blockFindMany,
      findFirst: mocks.blockFindFirst,
    },
  },
}));

const { bookingFindMany, blockFindMany, bookingFindFirst, blockFindFirst } =
  mocks;

import { getAvailableSlots, isSlotAvailable } from "./slots";

beforeEach(() => {
  bookingFindMany.mockReset().mockResolvedValue([]);
  blockFindMany.mockReset().mockResolvedValue([]);
  bookingFindFirst.mockReset().mockResolvedValue(null);
  blockFindFirst.mockReset().mockResolvedValue(null);
});

const longAgo = new Date("2024-01-01T00:00:00Z"); // for å unngå lead-time-filter

// Åpningstider: man–lør 10:30–19:00 = 8.5 timer = 17 slots à 30 min.
// Søndag: stengt.
const EXPECTED_SLOTS = 17;
const FIRST_SLOT = "10:30";
const LAST_SLOT = "18:30";

describe("getAvailableSlots", () => {
  it(`genererer ${EXPECTED_SLOTS} slots på en mandag (10:30–19:00)`, async () => {
    // 2026-05-04 er en mandag
    const slots = await getAvailableSlots("2026-05-04", { now: longAgo });
    expect(slots).toHaveLength(EXPECTED_SLOTS);
    expect(slots[0].time).toBe(FIRST_SLOT);
    expect(slots[slots.length - 1].time).toBe(LAST_SLOT);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it(`genererer ${EXPECTED_SLOTS} slots også på lørdag (samme åpningstid)`, async () => {
    // 2026-05-09 er en lørdag
    const slots = await getAvailableSlots("2026-05-09", { now: longAgo });
    expect(slots).toHaveLength(EXPECTED_SLOTS);
    expect(slots[0].time).toBe(FIRST_SLOT);
    expect(slots[slots.length - 1].time).toBe(LAST_SLOT);
  });

  it("returnerer tom liste på søndag (stengt)", async () => {
    // 2026-05-10 er en søndag
    const slots = await getAvailableSlots("2026-05-10", { now: longAgo });
    expect(slots).toHaveLength(0);
  });

  it("markerer slots som overlapper en booking som ikke-ledige", async () => {
    bookingFindMany.mockResolvedValue([
      {
        startsAt: new Date("2026-05-04T09:00:00Z"), // 11:00 Oslo (sommertid UTC+2)
        endsAt: new Date("2026-05-04T09:30:00Z"),
      },
    ]);
    const slots = await getAvailableSlots("2026-05-04", { now: longAgo });
    const tatt = slots.find((s) => s.time === "11:00");
    expect(tatt?.available).toBe(false);
    const ledig = slots.find((s) => s.time === "11:30");
    expect(ledig?.available).toBe(true);
  });

  it("markerer slots som overlapper en blokk som ikke-ledige", async () => {
    blockFindMany.mockResolvedValue([
      {
        startsAt: new Date("2026-05-04T08:00:00Z"), // 10:00 Oslo
        endsAt: new Date("2026-05-04T18:00:00Z"), // 20:00 Oslo (hele dagen)
      },
    ]);
    const slots = await getAvailableSlots("2026-05-04", { now: longAgo });
    expect(slots.every((s) => !s.available)).toBe(true);
  });

  it("hopper over slots som er innenfor lead-time fra nå", async () => {
    // "Nå" er 2026-05-04 11:00 Oslo (= 09:00 UTC i mai). Lead = 60 min → 12:00+ ledig.
    const now = new Date("2026-05-04T09:00:00Z");
    const slots = await getAvailableSlots("2026-05-04", { now });
    expect(slots.find((s) => s.time === "10:30")?.available).toBe(false);
    expect(slots.find((s) => s.time === "11:30")?.available).toBe(false);
    expect(slots.find((s) => s.time === "12:00")?.available).toBe(true);
  });
});

describe("isSlotAvailable", () => {
  it("returnerer false for tidspunkt utenfor åpningstid", async () => {
    // 19:00 Oslo (= 17:00 UTC sommer) er stengt — siste lovlige slot er 18:30.
    const after = new Date("2026-05-04T17:00:00Z");
    expect(await isSlotAvailable(after, { now: longAgo })).toBe(false);
  });

  it("returnerer false når et slot er booket", async () => {
    bookingFindFirst.mockResolvedValue({ id: "x" });
    const slot = new Date("2026-05-04T09:00:00Z"); // 11:00 Oslo
    expect(await isSlotAvailable(slot, { now: longAgo })).toBe(false);
  });

  it("returnerer true for et lovlig, ledig slot", async () => {
    const slot = new Date("2026-05-04T09:00:00Z"); // 11:00 Oslo
    expect(await isSlotAvailable(slot, { now: longAgo })).toBe(true);
  });
});
