# Guía de Estilo y Sistema de Diseño — Nuzlocke Tracker

Documento de especificación visual y componentes de la aplicación **Nuzlocke Tracker**. Este sistema de diseño define los fundamentos de color, tipografía, tokens de diseño y componentes clave para asegurar consistencia visual en entornos de **Modo Claro** y **Modo Oscuro**.

---

## 1. Paleta de Colores

### 1.1 Modo Oscuro (Dark Mode)
Diseñado para reducir la fatiga visual en entornos de poca luz, manteniendo un alto contraste y jerarquía de capas mediante el uso de elevaciones sobre tonos azulados oscuros.

| Token | Nombre | Código Hex | Uso Principal |
| :--- | :--- | :--- | :--- |
| `color-dark-bg` | **Bg** | `#0C1017` | Fondo principal del lienzo (Canvas / Root) |
| `color-dark-surf` | **Surf** | `#161B26` | Superficies secundarias, barras de navegación y containers |
| `color-dark-card` | **Card** | `#1E2533` | Tarjetas, contenedores interactivos y modales |
| `color-dark-bord` | **Bord** | `#2B3548` | Bordes, divisores y delimitadores de sección |
| `color-dark-txt1` | **Txt1** | `#F4F6F9` | Texto principal, encabezados e iconos activos |
| `color-dark-txt2` | **Txt2** | `#8292A6` | Texto secundario, subtítulos, placeholders y captions |

---

### 1.2 Modo Claro (Light Mode)
Una paleta limpia y luminosa con contrastes nítidos sobre tonos neutros y azulados suaves para máxima legibilidad durante el día.

| Token | Nombre | Código Hex | Uso Principal |
| :--- | :--- | :--- | :--- |
| `color-light-bg` | **Bg** | `#FFFFFF` | Fondo principal del lienzo |
| `color-light-surf` | **Surf** | `#F4F6F8` | Contenedores secundarios, áreas de soporte |
| `color-light-card` | **Card** | `#FFFFFF` | Tarjetas y contenedores elevados (con sombra/borde) |
| `color-light-bord` | **Bord** | `#E5E9F0` | Bordes finos, separadores y trazados de componentes |
| `color-light-txt1` | **Txt1** | `#111827` | Texto primario, títulos y elementos con alto foco |
| `color-light-txt2` | **Txt2** | `#64748B` | Texto secundario, descripciones y metadatos |

---

### 1.3 Colores de Tipo Pokémon (Pokémon Type Badges)
Paleta cromática identificadora para cada tipo Pokémon. Incluye las 12 categorías base de la interfaz más los 6 tipos complementarios (**Dragón, Siniestro, Fantasma, Hada, Acero, Roca**).

#### Tipos Principales (Interficie Original)
| Tipo | Código Hex | Color Visual | Recomendación de Texto |
| :--- | :--- | :--- | :--- |
| **Normal** | `#A8A77A` | Caqui / Olive | Texto Blanco `#FFFFFF` |
| **Fuego** | `#EE8130` | Naranja Cálido | Texto Blanco `#FFFFFF` |
| **Agua** | `#6390F0` | Azul Vibrante | Texto Blanco `#FFFFFF` |
| **Planta** | `#7AC74C` | Verde Hoja | Texto Blanco `#FFFFFF` |
| **Eléctrico** | `#F7D02C` | Amarillo Rayo | Texto Oscuro `#111827` |
| **Hielo** | `#96D9D6` | Turquesa / Cian | Texto Oscuro `#111827` |
| **Lucha** | `#C22E28` | Rojo Carmín | Texto Blanco `#FFFFFF` |
| **Veneno** | `#A33EA1` | Púrpura Intenso | Texto Blanco `#FFFFFF` |
| **Tierra** | `#E2BF65` | Arena / Ocre | Texto Oscuro `#111827` |
| **Volador** | `#A98FF3` | Lavanda / Violeta Claro | Texto Blanco `#FFFFFF` |
| **Psíquico** | `#F95587` | Rosa Neo / Magenta | Texto Blanco `#FFFFFF` |
| **Bicho** | `#A6B91A` | Verde Lima / Oliva | Texto Blanco `#FFFFFF` |

#### Tipos Adicionales Añadidos
| Tipo | Código Hex | Color Visual | Recomendación de Texto |
| :--- | :--- | :--- | :--- |
| **Dragón** | `#6F35FC` | Azul Índigo / Violeta Profundo | Texto Blanco `#FFFFFF` |
| **Siniestro** | `#705746` | Marrón Oscuro / Carbón | Texto Blanco `#FFFFFF` |
| **Fantasma** | `#735797` | Violeta Espectral | Texto Blanco `#FFFFFF` |
| **Hada** | `#D685AD` | Rosa Pastel / Algodón | Texto Blanco `#FFFFFF` |
| **Acero** | `#B7B7CE` | Gris Metálico / Plateado | Texto Oscuro `#111827` |
| **Roca** | `#B6A136` | Pardo / Piedra Dorado | Texto Blanco `#FFFFFF` |

---

## 2. Tipografía

La fuente tipográfica oficial para todo el ecosistema es **Inter**, una sans-serif optimizada para pantallas que garantiza alta legibilidad en densidades elevadas de datos.

- **Familia Tipográfica:** `Inter`, system-ui, -apple-system, sans-serif

### 2.1 Jerarquía Tipográfica

| Nivel | Peso | Tamaño (px / rem) | Line Height | Uso |
| :--- | :--- | :--- | :--- | :--- |
| **Heading** | Bold (700) | `24px` / `1.5rem` | `1.25` | Títulos principales de pantalla (ej. "Paleta de Colores") |
| **Subheading** | Semibold (600) | `18px` / `1.125rem` | `1.35` | Subtítulos de sección, nombres de Pokémon, headers de card |
| **Body** | Regular (400) | `14px` / `0.875rem` | `1.5` | Texto descriptivo principal, listas y contenidos |
| **Caption** | Regular (400) / Medium (500) | `12px` / `0.75rem` | `1.4` | Etiquetas secundarias, fechas, barras de estado y notas de pie |

---

## 3. Componentes Clave

### 3.1 Botones Acción Principal y Secundario

#### Primary CTA (Red)
- **Fondo:** `#FF3B30` (o `#EF4444`)
- **Texto:** `#FFFFFF` (Bold / Semibold)
- **Border-radius:** `12px` / `0.75rem`
- **Padding:** `14px 24px`
- **Uso:** Acciones críticas o de alto impacto (ej. "Añadir Pokémon", "Iniciar Nuzlocke", "Capturado").

#### Secondary Outlined
- **Fondo:** Transparente (o `Surf` al hover)
- **Borde:** `1px solid var(--color-bord)`
- **Texto:** `var(--color-txt1)` (Semibold)
- **Border-radius:** `12px` / `0.75rem`
- **Padding:** `14px 24px`
- **Uso:** Acciones secundarias, cancelación o navegación secundaria.

---

### 3.2 Barra de Navegación Inferior (Bottom Navigation Bar)
- **Fondo:** `var(--color-surf)`
- **Borde superior:** `1px solid var(--color-bord)`
- **Altura:** `64px`
- **Ítems:**
  1. **Historia** (Icono de libro)
  2. **Ruleta** (Icono circular/rueda)
  3. **Bitácora** (Icono de notas)
  4. **Datos** (Icono activo de datos/estadísticas - Color primario `#FF3B30`)

---

## 4. Implementación en Código

### 4.1 CSS Custom Properties (Variables CSS)

```css
:root {
  /* Fuente */
  --font-family-base: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Modo Claro (Default) */
  --bg-color: #FFFFFF;
  --surf-color: #F4F6F8;
  --card-color: #FFFFFF;
  --bord-color: #E5E9F0;
  --txt-primary: #111827;
  --txt-secondary: #64748B;

  /* Accent & CTA */
  --cta-primary: #FF3B30;
  --cta-primary-hover: #E03126;

  /* Pokémon Types */
  --type-normal: #A8A77A;
  --type-fuego: #EE8130;
  --type-agua: #6390F0;
  --type-planta: #7AC74C;
  --type-electrico: #F7D02C;
  --type-hielo: #96D9D6;
  --type-lucha: #C22E28;
  --type-veneno: #A33EA1;
  --type-tierra: #E2BF65;
  --type-volador: #A98FF3;
  --type-psiquico: #F95587;
  --type-bicho: #A6B91A;
  --type-dragon: #6F35FC;
  --type-siniestro: #705746;
  --type-fantasma: #735797;
  --type-hada: #D685AD;
  --type-acero: #B7B7CE;
  --type-roca: #B6A136;
}

[data-theme="dark"] {
  --bg-color: #0C1017;
  --surf-color: #161B26;
  --card-color: #1E2533;
  --bord-color: #2B3548;
  --txt-primary: #F4F6F9;
  --txt-secondary: #8292A6;
}
```

### 4.2 Configuración Tailwind CSS (`tailwind.config.js`)

```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#FF3B30',
        },
        dark: {
          bg: '#0C1017',
          surf: '#161B26',
          card: '#1E2533',
          bord: '#2B3548',
          txt1: '#F4F6F9',
          txt2: '#8292A6',
        },
        light: {
          bg: '#FFFFFF',
          surf: '#F4F6F8',
          card: '#FFFFFF',
          bord: '#E5E9F0',
          txt1: '#111827',
          txt2: '#64748B',
        },
        pokemon: {
          normal: '#A8A77A',
          fuego: '#EE8130',
          agua: '#6390F0',
          planta: '#7AC74C',
          electrico: '#F7D02C',
          hielo: '#96D9D6',
          lucha: '#C22E28',
          veneno: '#A33EA1',
          tierra: '#E2BF65',
          volador: '#A98FF3',
          psiquico: '#F95587',
          bicho: '#A6B91A',
          dragon: '#6F35FC',
          siniestro: '#705746',
          fantasma: '#735797',
          hada: '#D685AD',
          acero: '#B7B7CE',
          roca: '#B6A136',
        },
      },
    },
  },
}
```

---

## 5. Reglas de Accesibilidad y Buenas Prácticas

1. **Contraste de Texto sobre Badges de Tipo:**
   - Los tipos `Eléctrico`, `Hielo`, `Tierra` y `Acero` deben utilizar texto oscuro (`#111827`) para cumplir con la norma **WCAG AA (ratio >= 4.5:1)**.
   - Los demás tipos utilizan texto blanco (`#FFFFFF`).
2. **Esquinas Redondeadas (Border Radius):**
   - Tarjetas y Botones: `12px` (`rounded-xl` / `0.75rem`).
   - Badges de Tipo: `8px` o `9999px` (Pill format).
3. **Elevación y Sombras:**
   - En Modo Oscuro, evitar sombras difusas pesadas; utilizar bordes de definición (`#2B3548`) y cambios de color de superficie (`#161B26` vs `#1E2533`).
