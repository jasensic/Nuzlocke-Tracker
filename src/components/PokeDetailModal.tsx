import React, { useState, useEffect } from 'react';
import { PokeDetailRequest, DetailType } from '../context/PokeDetailContext';
import {
  getMoveDetails,
  getAbilityDetails,
  getItemDetails,
  getPokemonDetails,
  MoveDetail,
  AbilityDetail,
  ItemDetail,
  PokemonDetail,
} from '../services/pokeApiService';
import { TYPE_COLORS } from '../utils/pokemonMeta';
import {
  X,
  Sparkles,
  Zap,
  Shield,
  Crosshair,
  Gauge,
  Swords,
  Info,
  Layers,
  ArrowRight,
  Scale,
  Ruler,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface PokeDetailModalProps {
  request: PokeDetailRequest;
  onClose: () => void;
  onOpenAnother: (type: DetailType, name: string) => void;
}

export const PokeDetailModal: React.FC<PokeDetailModalProps> = ({
  request,
  onClose,
  onOpenAnother,
}) => {
  const { type, name } = request;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [moveData, setMoveData] = useState<MoveDetail | null>(null);
  const [abilityData, setAbilityData] = useState<AbilityDetail | null>(null);
  const [itemData, setItemData] = useState<ItemDetail | null>(null);
  const [pokemonData, setPokemonData] = useState<PokemonDetail | null>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch from pokenode-ts
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    async function fetchData() {
      try {
        if (type === 'move') {
          const res = await getMoveDetails(name);
          if (!isCancelled) setMoveData(res);
        } else if (type === 'ability') {
          const res = await getAbilityDetails(name);
          if (!isCancelled) setAbilityData(res);
        } else if (type === 'item') {
          const res = await getItemDetails(name);
          if (!isCancelled) setItemData(res);
        } else if (type === 'pokemon') {
          const res = await getPokemonDetails(name);
          if (!isCancelled) setPokemonData(res);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'No se pudo cargar la información desde PokéAPI.');
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [type, name]);

  const typeConfig =
    type === 'move'
      ? { title: 'Detalles del Movimiento', icon: Swords, color: 'text-red-500 bg-red-50 dark:bg-red-950/60' }
      : type === 'ability'
      ? { title: 'Detalles de la Habilidad', icon: Zap, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' }
      : type === 'item'
      ? { title: 'Detalles del Objeto', icon: Shield, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' }
      : { title: 'Detalles del Pokémon', icon: Sparkles, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${typeConfig.color}`}>
              <typeConfig.icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {typeConfig.title}
              </span>
              <h2 className="text-base font-black text-slate-900 dark:text-white capitalize">
                {name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-xs font-bold text-slate-500">
                Consultando PokéAPI (pokenode-ts)...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Error al consultar la API</span>
              </div>
              <p className="text-xs">{error}</p>
            </div>
          ) : type === 'move' && moveData ? (
            /* ================= MOVE VIEW ================= */
            <div className="space-y-4">
              {/* Header Title & Types */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {moveData.name}
                  </h3>
                  {moveData.originalName !== moveData.name && (
                    <p className="text-xs text-slate-400 font-medium">
                      Nombre en inglés: <strong>{moveData.originalName}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Type Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs ${
                      TYPE_COLORS[moveData.type]?.badge || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {moveData.type}
                  </span>

                  {/* Damage Class Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                      moveData.damageClass === 'physical'
                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                        : moveData.damageClass === 'special'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {moveData.damageClass === 'physical'
                      ? '💥 Físico'
                      : moveData.damageClass === 'special'
                      ? '✨ Especial'
                      : '🛡️ Estado'}
                  </span>
                </div>
              </div>

              {/* Stat Grid: Potencia, Precisión, PP, Prioridad */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* Potencia */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center justify-center gap-1">
                    <Swords className="w-3 h-3 text-red-500" />
                    <span>Potencia</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    {moveData.power !== null ? moveData.power : '—'}
                  </div>
                </div>

                {/* Precisión */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center justify-center gap-1">
                    <Crosshair className="w-3 h-3 text-indigo-500" />
                    <span>Precisión</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    {moveData.accuracy !== null ? `${moveData.accuracy}%` : '—'}
                  </div>
                </div>

                {/* PP */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-emerald-500" />
                    <span>PP</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    {moveData.pp}
                  </div>
                </div>

                {/* Prioridad */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Prioridad</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    {moveData.priority > 0 ? `+${moveData.priority}` : moveData.priority}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Descripción en combate:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {moveData.description}
                </p>
              </div>

              {/* Detailed Effect */}
              {moveData.effect && moveData.effect !== moveData.description && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mecánica detallada:</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {moveData.effect}
                  </p>
                </div>
              )}
            </div>
          ) : type === 'ability' && abilityData ? (
            /* ================= ABILITY VIEW ================= */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {abilityData.name}
                  </h3>
                  {abilityData.originalName !== abilityData.name && (
                    <p className="text-xs text-slate-400 font-medium">
                      Nombre en inglés: <strong>{abilityData.originalName}</strong>
                    </p>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Habilidad
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60 space-y-1">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Descripción oficial:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {abilityData.description}
                </p>
              </div>

              {abilityData.effect && abilityData.effect !== abilityData.description && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Efecto en combate:</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {abilityData.effect}
                  </p>
                </div>
              )}
            </div>
          ) : type === 'item' && itemData ? (
            /* ================= ITEM VIEW ================= */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={itemData.sprite}
                    alt={itemData.name}
                    className="w-10 h-10 object-contain pixelated"
                    loading="lazy"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {itemData.name}
                  </h3>
                  {itemData.originalName !== itemData.name && (
                    <p className="text-xs text-slate-400 font-medium">
                      En inglés: <strong>{itemData.originalName}</strong>
                    </p>
                  )}
                  <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {itemData.category}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Efecto del objeto:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {itemData.description}
                </p>
              </div>

              {itemData.effect && itemData.effect !== itemData.description && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mecánica al equipar:</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {itemData.effect}
                  </p>
                </div>
              )}
            </div>
          ) : type === 'pokemon' && pokemonData ? (
            /* ================= POKEMON VIEW ================= */
            <div className="space-y-4">
              {/* Header: Artwork, Name, Types */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                  <img
                    src={pokemonData.sprites.artwork}
                    alt={pokemonData.displayName}
                    className="w-full h-full object-contain pixelated"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      #{String(pokemonData.id).padStart(3, '0')}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white capitalize truncate">
                      {pokemonData.displayName}
                    </h3>
                  </div>

                  {/* Types */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pokemonData.types.map((t) => (
                      <span
                        key={t.name}
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-lg shadow-2xs ${
                          TYPE_COLORS[t.es]?.badge || 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {t.es}
                      </span>
                    ))}
                  </div>

                  {/* Height & Weight */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" />
                      {pokemonData.heightMeters} m
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      {pokemonData.weightKg} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Base Stats */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Estadísticas Base (BST):</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">
                    {pokemonData.bst} Total
                  </span>
                </div>

                <div className="space-y-1.5">
                  {pokemonData.stats.map((s) => (
                    <div key={s.name} className="flex items-center text-xs gap-2">
                      <span className="w-16 font-bold text-slate-600 dark:text-slate-400 text-[11px]">
                        {s.nameEs}:
                      </span>
                      <span className="w-8 font-black text-slate-900 dark:text-white text-right">
                        {s.base}
                      </span>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            s.base >= 110
                              ? 'bg-emerald-500'
                              : s.base >= 80
                              ? 'bg-blue-500'
                              : s.base >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${s.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abilities */}
              {pokemonData.abilities.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400">
                    Habilidades (Haz clic para ver detalles):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pokemonData.abilities.map((ab) => (
                      <button
                        key={ab.slug}
                        type="button"
                        onClick={() => onOpenAnother('ability', ab.slug)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>{ab.nameEs}</span>
                        {ab.isHidden && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold">
                            Oculta
                          </span>
                        )}
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
          <span className="text-[11px] text-slate-400 font-medium">
            Datos obtenidos en tiempo real vía <strong>pokenode-ts</strong> (PokéAPI)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
