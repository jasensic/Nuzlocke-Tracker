import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RouteEncounter, SavedEncounter } from '../types';
import { parsePokemonName, TYPE_COLORS, getPokemonSprite } from '../utils/pokemonMeta';
import { translateWeather } from '../data/routeTranslations';
import { usePokeDetail } from '../context/PokeDetailContext';
import { Sparkles, BookmarkCheck, Check, ShieldAlert, Heart, Box, Wind, Compass, Hand, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/audio';
import { TypeBadge } from './TypeBadge';
import {
  cn,
  panelLg,
  inset,
  btn,
  pill,
  pillSolid,
  statTile,
  text,
  field,
  layout,
  filterChip,
  spriteFrame,
  TONES,
  type Tone,
} from '../utils/ui';

interface EncounterResultCardProps {
  encounter: RouteEncounter;
  routeName: string;
  routeId: string;
  onSave: (saved: SavedEncounter) => void;
  onUpdate?: (id: string, updates: Partial<SavedEncounter>) => void;
  existingSavedId?: string;
  isAlreadySaved?: boolean;
  selectionMode?: 'random' | 'manual';
}

export const EncounterResultCard: React.FC<EncounterResultCardProps> = ({
  encounter,
  routeName,
  routeId,
  onSave,
  onUpdate,
  existingSavedId,
  isAlreadySaved = false,
  selectionMode = 'random',
}) => {
  const { openDetail } = usePokeDetail();
  const { displayName, cleanName, formLabel, types } = parsePokemonName(encounter.pokemon);
  const { sprite, showdown, shinySprite, shinyShowdown } = getPokemonSprite(encounter.pokemon);

  const [status, setStatus] = useState<SavedEncounter['status']>('Capturado');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState(existingSavedId ? 'Elegido a dedo' : '');
  const [isShiny, setIsShiny] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isAlreadySaved || Boolean(existingSavedId));
  const [savedId, setSavedId] = useState<string | null>(existingSavedId ?? null);
  const [imgSrc, setImgSrc] = useState(showdown);

  // Synchronize internal state whenever the encounter or route changes
  useEffect(() => {
    setImgSrc(showdown);
    setSavedSuccess(isAlreadySaved || Boolean(existingSavedId));
    setSavedId(existingSavedId ?? null);
    setNickname('');
    setNotes(existingSavedId ? 'Elegido a dedo' : '');
    setIsShiny(false);
    setStatus('Capturado');
  }, [encounter.pokemon, encounter.method, encounter.weather, encounter.levelRange, routeId, isAlreadySaved, existingSavedId, showdown]);

  // Update image when shiny mode is toggled
  useEffect(() => {
    if (isShiny) {
      setImgSrc(shinyShowdown || showdown);
    } else {
      setImgSrc(showdown);
    }
  }, [isShiny, showdown, shinyShowdown]);

  const handleImageError = () => {
    if (isShiny) {
      if (imgSrc === shinyShowdown) {
        setImgSrc(shinySprite);
      } else if (imgSrc === shinySprite) {
        setImgSrc(showdown);
      } else if (imgSrc === showdown) {
        setImgSrc(sprite);
      }
    } else {
      if (imgSrc !== sprite) {
        setImgSrc(sprite);
      }
    }
  };

  const primaryType = types[0] || 'Normal';
  const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS['Normal'];

  const getRarity = (chance: number): { label: string; tone: Tone } => {
    if (chance <= 2) return { label: 'Extremadamente Raro', tone: 'warning' };
    if (chance <= 5) return { label: 'Muy Raro', tone: 'accent' };
    if (chance <= 15) return { label: 'Poco Común', tone: 'info' };
    return { label: 'Común', tone: 'success' };
  };

  const rarity = getRarity(encounter.chance);

  const handleSave = () => {
    const nicknameValue = nickname.trim() || undefined;
    const notesValue = notes.trim() || undefined;

    if (savedId && onUpdate) {
      onUpdate(savedId, {
        status,
        nickname: nicknameValue,
        notes: notesValue,
        isShiny,
      });
      setSavedSuccess(true);
      sfx.playCatch();
      return;
    }

    const item: SavedEncounter = {
      id: `${routeId}-${encounter.pokemon}-${Date.now()}`,
      timestamp: Date.now(),
      routeId,
      routeName,
      pokemon: encounter.pokemon,
      cleanName,
      formLabel,
      method: encounter.method,
      weather: encounter.weather,
      levelRange: encounter.levelRange,
      chance: encounter.chance,
      status,
      nickname: nicknameValue,
      notes: notesValue,
      isShiny,
    };

    onSave(item);
    setSavedId(item.id);
    setSavedSuccess(true);
    sfx.playCatch();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: isShiny ? ['#ffd700', '#ffaa00', '#ffffff'] : ['#ef4444', '#3b82f6', '#10b981'],
    });
  };

  return (
    <motion.div
      id="encounter-result-card"
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={panelLg('w-full max-w-xl overflow-hidden')}
    >
      {/* Top Banner Header */}
      <div className={inset('flex flex-wrap items-center justify-between gap-2')}>
        <div className="flex items-center gap-2">
          <Compass className={cn('w-5 h-5', TONES.warning.ink)} />
          <span className={text.labelStrong}>
            {routeName}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectionMode === 'manual' && (
            <span className={pill('warning', 'sm')}>
              <Hand className="w-3 h-3" />
              Elegido a Dedo
            </span>
          )}
          <span className={pill(rarity.tone, 'sm')}>
            {encounter.chance}% ({rarity.label})
          </span>
          {isShiny && (
            <span className={pillSolid('warning', 'sm')}>
              <Sparkles className="w-3 h-3 fill-current" />
              SHINY
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        {/* Main Presentation: Pokemon Visual & Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Pokemon Sprite / Avatar Stage */}
          <div className="relative group shrink-0">
            <div className={spriteFrame(false, 'w-36 h-36 p-3 relative')}>
              {/* Radial subtle glow based on type */}
              <div
                className="absolute inset-0 opacity-15 rounded-xl"
                style={{
                  background: `radial-gradient(circle, var(--tw-gradient-stops))`,
                }}
              />
              <img
                key={`${encounter.pokemon}-${isShiny ? 'shiny' : 'normal'}-${imgSrc}`}
                src={imgSrc}
                alt={displayName}
                className="w-28 h-28 object-contain z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
                onError={handleImageError}
              />
            </div>

            {/* Toggle Shiny Button */}
            <button
              id="toggle-shiny-button"
              type="button"
              onClick={() => setIsShiny(!isShiny)}
              className={filterChip(isShiny, 'warning', 'mt-2 w-full justify-center')}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isShiny ? '¡Es Variocolor!' : 'Marcar Shiny'}
            </button>
          </div>

          {/* Core Info Details */}
          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              {types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
              {formLabel && (
                <span className={pill('neutral', 'sm')}>
                  Forma {formLabel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={text.pageTitle}>
                {displayName}
              </h2>
              <button
                type="button"
                onClick={() => openDetail('pokemon', cleanName)}
                className={btn('soft', 'xs', 'info')}
                title={`Ver estadísticas base, habilidades y datos de ${displayName}`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Ver Datos PokéAPI</span>
              </button>
            </div>

            {/* Badges for Weather, Method & Levels */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className={statTile('neutral')}>
                <span className={cn(text.label, 'block')}>Método</span>
                <span className={cn(text.subtitle, 'flex items-center gap-1.5 mt-0.5')}>
                  <span className={cn('w-2 h-2 rounded-full shrink-0', TONES.success.fill)} />
                  <span className="truncate">
                    {encounter.methods && encounter.methods.length > 1
                      ? encounter.methods
                          .map((m) =>
                            m === 'Hidden'
                              ? 'Oculta'
                              : m === 'Visible'
                              ? 'Visible'
                              : m === 'Fishing'
                              ? 'Pesca'
                              : m === 'Surfing'
                              ? 'Surf'
                              : m
                          )
                          .join(' / ')
                      : encounter.method === 'Hidden'
                      ? 'Hierba Oculta (!)'
                      : encounter.method === 'Visible'
                      ? 'Sobrehierba Visible'
                      : encounter.method === 'Fishing'
                      ? 'Pesca con Caña'
                      : encounter.method === 'Surfing'
                      ? 'Navegando (Surf)'
                      : encounter.method}
                  </span>
                </span>
              </div>

              <div className={statTile('neutral')}>
                <span className={cn(text.label, 'block')}>Clima Requerido</span>
                <span className={cn(text.subtitle, 'flex items-center gap-1.5 mt-0.5')}>
                  <Wind className={cn('w-3.5 h-3.5 shrink-0', TONES.info.ink)} />
                  <span className="truncate">{translateWeather(encounter.weather)}</span>
                </span>
              </div>

              {encounter.levelRange && (
                <div className={statTile('neutral', 'col-span-2')}>
                  <span className={cn(text.label, 'block')}>Rango de Nivel</span>
                  <span className={cn(text.subtitle, 'mt-0.5 block')}>{encounter.levelRange}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Logging & Saving info */}
        <div className={cn('mt-6 pt-5 space-y-4', layout.divider)}>
          <div className={cn(text.subtitle, 'flex flex-wrap items-center justify-between gap-2')}>
            <span>Guardar en tu Bitácora</span>
            {savedSuccess && (
              <span className={pill('success', 'sm')}>
                <Check className="w-3.5 h-3.5" /> Registrado en Historial
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nickname Input */}
            <div>
              <label htmlFor="pokemon-nickname-input" className={field.label}>
                Mote / Apodo (Opcional)
              </label>
              <input
                id="pokemon-nickname-input"
                type="text"
                placeholder="Ej. Chispa, Rocky..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={field.input}
              />
            </div>

            {/* Status Select */}
            <div>
              <label htmlFor="pokemon-status-select" className={field.label}>
                Estado del Encuentro
              </label>
              <select
                id="pokemon-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as SavedEncounter['status'])}
                className={field.select}
              >
                <option value="Capturado">🎯 Capturado</option>
                <option value="En Equipo">⭐ En Equipo</option>
                <option value="En Caja">📦 En Caja (PC)</option>
                <option value="Debilitado">💀 Debilitado / Muerto</option>
                <option value="Huido">💨 Huido / No Capturado</option>
              </select>
            </div>

            {/* Notes Input */}
            <div className="sm:col-span-2">
              <label htmlFor="pokemon-notes-input" className={field.label}>
                Notas adicionales (Regla Nuzlocke, Naturaleza, Habilidad)
              </label>
              <input
                id="pokemon-notes-input"
                type="text"
                placeholder="Ej. Primer encuentro de ruta según reglas Nuzlocke."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={field.input}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            id="save-encounter-button"
            type="button"
            onClick={handleSave}
            className={btn('primary', 'lg', savedSuccess ? 'success' : 'accent', 'w-full')}
          >
            {savedSuccess ? (
              <>
                <BookmarkCheck className="w-5 h-5" />
                Actualizar Registro en Historial
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Guardar este Encuentro en el Historial
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
