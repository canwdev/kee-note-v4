import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {NaiveUiResolver} from 'unplugin-vue-components/resolvers'
import {fileURLToPath, URL} from 'url'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default ({mode}) => {
  // Load app-level env vars to node-level env vars.
  process.env = {...process.env, ...loadEnv(mode, process.cwd())}

  return defineConfig({
    base: './',
    build: {
      outDir: '../electron/dist-frontend',
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/_variables.scss";`,
        },
      },
    },
    plugins: [
      vueJsx(),
      vue({
        reactivityTransform: true,
      }),
      AutoImport({
        dts: './src/auto-import.d.ts',
        imports: [
          'vue',
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
          },
          'pinia',
          '@vueuse/core',
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 3030,
      proxy: {
        '/api_server': {
          target: process.env.VITE_API_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api_server/, ''),
        },
      },
    },
    esbuild: {
      jsxFactory: 'h',
      jsxInject: 'import {h,Fragment} from "vue"',
      jsxFragment: 'Fragment',
    },
  })
}
