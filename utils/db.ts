import postgres from 'postgres';
interface IOptions {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

const options: IOptions = {
  host: process.env.PG_HOST as string,
  port: process.env.PG_PORT as unknown as number,
  database: process.env.PG_DATABASE as string,
  username: process.env.PG_USERNAME as string,
  password: process.env.PG_PASSWORD as string,
};

const sql = postgres(options); // will use psql environment variables

export default sql;
