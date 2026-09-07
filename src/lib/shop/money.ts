/** Formateo de precios. COP sin decimales, formato colombiano. */
export const CURRENCY = "COP";

const fmt = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export const money = (n: number): string => fmt.format(n);
