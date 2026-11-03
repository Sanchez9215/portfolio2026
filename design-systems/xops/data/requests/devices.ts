// Deterministic per-employee devices for the device runbooks (Device Deployment / Device Recovery).
// There is no asset source table yet, so a device is derived from the employee's persona and id: the persona
// picks the model, a PRNG seeded from the employee id fills the identifiers. Same employee → same device every
// run, and nothing is drawn from the shared requests rng, so the rest of the dataset is unchanged.

import { createRng } from "../generate";

export interface DeviceModel {
  make: string;
  model: string;
  /** Under `public/xops/images/`. */
  image: string;
  serialPrefix: string;
  /** Characters after the prefix. */
  serialLength: number;
}

// Persona → device. Personas come from `employeeInformation` (metrics.ts).
export const DEVICE_BY_PERSONA: Record<string, DeviceModel> = {
  Executive: { make: "Apple", model: "MacBook Pro 14-inch (M2)", image: "macbook-pro.webp", serialPrefix: "C02", serialLength: 9 },
  Sales: { make: "Apple", model: "MacBook Air 13-inch (M1)", image: "macbook-air.webp", serialPrefix: "C02", serialLength: 9 },
  Engineer: { make: "Lenovo", model: "ThinkPad T14 (Gen 4)", image: "lenovo-thinkpad.avif", serialPrefix: "PF", serialLength: 6 },
  "Knowledge Worker": { make: "Dell", model: "Latitude 7440", image: "latitude.webp", serialPrefix: "", serialLength: 7 },
};

export interface DeviceRecord {
  assetTag: string;
  make: string;
  model: string;
  image: string;
  serialNumber: string;
  /** UPS-style number for the shipment that carries the device. */
  trackingNumber: string;
  /** ISO date. */
  warrantyEnd: string;
}

const ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A new device being shipped out (bought this year) or the one an employee already holds (bought 2022–2024). */
export function deviceFor(employeeId: string, persona: string, purpose: "deploy" | "recover"): DeviceRecord {
  const model = DEVICE_BY_PERSONA[persona] ?? DEVICE_BY_PERSONA["Knowledge Worker"];
  const rng = createRng(hashString(`${employeeId}|device|${purpose}`));
  const chars = (count: number) => Array.from({ length: count }, () => rng.pick(ALPHANUMERIC.split(""))).join("");
  const purchaseYear = purpose === "deploy" ? 2025 : rng.int(2022, 2024);
  const month = String(rng.int(1, 12)).padStart(2, "0");
  return {
    assetTag: `DEV-${purchaseYear}-${String(rng.int(1000, 9999))}`,
    make: model.make,
    model: model.model,
    image: model.image,
    serialNumber: `${model.serialPrefix}${chars(model.serialLength)}`,
    trackingNumber: `1Z${chars(16)}`,
    // Three-year warranty from purchase.
    warrantyEnd: `${purchaseYear + 3}-${month}-01T00:00:00Z`,
  };
}
