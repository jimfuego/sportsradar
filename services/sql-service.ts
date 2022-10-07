import db from '../utils/sqlite';
const writeEntriesToBronze = async (entries: any): Promise<boolean> => {
  return true;
};

const createTestTable = (tableName: string): any => {
  try {
    let dbres = db.exec(`
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
    let dbres = db.run(sql, (err) => {
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
    let sql = `INSERT INTO bronze_table
    (player_id, player_name, team_id, team_name, player_age, player_number, player_position, assists, goals, hits, points, penalty_minutes, player_type, event_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
    let statement = db.prepare(sql);
    players.forEach((player) =>
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

const seedBronzeTable = (): any => {
  const seedPlayers = [
    [
      8476905,
      'Chandler Stephenson',
      54,
      'Vegas Golden Knights',
      28,
      '20',
      'Center',
      1,
      0,
      0,
      1,
      0,
      'Goal',
      'sha256(gameId + playId, playerId)',
    ],
    [
      8477361,
      'Cal Petersen',
      26,
      'Los Angeles Kings',
      27,
      '40',
      'Goalie',
      0,
      0,
      0,
      0,
      0,
      'Goal',
      'sha25(gameId + playId, playerId)',
    ],
  ];
  try {
    let sql = `INSERT INTO bronze_table
    (player_id, player_name, team_id, team_name, player_age, player_number, player_position, assists, goals, hits, points, penalty_minutes, player_type, event_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;

    let statement = db.prepare(sql);
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
    let sql = `
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
    // dbres.close(err => { if (err) console.error(err) })
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
