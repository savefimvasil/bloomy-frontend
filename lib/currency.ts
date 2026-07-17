const _GBP2 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });
const _GBP0 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 });

export const fmtGBP = (n: number) => _GBP2.format(n);
export const fmtGBP0 = (n: number) => _GBP0.format(n);
