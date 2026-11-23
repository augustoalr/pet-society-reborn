import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PetStatusHUD, GoldenCoinIcon, PlayfishCashIcon } from '../PetStatusHUD';
import type { PetNeeds, Wallet } from '../../../domain';

describe('PetStatusHUD (HUD Superior Estilo Flash)', () => {
  const sampleNeeds: PetNeeds = {
    hunger: 75,
    hygiene: 90,
    energy: 60,
    happiness: 85,
  };

  const sampleWallet: Wallet = {
    coins: 250,
    cash: 10,
  };

  it('renderiza el nombre de la mascota, medallón de nivel con Paw Points y saldos de billetera', () => {
    const html = renderToString(
      <PetStatusHUD
        petName="Fluffy"
        level={3}
        needs={sampleNeeds}
        wallet={sampleWallet}
      />
    );

    expect(html).toContain('Fluffy');
    expect(html).toContain('🐾');
    expect(html).toContain('Nvl 3');
    expect(html).toContain('250');
    expect(html).toContain('10');
  });

  it('renderiza las 4 barras de necesidades vitales con sus valores porcentuales', () => {
    const html = renderToString(
      <PetStatusHUD
        petName="Fluffy"
        level={1}
        needs={sampleNeeds}
      />
    );

    expect(html).toContain('Hambre');
    expect(html).toContain('75%');
    expect(html).toContain('Higiene');
    expect(html).toContain('90%');
    expect(html).toContain('Energía');
    expect(html).toContain('60%');
    expect(html).toContain('Felicidad');
    expect(html).toContain('85%');
  });

  it('asigna atributos de accesibilidad ARIA role="progressbar" a cada necesidad', () => {
    const html = renderToString(
      <PetStatusHUD
        petName="Fluffy"
        level={2}
        needs={sampleNeeds}
      />
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="75"');
    expect(html).toContain('aria-valuenow="90"');
    expect(html).toContain('aria-valuenow="60"');
    expect(html).toContain('aria-valuenow="85"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
  });

  it('renderiza los iconos vectoriales GoldenCoinIcon y PlayfishCashIcon sin errores', () => {
    const coinHtml = renderToString(<GoldenCoinIcon size={20} />);
    const cashHtml = renderToString(<PlayfishCashIcon size={24} />);

    expect(coinHtml).toContain('<svg');
    expect(coinHtml).toContain('coinGrad');
    expect(cashHtml).toContain('<svg');
    expect(cashHtml).toContain('cashGrad');
  });
});
