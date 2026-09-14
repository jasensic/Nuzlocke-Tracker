import React, { useState, useRef } from 'react';
import { GameTenant, SavedEncounter } from '../types';
import {
  Gamepad2,
  Check,
  Upload,
  Download,
  Trash2,
  X,
  FileJson,
  AlertTriangle,
  Plus,
  Compass,
} from 'lucide-react';
import { parseImportedTenantJson } from '../data/tenantRegistry';
import {
  cn,
  card,
  inset,
  btn,
  iconBtn,
  pill,
  iconTile,
  text,
  field,
  surface,
  layout,
  anim,
  TONES,
} from '../utils/ui';

interface GameTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: GameTenant[];
  activeTenantId: string;
  onSelectTenant: (tenantId: string) => void;
  onAddCustomTenant: (tenant: GameTenant) => void;
  onDeleteCustomTenant: (tenantId: string) => void;
  history: SavedEncounter[];
}

export const GameTenantModal: React.FC<GameTenantModalProps> = ({
  isOpen,
  onClose,
  tenants,
  activeTenantId,
  onSelectTenant,
  onAddCustomTenant,
  onDeleteCustomTenant,
  history,
}) => {
  const [showImportSection, setShowImportSection] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  // Handle Export Current Game JSON
  const handleExportCurrent = () => {
    try {
      const exportData = {
        id: activeTenant.id,
        name: activeTenant.name,
        shortName: activeTenant.shortName,
        region: activeTenant.region,
        generation: activeTenant.generation,
        badge: activeTenant.badge,
        description: activeTenant.description,
        routes: activeTenant.routes,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pokemon-database-${activeTenant.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error al exportar: ${err.message}`);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      processJsonImport(content);
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const processJsonImport = (rawContent: string) => {
    setImportError(null);
    setImportSuccess(null);
    try {
      const newTenant = parseImportedTenantJson(rawContent);
      onAddCustomTenant(newTenant);
      setImportSuccess(
        `¡Mod "${newTenant.name}" importado con éxito! Se cargaron ${newTenant.routes.length} rutas.`
      );
      setJsonText('');
      // Automatically switch to the imported tenant
      onSelectTenant(newTenant.id);
    } catch (err: any) {
      setImportError(err.message || 'Error al procesar el archivo JSON.');
    }
  };

  // Copy sample JSON template
  const handleCopySample = () => {
    const sample = {
      name: 'Mi ROM Hack Personalizado',
      shortName: 'Mi ROM Hack',
      region: 'Kanto / Personalizada',
      generation: 'ROM Hack Custom',
      badge: 'Mod de Usuario',
      description: 'Base de datos para mi run de Nuzlocke',
      routes: [
        {
          id: 'mi-ruta-1',
          name: 'Ruta 1',
          category: 'Ruta',
          encounters: [
            { pokemon: 'Pidgey', chance: 50, levelRange: 'Nv. 2-4', method: 'Visible' },
            { pokemon: 'Rattata', chance: 50, levelRange: 'Nv. 2-4', method: 'Visible' },
          ],
        },
      ],
    };
    navigator.clipboard.writeText(JSON.stringify(sample, null, 2));
    alert('Plantilla JSON de ejemplo copiada al portapapeles.');
  };

  return (
    <div
      id="game-tenant-modal-backdrop"
      className={surface.overlay}
      onClick={onClose}
    >
      <div
        id="game-tenant-modal"
        className={cn(surface.modal, 'max-w-3xl max-h-[90vh] flex flex-col')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between gap-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <span className={iconTile('accent', 'w-11 h-11')}>
              <Gamepad2 className="w-6 h-6" />
            </span>
            <div>
              <h3 className={text.sectionTitle}>
                Selector de Edición & Mods de Pokémon
              </h3>
              <p className={text.muted}>
                Cambia entre juegos oficiales y mods de Pokémon, o importa tu propia base de datos de rutas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={iconBtn('ghost', 'md', 'neutral')}
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Active Game Quick Summary */}
          <div className={card({ tone: 'accent', extra: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3' })}>
            <div>
              <span className={cn(text.label, TONES.accent.ink)}>
                Partida Activa Actualmente
              </span>
              <h4 className={cn(text.sectionTitle, 'flex items-center gap-2')}>
                {activeTenant.name}
                <span className={pill('accent', 'sm')}>{activeTenant.region}</span>
              </h4>
              <p className={cn(text.muted, 'mt-0.5')}>
                {activeTenant.routes.length} rutas disponibles • {history.length} encuentros registrados
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCurrent}
              className={btn('secondary', 'sm', 'accent', 'self-start sm:self-auto')}
            >
              <Download className="w-4 h-4" />
              <span>Exportar JSON</span>
            </button>
          </div>

          {/* Tenants Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={text.label}>
                Catálogo de Juegos & Mods Disponibles
              </h4>
              <span className={cn(text.muted, 'font-semibold')}>
                {tenants.length} {tenants.length === 1 ? 'juego' : 'juegos'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tenants.map((t) => {
                const isCurrent = t.id === activeTenantId;
                return (
                  <div
                    key={t.id}
                    id={`tenant-card-${t.id}`}
                    onClick={() => {
                      if (!isCurrent) {
                        onSelectTenant(t.id);
                        onClose();
                      }
                    }}
                    className={card({
                      interactive: !isCurrent,
                      active: isCurrent,
                      extra: 'flex flex-col justify-between relative group p-4 sm:p-5',
                    })}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={pill('neutral', 'sm')}>
                          <Compass className={cn('w-3 h-3', TONES.accent.ink)} />
                          {t.region}
                        </span>

                        <div className="flex items-center gap-1">
                          <span className={pill('accent', 'xs')}>
                            {t.generation}
                          </span>

                          {t.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    `¿Seguro que deseas eliminar el mod personalizado "${t.name}"?`
                                  )
                                ) {
                                  onDeleteCustomTenant(t.id);
                                }
                              }}
                              className={iconBtn('ghost', 'sm', 'danger')}
                              title="Eliminar este mod personalizado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <h5 className={cn(text.cardTitle, 'group-hover:text-brand-accent-ink transition-colors')}>
                        {t.name}
                      </h5>
                      <p className={cn(text.muted, 'mt-1.5 line-clamp-2')}>
                        {t.description}
                      </p>

                      <div className={cn(text.meta, 'mt-3 font-medium')}>
                        {t.routes.length} rutas configuradas
                      </div>
                    </div>

                    {/* Activation Button */}
                    <div className={cn('mt-4 pt-3 flex items-center justify-between', layout.divider)}>
                      {isCurrent ? (
                        <div className={cn(pill('success', 'md'), 'w-full justify-center py-2')}>
                          <Check className="w-4 h-4" />
                          <span>Partida en curso activa</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTenant(t.id);
                            onClose();
                          }}
                          className={btn('primary', 'md', 'accent', 'w-full')}
                        >
                          <Gamepad2 className="w-3.5 h-3.5" />
                          <span>Cargar Base de Datos</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Import Custom Mod / JSON Database Section */}
          <div className={inset('space-y-3 p-4 sm:p-5')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className={cn('w-5 h-5', TONES.info.ink)} />
                <h4 className={text.subtitle}>
                  Importar Nuevo Mod o ROM Hack (JSON)
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowImportSection(!showImportSection)}
                className={cn(text.link, 'text-xs flex items-center gap-1')}
              >
                {showImportSection ? 'Ocultar panel' : 'Abrir importador'}
              </button>
            </div>

            <p className={text.muted}>
              ¿Juegas a otro mod o ROM hack (como Polished Crystal, Blaze Black, Unbound, etc.)? Carga tu archivo JSON de rutas y úsalo con todas las funciones del Nuzlocke.
            </p>

            {showImportSection && (
              <div className={cn('space-y-4 pt-3', layout.divider, anim.fadeIn)}>
                {/* File picker button */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={btn('primary', 'sm', 'info')}
                  >
                    <Upload className="w-4 h-4" />
                    Subir archivo .json
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySample}
                    className={btn('secondary', 'sm')}
                  >
                    Copiar Plantilla JSON de Ejemplo
                  </button>
                </div>

                {/* Paste Textarea */}
                <div className="space-y-1.5">
                  <label className={field.label}>
                    O pega el código JSON aquí directamente:
                  </label>
                  <textarea
                    rows={4}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='{"name": "Mi ROM Hack", "region": "Kanto", "routes": [...] }'
                    className={cn(field.textarea, 'font-mono text-xs')}
                  />
                </div>

                {/* Submit button for pasted text */}
                {jsonText.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => processJsonImport(jsonText)}
                    className={btn('primary', 'sm')}
                  >
                    <Plus className="w-4 h-4" />
                    Procesar y Guardar Mod
                  </button>
                )}

                {/* Feedback Alerts */}
                {importError && (
                  <div className={card({ tone: 'danger', padding: 'compact', extra: 'flex items-start gap-2 text-xs' })}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className={card({ tone: 'success', padding: 'compact', extra: 'flex items-center gap-2 text-xs' })}>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{importSuccess}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={cn('p-4 sm:p-5 bg-brand-surface flex items-center justify-end', layout.divider)}>
          <button
            type="button"
            onClick={onClose}
            className={btn('primary', 'md')}
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
