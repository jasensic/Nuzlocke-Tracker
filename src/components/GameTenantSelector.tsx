import React from 'react';
import { GameTenant } from '../types';
import { Gamepad2, ChevronDown } from 'lucide-react';
import { btn } from '../utils/ui';

interface GameTenantSelectorProps {
  activeTenant: GameTenant;
  onClick: () => void;
}

export const GameTenantSelector: React.FC<GameTenantSelectorProps> = ({
  activeTenant,
  onClick,
}) => {
  const label = activeTenant.shortName || activeTenant.name;

  return (
    <button
      id="game-tenant-selector-button"
      type="button"
      onClick={onClick}
      aria-label={`Cambiar juego (actual: ${label} · ${activeTenant.region})`}
      title={`Cambiar juego (actual: ${label} · ${activeTenant.region})`}
      className={btn('secondary', 'xs', 'accent', 'group max-w-[11.5rem] min-w-0')}
    >
      <Gamepad2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
      <span className="hidden lg:inline truncate">{label}</span>
      <ChevronDown className="w-3 h-3 text-brand-txt2 group-hover:text-brand-accent shrink-0" />
    </button>
  );
};
