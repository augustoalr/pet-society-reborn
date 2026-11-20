/**
 * Modelos de dominio inmutables para la economía del juego.
 *
 * Economía dual:
 * - `coins`: moneda regular ganada en minijuegos, cuidados y recompensas.
 * - `cash`: moneda premium preparada para monetización futura y compras exclusivas.
 */

export interface Wallet {
  readonly coins: number;
  readonly cash: number;
}

export type CurrencyType = 'coins' | 'cash';

export type TransactionType = 'credit' | 'debit';

export type EconomyErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_AMOUNT'
  | 'OVERFLOW_LIMIT';

export interface Transaction {
  readonly id: string;
  readonly type: TransactionType;
  readonly currency: CurrencyType;
  readonly amount: number;
  readonly description: string;
  readonly timestamp: number;
  readonly balanceAfter: number;
}

export interface TransactionResult {
  readonly success: boolean;
  readonly wallet: Wallet;
  readonly error?: EconomyErrorCode;
  readonly transaction?: Transaction;
  readonly transactions?: readonly Transaction[];
}

export interface PurchaseCost {
  readonly coins?: number;
  readonly cash?: number;
}
