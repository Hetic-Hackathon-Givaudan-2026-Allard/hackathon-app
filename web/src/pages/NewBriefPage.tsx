import { useState, type FormEvent } from 'react';
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
import { CircleX } from 'lucide-react';

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
    const next = update(form);
    setForm(next);
    if (attempted) validate(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    // Le formulaire est valide. Le traitement sera ajouté lors de l’intégration Data.
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-6">
        <span className="text-sm text-muted-foreground uppercase">
          Étape 1 sur 2
        </span>
        <h1 id="page-title" className="text-2xl font-semibold tracking-tight">
          Que Cherche votre client ?
        </h1>
        <p className="text-muted-foreground">
          Décrivez sa demande avec ses mots, puis ajustez le style. L'outil
          propose le produit le plus adapté et explique pourquoi.
        </p>
      </div>
      <form
        className="flex flex-col gap-6 [--primary:#4e3cbb] [--primary-foreground:#fff] [--ring:#4e3cbb]"
        noValidate
        onSubmit={handleSubmit}
        onReset={() => {
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
          <Button type="submit" className="cursor-pointer h-12 rounded-xl px-6">
            Trouver le meilleur Produit
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
    </div>
  );
}
