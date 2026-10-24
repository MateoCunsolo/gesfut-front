/** "Retomar" (review 24/10, privacidad): el nombre del torneo se publica SOLO si la propiedad ya se confirmo.
 *  Si llega antes queda guardado en privado; si la propiedad da false se descarta y nunca se muestra. */
export class OwnedNameGate {
  private pending = '';
  private owned: boolean | null = null;
  constructor(private publish: (name: string) => void) {}
  name(n: string | null | undefined) {
    if (this.owned === false) return;
    if (this.owned === true) this.publish(n ?? ''); else this.pending = n ?? '';
  }
  ownership(isMine: boolean) {
    this.owned = isMine;
    if (isMine) { if (this.pending) this.publish(this.pending); } else this.publish('');
    this.pending = '';
  }
}
