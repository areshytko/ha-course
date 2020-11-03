
import dotenv from "dotenv";

dotenv.config();

export default {
    port: parseInt(process.env.PORT, 10),
    loglevel: process.env.LOG_LEVEL,
    public_dir: process.env.PUBLIC_DIR,
    db_host: process.env.DB_HOST,
    db_user: process.env.DB_USER,
    db_name: process.env.DB,
    db_password: process.env.DB_PASSWORD,
    db_connection_limit: parseInt(process.env.DB_CONNECTION_LIMIT, 10)
};