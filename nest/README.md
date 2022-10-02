# KeeNote - Nest

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

# Generate user (password with hashed) and other `.env` configs
yarn gen:config
```

You can create a `.env` file in the project root folder as a production configuration with content similar to `.env.development`.

## Windows install bcrypt

run cmd as Administrator:

```sh
npm i -g node-gyp
npm i -g --production windows-build-tools
```
