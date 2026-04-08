# Guia de Estilos — Resonancias de la Esparta

> El Atlas Vivo de Marinilla
> Documento de referencia visual y narrativa para el equipo de desarrollo y diseño.

---

## 1. Paleta de Colores

La paleta se inspira en los **tonos del bronce, la piedra de los monumentos y los colores civicos de Marinilla**, segun la Biblia Transmedia.

### Colores primarios

| Token | Hex | Uso |
|---|---|---|
| **Bronce (primario)** | `#B87333` | Botones, acentos, badges, links activos, tab activo |
| **Bronce oscuro** | `#8B5E3C` | Sombras, bordes activos dark mode |
| **Dorado calido** | `#C9A96E` | Eyebrows, chevrons, acentos secundarios, iconos decorativos |
| **Arena claro** | `#D4B483` | Separadores, flechas, elementos terciarios |
| **Arena medio** | `#A67C52` | Iconos decorativos, hints |

### Modo claro (Light)

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#FAF8F3` | Fondo principal |
| `bgAlt` | `#F7F4EE` | Fondo alternativo |
| `surface` | `#FFFFFF` | Cards, modales, inputs |
| `surfacePrimary` | `#F5EDE0` | Fondos con acento (badges, icon wraps) |
| `surfacePrimaryLight` | `#FAF5ED` | Fondos sutiles |
| `text` | `#1A1710` | Texto principal |
| `textSub` | `#3D3628` | Texto secundario |
| `textMuted` | `#6B6355` | Texto apagado |
| `textFaint` | `#948B7A` | Texto muy sutil (hints, fechas) |
| `border` | `#F0EBE0` | Bordes de cards |
| `borderPrimary` | `#DDD0B8` | Bordes con acento (inputs activos, botones outline) |
| `tabBar` | `#FFFFFF` | Fondo del tab bar |
| `tabBarBorder` | `#EDE5D8` | Borde superior del tab bar |

### Modo oscuro (Dark)

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#1A1710` | Fondo principal (tierra profunda) |
| `bgAlt` | `#1E1B14` | Fondo alternativo |
| `surface` | `#252117` | Cards, modales |
| `surfacePrimary` | `#3A2E1A` | Fondos con acento |
| `surfacePrimaryLight` | `#2D2415` | Fondos sutiles |
| `text` | `#F0E8DA` | Texto principal |
| `textSub` | `#C8BFAE` | Texto secundario |
| `textMuted` | `#8A8070` | Texto apagado |
| `textFaint` | `#5E5649` | Texto muy sutil |
| `border` | `#3D3425` | Bordes de cards |
| `borderPrimary` | `#7A6340` | Bordes con acento |
| `tabBar` | `#252117` | Fondo del tab bar |
| `tabBarBorder` | `#3D3425` | Borde superior del tab bar |

### Colores de estado (no cambian con el tema)

| Color | Hex | Uso |
|---|---|---|
| Rojo / Live | `#EF4444` | Eventos en curso, errores |
| Rosa / Favorito | `#F43F5E` | Corazon de favoritos |
| Verde / Exito | `#10B981` | Aprobado, exito |
| Ambar / Warning | `#F59E0B` | Admin, featured, advertencias |
| Naranja / Precio | `#D97706` | Precio de eventos pagos |

### Colores por categoria de evento

| Categoria | Color texto | Color fondo | Emoji |
|---|---|---|---|
| Religioso | `#B45309` | `#FEF3C7` | ⛪ |
| Artistico | `#0F766E` | `#CCFBF1` | 🎨 |
| Cultural | `#B87333` | `#F5EDE0` | 🏛️ |
| Social | `#F59E0B` | `#FEF3C7` | 🤝 |
| Deportivo | `#10B981` | `#D1FAE5` | ⚽ |
| Educativo | `#3B82F6` | `#DBEAFE` | 📚 |

---

## 2. Tipografia

La app usa las fuentes del sistema (San Francisco en iOS, Roboto en Android, system-ui en web).

| Elemento | Tamano | Peso | Tracking |
|---|---|---|---|
| Titulo de pantalla | 28px | 800 (ExtraBold) | -0.5 |
| Titulo de card hero | 24px | 800 | — |
| Titulo de card | 15-17px | 700 (Bold) | — |
| Subtitulo / Descripcion | 14-15px | 400-500 | — |
| Eyebrow (etiqueta superior) | 11px | 700 | 1.4 (uppercase) |
| Badge / Pill | 11-12px | 600-700 | 0.2 |
| Texto muted / Hint | 12-13px | 500 | — |
| Footer decorativo | 11px | 600 | 1.0 (uppercase) |

### Estilo literario en textos

- Los **acertijos** van en *italica* entre comillas
- Los **tags narrativos** ("Raices", "Ecos del presente") van en *italica* bold 10px
- El **eyebrow** siempre va en UPPERCASE con letter-spacing amplio

---

## 3. Espaciado y Layout

| Elemento | Valor |
|---|---|
| Padding horizontal de pantalla | 20-24px |
| Margen horizontal de cards | 16px |
| Border radius de cards | 16-18px |
| Border radius de botones | 14-16px |
| Border radius de pills/badges | 20px |
| Gap entre cards | 10-12px |
| Gap entre secciones | 16-20px |
| Altura del tab bar | 68px |
| Padding inferior (para tab bar) | 80-90px |

---

## 4. Componentes Clave

### Cards de evento
- Fondo: `surface`
- Borde: 1px `border`
- Sombra: `#8B5E3C` opacity 0.06-0.07
- Border radius: 18px
- Padding interno: 16px
- **Tag narrativo** visible antes del titulo: "Raices" o "Ecos del presente"

### Botones primarios
- Fondo: `#B87333`
- Texto: `#FFFFFF` bold
- Border radius: 14-16px
- Sombra: `#B87333` offset-y 4, opacity 0.3

### Botones secundarios (outline)
- Fondo: transparente o `surfacePrimaryLight`
- Borde: 1.5px `borderPrimary`
- Texto: `#B87333` bold

### Pills de filtro
- Inactivo: fondo `surface`, borde `borderPrimaryLight`
- Activo: fondo = color de la categoria, texto blanco
- Border radius: 20px
- Padding: 13px horizontal, 34px altura

### Hero card (evento destacado)
- Fondo: color de la categoria (full bleed)
- Texto blanco
- Decoradores: circulos blancos con opacity 0.1
- CTA: boton blanco con texto del color de la categoria

---

## 5. Iconografia

### Tabs

| Tab | Icono Ionicons | Nombre |
|---|---|---|
| Inicio | `home` / `home-outline` | Inicio |
| El Latido | `pulse` / `pulse-outline` | El Latido |
| Favoritos | `heart` / `heart-outline` | Favoritos |
| Resonar | `megaphone` / `megaphone-outline` | Resonar |
| Expedicionario | `person` / `person-outline` | Expedicionario |

### Emojis recurrentes

| Concepto | Emoji |
|---|---|
| Brujula / Expedicion | 🧭 |
| El Latido | 📡 |
| La Lupa del Tiempo | 🔍 |
| Hora / Tiempo | 🕐 |
| Ubicacion | 📍 |
| Entrada | 🎟 |
| Municipalidad | 🏛️ |
| Contacto email | ✉️ |
| Contacto WhatsApp | 💬 |

---

## 6. Lenguaje Narrativo

La app usa un **lenguaje inmersivo** alineado a la Biblia Transmedia "Resonancias de la Esparta". El usuario es un **Expedicionario de la Memoria**.

### Vocabulario de la app

| Concepto generico | Termino en la app |
|---|---|
| Eventos de hoy | **El Latido** — el pulso del presente |
| Proximos eventos | **La Brujula** — expediciones proximas |
| Categorias | **Frecuencias** |
| Filtro "Todos" | **Todas las frecuencias** |
| Evento destacado | **Resonancia destacada** |
| En curso ahora | **Resonando ahora** |
| Proximos | **Proximas vibraciones** |
| Finalizados | **Ecos del dia** |
| Lo que viene | **Proximas frecuencias** |
| Publicar evento | **Resonar** — hace resonar tu voz |
| Mis publicaciones | **Mis resonancias** |
| Favoritos | **Bitacora de expedicionario** |
| Mis guardados | **Mi bitacora** |
| Perfil | **Expedicionario** |
| Patrimonio gamificado | **La Lupa del Tiempo** — el rompecabezas de la memoria |
| Desafio/Reto | **Reto** — con acertijo literario |
| Progreso | **Fragmentos del alma musical de Marinilla** |

### Tags narrativos en cards

| Tipo de evento | Tag |
|---|---|
| Cultural, Religioso | *Raices* |
| Artistico, Social, Deportivo, Educativo | *Ecos del presente* |

### Puente a gamificacion (detalle de evento)

Cada evento muestra al final un bloque que dice:
> "¿Vas a este evento? Abri los ojos. Cerca de este lugar hay un fragmento de la memoria oculto esperando ser descubierto por un expedicionario."

### Textos de autenticacion

| Pantalla | Titulo | Subtitulo |
|---|---|---|
| Login | ¡Bienvenido de vuelta, expedicionario! | Ingresa y segui explorando las resonancias del territorio |
| Registro | Unite a la expedicion | Crea tu cuenta para resonar y descubrir el atlas vivo |
| Guest (Perfil) | ¡Bienvenido, expedicionario! | Unite a la expedicion y descubri las resonancias... |
| Guest (Favoritos) | Tu bitacora de expedicionario | Inicia sesion para guardar las resonancias que te conmueven... |
| Guest (Publicar) | Hace resonar tu voz | Abri tu cuenta y suma tu vibracion al atlas... |

---

## 7. Estructura de Navegacion

```
Intro (solo primera visita, scroll inmersivo GSAP)
  └─> Home Hub (tabs/index)
        ├─ El Latido (tabs/latido) ← agenda del dia
        ├─ La Brujula (tabs/explore) ← proximos eventos (accesible desde home)
        ├─ Favoritos (tabs/favorites) ← bitacora del expedicionario
        ├─ Resonar (tabs/submit) ← publicar eventos
        ├─ Expedicionario (tabs/profile) ← perfil y preferencias
        └─ La Lupa del Tiempo (/lupa) ← retos gamificados (stack screen)

Evento detalle (/event/[id]) ← stack screen
Auth (/auth/login, /auth/register) ← modales
Admin (/admin/dashboard) ← panel admin
```

---

## 8. La Lupa del Tiempo — Estructura de Retos

Cada reto tiene:

| Campo | Descripcion |
|---|---|
| `title` | Nombre del fragmento patrimonial |
| `acertijo` | Texto literario/poetico que guia al lugar fisico |
| `locationHint` | Lugar donde se encuentra el anclaje QR |
| `category` | Monumento, Instrumento, Personaje, Patrimonio, Lugar, Naturaleza |
| `difficulty` | Iniciado (verde), Explorador (ambar), Maestro (rojo) |
| `status` | `locked` (bloqueado), `unlocked` (activo), `discovered` (completado) |
| `fragments` | Progreso de fragmentos (ej: "1/5") |

### Flujo del reto

1. **El Vistazo**: El usuario ve el acertijo y la pista de ubicacion
2. **La Caceria**: Va al sitio fisico, encuentra el anclaje QR
3. **El Descubrimiento**: Escanea → se desbloquea el modelo 3D (futuro)
4. **La Resena**: Historia expandida del patrimonio
5. **La Recompensa**: "Has recuperado X de Y fragmentos del alma musical de Marinilla"

---

## 9. Archivos Clave

| Archivo | Proposito |
|---|---|
| `context/ThemeContext.tsx` | Paleta completa light/dark |
| `constants/categories.ts` | Colores y emojis por categoria |
| `components/CategoryPill.tsx` | Pill de filtro reutilizable |
| `components/EventCard.tsx` | Card de evento con tag narrativo |
| `components/EventHero.tsx` | Card hero destacada |
| `app/(tabs)/index.tsx` | Home hub (portal) |
| `app/(tabs)/latido.tsx` | El Latido (agenda del dia) |
| `app/(tabs)/explore.tsx` | La Brujula (proximos) |
| `app/lupa.tsx` | La Lupa del Tiempo (retos) |
| `app/intro.tsx` | Intro inmersiva (GSAP, solo web) |

---

## 10. Assets y Recursos

- **PDF de referencia**: `Resonancias de esparta (Biblia transmedia).pdf`
- **Produccion**: https://resonancias-de-la-esparta.vercel.app
- **Repositorio**: branch `feature/intro`

---

*Documento generado el 7 de abril de 2026 — Corporacion Licania*
