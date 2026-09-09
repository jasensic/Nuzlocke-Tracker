import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RouteEncounter, SavedEncounter } from '../types';
import { parsePokemonName, TYPE_COLORS, getPokemonSprite } from '../utils/pokemonMeta';
import { translateWeather } from '../data/routeTranslations';
import { Sparkles, BookmarkCheck, Check, ShieldAlert, Heart, Box, Wind, Compass, Hand } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/audio';

interface EncounterResultCardProps {
  encounter: RouteEncounter;
  routeName: string;
  routeId: string;
  onSave: (saved: SavedEncounter) => void;
  isAlreadySaved?: boolean;
  selectionMode?: 'random' | 'manual';
}

export const EncounterResultCard: React.FC<EncounterResultCardProps> = ({
  encounter,
  routeName,
  routeId,
  onSave,
  isAlreadySaved = false,
  selectionMode = 'random',
}) => {
  const { displayName, cleanName, formLabel, types } = parsePokemonName(encounter.pokemon);
  const { sprite, showdown } = getPokemonSprite(encounter.pokemon);

  const [status, setStatus] = useState<SavedEncounter['status']>('Capturado');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [isShiny, setIsShiny] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isAlreadySaved);
  const [imgSrc, setImgSrc] = useState(showdown);

  const primaryType = types[0] || 'Normal';
  const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS['Normal'];

  const getRarity = (chance: number) => {
    if (chance <= 2) return { label: 'Extremadamente Raro', color: 'bg-amber-500/20 text-amber-700 border-amber-300' };
    if (chance <= 5) return { label: 'Muy Raro', color: 'bg-purple-500/20 text-purple-700 border-purple-300' };
    if (chance <= 15) return { label: 'Poco Común', color: 'bg-blue-500/20 text-blue-700 border-blue-300' };
    return { label: 'Común', color: 'bg-emerald-500/20 text-emerald-700 border-emerald-300' };
  };

  const rarity = getRarity(encounter.chance);

  const handleSave = () => {
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
      nickname: nickname.trim() || undefined,
      notes: notes.trim() || undefined,
      isShiny,
    };

    onSave(item);
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
      className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-colors"
    >
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm tracking-wide text-slate-200 uppercase">
            {routeName}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {selectionMode === 'manual' && (
            <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/50 flex items-center gap-1 shadow-xs">
              <Hand className="w-3 h-3 text-amber-300" />
              Elegido a Dedo
            </span>
          )}
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${rarity.color} bg-white/10 text-white border-white/20`}>
            {encounter.chance}% ({rarity.label})
          </span>
          {isShiny && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 fill-amber-950" />
              SHINY
            </span>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Main Presentation: Pokemon Visual & Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Pokemon Sprite / Avatar Stage */}
          <div className="relative group flex-shrink-0">
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-3 shadow-inner relative overflow-hidden">
              {/* Radial subtle glow based on type */}
              <div
                className="absolute inset-0 opacity-15 rounded-2xl"
                style={{
                  background: `radial-gradient(circle, var(--tw-gradient-stops))`,
                }}
              />
              <img
                src={imgSrc}
                alt={displayName}
                className="w-28 h-28 object-contain z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
                onError={() => {
                  if (imgSrc !== sprite) {
                    setImgSrc(sprite);
                  }
                }}
              />
            </div>

            {/* Toggle Shiny Button */}
            <button
              id="toggle-shiny-button"
              type="button"
              onClick={() => setIsShiny(!isShiny)}
              className={`mt-2 w-full py-1 px-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-all ${
                isShiny
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isShiny ? '¡Es Variocolor!' : 'Marcar Shiny'}
            </button>
          </div>

          {/* Core Info Details */}
          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              {types.map((t) => {
                const style = TYPE_COLORS[t] || TYPE_COLORS['Normal'];
                return (
                  <span
                    key={t}
                    className={`px-3 py-0.5 text-xs font-bold rounded-full ${style.badge}`}
                  >
                    {t}
                  </span>
                );
              })}
              {formLabel && (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Forma {formLabel}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {displayName}
            </h2>

            {/* Badges for Weather, Method & Levels */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Método</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="truncate">
                    {encounter.method === 'Hidden'
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

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Clima Requerido</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <Wind className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{translateWeather(encounter.weather)}</span>
                </span>
              </div>

              {encounter.levelRange && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Rango de Nivel</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">{encounter.levelRange}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Logging & Saving info */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Guardar en tu Bitácora</span>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" /> Registrado en Historial
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nickname Input */}
            <div>
              <label htmlFor="pokemon-nickname-input" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Mote / Apodo (Opcional)
              </label>
              <input
                id="pokemon-nickname-input"
                type="text"
                placeholder="Ej. Chispa, Rocky..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
              />
            </div>

            {/* Status Select */}
            <div>
              <label htmlFor="pokemon-status-select" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Estado del Encuentro
              </label>
              <select
                id="pokemon-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as SavedEncounter['status'])}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all font-medium cursor-pointer"
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
              <label htmlFor="pokemon-notes-input" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Notas adicionales (Regla Nuzlocke, Naturaleza, Habilidad)
              </label>
              <input
                id="pokemon-notes-input"
                type="text"
                placeholder="Ej. Primer encuentro de ruta según reglas Nuzlocke."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            id="save-encounter-button"
            type="button"
            onClick={handleSave}
            className={`w-full py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              savedSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/25 active:scale-[0.98]'
            }`}
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
