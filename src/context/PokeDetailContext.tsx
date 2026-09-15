import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
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

export type DetailNavDirection = 1 | -1;

export interface PokeDetailContextType {
  openDetail: (type: DetailType, name: string, extraMeta?: PokeDetailRequest['extraMeta']) => void;
  closeDetail: () => void;
  goBack: () => void;
  activeRequest: PokeDetailRequest | null;
  canGoBack: boolean;
  isOpen: boolean;
}

const PokeDetailContext = createContext<PokeDetailContextType | undefined>(undefined);

const DETAIL_STACK_KEY = 'nuzlockePokeDetailStack';

type HistoryState = Record<string, unknown> & {
  [DETAIL_STACK_KEY]?: PokeDetailRequest[];
};

function isBlankDetailName(name: string): boolean {
  const trimmed = name.trim().toLowerCase();
  return trimmed === '' || trimmed === 'none' || trimmed === 'ninguno';
}

function isSameRequest(a: PokeDetailRequest, b: PokeDetailRequest): boolean {
  return a.type === b.type && a.name.toLowerCase() === b.name.toLowerCase();
}

function readDetailStack(state: unknown): PokeDetailRequest[] {
  if (!state || typeof state !== 'object') return [];
  const stack = (state as HistoryState)[DETAIL_STACK_KEY];
  return Array.isArray(stack) ? stack : [];
}

function withDetailStack(stack: PokeDetailRequest[]): HistoryState {
  const current = history.state && typeof history.state === 'object' ? (history.state as HistoryState) : {};
  return { ...current, [DETAIL_STACK_KEY]: stack };
}

export const PokeDetailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<PokeDetailRequest[]>([]);
  const [navDirection, setNavDirection] = useState<DetailNavDirection>(1);
  const stackRef = useRef<PokeDetailRequest[]>([]);
  const isClosingRef = useRef(false);

  const syncStack = useCallback((next: PokeDetailRequest[]) => {
    const prevLength = stackRef.current.length;
    if (next.length < prevLength) {
      setNavDirection(-1);
    } else if (next.length > prevLength) {
      setNavDirection(1);
    }
    stackRef.current = next;
    setStack(next);
    if (next.length === 0) {
      isClosingRef.current = false;
    }
  }, []);

  const openDetail = useCallback(
    (type: DetailType, name: string, extraMeta?: PokeDetailRequest['extraMeta']) => {
      if (isBlankDetailName(name)) {
        return;
      }

      const request: PokeDetailRequest = { type, name: name.trim(), extraMeta };
      const current = stackRef.current;
      const last = current[current.length - 1];
      if (last && isSameRequest(last, request)) {
        return;
      }

      const next = [...current, request];
      history.pushState(withDetailStack(next), '');
      syncStack(next);
    },
    [syncStack]
  );

  const closeDetail = useCallback(() => {
    const depth = stackRef.current.length;
    if (depth === 0 || isClosingRef.current) return;
    isClosingRef.current = true;
    history.go(-depth);
  }, []);

  const goBack = useCallback(() => {
    if (stackRef.current.length === 0) return;
    history.back();
  }, []);

  useEffect(() => {
    if (readDetailStack(history.state).length > 0) {
      history.replaceState(withDetailStack([]), '');
    }

    const onPopState = (event: PopStateEvent) => {
      syncStack(readDetailStack(event.state));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [syncStack]);

  const activeRequest = stack[stack.length - 1] ?? null;
  const previousRequest = stack.length > 1 ? stack[stack.length - 2] : null;
  const isOpen = stack.length > 0;
  const canGoBack = stack.length > 1;

  return (
    <PokeDetailContext.Provider value={{ openDetail, closeDetail, goBack, activeRequest, canGoBack, isOpen }}>
      {children}
      <AnimatePresence>
        {isOpen && activeRequest && (
          <PokeDetailModal
            key="poke-detail-modal"
            request={activeRequest}
            previousRequest={previousRequest}
            navDirection={navDirection}
            onClose={closeDetail}
            onBack={goBack}
            canGoBack={canGoBack}
            onOpenAnother={(type, name) => openDetail(type, name)}
          />
        )}
      </AnimatePresence>
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
