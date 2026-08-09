import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HUB_EVENT_CATALOG, HUB_EVENT_TYPES, hubEventLabel } from "./hubEvents";

/** Pull the canonical event list out of the shared edge-function module. */
function sharedEventTypes(): string[] {
  const src = readFileSync(
    resolve(process.cwd(), "supabase/functions/_shared/hub.ts"),
    "utf8",
  );
  const block = src.match(/HUB_EVENT_TYPES\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!block) throw new Error("HUB_EVENT_TYPES not found in _shared/hub.ts");
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

describe("App Family event catalog", () => {
  it("has no duplicate event types", () => {
    expect(new Set(HUB_EVENT_TYPES).size).toBe(HUB_EVENT_TYPES.length);
  });

  it("gives every event a label and description", () => {
    for (const e of HUB_EVENT_CATALOG) {
      expect(e.label.length).toBeGreaterThan(0);
      expect(e.description.length).toBeGreaterThan(0);
    }
  });

  it("uses dotted lowercase event names", () => {
    for (const t of HUB_EVENT_TYPES) {
      expect(t).toMatch(/^[a-z]+(\.[a-z_]+)+$/);
    }
  });

  it("stays in sync with the shared edge-function catalog", () => {
    const shared = sharedEventTypes();
    // hub.test is a hub-only manual test event, not part of the wire contract.
    const client = HUB_EVENT_TYPES.filter((t) => t !== "hub.test");
    expect([...client].sort()).toEqual([...shared].sort());
  });

  it("falls back to the raw type for unknown events", () => {
    expect(hubEventLabel("leads.new")).toBe("New Lead");
    expect(hubEventLabel("does.not_exist")).toBe("does.not_exist");
  });
});
