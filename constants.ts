export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_TESTNET_RPC = "https://testnet-rpc.monad.xyz";
export const MONAD_EXPLORER = "https://testnet.monadexplorer.com";

export const MOCK_DELAY_MS = 400; // Simulate Monad's 400ms block time

export const DEFAULT_TEMPLATES = {
  hackathon: {
    title: "Who will win the Monad Blitz Hackathon?",
    options: ["Team Alpha", "Room-Market", "DeFi King", "SpeedRacer"],
    type: 'PREDICTION',
    entryFee: 1
  },
  sports: {
    title: "Lakers vs Warriors - Who wins tonight?",
    options: ["Lakers", "Warriors", "Draw"],
    type: 'PREDICTION',
    entryFee: 5
  },
  arena: {
    title: "Monad Speed Arena - Click Battle",
    options: [],
    type: 'ARENA',
    entryFee: 1
  }
};