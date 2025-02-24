/* eslint-disable @typescript-eslint/no-unused-vars */

import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import createDebug from 'debug';
import sqlite3 from 'sqlite3';
import { Animal } from './animal.type';
import { Repository } from './repository.type';
const debug = createDebug('demo:repository:animals');

export class AnimalSqliteRepo implements Repository<Animal> {
    constructor() {
        console.log('Instanciando repo for sqlite');
    }

    async initializeSQLITE(relativeFilePath: string) {
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
    }

    async connectSQLite() {
        const dbFile = process.env.DB_FILE; // || ':memory:';

        if (!dbFile) {
            throw new Error('DB_FILE not defined');
        }

        // const info = await this.initializeSQLITE(dbFile);
        // info.forEach((msg) => debug(msg));

        // const file = info.at(-1) as string;

        const file = resolve(dbFile);

        debug('Connecting to DB:', file);
        const dataBase = new sqlite3.Database(file);
        debug('Connection to DB', dataBase);

        // if (info[0] === 'File does not exist') {
        //    await initializeTable('animals', dataBase);
        //}

        return dataBase;
    }

    async read(): Promise<Animal[]> {
        return [];
    }
    async readById(id: string): Promise<Animal> {
        return {} as Animal;
    }
    async create(data: Omit<Animal, 'id'>): Promise<Animal> {
        return {} as Animal;
    }
    async update(
        id: string,
        data: Partial<Omit<Animal, 'id'>>,
    ): Promise<Animal> {
        return {} as Animal;
    }
    async delete(id: string): Promise<Animal> {
        return {} as Animal;
    }
}