import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Esencial para el look industrial oscuro
  theme: {
    extend: {
      colors: {
        // Paleta base: Acero frío y profundo
        industrial: {
          950: '#0a0c10', // Fondo principal (Casi negro metal)
          900: '#11141b', // Tarjetas y superficies
          800: '#1b1f29', // Bordes y separadores
          700: '#2d3544', // Hovers y estados secundarios
          400: '#94a3b8', // Texto secundario
          100: '#f1f5f9', // Texto principal
        },
        // Acento: Naranja de seguridad premium (menos chillón, más sólido)
        accent: {
          DEFAULT: '#f97316',
          states: '#ea580c',
          glow: 'rgba(249, 115, 22, 0.15)',
        },
        // Estados de maquinaria / KPI
        status: {
          online: '#10b981', // Esmeralda quirúrgico
          warning: '#f59e0b', // Ámbar de precaución
          critical: '#ef4444', // Rojo de paro de emergencia
        }
      },
      fontFamily: {
        // 'Inter' para lectura limpia, 'JetBrains Mono' para datos numéricos/técnicos
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        // Sombra sutil y dura que evoca profundidad mecánica
        'industrial-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
        'premium-glow': '0 0 20px -5px rgba(249, 115, 22, 0.3)',
      },
      backgroundImage: {
        // Efecto sutil de malla metálica o grid técnico
        'tech-grid': "url(\"data:image/svg+xml,%3Csvg xmlns='http://w3.org' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h1v40H0V0zm1 0h39v1H1V0z' fill='%23ffffff' fill-opacity='0.02'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config
