# sportsradar

## Package Manager

Please use Yarn 3.2.1

## Database

For ease of demo, I used SQLite. No setup is required.

Therefore, the database is not persistent, but the concepts are clearly on display.

## Commands

The following commands will install the necessary dependencies, and run the server.

```cmd
$ yarn set version 3.2.1
$ yarn
$ yarn dev
```

## Postinstall

Husky is used as a hook on out git commands. It should properly install on `yarn install`. If husky hooks are not triggering, run `yarn husky install` after initializing the yarn project.

## Testing

Basic tests are included to check the functionality of the server as well as the GameTacker and LiveGame classes. These tests are called on a husky hook, and tests must succeed if changes are to be committed.

You can also run the tests with:

```cmd
yarn test
```

## What is happening?

The main scheduler looks for currently live games.

If games are live, The gameId is used to make a new LiveGame instance and adds it
to the GamePool. A second job then starts to retrieve updates, and write them to
the bronze table. That process ends itself when no games are live.

The codebase defaults to intended operation, which monitors for live games, and acts
accordingly, however, it is possible to demonstrate the functionality of the
scheduler and ingest capabilities by switching the comments on lines 51 and 52 of `index.js`.
This will add two games played by the Vancouver Canucks so that player data can be retrieved
across multiple games.

## **Endpoints**

If one desires to test the app, and **no games are live**, the gametracker app can be seeded by calling a POST to `api/vi/app/bronze/add`, as it is described below. That will enable database queries such ad `bronze/:playerId` and `bronze/:gameId`. The gameIds in the example below are valid, and can be used for this seed.

**Postman requests are located in ./sportradar.postman_collection.json**

### Bronze

[localhost:7777/api/v1/app/bronze/](localhost:7777/api/v1/app/bronze)

`GET /`

- Retrieves all bronze entries

`GET /:gameId`

- Retrieves data from a specified gameId in the format `2022010074`

`GET /:playerId`

- Retrieves data from a specified playerId in the format `8477508`

`POST /`

- Creates a bronze_table in the database, if it does not already exist

`POST /add`

- Writes data from a specified gameId if that game data is not present in
  the database.

```json
// body
{
  "gameIds": ["2022010074", "2022010085"]
}
```

`POST /seed`

- Seeds the database with test data

### Silver

[localhost:7777/api/v1/app/silver/](localhost:7777/api/v1/app/silver)

`GET /`

- Retrieves all silver entries
- There are no silver entries

## In Conclusion

In production, there would obviously be a need for persistence.

I left off conceptualizing the silver layer. Typically, there would not have been transformations being performed going into the bronze layer. If granted a little more time, I would have taken unprocessed data into the bronze layer (i.e. the data used to compute the final values) if space were unlimited. The data specified in the [assignment instructions ](https://github.com/sportradarus/sportradar-advanced-challenge) would be transformed on an interval of its own (line 91 index.js). This would likely be held in a silver layer. Things like aggregations would likewise be run on schedules of their own and processed into tables contained in a gold layer.
