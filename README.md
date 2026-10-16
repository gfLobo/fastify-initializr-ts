# fastify-initializr-ts

![GitHub License](https://img.shields.io/github/license/gfLobo/fastify-initializr-ts)
![Version](https://img.shields.io/npm/v/fastify-initializr-ts)
[![Architecture diagram](https://gitdiagram.com/diagram-badge.svg)](https://gitdiagram.com/gflobo/fastify-initializr-ts?utm_source=readme&utm_medium=badge)

A modern **Fastify** boilerplate built with **TypeScript** and integrated **Swagger documentation** for fast and scalable API development — with optional **Prisma** database setup.

[![Architecture diagram of gflobo/fastify-initializr-ts](https://gitdiagram.com/gflobo/fastify-initializr-ts/diagram.png)](https://gitdiagram.com/gflobo/fastify-initializr-ts?utm_source=readme&utm_medium=picture)


## 🛠️ Installation

Install globally:
```bash
npm install -g fastify-initializr-ts
```

Then run:
```bash
npx fastify-initializr-ts
```



## ⚙️ Database setup (optional)

During setup, you'll be asked whether you want to configure a database with Prisma. If you say yes, you'll also choose a provider:

* PostgreSQL (Supabase / Neon / default)
* MySQL / PlanetScale
* SQLite (local / Turso / libSQL)
* MongoDB
* SQL Server
* CockroachDB

Based on your choice, the CLI configures the right Prisma adapter, connection strings, and generates `lib/prisma.ts` accordingly. If you skip this step, the `lib`, `prisma` folders and `prisma.config.ts` are removed, and Prisma-related dependencies are stripped from `package.json`.



## 📦 Dependencies & Documentation

<img width="11022" height="7175" alt="diagram" src="https://github.com/user-attachments/assets/845b1bec-573e-4096-8276-dd0f04cbd1f2" />


### Runtime dependencies

* [Fastify](https://fastify.dev/docs/latest/) — Web framework for Node.js focused on performance and low overhead.
* [Zod](https://zod.dev/) — TypeScript-first schema validation library.
* [@fastify/swagger](https://github.com/fastify/fastify-swagger) — Generates OpenAPI/Swagger documentation for Fastify APIs.
* [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) — Swagger UI integration for Fastify.
* [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod) — Zod type provider integration for Fastify.
* [Prisma Client](https://www.prisma.io/docs/orm/prisma-client) *(optional)* — Type-safe database client, included when a database is configured.
* [dotenv](https://github.com/motdotla/dotenv) *(optional)* — Loads environment variables from `.env`, included when a database is configured.

### Development dependencies

* [TypeScript](https://www.typescriptlang.org/docs/) — JavaScript superset with static typing support.
* [TSX](https://tsx.is/) — TypeScript execution environment powered by esbuild.
* [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node) — Type definitions for Node.js.
* [Prisma CLI](https://www.prisma.io/docs/orm/tools/prisma-cli) *(optional)* — Schema management, migrations, and client generation, included when a database is configured.



## 🤝 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

#### Branches

```text
feature/<issue-id>
```


#### Commits

```text
<type>(<issue-id>): <description>
```


#### Types

- `feat` — new feature  
- `fix` — bug fix  
- `docs` — documentation  
- `refactor` — code refactor  
- `test` — tests  
- `chore` — maintenance  
- `ci` — CI/CD changes




## 📜 License

This project is licensed under the [GPL-3.0](LICENSE).
