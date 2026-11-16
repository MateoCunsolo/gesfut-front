export const ADD_PLAYER_FORBIDDEN_MESSAGE =
  'No tenés permiso para agregar un jugador en este equipo. Si acabás de cambiar de cuenta en otra pestaña, recargá para actualizar la sesión.';

/** Mensaje claro si getTeam responde 403 al abrir Agregar jugador; si no, null. */
export function addPlayerForbiddenMessage(status: number | undefined | null): string | null {
  return status === 403 ? ADD_PLAYER_FORBIDDEN_MESSAGE : null;
}
