import { z } from 'zod';

export const styleAxes = [
  { key: 'gourmand', label: 'Gourmand' },
  { key: 'premium', label: 'Premium' },
  { key: 'naturel', label: 'Naturel' },
  { key: 'audace', label: 'Audace' },
  { key: 'bien_etre', label: 'Bien-être' },
] as const;

export const categories = {
  parfum: ['Parfumerie Fine', 'Soin corps & cheveux', 'Linge et maison'],
  arome: [
    'Boissons',
    'Snacking & confiserie',
    'Laitiers & dessert',
    'Plant-based et protéines',
    'Bien-être et compléments',
  ],
};
export const markets = [
  'Asie-Pacifique',
  'Europe',
  'Amérique du Nord',
  'Amérique Latine',
  'Moyen-Orient & Afrique',
];
export const clientTypes = [
  'Multinationale',
  'Jeune marque',
  'Régionale ou locale',
];
export type ProductType = keyof typeof categories;
export type StyleAxis = (typeof styleAxes)[number]['key'];

const preference = z
  .number()
  .int('La valeur doit être entière.')
  .min(0, 'Minimum : 0.')
  .max(10, 'Maximum : 10.');

export const newBriefSchema = z
  .object({
    productType: z.enum(['parfum', 'arome']),
    brief: z.string().trim().min(1, 'Renseignez la demande du client.'),
    clientName: z.string().trim().min(1, 'Renseignez le nom du client.'),
    market: z
      .string()
      .refine(
        (value) => markets.includes(value),
        'Sélectionnez un marché visé.',
      ),
    category: z.string().min(1, 'Sélectionnez une catégorie de produit.'),
    clientType: z
      .string()
      .refine(
        (value) => clientTypes.includes(value),
        'Sélectionnez un type de client.',
      ),
    preferences: z.object({
      gourmand: preference,
      premium: preference,
      naturel: preference,
      audace: preference,
      bien_etre: preference,
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.category &&
      !categories[data.productType].includes(data.category)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message: 'Sélectionnez une catégorie correspondant au type de produit.',
      });
    }
  });

export type NewBriefForm = z.infer<typeof newBriefSchema>;
