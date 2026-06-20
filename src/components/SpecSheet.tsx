import type { Movement } from '@/types';
import {
  fmtBool,
  fmtHands,
  fmtList,
  fmtMm,
  fmtNum,
  fmtPriceRange,
  fmtRate,
  ligneFromMm,
} from '@/lib/format';
import { TYPE_LABEL } from '@/lib/labels';
import { CostGlyphs } from './atoms';

type Row = { label: string; value: React.ReactNode };

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="rounded-card border border-border bg-surface">
      <h3 className="border-b border-border px-4 py-2 text-sm font-semibold text-ink-muted">
        {title}
      </h3>
      <dl className="divide-y divide-border">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-baseline justify-between gap-4 px-4 py-2 text-sm"
          >
            <dt className="text-ink-muted">{r.label}</dt>
            <dd className="text-right font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SpecSheet({ movement: m }: { movement: Movement }) {
  const physical: Row[] = [
    { label: 'Type', value: TYPE_LABEL[m.type] },
    {
      label: 'Diameter',
      value: `${fmtMm(m.diameterMm)}${m.diameterMm != null ? ` · ${ligneFromMm(m.diameterMm)}` : ''}`,
    },
    { label: 'Casing Ø (w/ ring)', value: fmtMm(m.casingDiameterMm) },
    { label: 'Height', value: fmtMm(m.heightMm) },
    { label: 'Height w/ hands', value: fmtMm(m.heightWithHandsMm) },
    { label: 'Jewels', value: fmtNum(m.jewels) },
  ];

  const fitment: Row[] = [
    { label: 'Hand sizes (H/M/S)', value: fmtHands(m.handSizes) },
    { label: 'Dial feet', value: fmtList(m.dialFeet) },
    { label: 'Feetless dials common', value: fmtBool(m.feetlessDialsCommon) },
    { label: 'Crown positions', value: fmtList(m.crownPositions) },
    { label: 'Date window', value: m.dateWindowPosition ?? 'None' },
    { label: 'Stem part no.', value: m.stemPartNo ?? '—' },
  ];

  const performance: Row[] = [
    { label: 'Rate', value: fmtRate(m) },
    { label: 'Hacking', value: fmtBool(m.hacking) },
    { label: 'Hand-winding', value: fmtBool(m.handWinding) },
    { label: 'Power reserve', value: fmtNum(m.powerReserveHours, ' h') },
    ...(m.batteryCell ? [{ label: 'Battery', value: m.batteryCell }] : []),
    ...(m.batteryLifeMonths != null
      ? [{ label: 'Battery life', value: fmtNum(m.batteryLifeMonths, ' mo') }]
      : []),
  ];

  const commerce: Row[] = [
    {
      label: 'Cost tier',
      value: <CostGlyphs tier={m.costTier} showLabel />,
    },
    {
      label: 'Price (typical)',
      value: fmtPriceRange(m.priceUsdLow, m.priceUsdHigh),
    },
    {
      label: 'Availability',
      value: <span className="capitalize">{m.availability}</span>,
    },
    { label: 'Vendors', value: fmtList(m.commonVendors) },
    { label: 'Country', value: m.manufactureCountry ?? '—' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Section title="Physical" rows={physical} />
      <Section title="Fitment" rows={fitment} />
      <Section title="Performance" rows={performance} />
      <Section title="Commerce" rows={commerce} />
    </div>
  );
}
