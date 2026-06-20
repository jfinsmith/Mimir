import { glossary } from '@/data';
import { COST_BANDS } from '@/lib/cost';
import { FIT_STATUS_LABEL, type FitStatus } from '@/lib/fitment';
import { CostGlyphs } from '@/components/atoms';
import { PlaceholderLegend } from '@/components/PlaceholderLegend';

const FIT_EXPLAIN: Record<FitStatus, string> = {
  direct: 'Drops in — bores, footprint and feet all match.',
  'with-spacer': 'Fits once you add a movement ring / spacer.',
  'needs-modification': 'Workable, but needs a change (e.g. remove dial feet).',
  'check-clearance':
    'Likely fine, but a spec is unknown — verify before buying.',
  incompatible: 'Will not work — a hard dimension conflicts.',
  unknown: 'Not enough data to judge.',
};

const FIT_ORDER: FitStatus[] = [
  'direct',
  'with-spacer',
  'needs-modification',
  'check-clearance',
  'incompatible',
  'unknown',
];

export function Learn() {
  return (
    <div className="max-w-3xl space-y-10">
      <section>
        <h1 className="text-2xl font-bold">Learn</h1>
        <p className="mt-2 text-ink-muted">
          The vocabulary and rules behind movement modding — enough to read a
          spec sheet and judge a parts list with confidence.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Reading the movement diagrams
        </h2>
        <p className="mb-3 text-sm text-ink-muted">
          Until a license-clean photo is added, each movement shows a generated
          schematic — a stylised disc whose marks are derived from its specs:
        </p>
        <PlaceholderLegend />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">How fitment is judged</h2>
        <p className="mb-3 text-sm text-ink-muted">
          For each part the engine returns one of six verdicts. When several
          rules apply, the most severe wins (incompatible beats needs-mod beats
          with-spacer beats check-clearance beats direct).
        </p>
        <dl className="divide-y divide-border rounded-card border border-border bg-surface">
          {FIT_ORDER.map((s) => (
            <div key={s} className="flex gap-4 px-4 py-2 text-sm">
              <dt className="w-40 shrink-0 font-medium">
                {FIT_STATUS_LABEL[s]}
              </dt>
              <dd className="text-ink-muted">{FIT_EXPLAIN[s]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Cost tiers</h2>
        <p className="mb-3 text-sm text-ink-muted">
          Derived from the typical single-unit street/parts price midpoint —
          never hand-entered.
        </p>
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {COST_BANDS.map((b) => (
                <tr key={b.tier}>
                  <td className="px-4 py-2">
                    <CostGlyphs tier={b.tier} />
                  </td>
                  <td className="px-4 py-2 font-medium">{b.label}</td>
                  <td className="px-4 py-2 text-ink-muted">
                    {b.minMidpointUsd === 0
                      ? `under $${b.maxMidpointUsd}`
                      : b.maxMidpointUsd === Infinity
                        ? `$${b.minMidpointUsd}+`
                        : `$${b.minMidpointUsd}–${b.maxMidpointUsd}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Glossary</h2>
        <dl className="space-y-4">
          {glossary.map((g) => (
            <div
              key={g.term}
              className="rounded-card border border-border bg-surface p-4"
            >
              <dt className="font-semibold">{g.term}</dt>
              <dd className="mt-1 text-sm text-ink-muted">
                <span className="text-ink">{g.short}</span> {g.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
