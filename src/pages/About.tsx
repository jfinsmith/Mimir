import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h1 className="text-2xl font-bold">About &amp; methodology</h1>
        <p className="mt-2 text-ink-muted">
          MIMIR is a catalog of watch movements and a fitment engine for
          hobbyist watchmakers. Pick a movement and it tells you which cases,
          dials, hands and crystals are a direct fit, which need a spacer or
          modification, and which simply won&apos;t work — with the specific
          reason for every verdict.
        </p>
      </section>

      <section className="rounded-card border border-fit-mod/40 bg-fit-mod/10 p-4">
        <h2 className="font-semibold text-fit-mod">Verify before you buy</h2>
        <p className="mt-1 text-sm text-fit-mod">
          Data is community-sourced and may contain errors. Every record carries
          a confidence flag; treat anything below <em>high</em> as a starting
          point and confirm critical dimensions against a manufacturer sheet
          before spending money on parts. MIMIR never guesses a number — unknown
          fields are left blank.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Where the data comes from
        </h2>
        <p className="text-sm text-ink-muted">
          In order of trust: manufacturer spec sheets (Miyota, Ronda, Sellita,
          Seiko/TMI) → Caliber Corner → WatchBase → Ranfft → parts-retailer spec
          fields (Esslinger, Perrin, Cousins UK, Otto Frei, CrystalTimes,
          namokiMODS). A single retailer listing is treated as <em>medium</em>{' '}
          confidence; a value is promoted to <em>high</em> only when two
          independent sources agree or a manufacturer PDF confirms it. The
          shipped app is fully static — nothing is scraped at runtime.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Confidence levels</h2>
        <ul className="space-y-1 text-sm text-ink-muted">
          <li>
            <strong className="text-ink">High</strong> — corroborated; safe to
            rely on (still: measure twice).
          </li>
          <li>
            <strong className="text-ink">Medium</strong> — single decent source
            or a documented inference; verify the fitment-critical numbers.
          </li>
          <li>
            <strong className="text-ink">Low</strong> — placeholder / sparse;
            confirm everything.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">
          How verdicts are computed
        </h2>
        <p className="text-sm text-ink-muted">
          The fitment engine is a set of pure, unit-tested rules. The strongest
          signal is an explicit maker listing (&ldquo;fits the NH3x
          family&rdquo;); from there, hard dimensional checks can downgrade the
          verdict — hand bores must match exactly, the case opening must accept
          the movement&apos;s casing diameter, dial feet must line up (or the
          dial must be feetless), and so on. When data is missing the engine
          says <em>check clearance</em> rather than pretending to know. See the{' '}
          <Link className="text-brand underline" to="/learn">
            Learn
          </Link>{' '}
          page for the full rule set.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Images</h2>
        <p className="text-sm text-ink-muted">
          Every movement renders a generated schematic placeholder so the
          catalog is complete with zero copyright risk. Real photos are optional
          and carry credit/license metadata; MIMIR does not hot-link or embed
          scraped retailer images.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Contributing corrections</h2>
        <p className="text-sm text-ink-muted">
          Spotted a wrong number? Each spec lists its sources on the movement
          page. Corrections come with a citation (manufacturer sheet or two
          agreeing sources) and update the typed dataset — the data validator
          rejects internal contradictions before they ship.
        </p>
      </section>
    </div>
  );
}
