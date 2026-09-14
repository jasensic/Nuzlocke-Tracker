import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PokeDetailModal } from '../components/PokeDetailModal';

export type DetailType = 'move' | 'ability' | 'item' | 'pokemon';

export interface PokeDetailRequest {
  type: DetailType;
  name: string;
  extraMeta?: {
    pokemonName?: string;
    level?: number;
    typeHint?: string;
  };
}

export interface PokeDetailContextType {
  openDetail: (type: DetailType, name: string, extraMeta?: PokeDetailRequest['extraMeta']) => void;
  closeDetail: () => void;
  activeRequest: PokeDetailRequest | null;
  isOpen: boolean;
}

const PokeDetailContext = createContext<PokeDetailContextType | undefined>(undefined);

export const PokeDetailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRequest, setActiveRequest] = useState<PokeDetailRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = useCallback(
    (type: DetailType, name: string, extraMeta?: PokeDetailRequest['extraMeta']) => {
      if (!name || name.trim() === '' || name.toLowerCase() === 'none' || name.toLowerCase() === 'ninguno') {
        return;
      }
      setActiveRequest({ type, name: name.trim(), extraMeta });
      setIsOpen(true);
    },
    []
  );

  const closeDetail = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <PokeDetailContext.Provider value={{ openDetail, closeDetail, activeRequest, isOpen }}>
      {children}
      {isOpen && activeRequest && (
        <PokeDetailModal
          request={activeRequest}
          onClose={closeDetail}
          onOpenAnother={(type, name) => openDetail(type, name)}
        />
      )}
    </PokeDetailContext.Provider>
  );
};

export function usePokeDetail(): PokeDetailContextType {
  const context = useContext(PokeDetailContext);
  if (!context) {
    throw new Error('usePokeDetail must be used within a PokeDetailProvider');
  }
  return context;
}
