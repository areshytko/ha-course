
import log4js from "log4js";
import mysql, { OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import { Pool, PoolConnection } from "mysql2/promise";
import config from "./config";
import { wait } from "./util";


const logger = log4js.getLogger(__filename);

export interface DBConnectionConfig {
    host?: string;
    user?: string;
    password?: string;
    database?: string;
    waitForConnections?: boolean;
    connectionLimit?: number;
    queueLimit?: number;
    multipleStatements?: boolean;
}

export const isRowDataPacket = (rows: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): rows is RowDataPacket[] | RowDataPacket[][] => {
    return (rows as RowDataPacket[] | RowDataPacket[][]).length !== undefined;
};

export default {

    pool: null as Promise<Pool> | null,
    MAX_RETRIES: 10,
    RECONNECT_INTERVAL: 5000,

    init(dbConfig: DBConnectionConfig) {
        dbConfig = Object.assign({}, {
            host: config.db_host,
            user: config.db_user,
            password: config.db_password,
            database: config.db_name,
            waitForConnections: true,
            connectionLimit: config.db_connection_limit,
            queueLimit: 0,
            multipleStatements: true
        }, dbConfig);
        this.pool = mysql.createPool(dbConfig).promise();
    },

    async getConnection(): Promise<PoolConnection> {

        if (!this.pool) {
            throw new Error("Pool must be initialized");
        }

        let connection: PoolConnection;
        let retries: number = 0;

        while (retries++ < this.MAX_RETRIES) {
            try {
                logger.debug(`Trying to connect to database. Try # ${retries}`);
                connection = await this.pool.getConnection();
                return connection;
            }
            catch (err) {
                if (err.code === "PROTOCOL_CONNECTION_LOST" && retries < this.MAX_RETRIES) {
                    await wait(this.RECONNECT_INTERVAL);
                }
                else {
                    logger.error("Failed to get connection to the database", err);
                    throw err;
                }
            }
        }
    },

    async end() {
        await this.pool.end();
    }

};