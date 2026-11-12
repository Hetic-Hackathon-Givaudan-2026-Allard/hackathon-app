import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  requestRecommendation,
  type RecommendationResponse,
} from '@/services/data-api';
import { RecommendationResult } from '@/components/recommendation-result';
import {
  categories,
  markets,
  clientTypes,
  styleAxes,
  newBriefSchema,
  type ProductType,
  type StyleAxis,
  type NewBriefForm,
} from '@/schemas/new-brief';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CircleX, LoaderCircle, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function initialForm(): NewBriefForm {
  return {
    productType: 'parfum' as ProductType,
    brief: '',
    preferences: {
      gourmand: 5,
      premium: 5,
      naturel: 5,
      audace: 5,
      bien_etre: 5,
    } as Record<StyleAxis, number>,
    clientName: '',
    market: '',
    category: '',
    clientType: '',
  };
}

const apiUrl = import.meta.env.VITE_DATA_API_URL || 'http://localhost:8000';
const mockMode = import.meta.env.VITE_DATA_API_MODE !== 'real';

const pillClass =
  'h-10 cursor-pointer rounded-full px-5 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground';

function FieldError({
  field,
  errors,
}: {
  field: string;
  errors: Record<string, string>;
}) {
  return errors[field] ? (
    <div
      className="flex items-center gap-2 mt-1 text-sm text-destructive"
      role="alert"
    >
      <CircleX className="h-4 w-4 text-destructive" />
      <p id={`${field}-error`} className="text-sm text-destructive">
        {errors[field]}
      </p>
    </div>
  ) : null;
}

export default function NewBriefPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [pending, setPending] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(null);
  const request = useRef<AbortController | null>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  useEffect(
    () => () => {
      request.current?.abort();
      toast.dismiss('recommendation-error');
    },
    [],
  );

  function validate(value: NewBriefForm) {
    const result = newBriefSchema.safeParse(value);
    const nextErrors: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path.join('.');
        nextErrors[key] ??= issue.message;
      }
    }
    setErrors(nextErrors);
    return result;
  }

  function updateForm(update: (previous: NewBriefForm) => NewBriefForm) {
    request.current?.abort();
    request.current = null;
    setPending(false);
    setRecommendation(null);
    toast.dismiss('recommendation-error');
    setResultOpen(false);
    const next = update(form);
    setForm(next);
    if (attempted) validate(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setRecommendation(null);
    toast.dismiss('recommendation-error');
    setResultOpen(false);
    setAttempted(true);
    const result = validate(form);
    if (!result.success) {
      const fieldIds: Record<string, string> = {
        brief: 'client-brief',
        clientName: 'client-name',
        market: 'target-market',
        category: 'product-category',
        clientType: 'client-type',
      };
      const firstField = String(result.error.issues[0]?.path[0]);
      document.getElementById(fieldIds[firstField])?.focus();
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    try {
      const response = await requestRecommendation(result.data, {
        baseUrl: apiUrl,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setRecommendation(response);
        setResultOpen(response.status === 'success');
      }
    } catch (error) {
      if (!controller.signal.aborted)
        toast.error('La recommandation a échoué', {
          id: 'recommendation-error',
          description:
            error instanceof Error
              ? error.message
              : 'Une erreur inattendue est survenue.',
          duration: 8000,
        });
    } finally {
      if (request.current === controller) {
        request.current = null;
        setPending(false);
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h1 id="page-title" className="text-2xl font-semibold tracking-tight">
          Que Cherche votre client ?
        </h1>
        <p className="text-muted-foreground">
          Décrivez sa demande avec ses mots, puis ajustez le style. L'outil
          propose le produit le plus adapté et explique pourquoi.
        </p>
      </div>
      {mockMode && (
        <aside
          role="note"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
        >
          Mode simulation : produits fictifs et score fixe de 85 %. Aucune IA ni
          base de catalogue réelle n’est utilisée.
        </aside>
      )}
      <form
        className="flex flex-col gap-6 [--primary:#4e3cbb] [--primary-foreground:#fff] [--ring:#4e3cbb]"
        noValidate
        onSubmit={handleSubmit}
        onReset={() => {
          request.current?.abort();
          request.current = null;
          setPending(false);
          setRecommendation(null);
          toast.dismiss('recommendation-error');
          setResultOpen(false);
          setForm(initialForm());
          setErrors({});
          setAttempted(false);
        }}
      >
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-sm text-destructive">
            Complétez les informations indiquées avant de continuer.
          </p>
        )}
        <ToggleGroup
          type="single"
          variant="outline"
          value={form.productType}
          aria-label="Type de produit"
          onValueChange={(value) => {
            if (value === 'parfum' || value === 'arome') {
              updateForm((previous) => ({
                ...previous,
                productType: value,
                category:
                  value === previous.productType ? previous.category : '',
              }));
            }
          }}
        >
          <ToggleGroupItem type="button" value="parfum" className={pillClass}>
            Parfum
          </ToggleGroupItem>
          <ToggleGroupItem type="button" value="arome" className={pillClass}>
            Arômes
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Card className="min-w-0 rounded-2xl py-6 md:py-8">
            <CardHeader className="px-6 md:px-8">
              <CardTitle>
                <Label htmlFor="client-brief" className="text-lg font-semibold">
                  La demande du client
                </Label>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-8 px-6 md:px-8">
              <Textarea
                id="client-brief"
                name="brief"
                aria-required="true"
                aria-invalid={!!errors.brief}
                aria-describedby={errors.brief ? 'brief-error' : undefined}
                placeholder="Décrivez les envies, les attentes et les contraintes de votre client…"
                value={form.brief}
                onChange={(event) =>
                  updateForm((previous) => ({
                    ...previous,
                    brief: event.target.value,
                  }))
                }
                className="min-h-40 resize-y rounded-xl text-base md:text-base"
              />
              <FieldError field="brief" errors={errors} />
              <Separator />
              <fieldset className="min-w-0">
                <legend className="mb-6 text-lg font-semibold">
                  Profil de style
                </legend>
                <div className="flex flex-col gap-7">
                  {styleAxes.map((axis) => (
                    <div
                      key={axis.key}
                      className="grid grid-cols-[1fr_auto] items-center gap-4 sm:grid-cols-[100px_minmax(0,1fr)_48px]"
                    >
                      <span
                        id={`${axis.key}-label`}
                        className="text-sm font-medium"
                      >
                        {axis.label}
                      </span>
                      <Slider
                        name={axis.key}
                        aria-label={axis.label}
                        aria-invalid={!!errors[`preferences.${axis.key}`]}
                        aria-describedby={
                          errors[`preferences.${axis.key}`]
                            ? `preferences.${axis.key}-error`
                            : undefined
                        }
                        min={0}
                        max={10}
                        step={1}
                        value={[form.preferences[axis.key]]}
                        onValueChange={([value]) =>
                          updateForm((previous) => ({
                            ...previous,
                            preferences: {
                              ...previous.preferences,
                              [axis.key]: value,
                            },
                          }))
                        }
                        className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto"
                      />
                      <output
                        className="col-start-2 row-start-1 text-right text-sm text-muted-foreground tabular-nums sm:col-start-3 sm:row-start-auto"
                        aria-labelledby={`${axis.key}-label`}
                      >
                        {form.preferences[axis.key]} / 10
                      </output>
                      <FieldError
                        field={`preferences.${axis.key}`}
                        errors={errors}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            </CardContent>
          </Card>

          <Card className="min-w-0 rounded-2xl py-6 md:py-8">
            <CardHeader className="px-6 md:px-8">
              <CardTitle className="text-lg font-semibold">
                Contexte du client
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 px-6 md:px-8">
              <div className="flex flex-col gap-2">
                <Label htmlFor="client-name">Nom du client</Label>
                <Input
                  id="client-name"
                  name="client_name"
                  aria-required="true"
                  aria-invalid={!!errors.clientName}
                  aria-describedby={
                    errors.clientName ? 'clientName-error' : undefined
                  }
                  placeholder="Nom de l’entreprise ou de la marque"
                  value={form.clientName}
                  onChange={(event) =>
                    updateForm((previous) => ({
                      ...previous,
                      clientName: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl"
                />
                <FieldError field="clientName" errors={errors} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="target-market">Marché visé</Label>
                <Select
                  name="region"
                  value={form.market}
                  onValueChange={(market) =>
                    updateForm((previous) => ({ ...previous, market }))
                  }
                >
                  <SelectTrigger
                    id="target-market"
                    aria-required="true"
                    aria-invalid={!!errors.market}
                    aria-describedby={
                      errors.market ? 'market-error' : undefined
                    }
                    className="h-11 w-full rounded-xl"
                  >
                    <SelectValue placeholder="Sélectionner un marché" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market) => (
                      <SelectItem key={market} value={market}>
                        {market}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="market" errors={errors} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="product-category">Catégorie de produit</Label>
                <Select
                  name="category"
                  value={form.category}
                  onValueChange={(category) =>
                    updateForm((previous) => ({ ...previous, category }))
                  }
                >
                  <SelectTrigger
                    id="product-category"
                    aria-required="true"
                    aria-invalid={!!errors.category}
                    aria-describedby={
                      errors.category ? 'category-error' : undefined
                    }
                    className="h-11 w-full rounded-xl"
                  >
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[form.productType].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="category" errors={errors} />
              </div>
              <fieldset className="min-w-0">
                <legend className="mb-3 text-sm font-medium">
                  Type de client
                </legend>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={form.clientType}
                  id="client-type"
                  tabIndex={-1}
                  aria-label="Type de client"
                  aria-required="true"
                  aria-invalid={!!errors.clientType}
                  aria-describedby={
                    errors.clientType ? 'clientType-error' : undefined
                  }
                  className="flex-wrap justify-start"
                  onValueChange={(clientType) => {
                    if (clientType)
                      updateForm((previous) => ({ ...previous, clientType }));
                  }}
                >
                  {clientTypes.map((type) => (
                    <ToggleGroupItem
                      type="button"
                      key={type}
                      value={type}
                      className={pillClass}
                    >
                      {type}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldError field="clientType" errors={errors} />
              </fieldset>
              <aside className="rounded-xl bg-primary/10 p-4 text-sm leading-relaxed">
                <p className="mb-1 font-semibold text-primary">Astuce</p>
                <p>
                  Plus le brief est précis, plus la recommandation est
                  pertinente. Vous pourrez toujours l’ajuster ensuite.
                </p>
              </aside>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            ref={submitButton}
            disabled={pending}
            type="submit"
            className="cursor-pointer h-12 rounded-xl px-6"
          >
            {pending && (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            )}
            {pending ? 'Recherche en cours…' : 'Trouver le meilleur Produit'}
          </Button>
          <Button
            type="reset"
            variant="outline"
            className="h-12 rounded-xl px-6 cursor-pointer"
          >
            Effacer
          </Button>
        </div>
      </form>
      <section
        aria-label="Résultat de la recommandation"
        aria-live="polite"
        aria-busy={pending}
        className="space-y-4"
      >
        {pending && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border p-4 text-sm"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin motion-reduce:animate-none"
            />
            Recherche du meilleur produit en cours…
          </div>
        )}
        {recommendation?.status === 'no_match' && (
          <RecommendationResult result={recommendation} />
        )}
      </section>
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent
          className="flex max-h-[90dvh] w-[92vw] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl"
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            submitButton.current?.focus();
          }}
        >
          <DialogHeader className="relative shrink-0 border-b px-5 py-5 pr-14 text-left sm:px-7 sm:pr-16">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#4e3cbb]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Votre sélection
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Votre recommandation
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {mockMode
                ? 'Aperçu de démonstration · Produit fictif et score simulé.'
                : 'Un produit sélectionné à partir des attentes de votre client.'}
            </DialogDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fermer la recommandation"
              className="absolute right-4 top-5 rounded-full text-muted-foreground"
              onClick={() => setResultOpen(false)}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
            {recommendation?.status === 'success' && (
              <RecommendationResult result={recommendation} />
            )}
          </div>
          <DialogFooter className="m-0 shrink-0 flex-row items-center justify-end rounded-none border-t bg-muted/25 px-5 py-4 sm:px-7">
            <Button
              type="button"
              className="h-10 cursor-pointer rounded-lg bg-[#4e3cbb] px-5 text-white hover:bg-[#40309e]"
              onClick={() => setResultOpen(false)}
            >
              Revenir au brief
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
