import { Calculator } from "@/components/calculator";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
          Prototyp
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Lizenzverwaltung
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Hier entsteht die Verwaltung von Lizenzschlüsseln, mit denen Kunden
          Funktionen ihrer Produkte freischalten.
        </p>
      </header>

      <section
        aria-labelledby="calculator-heading"
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="flex flex-col gap-1">
          <h2 id="calculator-heading" className="text-xl font-semibold">
            Rechner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Beispielkomponente zum Prüfen der Projektkonfiguration.
          </p>
        </div>
        <Calculator />
      </section>
    </main>
  );
}
