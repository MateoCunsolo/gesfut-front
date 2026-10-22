import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TournamentResponseFull } from '../../models/tournamentResponse';

/** Caché en memoria del torneo completo por código. Sin dependencias para poder usarse desde interceptores. */
@Injectable({ providedIn: 'root' })
export class TournamentCache {
  static readonly TTL_MS = 60_000;
  private entries = new Map<string, { at: number; value$: Observable<TournamentResponseFull> }>();

  get(code: string): Observable<TournamentResponseFull> | undefined {
    const entry = this.entries.get(code);
    if (!entry) return undefined;
    if (Date.now() - entry.at > TournamentCache.TTL_MS) { this.entries.delete(code); return undefined; }
    return entry.value$;
  }

  set(code: string, value$: Observable<TournamentResponseFull>): void {
    this.entries.set(code, { at: Date.now(), value$ });
  }

  invalidate(code?: string): void {
    if (code) this.entries.delete(code); else this.entries.clear();
  }
}
