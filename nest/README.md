# KeeNote - Nest

## Development

```shell
# Install deps
yarn install

# Start backend
yarn dev
```

## Config

You can create a `.env` file in the project root folder as a production configuration with content similar to `.env.development`.

```sh
# Generate user (password with hashed) and other `.env` configs
yarn gen:config
```

[db-config.json](test/db-config.json) description

```json5
{
 "kdbxOpenOptions": {
  "dbPath": "databases/test[123456].kdbx",
  "password": "", // If written, will try auto unlock
  "keyPath": "databases/test[123456].key" // Recommend write here if you have a key
 },
 "isRelativeBase": true // If set to false, will use absolute path
}
```
