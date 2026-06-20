import {
  FIT_STATUS_LABEL,
  type FitStatus,
  type FitVerdict,
} from '@/lib/fitment';

const STYLE: Record<FitStatus, string> = {
  direct: 'bg-fit-direct/15 text-fit-direct border-fit-direct/40',
  'with-spacer': 'bg-fit-spacer/15 text-fit-spacer border-fit-spacer/40',
  'needs-modification': 'bg-fit-mod/15 text-fit-mod border-fit-mod/40',
  'check-clearance': 'bg-fit-check/15 text-fit-check border-fit-check/40',
  incompatible:
    'bg-fit-incompatible/15 text-fit-incompatible border-fit-incompatible/40',
  unknown: 'bg-fit-unknown/15 text-fit-unknown border-fit-unknown/40',
};

export function FitBadge({
  verdict,
  showDetails = false,
}: {
  verdict: FitVerdict;
  showDetails?: boolean;
}) {
  const tooltip = [
    ...verdict.reasons,
    ...verdict.warnings.map((w) => `⚠ ${w}`),
    ...verdict.requiredExtras.map((e) => `+ needs: ${e}`),
  ].join('\n');

  return (
    <div className="space-y-1">
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${STYLE[verdict.status]}`}
        title={tooltip || undefined}
      >
        {FIT_STATUS_LABEL[verdict.status]}
      </span>

      {showDetails && (
        <div className="space-y-0.5 text-xs">
          {verdict.reasons.map((r) => (
            <p key={r} className="text-ink-muted">
              {r}
            </p>
          ))}
          {verdict.warnings.map((w) => (
            <p key={w} className="text-fit-mod">
              ⚠ {w}
            </p>
          ))}
          {verdict.requiredExtras.length > 0 && (
            <p className="text-fit-spacer">
              + needs: {verdict.requiredExtras.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
