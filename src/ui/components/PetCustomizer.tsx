import React from 'react';
import type {
  EarStyle,
  EyeStyle,
  MouthStyle,
  PetAppearance,
  PetClothes,
  PetColor,
} from '../../domain';
import { theme } from '../../styles';

export interface PetCustomizerProps {
  readonly appearance: PetAppearance;
  readonly onChangeAppearance: (appearance: PetAppearance) => void;
  readonly clothes?: PetClothes;
  readonly onChangeClothes?: (clothes: PetClothes) => void;
}

const COLORS: readonly { readonly id: PetColor; readonly label: string; readonly hex: string }[] = [
  { id: 'white', label: 'Blanco', hex: '#FFFFFF' },
  { id: 'brown', label: 'Marrón', hex: '#8D6E63' },
  { id: 'black', label: 'Negro', hex: '#37474F' },
  { id: 'pink', label: 'Rosa', hex: '#F8BBD0' },
  { id: 'gray', label: 'Gris', hex: '#B0BEC5' },
  { id: 'orange', label: 'Naranja', hex: '#FFB74D' },
];

const EYES: readonly { readonly id: EyeStyle; readonly label: string }[] = [
  { id: 'round', label: 'Redondos' },
  { id: 'sleepy', label: 'Soñolientos' },
  { id: 'happy', label: 'Felices' },
  { id: 'star', label: 'Estrellas' },
];

const EARS: readonly { readonly id: EarStyle; readonly label: string }[] = [
  { id: 'floppy', label: 'Caídas' },
  { id: 'pointy', label: 'Puntiagudas' },
  { id: 'round', label: 'Redondas' },
];

const MOUTHS: readonly { readonly id: MouthStyle; readonly label: string }[] = [
  { id: 'smile', label: 'Sonrisa' },
  { id: 'open', label: 'Abierta' },
  { id: 'neutral', label: 'Neutral' },
];

const HATS: readonly { readonly id: string | null; readonly label: string }[] = [
  { id: null, label: 'Sin gorro' },
  { id: 'party-hat', label: 'Fiesta' },
  { id: 'cap', label: 'Gorra' },
];

const SHIRTS: readonly { readonly id: string | null; readonly label: string }[] = [
  { id: null, label: 'Sin ropa' },
  { id: 'red-shirt', label: 'Roja' },
  { id: 'blue-shirt', label: 'Azul' },
];

const ACCESSORIES: readonly { readonly id: string | null; readonly label: string }[] = [
  { id: null, label: 'Ninguno' },
  { id: 'bowtie', label: 'Pajarita' },
  { id: 'glasses', label: 'Lentes' },
];

/**
 * Panel de personalización en vivo para probar la reactividad
 * del renderizado por capas de la mascota (R-01, R-02, R-03).
 */
export const PetCustomizer: React.FC<PetCustomizerProps> = ({
  appearance,
  onChangeAppearance,
  clothes,
  onChangeClothes,
}) => {
  return (
    <section
      aria-label="Personalización de la mascota"
      style={{
        backgroundColor: theme.colors.cardBackground,
        borderTop: `1px solid ${theme.colors.cardBorder}`,
        padding: `${theme.spacing.small} ${theme.spacing.medium}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing.medium,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
        overflowX: 'auto',
        fontSize: '0.85rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Selector de Color */}
      <fieldset style={groupStyle}>
        <legend style={legendStyle}>Pelaje</legend>
        <div style={optionsRowStyle}>
          {COLORS.map((item) => {
            const isSelected = appearance.color === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-pressed={isSelected}
                onClick={() => onChangeAppearance({ ...appearance, color: item.id })}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: theme.borderRadius.round,
                  backgroundColor: item.hex,
                  border: isSelected
                    ? `3px solid ${theme.colors.primary}`
                    : `1px solid ${theme.colors.cardBorder}`,
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  padding: 0,
                  outline: 'none',
                }}
              />
            );
          })}
        </div>
      </fieldset>

      {/* Selector de Ojos */}
      <fieldset style={groupStyle}>
        <legend style={legendStyle}>Ojos</legend>
        <div style={optionsRowStyle}>
          {EYES.map((item) => (
            <OptionButton
              key={item.id}
              label={item.label}
              isSelected={appearance.eyes === item.id}
              onClick={() => onChangeAppearance({ ...appearance, eyes: item.id })}
            />
          ))}
        </div>
      </fieldset>

      {/* Selector de Orejas */}
      <fieldset style={groupStyle}>
        <legend style={legendStyle}>Orejas</legend>
        <div style={optionsRowStyle}>
          {EARS.map((item) => (
            <OptionButton
              key={item.id}
              label={item.label}
              isSelected={appearance.ears === item.id}
              onClick={() => onChangeAppearance({ ...appearance, ears: item.id })}
            />
          ))}
        </div>
      </fieldset>

      {/* Selector de Boca */}
      <fieldset style={groupStyle}>
        <legend style={legendStyle}>Boca</legend>
        <div style={optionsRowStyle}>
          {MOUTHS.map((item) => (
            <OptionButton
              key={item.id}
              label={item.label}
              isSelected={appearance.mouth === item.id}
              onClick={() => onChangeAppearance({ ...appearance, mouth: item.id })}
            />
          ))}
        </div>
      </fieldset>

      {/* Controles de Ropa y Accesorios */}
      {onChangeClothes && (
        <>
          <fieldset style={groupStyle}>
            <legend style={legendStyle}>Gorro</legend>
            <div style={optionsRowStyle}>
              {HATS.map((item) => (
                <OptionButton
                  key={item.id ?? 'none'}
                  label={item.label}
                  isSelected={(clothes?.hat ?? null) === item.id}
                  onClick={() => onChangeClothes({ ...clothes, hat: item.id })}
                />
              ))}
            </div>
          </fieldset>

          <fieldset style={groupStyle}>
            <legend style={legendStyle}>Camisa</legend>
            <div style={optionsRowStyle}>
              {SHIRTS.map((item) => (
                <OptionButton
                  key={item.id ?? 'none'}
                  label={item.label}
                  isSelected={(clothes?.shirt ?? null) === item.id}
                  onClick={() => onChangeClothes({ ...clothes, shirt: item.id })}
                />
              ))}
            </div>
          </fieldset>

          <fieldset style={groupStyle}>
            <legend style={legendStyle}>Accesorio</legend>
            <div style={optionsRowStyle}>
              {ACCESSORIES.map((item) => (
                <OptionButton
                  key={item.id ?? 'none'}
                  label={item.label}
                  isSelected={(clothes?.accessory ?? null) === item.id}
                  onClick={() => onChangeClothes({ ...clothes, accessory: item.id })}
                />
              ))}
            </div>
          </fieldset>
        </>
      )}
    </section>
  );
};

interface OptionButtonProps {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onClick: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({ label, isSelected, onClick }) => {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      style={{
        padding: `${theme.spacing.xs} ${theme.spacing.small}`,
        borderRadius: theme.borderRadius.small,
        border: `1px solid ${isSelected ? theme.colors.activeOption : theme.colors.cardBorder}`,
        backgroundColor: isSelected ? theme.colors.activeOption : theme.colors.inactiveOption,
        color: isSelected ? theme.colors.activeOptionText : theme.colors.inactiveOptionText,
        fontWeight: isSelected ? '600' : 'normal',
        fontSize: '0.78rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );
};

const groupStyle: React.CSSProperties = {
  border: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const legendStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: theme.colors.text,
  marginBottom: '2px',
};

const optionsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
};
