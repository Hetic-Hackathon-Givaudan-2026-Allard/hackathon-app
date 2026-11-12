import { setTimeout as delay } from 'node:timers/promises';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';

const preference = z.number().int().min(0).max(10);
const requestSchema = z.object({
  product_type: z.enum(['parfum', 'arome']),
  brief: z.string().trim().min(1),
  region: z.string().trim().min(1),
  preferences: z.object({
    gourmand: preference,
    premium: preference,
    naturel: preference,
    audace: preference,
    bien_etre: preference,
  }),
});

export function createApp({
  origins = ['http://localhost:5173'],
  delayMs = 600,
  slowDelayMs = 3000,
} = {}) {
  const app = express();
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '64kb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/ask', async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Certaines données sont invalides.',
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
      return;
    }
    const { product_type, brief } = parsed.data;
    await delay(brief.toLowerCase() === '[lent]' ? slowDelayMs : delayMs);
    if (brief.toLowerCase() === '[sans-resultat]') {
      res.json({
        status: 'no_match',
        recommendation: null,
        message:
          'Aucun produit suffisamment pertinent n’a été trouvé pour ces critères.',
      });
      return;
    }
    if (brief.toLowerCase() === '[erreur]') {
      res.status(503).json({
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message:
            'Démonstration : le service de recommandation est indisponible.',
          details: [],
        },
      });
      return;
    }
    const perfume = product_type === 'parfum';
    res.json({
      status: 'success',
      recommendation: {
        match_score: 85,
        product: {
          id: perfume ? 'DEMO-P042' : 'DEMO-A042',
          product_type,
          name: perfume
            ? 'Bois gourmand — démonstration'
            : 'Agrumes doux — démonstration',
          description: perfume
            ? 'Produit fictif aux notes gourmandes et boisées.'
            : 'Produit fictif aux notes d’agrumes et de fruits doux.',
        },
        reasons: [
          {
            criterion: 'brief',
            explanation:
              'Exemple de présentation d’un argument : aucune analyse du brief ni recherche réelle n’est effectuée.',
          },
          {
            criterion: 'gourmand',
            explanation:
              'Réponse de démonstration pour vérifier l’affichage des critères.',
          },
        ],
        limitations: [
          'Produit fictif et score fixe de 85 %. Aucun modèle IA ni catalogue réel n’est interrogé.',
        ],
      },
    });
  });
  app.use((error, _req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const status =
      error.status === 413 ? 413 : error.status === 400 ? 422 : 500;
    res.status(status).json({
      error: {
        code:
          status === 413
            ? 'PAYLOAD_TOO_LARGE'
            : status === 422
              ? 'VALIDATION_ERROR'
              : 'INTERNAL_ERROR',
        message:
          status === 413
            ? 'Corps de requête trop volumineux.'
            : status === 422
              ? 'Le corps JSON est invalide.'
              : 'Une erreur interne est survenue.',
        details: [],
      },
    });
  });
  return app;
}
