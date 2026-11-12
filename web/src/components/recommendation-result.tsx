import { Check, FlaskConical, Info, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecommendationResponse } from '@/services/data-api';

const criterionLabels: Record<string, string> = {
  brief: 'Demande du client',
  gourmand: 'Gourmand',
  premium: 'Premium',
  naturel: 'Naturel',
  audace: 'Audace',
  bien_etre: 'Bien-être',
  region: 'Marché visé',
};

export function RecommendationResult({
  result,
}: {
  result: RecommendationResponse;
}) {
  if (result.status === 'no_match')
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucune correspondance suffisante</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{result.message}</p>
        </CardContent>
      </Card>
    );

  const { product, match_score, reasons, limitations } = result.recommendation;
  const ProductIcon = product.product_type === 'parfum' ? FlaskConical : Leaf;

  return (
    <div className="space-y-7">
      <section
        aria-label="Produit recommandé"
        className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-5 sm:p-6"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                <ProductIcon className="size-3.5" aria-hidden="true" />
                {product.product_type === 'parfum' ? 'Parfum' : 'Arôme'}
              </span>
              <span className="break-all text-xs text-muted-foreground">
                Réf. {product.id}
              </span>
            </div>
            <h3 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl [overflow-wrap:anywhere]">
              {product.name}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground [overflow-wrap:anywhere]">
              {product.description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-2">
            <div
              role="img"
              aria-label={`Score de correspondance : ${match_score} %`}
              className="relative size-24 sm:size-28"
            >
              <svg
                viewBox="0 0 36 36"
                className="size-full -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-violet-100"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray={`${match_score} 100`}
                  strokeLinecap="round"
                  className="text-[#4e3cbb]"
                />
              </svg>
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center gap-0.5 text-3xl font-semibold tracking-tight text-[#4e3cbb] tabular-nums"
              >
                {match_score}
                <span className="text-sm">%</span>
              </span>
            </div>
            <p className="text-xs font-medium text-violet-800">
              Correspondance au brief
            </p>
          </div>
        </div>
        <p className="mt-5 border-t border-violet-100 pt-4 text-xs leading-5 text-muted-foreground">
          Ce score indique une correspondance aux critères, pas une probabilité
          de satisfaction.
        </p>
      </section>

      <section aria-labelledby="recommendation-reasons-title">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-violet-50 text-[#4e3cbb]">
            <Check className="size-4" aria-hidden="true" />
          </span>
          <h3
            id="recommendation-reasons-title"
            className="text-base font-semibold"
          >
            Pourquoi ce produit ?
          </h3>
        </div>
        {reasons.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {reasons.map((reason, index) => (
              <li
                key={index}
                className="min-w-0 rounded-xl border bg-background p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-[#4e3cbb] [overflow-wrap:anywhere]">
                    {criterionLabels[reason.criterion] || reason.criterion}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-xs text-muted-foreground/60 tabular-nums"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
                  {reason.explanation}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Le service n’a pas fourni d’argument détaillé.
          </p>
        )}
      </section>

      {limitations.length > 0 && (
        <aside className="flex gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 sm:p-5">
          <Info
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-amber-700"
          />
          <div className="min-w-0">
            <h3 className="mb-2 text-sm font-semibold text-amber-950">
              À garder en tête
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-amber-900/85">
              {limitations.map((limitation, index) => (
                <li key={index} className="[overflow-wrap:anywhere]">
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
