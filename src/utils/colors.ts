const PALETA_ESPECIES = [
  "var(--water)",
  "var(--clay)",
  "var(--leaf)",
  "var(--water-mid)",
  "var(--amber)",
  "var(--danger)",
];

export function colorDeEspecie(nombre: string): string {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = (hash * 31 + nombre.charCodeAt(i)) >>> 0;
  }
  return PALETA_ESPECIES[hash % PALETA_ESPECIES.length];
}
