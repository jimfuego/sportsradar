# sportsradar

## Package Manager

**Please use Yarn 3.2.1**

## Database

For ease of demo, I used SQLite.

## Environment Variables

Please include a `.env` file in the root directory with the following variables.
Modify them as needed for your local configuration. These variables are accessed through the `process.env` property.

```bash
NODE_ENV=localhost
PORT=7777
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=sportradar
PG_USERNAME=postgres
PG_PASSWORD=postgres
```

## Database

You will need a postgres server with the correct configuration. A seed script has been included to create the necessary tables, etc. Run this script once your database is set up.

```
yarn seed
```

## Commands

The following commands will install the necessary dependencies, and run the server. A database (as explained above) is needed for pipeline functionality.

```bash
$ yarn set version 3.2.1
$ yarn
$ yarn dev
```
