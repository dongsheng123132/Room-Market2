
export enum MarketType {
  ARENA = 'ARENA',
  PREDICTION = 'PREDICTION',
  RED_PACKET = 'RED_PACKET'
}

export interface Market {
  id: string;
  type: MarketType;
  title: string;
  options: string[]; // For Arena this might be empty or player IDs
  entryFee: number;
  totalPool: number;
  createdAt: number;
  status: 'OPEN' | 'ACTIVE' | 'SETTLED';
  creator: string;
  // Specific to Red Packet
  maxClaimers?: number;
  claimedCount?: number;
}

export interface Player {
  address: string;
  score: number; // For Arena
  betOption?: number; // For Prediction
  betAmount?: number;
  claimedAmount?: number; // For Red Packet
}

export interface MarketState {
  market: Market;
  players: Player[];
  winner?: string;
  history: { timestamp: number, type: string, data: any }[];
}
