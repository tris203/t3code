import { describe, expect, it } from "vite-plus/test";

import "./intl-polyfills";

describe("shared plural rules", () => {
  it("builds one instance for equal arguments", () => {
    const cardinal = new Intl.PluralRules("en");

    expect(new Intl.PluralRules("en")).toBe(cardinal);
    expect(new Intl.PluralRules("en", { type: "ordinal" })).not.toBe(cardinal);
    expect(new Intl.PluralRules("de")).not.toBe(cardinal);
  });

  it("selects the same categories as an unshared instance", () => {
    expect(new Intl.PluralRules("en").select(1)).toBe("one");
    expect(new Intl.PluralRules("en").select(2)).toBe("other");
    expect(new Intl.PluralRules("en", { type: "ordinal" }).select(2)).toBe("two");
    expect(new Intl.PluralRules("en")).toBeInstanceOf(Intl.PluralRules);
  });
});

describe("shared locale resolution", () => {
  it("builds one Intl.Locale for equal arguments", () => {
    const english = new Intl.Locale("en");

    expect(new Intl.Locale("en")).toBe(english);
    expect(new Intl.Locale("en", { region: "GB" })).not.toBe(english);
    expect(new Intl.Locale("en", { region: "GB" }).baseName).toBe("en-GB");
    expect(english).toBeInstanceOf(Intl.Locale);
  });

  it("gives each supportedLocalesOf caller its own array", () => {
    const first = Intl.NumberFormat.supportedLocalesOf(["de"]);
    const second = Intl.NumberFormat.supportedLocalesOf(["de"]);

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });
});
