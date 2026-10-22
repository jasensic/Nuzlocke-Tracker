import React, { useState, useMemo } from 'react';
import { GameTenant, SavedEncounter, ExtraEncounterClause } from '../types';
import { parsePokemonName, getPokemonSprite } from '../utils/pokemonMeta';
import { TypeBadge } from './TypeBadge';
import { sfx } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  cn,
  card,
  btn,
  iconBtn,
  pill,
  iconTile,
  text,
  field,
  surface,
  layout,
  segmented,
  spriteFrame,
  focusRing,
  TONES,
} from '../utils/ui';
import {
  X,
  Egg,
  Sparkles,
  Gift,
  ArrowLeftRight,
  Zap,
  BookmarkCheck,
  Search,
  Check,
  Compass,
  Plus,
  Dna,
} from 'lucide-react';

export interface ExtraPokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEncounter: (encounter: SavedEncounter) => void;
  activeTenant?: GameTenant;
}

interface ClauseOption {
  id: ExtraEncounterClause;
  label: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'warning' | 'info' | 'success' | 'danger' | 'neutral';
  defaultLevel: string;
  defaultLocation: string;
}

const CLAUSE_OPTIONS: ClauseOption[] = [
  {
    id: 'egg',
    label: 'Huevo / Guardería',
    badge: '🥚 Huevo',
    description: 'Pokémon eclosionado de un huevo (Togepi, Riolu, Toxel, etc.)',
    icon: Egg,
    tone: 'warning',
    defaultLevel: 'Nv. 1',
    defaultLocation: 'Ruta 5 (Guardería Pokémon)',
  },
  {
    id: 'shiny',
    label: 'Cláusula Shiny',
    badge: '✨ Regla Shiny',
    description: 'Encuentro variocolor que se permite capturar por regla especial',
    icon: Sparkles,
    tone: 'warning',
    defaultLevel: 'Nv. 15',
    defaultLocation: 'Encuentro Salvaje Shiny',
  },
  {
    id: 'gift',
    label: 'Regalo NPC / Estático',
    badge: '🎁 Regalo',
    description: 'Entregado por un personaje o evento (Type: Null, Eevee, Gigamax...)',
    icon: Gift,
    tone: 'info',
    defaultLevel: 'Nv. 20',
    defaultLocation: 'Regalo de Personaje',
  },
  {
    id: 'fossil',
    label: 'Fósil Revivido',
    badge: '🦴 Fósil',
    description: 'Pokémon restaurado en un laboratorio (Dracovish, Arctozolt, etc.)',
    icon: Dna,
    tone: 'success',
    defaultLevel: 'Nv. 10',
    defaultLocation: 'Ruta 6 (Laboratorio de Fósiles)',
  },
  {
    id: 'trade',
    label: 'Intercambio NPC',
    badge: '🤝 Intercambio',
    description: 'Obtenido mediante un intercambio interno del juego',
    icon: ArrowLeftRight,
    tone: 'info',
    defaultLevel: 'Nv. 15',
    defaultLocation: 'Intercambio en Pueblo/Ciudad',
  },
  {
    id: 'raid',
    label: 'Incursión Dinamax / Nido',
    badge: '⚡ Incursión',
    description: 'Capturado en un nido o raid bajo reglas optativas de tu run',
    icon: Zap,
    tone: 'danger',
    defaultLevel: 'Nv. 20',
    defaultLocation: 'Área Silvestre (Nido Dinamax)',
  },
  {
    id: 'custom',
    label: 'Regla Personalizada',
    badge: '🏷️ Regla Extra',
    description: 'Cualquier otra cláusula u origen optativo de tu partida',
    icon: BookmarkCheck,
    tone: 'neutral',
    defaultLevel: 'Nv. 10',
    defaultLocation: 'Lugar Especial',
  },
];

// Popular gift / egg / fossil Pokémon commonly used in SwSh and Romhacks
const COMMON_EXTRA_POKEMON = [
  'Togepi',
  'Toxel',
  'Riolu',
  'Dracovish',
  'Dracozolt',
  'Arctovish',
  'Arctozolt',
  'Type: Null',
  'Eevee',
  'Pikachu',
  'Bulbasaur',
  'Squirtle',
  'Charmander',
  'Slowpoke-Galar',
  'Meowth-Galar',
  'Farfetch’d-1',
  'Rotom',
  'Ditto',
  'Aerodactyl',
  'Kabuto',
  'Omanyte',
];

export const ExtraPokemonModal: React.FC<ExtraPokemonModalProps> = ({
  isOpen,
  onClose,
  onSaveEncounter,
  activeTenant,
}) => {
  const [selectedClause, setSelectedClause] = useState<ExtraEncounterClause>('egg');
  const [customClauseName, setCustomClauseName] = useState('');
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState('Togepi');
  const [locationName, setLocationName] = useState('Ruta 5 (Guardería Pokémon)');
  const [nickname, setNickname] = useState('');
  const [levelText, setLevelText] = useState('Nv. 1');
  const [status, setStatus] = useState<SavedEncounter['status']>('En Equipo');
  const [isShiny, setIsShiny] = useState(false);
  const [notes, setNotes] = useState('');

  // Collect candidate Pokémon from active tenant routes
  const tenantPokemonList = useMemo(() => {
    const set = new Set<string>();
    activeTenant?.routes.forEach((r) => {
      r.encounters.forEach((e) => set.add(e.pokemon));
    });
    COMMON_EXTRA_POKEMON.forEach((p) => set.add(p));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [activeTenant]);

  // Filtered Pokémon list
  const filteredCandidates = useMemo(() => {
    const q = pokemonSearch.trim().toLowerCase();
    if (!q) return tenantPokemonList.slice(0, 30);
    return tenantPokemonList
      .filter((p) => {
        const meta = parsePokemonName(p);
        return (
          p.toLowerCase().includes(q) ||
          meta.cleanName.toLowerCase().includes(q) ||
          meta.displayName.toLowerCase().includes(q)
        );
      })
      .slice(0, 40);
  }, [tenantPokemonList, pokemonSearch]);

  // Active clause configuration
  const currentClauseConfig = useMemo(() => {
    return CLAUSE_OPTIONS.find((c) => c.id === selectedClause) || CLAUSE_OPTIONS[0];
  }, [selectedClause]);

  // Selected Pokemon metadata
  const selectedMeta = useMemo(() => {
    return parsePokemonName(selectedPokemon);
  }, [selectedPokemon]);

  const selectedSprites = useMemo(() => {
    return getPokemonSprite(selectedPokemon);
  }, [selectedPokemon]);

  if (!isOpen) return null;

  const handleSelectClause = (clauseId: ExtraEncounterClause) => {
    setSelectedClause(clauseId);
    const cfg = CLAUSE_OPTIONS.find((c) => c.id === clauseId);
    if (cfg) {
      setLevelText(cfg.defaultLevel);
      setLocationName(cfg.defaultLocation);
      if (clauseId === 'shiny') {
        setIsShiny(true);
      }
    }
  };

  const handleSelectPokemonCandidate = (poke: string) => {
    setSelectedPokemon(poke);
    setPokemonSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPokemon.trim()) return;

    const clauseBadge =
      selectedClause === 'custom' && customClauseName.trim()
        ? `🏷️ ${customClauseName.trim()}`
        : currentClauseConfig.badge;

    const newEncounter: SavedEncounter = {
      id: `extra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      routeId: `extra-${selectedClause}-${Date.now()}`,
      routeName: locationName.trim() || currentClauseConfig.defaultLocation,
      pokemon: selectedPokemon.trim(),
      cleanName: selectedMeta.cleanName,
      formLabel: selectedMeta.formLabel,
      method: 'Otro',
      weather: 'Despejado',
      levelRange: levelText.trim() || undefined,
      chance: 100,
      status,
      nickname: nickname.trim() || undefined,
      notes: notes.trim()
        ? `[${clauseBadge}] ${notes.trim()}`
        : `[${clauseBadge}] ${currentClauseConfig.description}`,
      isShiny,
      extraClause: selectedClause,
      clauseLabel: clauseBadge,
    };

    onSaveEncounter(newEncounter);
    sfx.playReveal();
    sfx.playCatch();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
    });
    onClose();
  };

  return (
    <div
      id="extra-pokemon-modal-backdrop"
      className={surface.overlay}
      onClick={onClose}
    >
      <div
        id="extra-pokemon-modal"
        className={cn(surface.modal, 'max-w-2xl max-h-[92vh] flex flex-col overflow-hidden')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
          <div className="flex items-center gap-3">
            <span className={iconTile('warning', 'w-10 h-10')}>
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={text.sectionTitle}>
                  Añadir Pokémon Extra por Reglas
                </h3>
                <span className={pill('warning', 'xs')}>
                  Nuzlocke Clauses
                </span>
              </div>
              <p className={text.muted}>
                Registra huevos, shinies, regalos de NPCs o fósiles permitidos por tus reglas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={iconBtn('ghost', 'md', 'neutral')}
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 1. SELECCIÓN DE REGLA / ORIGEN */}
          <div className="space-y-2">
            <label className={text.label}>
              1. Selecciona la Regla o Cláusula de Origen:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CLAUSE_OPTIONS.map((clause) => {
                const isSelected = selectedClause === clause.id;
                const IconComponent = clause.icon;
                return (
                  <button
                    key={clause.id}
                    type="button"
                    onClick={() => handleSelectClause(clause.id)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer',
                      isSelected
                        ? 'border-brand-accent bg-brand-accent/10 ring-1 ring-brand-accent text-brand-txt1'
                        : 'border-brand-border bg-brand-surface hover:bg-brand-surface-hover text-brand-txt2'
                    )}
                  >
                    <span
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                        isSelected ? TONES[clause.tone].solid : 'bg-brand-surface-elevated text-brand-txt2'
                      )}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-tight truncate">
                        {clause.label}
                      </p>
                      <p className="text-[10px] text-brand-txt2 leading-tight mt-0.5 line-clamp-1">
                        {clause.badge}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedClause === 'custom' && (
              <div className="pt-2">
                <input
                  type="text"
                  value={customClauseName}
                  onChange={(e) => setCustomClauseName(e.target.value)}
                  placeholder="Nombre de la regla (ej: Pesca Milagrosa, Ruleta de la Suerte...)"
                  className={field.input}
                />
              </div>
            )}
          </div>

          {/* 2. SELECCIÓN DE POKÉMON */}
          <div className="space-y-2.5">
            <label className={text.label}>
              2. Elige o busca el Pokémon Obtenido:
            </label>

            {/* Selected Pokémon Highlight Preview */}
            <div className="p-3 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={spriteFrame(false, 'w-14 h-14 p-1 shrink-0')}>
                  <img
                    src={isShiny ? selectedSprites.shinyShowdown : selectedSprites.showdown}
                    alt={selectedMeta.displayName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = isShiny
                        ? selectedSprites.shinySprite
                        : selectedSprites.sprite;
                    }}
                    className="w-full h-full object-contain pixelated"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-base text-brand-txt1 truncate">
                      {selectedMeta.displayName}
                    </span>
                    {selectedMeta.formLabel && (
                      <span className={pill('info', 'xs')}>
                        {selectedMeta.formLabel}
                      </span>
                    )}
                    {isShiny && (
                      <span className={pill('warning', 'xs')}>
                        <Sparkles className="w-2.5 h-2.5 fill-current inline mr-0.5" />
                        Shiny
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMeta.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </div>
              </div>

              <span className={pill('success', 'xs')}>
                Seleccionado
              </span>
            </div>

            {/* Search Box */}
            <div className={field.withIcon}>
              <Search className={field.icon} />
              <input
                type="text"
                value={pokemonSearch}
                onChange={(e) => setPokemonSearch(e.target.value)}
                placeholder="Buscar por nombre (ej: Togepi, Riolu, Toxel, Dracovish...)"
                className={cn(field.input, field.iconInputPad)}
              />
            </div>

            {/* Candidate Quick Buttons */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 rounded-lg border border-brand-border bg-brand-surface-elevated/40">
              {filteredCandidates.map((candidate) => {
                const isCurrent = candidate.toLowerCase() === selectedPokemon.toLowerCase();
                const meta = parsePokemonName(candidate);
                return (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => handleSelectPokemonCandidate(candidate)}
                    className={cn(
                      'px-2 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer',
                      isCurrent
                        ? 'border-brand-accent bg-brand-accent text-white shadow-xs'
                        : 'border-brand-border bg-brand-surface hover:bg-brand-surface-hover text-brand-txt1'
                    )}
                  >
                    <span>{meta.displayName}</span>
                    {isCurrent && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. LUGAR, NIVEL Y MOTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={text.label}>
                Lugar de obtención / Ruta:
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="ej: Ruta 5 (Guardería Pokémon)"
                className={field.input}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className={text.label}>
                Nivel de inicio:
              </label>
              <input
                type="text"
                value={levelText}
                onChange={(e) => setLevelText(e.target.value)}
                placeholder="ej: Nv. 1, Nv. 10..."
                className={field.input}
              />
            </div>

            <div className="space-y-1.5">
              <label className={text.label}>
                Mote / Apodo (Opcional):
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Mote para el Pokémon..."
                className={field.input}
              />
            </div>

            <div className="space-y-1.5">
              <label className={text.label}>
                Estado Inicial en la Run:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={field.select}
              >
                <option value="En Equipo">En Equipo</option>
                <option value="En Caja">En Caja</option>
                <option value="Capturado">Capturado</option>
              </select>
            </div>
          </div>

          {/* 4. SHINY TOGGLE & NOTAS */}
          <div className="space-y-3 pt-2 border-t border-brand-border">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isShiny}
                onChange={(e) => setIsShiny(e.target.checked)}
                className="w-4 h-4 rounded-sm border-brand-border text-brand-accent focus:ring-brand-accent/40"
              />
              <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-txt1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Marcar como Pokémon Variocolor (Shiny ✨)
              </span>
            </label>

            <div className="space-y-1.5">
              <label className={text.label}>
                Notas adicionales (Opcional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ej: Eclosionado tras 5000 pasos en Ruta 5..."
                className={field.input}
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-brand-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={btn('secondary', 'md')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={btn('solid', 'md', 'accent')}
            >
              <Plus className="w-4 h-4" />
              <span>Guardar en Bitácora</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
