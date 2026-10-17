# 💤 Pokémon Sleep Master

Optimice y proyecte el rendimiento de sus equipos en **Pokémon Sleep** con precisión algorítmica, sincronización dinámica de clima y cálculo proyectivo de rangos para las 8 islas.

![Pokemon Sleep Master](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/143.gif)

## ✨ Características Principales

- 🏝️ **Cálculo de Curva y Rangos para las 8 Islas:** Proyección exacta día a día (Lunes a Domingo) considerando la asimetría de producción entre días regulares y el **Súper Domingo** (puchero ×2 y triplicación de probabilidad de ¡Riquísimo!).
- 🤖 **Motor de Optimización Beam Search:** Encuentra la combinación óptima de 5 Pokémon de tu caja considerando bayas favoritas de la isla, bonos de evento, ingredientes para recetas específicas y habilidades principales.
- 🌦️ **Atmósfera y Clima en Tiempo Real:** Detección automática de la hora del día (mañana, tarde, noche) y clima real por geolocalización (lluvia/tormenta) con partículas dinámicas.
- 🎨 **Interfaz Inspirada en Pokémon Zafiro & Escarlata/Púrpura:** Paleta oceánica de alta fidelidad, animaciones Showdown en pedestales centrados y ranuras de equipo uniformes de 142px con cambio rápido.
- 📖 **Pokédex & Gestor de Ayudantes:** Control total de subhabilidades, naturalezas, desbloqueo progresivo de ingredientes a niveles 1, 30 y 60, y notas de sinergia.
- 🍲 **Recetario Oficial de 78 Platos:** Simulación de vigor escalado según el nivel del plato (hasta Nivel 65).
- 📊 **Importación y Exportación:** Soporte completo para bases de datos en formato Excel (.xlsx) y CSV.

## 🚀 Instalación y Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/theledzed/poke-master-sleep.git
cd poke-master-sleep

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción
npm run build
```

## 🛠️ Tecnologías

- **Framework:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS con componentes modulares
- **Iconografía:** Lucide React
- **Datos y Sprites:** PokeAPI & Pokémon Showdown Animated Sprites
- **PWA:** Soporte offline con Vite PWA

---
Desarrollado con ❤️ para la comunidad de Pokémon Sleep.
