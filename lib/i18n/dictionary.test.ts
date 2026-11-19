import { describe, expect, it } from "vitest";
import { translate } from "./dictionary";

describe("translate", () => {
  it("returns English and French copy", () => {
    expect(translate("en", "common.from")).toBe("From");
    expect(translate("fr", "common.from")).toBe("Dès");
  });

  it("interpolates variables", () => {
    const body = translate("fr", "notifications.newRequest.body", {
      customer: "Amina",
      service: "Tresses",
      date: "22 nov. 2026",
      window: "Matin",
    });
    expect(body).toContain("Amina");
    expect(body).toContain("Tresses");
    expect(body).toContain("Matin");
    expect(body).not.toContain("{customer}");
  });

  it("keeps missing variables visible for debugging", () => {
    expect(translate("en", "notifications.newRequest.body", { customer: "Amina" })).toContain(
      "{service}",
    );
  });

  it("translates booking windows", () => {
    expect(translate("en", "window.MORNING")).toBe("Morning");
    expect(translate("fr", "window.EVENING")).toBe("Soir");
  });
});
