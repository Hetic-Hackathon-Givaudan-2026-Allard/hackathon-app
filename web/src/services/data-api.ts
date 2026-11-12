import { z } from 'zod';
import type { NewBriefForm } from '../schemas/new-brief';

const productSchema = z.object({
  id: z.string(),
  product_type: z.enum(['parfum', 'arome']),
  name: z.string(),
  description: z.string(),
});
export const responseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    recommendation: z.object({
      match_score: z.number().int().min(0).max(100),
      product: productSchema,
      reasons: z.array(
        z.object({ criterion: z.string(), explanation: z.string() }),
      ),
      limitations: z.array(z.string()),
    }),
  }),
  z.object({
    status: z.literal('no_match'),
    recommendation: z.null(),
    message: z.string(),
  }),
]);
const errorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ field: z.string(), message: z.string() })),
  }),
});
export type RecommendationResponse = z.infer<typeof responseSchema>;

export function toAskRequest(form: NewBriefForm) {
  return {
    product_type: form.productType,
    brief: form.brief,
    preferences: form.preferences,
    region: form.market,
  };
}

export async function requestRecommendation(
  form: NewBriefForm,
  options: { baseUrl: string; signal: AbortSignal; timeoutMs?: number },
): Promise<RecommendationResponse> {
  const timeout = AbortSignal.timeout(options.timeoutMs ?? 60_000);
  try {
    const response = await fetch(`${options.baseUrl.replace(/\/$/, '')}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toAskRequest(form)),
      signal: AbortSignal.any([options.signal, timeout]),
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      const error = errorSchema.safeParse(body);
      throw new Error(
        error.success
          ? error.data.error.message
          : `La demande a échoué (HTTP ${response.status}).`,
      );
    }
    const parsed = responseSchema.safeParse(body);
    if (!parsed.success)
      throw new Error(
        'Le service a renvoyé une réponse incompatible avec le contrat attendu.',
      );
    if (
      parsed.data.status === 'success' &&
      parsed.data.recommendation.product.product_type !== form.productType
    )
      throw new Error('Le produit reçu ne correspond pas au type demandé.');
    return parsed.data;
  } catch (error) {
    if (options.signal.aborted) throw error;
    if (timeout.aborted)
      throw new Error(
        'Le service n’a pas répondu dans le délai de 60 secondes.',
        { cause: error },
      );
    if (error instanceof SyntaxError)
      throw new Error('Le service n’a pas renvoyé une réponse JSON valide.', {
        cause: error,
      });
    if (error instanceof TypeError)
      throw new Error(
        'Service inaccessible. Vérifiez son adresse, sa disponibilité et la configuration CORS.',
        { cause: error },
      );
    throw error;
  }
}
