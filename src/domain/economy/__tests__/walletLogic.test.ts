import { describe, it, expect } from 'vitest';
import type { Wallet } from '../types';
import {
  validateAmount,
  creditCurrency,
  debitCurrency,
  canAfford,
  purchase,
  generateTransactionId,
} from '../walletLogic';

describe('walletLogic (Dominio de Economía)', () => {
  const initialWallet: Wallet = Object.freeze({
    coins: 100,
    cash: 10,
  });

  describe('generateTransactionId', () => {
    it('genera identificadores de transacción únicos no vacíos', () => {
      const id1 = generateTransactionId();
      const id2 = generateTransactionId();

      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
      expect(id1).not.toBe(id2);
    });
  });

  describe('validateAmount', () => {
    it('acepta enteros positivos válidos y límites seguros', () => {
      expect(validateAmount(1)).toBe(true);
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(1_000_000)).toBe(true);
      expect(validateAmount(1e6)).toBe(true);
      expect(validateAmount(Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    it('rechaza cero (0) y ceros negativos (-0)', () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-0)).toBe(false);
    });

    it('rechaza números negativos y límites negativos', () => {
      expect(validateAmount(-1)).toBe(false);
      expect(validateAmount(-50)).toBe(false);
      expect(validateAmount(-1_000_000)).toBe(false);
      expect(validateAmount(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    it('rechaza números con decimales (flotantes)', () => {
      expect(validateAmount(0.5)).toBe(false);
      expect(validateAmount(10.99)).toBe(false);
      expect(validateAmount(100.0001)).toBe(false);
      expect(validateAmount(1e-5)).toBe(false);
    });

    it('rechaza valores numéricos no finitos (NaN, Infinity)', () => {
      expect(validateAmount(NaN)).toBe(false);
      expect(validateAmount(Infinity)).toBe(false);
      expect(validateAmount(-Infinity)).toBe(false);
    });

    it('rechaza tipos no numéricos en runtime', () => {
      expect(validateAmount(null as unknown as number)).toBe(false);
      expect(validateAmount(undefined as unknown as number)).toBe(false);
      expect(validateAmount('100' as unknown as number)).toBe(false);
      expect(validateAmount({} as unknown as number)).toBe(false);
    });
  });

  describe('creditCurrency', () => {
    it('acredita monedas regulares (coins) correctamente de forma inmutable con descripción personalizada', () => {
      const result = creditCurrency(initialWallet, 'coins', 50, 'Recompensa de minijuego');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.wallet.coins).toBe(150);
      expect(result.wallet.cash).toBe(10);
      expect(result.wallet).not.toBe(initialWallet);
      expect(initialWallet.coins).toBe(100);

      expect(result.transaction).toBeDefined();
      expect(result.transaction?.type).toBe('credit');
      expect(result.transaction?.currency).toBe('coins');
      expect(result.transaction?.amount).toBe(50);
      expect(result.transaction?.balanceAfter).toBe(150);
      expect(result.transaction?.description).toBe('Recompensa de minijuego');
      expect(result.transaction?.timestamp).toBeGreaterThan(0);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions?.[0]).toBe(result.transaction);
    });

    it('acredita moneda premium (cash) correctamente con descripción por defecto', () => {
      const result = creditCurrency(initialWallet, 'cash', 25);

      expect(result.success).toBe(true);
      expect(result.wallet.cash).toBe(35);
      expect(result.wallet.coins).toBe(100);
      expect(result.transaction?.type).toBe('credit');
      expect(result.transaction?.currency).toBe('cash');
      expect(result.transaction?.amount).toBe(25);
      expect(result.transaction?.balanceAfter).toBe(35);
      expect(result.transaction?.description).toBe('Crédito de 25 cash');
    });

    it('acredita sobre una billetera con saldo cero inicial', () => {
      const zeroWallet: Wallet = { coins: 0, cash: 0 };
      const resultCoins = creditCurrency(zeroWallet, 'coins', 100);
      expect(resultCoins.success).toBe(true);
      expect(resultCoins.wallet.coins).toBe(100);
      expect(resultCoins.wallet.cash).toBe(0);

      const resultCash = creditCurrency(zeroWallet, 'cash', 50);
      expect(resultCash.success).toBe(true);
      expect(resultCash.wallet.cash).toBe(50);
      expect(resultCash.wallet.coins).toBe(0);
    });

    it('rechaza montos inválidos sin alterar la billetera', () => {
      const invalidAmounts = [0, -10, 15.5, NaN, Infinity, -Infinity];

      for (const amount of invalidAmounts) {
        const result = creditCurrency(initialWallet, 'coins', amount);
        expect(result.success).toBe(false);
        expect(result.error).toBe('INVALID_AMOUNT');
        expect(result.wallet).toBe(initialWallet);
        expect(result.transaction).toBeUndefined();
      }
    });

    it('rechaza créditos que superen Number.MAX_SAFE_INTEGER (OVERFLOW_LIMIT)', () => {
      const nearLimitWallet: Wallet = {
        coins: Number.MAX_SAFE_INTEGER - 10,
        cash: 0,
      };

      // Justo en el límite -> Éxito
      const exactFit = creditCurrency(nearLimitWallet, 'coins', 10);
      expect(exactFit.success).toBe(true);
      expect(exactFit.wallet.coins).toBe(Number.MAX_SAFE_INTEGER);

      // Supera el límite -> OVERFLOW_LIMIT
      const overflowResult = creditCurrency(nearLimitWallet, 'coins', 11);
      expect(overflowResult.success).toBe(false);
      expect(overflowResult.error).toBe('OVERFLOW_LIMIT');
      expect(overflowResult.wallet).toBe(nearLimitWallet);
    });
  });

  describe('debitCurrency', () => {
    it('debita monedas regulares (coins) cuando hay saldo suficiente', () => {
      const result = debitCurrency(initialWallet, 'coins', 40, 'Compra de manzana');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.wallet.coins).toBe(60);
      expect(result.wallet.cash).toBe(10);
      expect(result.wallet).not.toBe(initialWallet);
      expect(initialWallet.coins).toBe(100);

      expect(result.transaction?.type).toBe('debit');
      expect(result.transaction?.currency).toBe('coins');
      expect(result.transaction?.amount).toBe(40);
      expect(result.transaction?.balanceAfter).toBe(60);
      expect(result.transaction?.description).toBe('Compra de manzana');
    });

    it('debita moneda premium (cash) cuando hay saldo suficiente con descripción por defecto', () => {
      const result = debitCurrency(initialWallet, 'cash', 10);

      expect(result.success).toBe(true);
      expect(result.wallet.cash).toBe(0);
      expect(result.wallet.coins).toBe(100);
      expect(result.transaction?.type).toBe('debit');
      expect(result.transaction?.currency).toBe('cash');
      expect(result.transaction?.amount).toBe(10);
      expect(result.transaction?.balanceAfter).toBe(0);
      expect(result.transaction?.description).toBe('Débito de 10 cash');
    });

    it('permite debitar la totalidad exacta del saldo quedando en 0', () => {
      const result = debitCurrency(initialWallet, 'coins', 100);
      expect(result.success).toBe(true);
      expect(result.wallet.coins).toBe(0);
    });

    it('rechaza débito si el saldo es insuficiente (saldo cero o parcial menor)', () => {
      // Saldo parcial insuficiente
      const insufficientResult = debitCurrency(initialWallet, 'coins', 101);
      expect(insufficientResult.success).toBe(false);
      expect(insufficientResult.error).toBe('INSUFFICIENT_FUNDS');
      expect(insufficientResult.wallet).toBe(initialWallet);
      expect(insufficientResult.transaction).toBeUndefined();

      // Saldo cero
      const zeroCashWallet: Wallet = { coins: 50, cash: 0 };
      const zeroResult = debitCurrency(zeroCashWallet, 'cash', 1);
      expect(zeroResult.success).toBe(false);
      expect(zeroResult.error).toBe('INSUFFICIENT_FUNDS');
      expect(zeroResult.wallet).toBe(zeroCashWallet);
    });

    it('rechaza montos inválidos en débito (negativos, cero, flotantes, NaN, Infinity)', () => {
      const invalidAmounts = [0, -1, -50, 4.5, NaN, Infinity, -Infinity];

      for (const amount of invalidAmounts) {
        const result = debitCurrency(initialWallet, 'coins', amount);
        expect(result.success).toBe(false);
        expect(result.error).toBe('INVALID_AMOUNT');
        expect(result.wallet).toBe(initialWallet);
      }
    });
  });

  describe('canAfford', () => {
    it('retorna true cuando la billetera tiene fondos suficientes', () => {
      expect(canAfford(initialWallet, { coins: 50 })).toBe(true);
      expect(canAfford(initialWallet, { cash: 5 })).toBe(true);
      expect(canAfford(initialWallet, { coins: 100, cash: 10 })).toBe(true);
      expect(canAfford(initialWallet, {})).toBe(true);
      expect(canAfford(initialWallet, { coins: 0, cash: 0 })).toBe(true);
      expect(canAfford(initialWallet, null)).toBe(true);
      expect(canAfford(initialWallet, undefined)).toBe(true);
    });

    it('retorna false cuando falta alguna divisa', () => {
      expect(canAfford(initialWallet, { coins: 101 })).toBe(false);
      expect(canAfford(initialWallet, { cash: 11 })).toBe(false);
      expect(canAfford(initialWallet, { coins: 50, cash: 15 })).toBe(false);
      expect(canAfford(initialWallet, { coins: 150, cash: 5 })).toBe(false);
    });

    it('retorna false ante costos inválidos (negativos, flotantes, NaN, no finitos)', () => {
      expect(canAfford(initialWallet, { coins: -10 })).toBe(false);
      expect(canAfford(initialWallet, { cash: -1 })).toBe(false);
      expect(canAfford(initialWallet, { coins: 10.5 })).toBe(false);
      expect(canAfford(initialWallet, { cash: 1.2 })).toBe(false);
      expect(canAfford(initialWallet, { coins: NaN })).toBe(false);
      expect(canAfford(initialWallet, { coins: Infinity })).toBe(false);
      expect(canAfford(initialWallet, { coins: -Infinity })).toBe(false);
    });
  });

  describe('purchase (Compra Compuesta Atómica)', () => {
    it('realiza una compra exitosa solo con coins', () => {
      const result = purchase(initialWallet, { coins: 30 }, 'Gorro azul');

      expect(result.success).toBe(true);
      expect(result.wallet.coins).toBe(70);
      expect(result.wallet.cash).toBe(10);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions?.[0].currency).toBe('coins');
      expect(result.transactions?.[0].amount).toBe(30);
      expect(result.transactions?.[0].description).toBe('Gorro azul');
      expect(result.transaction).toBe(result.transactions?.[0]);
    });

    it('realiza una compra exitosa solo con cash', () => {
      const result = purchase(initialWallet, { cash: 5 }, 'Poción especial');

      expect(result.success).toBe(true);
      expect(result.wallet.coins).toBe(100);
      expect(result.wallet.cash).toBe(5);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions?.[0].currency).toBe('cash');
      expect(result.transactions?.[0].amount).toBe(5);
    });

    it('realiza una compra dual exitosa (coins y cash combinados)', () => {
      const result = purchase(initialWallet, { coins: 50, cash: 4 }, 'Mueble exclusivo');

      expect(result.success).toBe(true);
      expect(result.wallet.coins).toBe(50);
      expect(result.wallet.cash).toBe(6);
      expect(result.transactions).toHaveLength(2);

      const [txCoins, txCash] = result.transactions!;
      expect(txCoins.currency).toBe('coins');
      expect(txCoins.amount).toBe(50);
      expect(txCoins.balanceAfter).toBe(50);

      expect(txCash.currency).toBe('cash');
      expect(txCash.amount).toBe(4);
      expect(txCash.balanceAfter).toBe(6);
    });

    it('permite una compra que consuma exactamente el saldo total de ambas divisas', () => {
      const result = purchase(initialWallet, { coins: 100, cash: 10 }, 'Limpieza total');

      expect(result.success).toBe(true);
      expect(result.wallet.coins).toBe(0);
      expect(result.wallet.cash).toBe(0);
      expect(result.transactions).toHaveLength(2);
    });

    it('retorna éxito sin debitar cuando el costo es 0 o vacío', () => {
      const emptyCost = purchase(initialWallet, {});
      expect(emptyCost.success).toBe(true);
      expect(emptyCost.wallet).toBe(initialWallet);
      expect(emptyCost.transactions).toHaveLength(0);

      const zeroCost = purchase(initialWallet, { coins: 0, cash: 0 });
      expect(zeroCost.success).toBe(true);
      expect(zeroCost.wallet).toBe(initialWallet);
      expect(zeroCost.transactions).toHaveLength(0);

      const nullCost = purchase(initialWallet, null);
      expect(nullCost.success).toBe(true);
      expect(nullCost.wallet).toBe(initialWallet);

      const undefinedCost = purchase(initialWallet, undefined);
      expect(undefinedCost.success).toBe(true);
      expect(undefinedCost.wallet).toBe(initialWallet);
    });

    it('garantiza atomicidad total: si falta coins, NO descuenta cash', () => {
      const result = purchase(initialWallet, { coins: 999, cash: 5 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_FUNDS');
      // La billetera queda intacta, cash NO fue descontado
      expect(result.wallet).toBe(initialWallet);
      expect(result.wallet.coins).toBe(100);
      expect(result.wallet.cash).toBe(10);
      expect(result.transaction).toBeUndefined();
      expect(result.transactions).toBeUndefined();
    });

    it('garantiza atomicidad total: si falta cash, NO descuenta coins', () => {
      const result = purchase(initialWallet, { coins: 50, cash: 999 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_FUNDS');
      // La billetera queda intacta, coins NO fue descontado
      expect(result.wallet).toBe(initialWallet);
      expect(result.wallet.coins).toBe(100);
      expect(result.wallet.cash).toBe(10);
      expect(result.transaction).toBeUndefined();
      expect(result.transactions).toBeUndefined();
    });

    it('garantiza atomicidad total: si la billetera tiene 0 fondos en ambas, rechaza sin cambios', () => {
      const emptyWallet: Wallet = { coins: 0, cash: 0 };
      const result = purchase(emptyWallet, { coins: 10, cash: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_FUNDS');
      expect(result.wallet).toBe(emptyWallet);
      expect(result.wallet.coins).toBe(0);
      expect(result.wallet.cash).toBe(0);
    });

    it('prevención de exploit de costo negativo: rechaza categóricamente cualquier costo negativo', () => {
      // Intento de exploit: enviar un costo negativo para ganar monedas gratis
      const exploitCoins = purchase(initialWallet, { coins: -100 });
      expect(exploitCoins.success).toBe(false);
      expect(exploitCoins.error).toBe('INVALID_AMOUNT');
      expect(exploitCoins.wallet).toBe(initialWallet);
      expect(exploitCoins.wallet.coins).toBe(100);

      const exploitCash = purchase(initialWallet, { cash: -50 });
      expect(exploitCash.success).toBe(false);
      expect(exploitCash.error).toBe('INVALID_AMOUNT');
      expect(exploitCash.wallet).toBe(initialWallet);
      expect(exploitCash.wallet.cash).toBe(10);

      // Intento mixto: pagar 50 coins pero con cash negativo
      const exploitMixed = purchase(initialWallet, { coins: 50, cash: -10 });
      expect(exploitMixed.success).toBe(false);
      expect(exploitMixed.error).toBe('INVALID_AMOUNT');
      expect(exploitMixed.wallet).toBe(initialWallet);
      expect(exploitMixed.wallet.coins).toBe(100);
      expect(exploitMixed.wallet.cash).toBe(10);
    });

    it('rechaza costos con números flotantes, NaN o Infinity', () => {
      const invalidCosts = [
        { coins: 10.5 },
        { cash: 2.3 },
        { coins: NaN },
        { cash: NaN },
        { coins: Infinity },
        { cash: -Infinity },
      ];

      for (const cost of invalidCosts) {
        const result = purchase(initialWallet, cost);
        expect(result.success).toBe(false);
        expect(result.error).toBe('INVALID_AMOUNT');
        expect(result.wallet).toBe(initialWallet);
      }
    });
  });
});
