
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
				border: 'hsl(240 5.9% 10%)',
				input: 'hsl(240 5.9% 10%)',
				ring: 'hsl(240 5.9% 10%)',
				background: 'hsl(240 10% 3.9%)',
				foreground: 'hsl(0 0% 98%)',
				primary: {
					DEFAULT: 'hsl(217 91.2% 59.8%)',
					foreground: 'hsl(240 10% 3.9%)'
				},
				secondary: {
					DEFAULT: 'hsl(240 5.9% 10%)',
					foreground: 'hsl(0 0% 98%)'
				},
				destructive: {
					DEFAULT: 'hsl(0 84.2% 60.2%)',
					foreground: 'hsl(0 0% 98%)'
				},
				muted: {
					DEFAULT: 'hsl(240 5.9% 10%)',
					foreground: 'hsl(240 3.8% 46.1%)'
				},
				accent: {
					DEFAULT: 'hsl(240 5.9% 10%)',
					foreground: 'hsl(0 0% 98%)'
				},
				popover: {
					DEFAULT: 'hsl(240 10% 3.9%)',
					foreground: 'hsl(0 0% 98%)'
				},
				card: {
					DEFAULT: 'hsl(240 10% 3.9%)',
					foreground: 'hsl(0 0% 98%)'
				},
				sidebar: {
					DEFAULT: 'hsl(240 10% 3.9%)',
					foreground: 'hsl(0 0% 98%)',
					primary: 'hsl(217 91.2% 59.8%)',
					'primary-foreground': 'hsl(240 10% 3.9%)',
					accent: 'hsl(240 5.9% 10%)',
					'accent-foreground': 'hsl(0 0% 98%)',
					border: 'hsl(240 5.9% 10%)',
					ring: 'hsl(240 5.9% 10%)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow': 'glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
