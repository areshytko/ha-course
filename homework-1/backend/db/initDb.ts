

import { promises as fs } from "fs";
import log4js from "log4js";
import path from "path";
import config from "../src/config";
import db from "../src/db";

log4js.configure({
    appenders: { console: { type: "console" } },
    categories: { default: { appenders: ["console"], level: config.loglevel } }
});


const ADMIN_USER = "root";
const ADMIN_PASSWORD = "root_password";

const logger = log4js.getLogger(__filename);


const connectionConfig = {
    host: config.db_host,
    user: ADMIN_USER,
    password: ADMIN_PASSWORD,
    waitForConnections: true,
    connectTimeout: 10000,
    connectionLimit: config.db_connection_limit,
    queueLimit: 0,
    multipleStatements: true
};

db.init(connectionConfig);

const main = async () => {
    try {
        const args = process.argv.slice(2);
        const uploadFixtures = args.length > 0 && args[0] === "fixtures";

        const schema = (await fs.readFile(path.join(path.dirname(__filename), "schema.sql"))).toString();
        const cities = (await fs.readFile(path.join(path.dirname(__filename), "cities.sql"))).toString();

        var connection = await db.getConnection(); // eslint-disable-line no-var

        await connection.query(schema);
        await connection.query(cities);

        if (uploadFixtures) {
            const fixtures = (await fs.readFile(path.join(path.dirname(__filename), "fixtures.sql"))).toString();
            await connection.query(fixtures);
        }

        logger.info("Successfully uploaded schema to the database");
    }
    catch (err) {
        logger.fatal("Couldn't upload schema to db");
        logger.error(err);
    }
    finally {
        connection.destroy();
    }
};

main();