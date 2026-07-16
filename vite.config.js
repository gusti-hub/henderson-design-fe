import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // TipTap v3 + ProseMirror have internal circular imports that cause
        // "Cannot access before initialization" TDZ errors when Rollup inlines
        // them into the main chunk. Splitting them into a dedicated vendor chunk
        // lets Rollup resolve their circular deps in isolation.
        manualChunks(id) {
          if (
            id.includes('node_modules/@tiptap') ||
            id.includes('node_modules/prosemirror') ||
            id.includes('node_modules/@lezer')
          ) {
            return 'editor-vendor';
          }
        },
      },
    },
  },
})
