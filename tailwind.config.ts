
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(240 5.9% 15%)',
				input: 'hsl(240 5.9% 15%)',
				ring: 'hsl(240 5.9% 15%)',
				background: 'hsl(220 25% 10%)',
				foreground: 'hsl(0 0% 98%)',
				primary: {
					DEFAULT: 'hsl(217 91.2% 59.8%)',
					foreground: 'hsl(240 10% 3.9%)'
				},
				secondary: {
					DEFAULT: 'hsl(240 5.9% 15%)',
					foreground: 'hsl(0 0% 98%)'
				},
				destructive: {
					DEFAULT: 'hsl(0 84.2% 60.2%)',
					foreground: 'hsl(0 0% 98%)'
				},
				muted: {
					DEFAULT: 'hsl(240 5.9% 15%)',
					foreground: 'hsl(240 3.8% 46.1%)'
				},
				accent: {
					DEFAULT: 'hsl(240 5.9% 15%)',
					foreground: 'hsl(0 0% 98%)'
				},
				popover: {
					DEFAULT: 'hsl(220 25% 12%)',
					foreground: 'hsl(0 0% 98%)'
				},
				card: {
					DEFAULT: 'hsl(220 25% 13%)',
					foreground: 'hsl(0 0% 98%)'
				},
				sidebar: {
					DEFAULT: 'hsl(220 25% 8%)',
					foreground: 'hsl(0 0% 98%)',
					primary: 'hsl(217 91.2% 59.8%)',
					'primary-foreground': 'hsl(240 10% 3.9%)',
					accent: 'hsl(240 5.9% 15%)',
					'accent-foreground': 'hsl(0 0% 98%)',
					border: 'hsl(240 5.9% 15%)',
					ring: 'hsl(240 5.9% 15%)'
				},
				vpn: {
					DEFAULT: '#3b82f6',
					light: '#60a5fa',
					dark: '#1d4ed8',
					foreground: '#ffffff'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
					'50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.9)' }
				},
				'pulse-blue': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
					'50%': { boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'pulse-blue': 'pulse-blue 2s infinite',
				'float': 'float 3s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'grid-pattern': 'linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
				'cyber-glow': 'linear-gradient(135deg, rgba(21, 31, 48, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
			},
			boxShadow: {
				'neon-blue': '0 0 5px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
				'inner-glow': 'inset 0 0 15px rgba(59, 130, 246, 0.2)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
