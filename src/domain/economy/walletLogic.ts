/**
 * Lógica pura de dominio para la economía y billetera dual (Coins y Cash).
 *
 * Principios:
 * - R-01 (SoC): Reglas de negocio puras, sin dependencias de UI ni persistencia.
 * - R-03 (Inmutabilidad por Defecto): Las instancias de Wallet son inmutables.
 * - R-05 (Early Return): Validaciones defensivas tempranas (montos no válidos, overflows, fondos insuficientes).
 * - R-13 ([DELICADA]): Casos de borde numéricos y prevención de saldos negativos o exploits de costo negativo.
 * - R-15 (Economía Segura): Auditoría mediante registros de transacción detallados.
 */

import type {
  Wallet,
  CurrencyType,
  Transaction,
  TransactionResult,
  PurchaseCost,
} from './types';

let transactionCounter = 0;

/**
 * Generador de identificadores únicos para transacciones de auditoría.
 */
export function generateTransactionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  transactionCounter += 1;
  return `tx_${Date.now()}_${transactionCounter}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Valida de forma estricta que un monto monetario sea un entero positivo finito.
 *
 * Rechaza:
 * - Valores <= 0 (ceros y negativos)
 * - Decimales / números de coma flotante
 * - NaN, Infinity, -Infinity
 * - Tipos no numéricos
 */
export function validateAmount(amount: number): boolean {
  return (
    typeof amount === 'number' &&
    Number.isFinite(amount) &&
    Number.isInteger(amount) &&
    amount > 0
  );
}

/**
 * Valida que un costo sea un entero no negativo finito o undefined.
 */
function isValidCostComponent(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 0
  );
}

/**
 * Acredita una cantidad de una divisa específica a la billetera.
 *
 * Retorna un nuevo objeto Wallet inmutable y el registro de la transacción.
 */
export function creditCurrency(
  wallet: Wallet,
  currency: CurrencyType,
  amount: number,
  description?: string
): TransactionResult {
  if (!validateAmount(amount)) {
    return {
      success: false,
      wallet,
      error: 'INVALID_AMOUNT',
    };
  }

  const currentBalance = wallet[currency];

  // Prevenir desbordamiento de Number.MAX_SAFE_INTEGER
  if (amount > Number.MAX_SAFE_INTEGER - currentBalance) {
    return {
      success: false,
      wallet,
      error: 'OVERFLOW_LIMIT',
    };
  }

  const balanceAfter = currentBalance + amount;
  const newWallet: Wallet = {
    ...wallet,
    [currency]: balanceAfter,
  };

  const transaction: Transaction = {
    id: generateTransactionId(),
    type: 'credit',
    currency,
    amount,
    description: description ?? `Crédito de ${amount} ${currency}`,
    timestamp: Date.now(),
    balanceAfter,
  };

  return {
    success: true,
    wallet: newWallet,
    transaction,
    transactions: [transaction],
  };
}

/**
 * Debita una cantidad de una divisa específica de la billetera.
 *
 * Rechaza montos inválidos o saldo insuficiente sin mutar el Wallet original.
 */
export function debitCurrency(
  wallet: Wallet,
  currency: CurrencyType,
  amount: number,
  description?: string
): TransactionResult {
  if (!validateAmount(amount)) {
    return {
      success: false,
      wallet,
      error: 'INVALID_AMOUNT',
    };
  }

  const currentBalance = wallet[currency];
  if (currentBalance < amount) {
    return {
      success: false,
      wallet,
      error: 'INSUFFICIENT_FUNDS',
    };
  }

  const balanceAfter = currentBalance - amount;
  const newWallet: Wallet = {
    ...wallet,
    [currency]: balanceAfter,
  };

  const transaction: Transaction = {
    id: generateTransactionId(),
    type: 'debit',
    currency,
    amount,
    description: description ?? `Débito de ${amount} ${currency}`,
    timestamp: Date.now(),
    balanceAfter,
  };

  return {
    success: true,
    wallet: newWallet,
    transaction,
    transactions: [transaction],
  };
}

/**
 * Verifica si la billetera dispone de fondos suficientes para cubrir un costo compuesto.
 *
 * Rechaza de forma defensiva costos con números negativos, flotantes, NaN o infinitos.
 */
export function canAfford(
  wallet: Wallet,
  cost?: PurchaseCost | null
): boolean {
  if (!cost) {
    return true;
  }

  const { coins, cash } = cost;

  if (!isValidCostComponent(coins) || !isValidCostComponent(cash)) {
    return false;
  }

  const coinsRequired = coins ?? 0;
  const cashRequired = cash ?? 0;

  return wallet.coins >= coinsRequired && wallet.cash >= cashRequired;
}

/**
 * Ejecuta una compra compuesta atómica (débito de Coins y/o Cash).
 *
 * Garantías de seguridad:
 * - Si cualquier costo es negativo, decimal, NaN o no finito, rechaza con `INVALID_AMOUNT`.
 * - Si falta saldo en cualquiera de las divisas requeridas, rechaza con `INSUFFICIENT_FUNDS`
 *   y la billetera permanece estrictamente intacta (atomicidad total).
 * - Si el costo total es 0 o no se especifica costo, retorna éxito sin debitar nada.
 * - Registra una transacción por cada divisa efectivamente debitada.
 */
export function purchase(
  wallet: Wallet,
  cost?: PurchaseCost | null,
  description?: string
): TransactionResult {
  if (!cost) {
    return {
      success: true,
      wallet,
      transactions: [],
    };
  }

  const { coins, cash } = cost;

  // Validación estricta defensiva contra exploits de costo negativo y datos inválidos
  if (!isValidCostComponent(coins) || !isValidCostComponent(cash)) {
    return {
      success: false,
      wallet,
      error: 'INVALID_AMOUNT',
    };
  }

  const coinsCost = coins ?? 0;
  const cashCost = cash ?? 0;

  // Si no se requiere ningún gasto
  if (coinsCost === 0 && cashCost === 0) {
    return {
      success: true,
      wallet,
      transactions: [],
    };
  }

  // Validación atómica de saldo suficiente
  if (wallet.coins < coinsCost || wallet.cash < cashCost) {
    return {
      success: false,
      wallet,
      error: 'INSUFFICIENT_FUNDS',
    };
  }

  const now = Date.now();
  const newWallet: Wallet = {
    coins: wallet.coins - coinsCost,
    cash: wallet.cash - cashCost,
  };

  const transactions: Transaction[] = [];

  if (coinsCost > 0) {
    transactions.push({
      id: generateTransactionId(),
      type: 'debit',
      currency: 'coins',
      amount: coinsCost,
      description: description ?? `Compra: débito de ${coinsCost} coins`,
      timestamp: now,
      balanceAfter: newWallet.coins,
    });
  }

  if (cashCost > 0) {
    transactions.push({
      id: generateTransactionId(),
      type: 'debit',
      currency: 'cash',
      amount: cashCost,
      description: description ?? `Compra: débito de ${cashCost} cash`,
      timestamp: now,
      balanceAfter: newWallet.cash,
    });
  }

  return {
    success: true,
    wallet: newWallet,
    transactions,
    ...(transactions.length === 1 ? { transaction: transactions[0] } : {}),
  };
}
