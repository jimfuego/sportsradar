import db from '../utils/sqlite';
const writeEntriesToBronze = async (entries: any): Promise<boolean> => {
  return true;
};

const unique_hash_constraint =
  'IF NOT EXISTS (SELECT 1 FROM bronze_table where event_hash = ?)';

const bronzeSchema =
  '(game_id, player_id, player_name, team_id, team_name, player_age, player_number, player_position, assists, goals, hits, points, penalty_minutes, player_type, event_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);';

const createTestTable = (tableName: string): any => {
  try {
    db.exec(`
      DROP TABLE if EXISTS ${tableName};
      CREATE TABLE ${tableName} (
        row_id integer primary key not null,
        row_data text not null
      );
      insert into ${tableName} (row_id, row_data)
        values (1, 'some cool data man'),
               (2, 'some cool data maam');
    `);
    // dbres.close(err => { if (err) console.error(err) })
  } catch (err) {
    console.error('err', err);
    return false;
  }
  return true;
};

const createBronzeTable = (): any => {
  try {
    const sql = `
      CREATE TABLE bronze_table (
        game_id int not null,
        player_id int not null,
        player_name text not null,
        team_id int not null,
        team_name text not null,
        player_age int not null,
        player_number text not null,
        player_position text not null,
        assists int not null,
        goals int not null,
        hits int not null,
        points int not null,
        penalty_minutes int not null,
        player_type text not null,
        event_hash text not null unique
      );`;
    db.run(sql, (err) => {
      if (err) {
        return err;
      }
      return true;
    });
  } catch (err) {
    return err;
  }
};

const insertToBronze = async (players: any[]): Promise<any> => {
  try {
    const sql = `INSERT OR IGNORE INTO bronze_table ${bronzeSchema}`;
    const statement = db.prepare(sql);
    players.forEach((player) =>
      statement.run(player, { $id: player[1] }, (err: { message: any }) => {
        if (err) {
          console.log('err:', err.message);
        }
      })
    );
  } catch (err) {
    return err;
  }
};

const seedBronzeTable = (): any => {
  const seedPlayers = [
    [
      '2022010074',
      8478465,
      'Guillaume Brisebois',
      23,
      'Vancouver Canucks',
      25,
      '55',
      'Defenseman',
      0,
      0,
      1,
      0,
      0,
      'Hitter',
      '6659c1d6f8b9ed57997695172c4ddc19158daf64ad402b7c69f2db6c733d53b3',
    ],
    [
      '2022010074',
      8477937,
      'Jake Virtanen',
      'unavailable',
      'unavailable',
      'unavailable',
      '18',
      'Right Wing',
      0,
      0,
      0,
      0,
      0,
      'Hittee',
      'd33d8cd4cb7ac7ea21df4705a1d55bbd399d9d1c02ed1f61970a0bfeafd75bc6',
    ],
  ];
  try {
    const sql = `INSERT OR IGNORE INTO bronze_table ${bronzeSchema}`;

    const statement = db.prepare(sql);
    seedPlayers.forEach((player) =>
      statement.run(player, (err) => {
        if (err) {
          console.log('err:', err.message);
        }
      })
    );
  } catch (err) {
    return err;
  }
};

const getAllTables = () => {
  try {
    const sql = `
    SELECT 
      name
    FROM 
      sqlite_schema
    WHERE 
      type ='table' AND 
      name NOT LIKE 'sqlite_%';`;
    const dbres = db.all(sql, [], (err, rows) => {
      if (err) {
        console.log('err:', err.message);
      }
      return rows;
    });
    return dbres;
  } catch (err) {
    return err;
  }
};

export {
  createBronzeTable,
  createTestTable,
  getAllTables,
  insertToBronze,
  seedBronzeTable,
  writeEntriesToBronze,
};
