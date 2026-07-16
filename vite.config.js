import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Force Vite to pre-bundle TipTap packages together with esbuild,
    // which resolves their internal circular dependencies before the
    // main Rollup bundle is built (fixes TDZ "Cannot access before init").
    include: [
      '@tiptap/core',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-paragraph',
      '@tiptap/extension-text-align',
      '@tiptap/extension-underline',
    ],
  },
})
