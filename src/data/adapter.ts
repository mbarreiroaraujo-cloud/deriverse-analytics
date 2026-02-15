/**
 * Deriverse SDK Adapter Interface
 *
 * This module defines the interface for data sources. Currently implemented
 * with mock data. When the Deriverse SDK (@deriverse/kit) becomes available,
 * a new adapter can be created that implements this same interface using
 * real on-chain data.
 *
 * Usage:
 *   const adapter = createMockAdapter();
 *   const trades = await adapter.getTrades();
 *   const portfolio = await adapter.getPortfolio();
 */

import type { Trade, PortfolioState } from './types';
import { generateTrades, generatePortfolioState } from './mockGenerator';

export interface DataAdapter {
  getTrades(): Promise<Trade[]>;
  getPortfolio(): Promise<PortfolioState>;
  isConnected(): boolean;
  getWalletAddress(): string | null;
}

export function createMockAdapter(): DataAdapter {
  const trades = generateTrades(42);
  const portfolio = generatePortfolioState();

  return {
    async getTrades() {
      return trades;
    },
    async getPortfolio() {
      return portfolio;
    },
    isConnected() {
      return true;
    },
    getWalletAddress() {
      return '7xKpR4nM8qT5vB2wE9hJ6cL3fA1gD0uY8iO4sP3mNq';
    },
  };
}

/**
 * Future: Deriverse SDK adapter
 *
 * export function createDeriverseAdapter(connection: Connection, wallet: WalletAdapter): DataAdapter {
 *   const programId = new PublicKey('CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2');
 *
 *   return {
 *     async getTrades() {
 *       // Fetch trade history from Deriverse program accounts
 *       const accounts = await connection.getProgramAccounts(programId, {
 *         filters: [{ memcmp: { offset: 0, bytes: wallet.publicKey.toBase58() } }]
 *       });
 *       return accounts.map(parseTradeAccount);
 *     },
 *     async getPortfolio() {
 *       // Fetch current positions and margin state
 *       const portfolioAccount = await connection.getAccountInfo(
 *         derivePortfolioPDA(wallet.publicKey, programId)
 *       );
 *       return parsePortfolioAccount(portfolioAccount);
 *     },
 *     isConnected() {
 *       return wallet.connected;
 *     },
 *     getWalletAddress() {
 *       return wallet.publicKey?.toBase58() || null;
 *     },
 *   };
 * }
 */
