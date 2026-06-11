import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const istErweiterung = mode === 'erweiterung'

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Extension: Manifest + Icons nach Build kopieren
      istErweiterung
        ? {
            name: 'erweiterung-kopieren',
            writeBundle() {
              const outDir = resolve(__dirname, 'dist-extension')
              // manifest.json kopieren
              copyFileSync(
                resolve(__dirname, 'src/erweiterung/manifest.json'),
                resolve(outDir, 'manifest.json')
              )
              // Popup HTML kopieren
              copyFileSync(
                resolve(__dirname, 'src/erweiterung/popup/popup.html'),
                resolve(outDir, 'popup.html')
              )
              // Options HTML kopieren
              copyFileSync(
                resolve(__dirname, 'src/erweiterung/optionen/optionen.html'),
                resolve(outDir, 'optionen.html')
              )
              // Icons kopieren (falls vorhanden)
              const iconDir = resolve(__dirname, 'extension-public')
              if (existsSync(iconDir)) {
                const files = ['icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png', 'icon.svg']
                for (const file of files) {
                  const src = resolve(iconDir, file)
                  if (existsSync(src)) {
                    copyFileSync(src, resolve(outDir, file))
                  }
                }
              }
            },
          }
        : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Verschiedene Build-Konfigurationen je nach Modus
    ...(istErweiterung
      ? {
          build: {
            outDir: 'dist-extension',
            emptyOutDir: true,
            rollupOptions: {
              input: {
                hintergrund: resolve(__dirname, 'src/erweiterung/hintergrund.ts'),
                inhalt: resolve(__dirname, 'src/erweiterung/inhalt.ts'),
                popup: resolve(__dirname, 'src/erweiterung/popup/popup.ts'),
                optionen: resolve(__dirname, 'src/erweiterung/optionen/optionen.ts'),
              } as Record<string, string>,
              output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name].[ext]',
              },
            },
            // Chrome Extensions benötigen relative Pfade
            base: '',
          },
        }
      : {
          build: {
            outDir: 'dist',
            rollupOptions: {
              input: {
                main: resolve(__dirname, 'index.html'),
              },
            },
          },
        }),
  }
})
