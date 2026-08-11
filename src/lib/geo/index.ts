import divisoes from "./divisoes-portugal.json";

export interface Concelho {
  concelho: string;
  freguesias: string[];
}

export interface Distrito {
  distrito: string;
  concelhos: Concelho[];
}

const DIVISOES = divisoes as Distrito[];

export function getDistritos(): string[] {
  return DIVISOES.map((d) => d.distrito);
}

export function getConcelhosPorDistrito(distrito: string): string[] {
  return (
    DIVISOES.find((d) => d.distrito === distrito)?.concelhos.map(
      (c) => c.concelho,
    ) ?? []
  );
}

export function getFreguesiasPorConcelho(concelho: string): string[] {
  for (const d of DIVISOES) {
    const c = d.concelhos.find((c) => c.concelho === concelho);
    if (c) return c.freguesias;
  }
  return [];
}

export function findDistritoPorConcelho(concelho: string): string | null {
  return DIVISOES.find((d) =>
    d.concelhos.some((c) => c.concelho === concelho),
  )?.distrito ?? null;
}
