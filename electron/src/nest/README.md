# KeeNote - Nest

这是一个完整的 Nest.js 项目，可以运行在 Electron 提供的 Node.js 环境中，并且和 Electron 项目共享 package.json 中的依赖。

## Config

You can create a [`.env`](../../.env) file in the project root folder as a production configuration with content similar to `.env.development`.

You can generate [`.env`](../../.env) file with a Vue Web UI(development mode) at http://127.0.0.1:3030/#/gen

[db-config.json](../../test/db-config.json) description

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
