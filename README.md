# KeeNote

- 安全的本地笔记App (Electron App + Web UI)
- 技术栈： KeePass (kdbxweb) + Nest.js + Vue 3 (NaiveUI)

---

- A secure note-editing app (Electron Desktop App + Web UI)
- Powered by KeePass (kdbxweb) + Electron + Nest.js + Vue 3 (NaiveUI)

## Screenshot

Open a kdbx database:

![screenshot](./electron/test/screenshot1.jpg)

Tree view + list view:

![screenshot](./electron/test/screenshot2.jpg)

Calendar view:

![screenshot](./electron/test/screenshot4.jpg)

Editing view:

![screenshot](./electron/test/screenshot3.jpg)


## Directory Structure

- `electron` App based backend, front end communicates with IPC
- `nest` Web-based backend, front-end communicates via HTTP (supports encryption)
- `vue` Frontend folder, automatically adapt backend (Election or Nest)

## Development

1. Start frontend development

```sh
cd vue
yarn
yarn dev
```

2. Start backend(nest) development

```sh
cd nest
yarn
yarn dev
```

3. Open http://127.0.0.1:3030/ ([Config](./vue/vite.config.ts))

---

## Build for production

### Build Frontend (First)

```sh
cd vue
yarn
yarn build
```

### Build Nest

See [README](./nest/README.md)

### Build Electron (Optional)

```sh
cd electron
yarn
yarn build
```
