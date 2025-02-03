export interface PrizesRequest {
  prizes: Prize[];
  code: string;
}

export interface Prize {
  type: string;
  description: string;
  position: number;
}

export interface updatePrizeDescription {
  type: string;
  description: string;
  position: number;
}
