export function inicioDelDia(d = new Date()): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function inicioDeSemana(d = new Date()): Date {
  const r = inicioDelDia(d);
  const dia = r.getDay() === 0 ? 7 : r.getDay(); // lunes = 1 ... domingo = 7
  r.setDate(r.getDate() - (dia - 1));
  return r;
}

export function inicioDelMes(d = new Date()): Date {
  const r = new Date(d);
  r.setDate(1);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function haceNDias(n: number, d = new Date()): Date {
  const r = inicioDelDia(d);
  r.setDate(r.getDate() - n);
  return r;
}
