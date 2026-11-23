import React from 'react';
import type { PetNeeds, Wallet } from '../../domain';
import { PetStatusHUD } from './PetStatusHUD';

export interface NeedsHUDProps {
  readonly petName: string;
  readonly level: number;
  readonly needs: PetNeeds;
  readonly wallet?: Wallet;
}

/**
 * Adaptador de compatibilidad para NeedsHUD utilizando el nuevo PetStatusHUD estilo Flash.
 */
export const NeedsHUD: React.FC<NeedsHUDProps> = (props) => {
  return <PetStatusHUD {...props} />;
};
