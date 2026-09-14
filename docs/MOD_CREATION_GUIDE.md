# 🎮 Guía de Creación e Importación de Mods (MOD_CREATION_GUIDE.md)

Esta guía explica cómo añadir nuevos juegos, ROM Hacks o tablas de encuentros a **Pokémon Nuzlocke Tracker**, tanto a través de la interfaz web como mediante código fuente.

---

## Opción 1: Importar un Mod desde la Interfaz Web (Sin Programar)

Cualquier usuario puede cargar su propio juego o hackrom sin modificar el código fuente:

1. Inicia la aplicación y pulsa en la cabecera superior sobre el **Selector de Juego** (el botón que muestra el juego activo, por ejemplo *Blessed Shield* o *Radical Red*).
2. Se abrirá el modal **"Juegos y Mods de Dificultad"**.
3. Pulsa en la pestaña **"Importar / Añadir Mod"**.
4. Puedes:
   - **Subir un archivo `.json`** desde tu ordenador.
   - O **pegar el contenido JSON** directamente en el área de texto.
5. Pulsa en **"Procesar e Importar Mod"**.
6. El nuevo juego aparecerá inmediatamente en tu lista de juegos disponibles con la etiqueta **"Mod de Usuario"** y su propia bitácora independiente guardada en tu navegador.

---

## Opción 2: Plantilla JSON para Crear un Mod

A continuación tienes una plantilla lista para copiar y rellenar con las rutas de tu juego:

```json
{
  "id": "mi-hack-personalizado",
  "name": "Pokémon Mi Hack V1",
  "shortName": "Mi Hack",
  "region": "Kanto",
  "generation": "Gen 3 ROM Hack",
  "badge": "Mod Custom",
  "badgeColor": "bg-violet-600",
  "description": "Tabla de encuentros adaptada para el locke de la comunidad.",
  "authorOrSource": "Comunidad",
  "routes": [
    {
      "id": "ruta-1",
      "name": "Ruta 1",
      "englishName": "Route 1",
      "category": "Ruta",
      "encounters": [
        {
          "pokemon": "Pidgey",
          "chance": 45,
          "method": "Visible",
          "weather": "All",
          "levelRange": "Lv. 2-4"
        },
        {
          "pokemon": "Rattata",
          "chance": 45,
          "method": "Visible",
          "weather": "All",
          "levelRange": "Lv. 2-4"
        },
        {
          "pokemon": "Mankey",
          "chance": 10,
          "method": "Hidden",
          "weather": "All",
          "levelRange": "Lv. 3-5"
        }
      ]
    },
    {
      "id": "ruta-2",
      "name": "Ruta 2",
      "category": "Ruta",
      "encounters": [
        {
          "pokemon": "Caterpie",
          "chance": 40,
          "method": "Visible",
          "weather": "All",
          "levelRange": "Lv. 3-5"
        },
        {
          "pokemon": "Weedle",
          "chance": 40,
          "method": "Visible",
          "weather": "All",
          "levelRange": "Lv. 3-5"
        },
        {
          "pokemon": "Pikachu",
          "chance": 20,
          "method": "Hidden",
          "weather": "All",
          "levelRange": "Lv. 4-6"
        }
      ]
    }
  ]
}
```

### Reglas para los Campos de Encuentros
- `pokemon`: Nombre de la especie. Si es una forma regional, puedes usar la convención `"Meowth (Galarian)"` o `"Vulpix (Alolan)"`. El sistema detectará automáticamente la variante para los sprites y PokeAPI.
- `chance`: Porcentaje numérico (ej. 10 para 10%). En modo ponderado, la ruleta sumará todos los porcentajes de los Pokémon filtrados.
- `method`: Uno de los siguientes valores:
  - `'Visible'` (Pokémon visto en overworld)
  - `'Hidden'` (Hierba alta tradicional)
  - `'Fishing'` (Pesca)
  - `'Surfing'` (Agua / Surf)
  - `'Otro'` (Regalos, estáticos, fósiles)
- `weather`: Usa `"All"` si la ruta no tiene clima dinámico, o especifica nombres de clima (ej. `"Lluvia"`, `"Tormenta"`, `"Despejado"`).

---

## Opción 3: Integrar un Juego Oficialmente en el Código

Si eres desarrollador y deseas integrar un nuevo juego de forma preinstalada en el repositorio:

1. Crea un nuevo archivo en `src/data/games/`, por ejemplo `src/data/games/heartGoldData.ts`.
2. Define y exporta el array de rutas utilizando el ayudante `buildRouteData`:
   ```typescript
   import { buildRouteData, SimpleRouteInput } from '../tenantHelper';
   import { RouteData } from '../../types';

   const RAW_ROUTES: SimpleRouteInput[] = [
     // Tus rutas...
   ];

   export const HEART_GOLD_ROUTES: RouteData[] = RAW_ROUTES.map((r, i) =>
     buildRouteData({ ...r, id: r.id || `hg-route-${i + 1}` })
   );
   ```
3. Registra el nuevo tenant en `src/data/tenantRegistry.ts` dentro de la función `getBuiltInTenants()`:
   ```typescript
   {
     id: 'heart-gold',
     name: 'Pokémon HeartGold',
     shortName: 'HeartGold',
     region: 'Johto',
     generation: 'Gen 4 (NDS)',
     badge: 'Oficial NDS',
     badgeColor: 'bg-amber-600',
     description: 'Aventura clásica en Johto y Kanto con gráficos de 4ª generación.',
     authorOrSource: 'Game Freak / Oficial',
     isCustom: false,
     routes: HEART_GOLD_ROUTES,
   }
   ```
4. El nuevo juego estará inmediatamente disponible en la lista de tenants sin requerir configuraciones adicionales.
