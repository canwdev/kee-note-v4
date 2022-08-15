# KeeNote - Nest

A safe note editor server & web client, powered by KeePass (kdbxweb) + Nest.js + Vue 3 (NaiveUI)

## Installation

```shell
# Install backend
yarn install

# Install frontend
cd frontend && yarn install
```

## Dev

```shell
# Start backend
yarn start:dev

# Start frontend
cd frontend
yarn dev

# Generate a user (password with hashed)
yarn gen:user
```

You can create a `.env` file in the project root folder as a production configuration with content similar to `.env.development`.

## Windows install bcrypt

run cmd as Administrator:

```sh
npm i -g node-gyp
npm i -g --production windows-build-tools
```
