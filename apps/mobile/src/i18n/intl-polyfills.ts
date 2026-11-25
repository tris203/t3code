// GT validates every locale with Intl.Locale and English Intl.DisplayNames, and selects every plural
// branch with Intl.PluralRules; Hermes has none of them, so plural messages would render as raw ICU.
// gt-react-native's Babel plugin would inject these; plain imports keep the Metro and Babel config unchanged.
import "@formatjs/intl-getcanonicallocales/polyfill";
import "@formatjs/intl-locale/polyfill";
import "@formatjs/intl-displaynames/polyfill";
import "@formatjs/intl-displaynames/locale-data/en";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-pluralrules/locale-data/de";
import "@formatjs/intl-pluralrules/locale-data/es";
import "@formatjs/intl-pluralrules/locale-data/fr";
import "@formatjs/intl-pluralrules/locale-data/ja";
import "@formatjs/intl-pluralrules/locale-data/ko";
import "@formatjs/intl-pluralrules/locale-data/pt";
import "@formatjs/intl-pluralrules/locale-data/ru";
import "@formatjs/intl-pluralrules/locale-data/sv";
import "@formatjs/intl-pluralrules/locale-data/zh";

// GT builds a new Intl.PluralRules and resolves an Intl.Locale (through
// NumberFormat.supportedLocalesOf) for every message it formats, and each polyfilled step
// canonicalizes against every locale it knows. One launch formats hundreds of messages, so equal
// arguments share one result. Neither object holds state that changes.
function shareInstances(name: "PluralRules" | "Locale") {
  const shared = new Map<string, object>();
  // The property is read-only in the lib types; the polyfill defines it the same way.
  Object.defineProperty(Intl, name, {
    configurable: true,
    writable: true,
    value: new Proxy(Intl[name], {
      construct(target, args: ReadonlyArray<unknown>) {
        const key = JSON.stringify(args);
        let instance = shared.get(key);
        if (instance === undefined) {
          instance = Reflect.construct(target, args) as object;
          shared.set(key, instance);
        }
        return instance;
      },
    }),
  });
}
shareInstances("PluralRules");
shareInstances("Locale");

const supportedNumberFormatLocales = new Map<string, ReadonlyArray<string>>();
const supportedLocalesOf = Intl.NumberFormat.supportedLocalesOf;
Object.defineProperty(Intl.NumberFormat, "supportedLocalesOf", {
  configurable: true,
  writable: true,
  value: (...args: Parameters<typeof supportedLocalesOf>) => {
    const key = JSON.stringify(args);
    let supported = supportedNumberFormatLocales.get(key);
    if (supported === undefined) {
      supported = supportedLocalesOf(...args);
      supportedNumberFormatLocales.set(key, supported);
    }
    // Callers own the array they get back.
    return [...supported];
  },
});
