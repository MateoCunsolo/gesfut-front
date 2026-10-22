/** Loop 10: valida las filas del Excel antes de crear equipos (antes se mandaban filas vacias o incompletas). */
export const EXCEL_MAX_BYTES = 2 * 1024 * 1024;
export const EXCEL_MAX_ROWS = 2000;
export interface ExcelTeam { name: string; color: string; players: { name: string; lastName: string; number: number; isCaptain: boolean; isGoalKeeper: boolean }[] }
export interface ExcelParse { teams: ExcelTeam[]; errors: string[] }
const txt = (v: unknown) => String(v ?? '').trim();
const yes = (v: unknown) => v === true || v === 1 || ['SI', 'S\u00cd', 'TRUE', 'VERDADERO', 'X', '1'].includes(txt(v).toUpperCase());
const norm = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).map(([k, v]) => [txt(k).toUpperCase(), v]));
export function parseTeamRows(rows: Record<string, unknown>[]): ExcelParse {
  const errors: string[] = [];
  if (rows.length > EXCEL_MAX_ROWS) return { teams: [], errors: ['El archivo tiene ' + rows.length + ' filas; el m\u00e1ximo es ' + EXCEL_MAX_ROWS + '.'] };
  const teams = new Map<string, ExcelTeam>();
  rows.forEach((raw, i) => {
    const row = norm(raw); const line = 'Fila ' + (i + 2);
    const team = txt(row['EQUIPO']), name = txt(row['NOMBRE']), lastName = txt(row['APELLIDO']), dorsal = txt(row['DORSAL']);
    if (!team && !name && !lastName && !dorsal) return;
    const problems: string[] = [];
    if (team.length < 3 || team.length > 50) problems.push('equipo de 3 a 50 letras');
    if (name.length < 3 || name.length > 50) problems.push('nombre de 3 a 50 letras');
    if (lastName.length < 3 || lastName.length > 50) problems.push('apellido de 3 a 50 letras');
    const number = Number(dorsal);
    if (!/^\d{1,2}$/.test(dorsal)) problems.push('dorsal de 0 a 99');
    if (problems.length) { errors.push(line + ': falta ' + problems.join(', ')); return; }
    const key = team.toUpperCase();
    if (!teams.has(key)) teams.set(key, { name: team, color: txt(row['COLOR_CAMISETA']), players: [] });
    const t = teams.get(key)!;
    if (t.players.some(p => p.number === number)) { errors.push(line + ': el dorsal ' + number + ' ya est\u00e1 en ' + t.name); return; }
    if (t.players.some(p => p.name.toUpperCase() === name.toUpperCase() && p.lastName.toUpperCase() === lastName.toUpperCase())) { errors.push(line + ': ' + name + ' ' + lastName + ' est\u00e1 repetido en ' + t.name); return; }
    t.players.push({ name, lastName, number, isCaptain: yes(row['CAPITAN']), isGoalKeeper: yes(row['ARQUERO']) });
  });
  for (const t of teams.values()) {
    const captains = t.players.filter(p => p.isCaptain).length;
    if (t.players.length < 2) errors.push(t.name + ': necesita al menos 2 jugadores');
    if (captains !== 1) errors.push(t.name + ': necesita exactamente 1 capit\u00e1n (tiene ' + captains + ')');
    if (!t.players.some(p => p.isGoalKeeper)) errors.push(t.name + ': necesita al menos 1 arquero');
  }
  if (!errors.length && !teams.size) errors.push('No se encontraron jugadores en el archivo.');
  return { teams: [...teams.values()], errors };
}
