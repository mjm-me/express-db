import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'path';
import { ODMLite } from '../odm/odm-lite.js';
import mysql from 'mysql2/promise';
import sqlite3, { Database } from 'sqlite3';
import createDebug from 'debug';
import { promisify } from 'node:util';
const debug = createDebug('demo:server:db:connect');

const dataConnection = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWD,
  database: process.env.DB_NAME || '',
};

export const connectDB = async () => {
  const info = await ODMLite.initializeJSON('./data/db.json');
  info.forEach((msg) => debug(msg));
};

export const connectMySQL = async () => {
  //const info = await ODMLite.initializeJSON('./data/db.json');
  //info.forEach((msg) => debug(msg));
  const connection = await mysql.createConnection(dataConnection);
  console.log(
    'Connection to server:',
    connection.config.host,
    connection.config.port,
  );
  console.log('Connection to DB:', connection.config.database);
  return connection;
};

const initializeSQLITE = async (relativeFilePath: string) => {
  const filePath = resolve(relativeFilePath);
  const folder = dirname(filePath);
  const info = [];
  try {
    await access(folder);
  } catch (error) {
    const errorFolder = error as Error;
    if (errorFolder.message.includes('no such file or directory')) {
      info.push('Folder does not exist');
      mkdir(folder, { recursive: true });
      info.push(folder);
    } else {
      console.error(errorFolder.message);
      throw errorFolder;
    }
  }
  try {
    await access(filePath);
    info.push('File already exists');
  } catch (error) {
    const errorFile = error as Error;
    if (errorFile.message.includes('no such file or directory')) {
      info.push('File does not exist');
      await writeFile(filePath, '', 'utf-8');
      info.push('File initialized');
    } else {
      console.error(errorFile.message);
      throw errorFile;
    }
  }
  info.push(`Initialized DB at`);
  info.push(filePath);
  return info;
};

const initializeTable = async (table: string, dataBase: Database) => {
  //  Alternativa id: string;
  const query = `CREATE TABLE IF NOT EXISTS ${table} (
        id INTEGER PRIMARY KEY AUTO INCREMENT,
        name TEXT NOT NULL,
        englishName TEXT,
        sciName TEXT,
        diet TEXT,
        lifestyle TEXT,
        location TEXT,
        slogan TEXT,
        bioGroup TEXT,
        image TEXT
    )`;
  await promisify(dataBase.run.bind(dataBase))(query);
  debug('Creating table:', query);
};

export const connectSQLite = async () => {
  const dbFile = process.env.DB_FILE; // || ':memory:';

  if (!dbFile) {
    throw new Error('DB_FILE not defined');
  }

  const info = await initializeSQLITE(dbFile);
  info.forEach((msg) => debug(msg));

  const file = info.at(-1) as string;

  debug('Connecting to DB:', file);
  const dataBase = new sqlite3.Database(file);
  debug('Connection to DB', dataBase);

  if (info[0] === 'File does not exist') {
    await initializeTable('animals', dataBase);
  }

  return dataBase;
};
