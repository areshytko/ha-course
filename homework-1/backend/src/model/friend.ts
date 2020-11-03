

import { getLogger } from "log4js";
import db, { isRowDataPacket } from "../db";
import { uniqueCombination } from "../util";

const logger = getLogger(__filename);

export enum FriendStatus {
    SENT_REQUEST = 1,
    WAIT_FOR_REQUEST = 2,
    FRIEND = 4,
    REQUEST_REJECTED = 8
}


export class Friend {

    id: number;
    firstName: string;
    lastName?: string;
    status: FriendStatus;

    constructor(id: number) {
        this.id = id;
    }
}

export interface FriendQuery {
    userId: number;
    paginated?: [number, number];
    status: FriendStatus;
}

interface FriendRow {
    id: number;
    first_name: string;
    last_name?: string;
    status: FriendStatus;
}

const isFriendRow = (value: any): value is FriendRow => {
    return (
        value &&
        value.id && typeof value.id === "number" &&
        value.first_name && typeof value.first_name === "string" &&
        (value.last_name === null || typeof value.last_name === "string")
    );
};

export class FriendMapper {
    static async query(query: FriendQuery): Promise<Array<Friend>> {

        let sql: string;
        let values: Array<any>;

        if (query.status === FriendStatus.FRIEND) {
            sql = `
            SELECT users.id as id, first_name, last_name, ${FriendStatus.FRIEND} as status
            FROM users JOIN friendship ON users.id = friendship.req_friend
            WHERE friendship.acc_friend = ? AND friendship.accepted = true
            UNION
            SELECT users.id as id, first_name, last_name, ${FriendStatus.FRIEND} as status
            FROM users JOIN friendship ON users.id = friendship.acc_friend
            WHERE friendship.req_friend = ? AND friendship.accepted = true
            `;
            values = [query.userId, query.userId];
        }
        else if (query.status === FriendStatus.SENT_REQUEST) {
            sql = `
            SELECT users.id as id, first_name, last_name, ${FriendStatus.SENT_REQUEST} as status
            FROM users JOIN friendship ON users.id = friendship.req_friend
            WHERE friendship.acc_friend = ? AND friendship.accepted = false
            `;
            values = [query.userId];
        }
        else if (query.status === (FriendStatus.FRIEND | FriendStatus.SENT_REQUEST)) {
            sql = `
            SELECT users.id as id, first_name, last_name,
                CASE
                    WHEN friendship.accepted = true THEN ${FriendStatus.FRIEND}
                    ELSE ${FriendStatus.SENT_REQUEST}
                END as status
            FROM users JOIN friendship ON users.id = friendship.req_friend
            WHERE friendship.acc_friend = ?
            UNION
            SELECT users.id as id, first_name, last_name, ${FriendStatus.FRIEND} as status
            FROM users JOIN friendship ON users.id = friendship.acc_friend
            WHERE friendship.req_friend = ? AND friendship.accepted = true
            `;
            values = [query.userId, query.userId];
        }
        else {
            throw new Error("Not implemented");
        }

        if (query.paginated) {
            sql = `SELECT * FROM ( ${sql} ) AS friends ORDER BY id LIMIT ?, ?`;
            values = values.concat(query.paginated);
        }

        try {
            var connection = await db.getConnection(); // eslint-disable-line no-var
            logger.debug(sql);
            const [rows,] = await connection.execute(sql, values);

            if (!isRowDataPacket(rows)) {
                logger.error("Unexpected query response", rows);
                throw Error("Unexpected query response");
            }

            const result: Array<Friend> = [];
            rows.forEach((row: any) => {
                if (!isFriendRow(row)) {
                    logger.error("Unexpected query response", rows);
                    throw Error("Unexpected query response");
                }
                const friend = new Friend(row.id);
                friend.firstName = row.first_name;
                friend.lastName = row.last_name;
                friend.status = row.status;
                result.push(friend);
            });
            return result;
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
        finally {
            connection && connection.release();
        }
    }

    static async acceptFriend(user_id: number, friend_id: number) {
        const sql = `
            UPDATE friendship
            SET accepted = true
            WHERE acc_friend = ? AND req_friend = ?
        `;
        const values = [user_id, friend_id];
        try {
            var connection = await db.getConnection(); // eslint-disable-line no-var
            logger.debug(sql);
            await connection.execute(sql, values);
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
        finally {
            connection && connection.release();
        }
    }

    static async sendFriendRequest(user_id: number, friend_id: number) {
        const sql = `
            INSERT INTO friendship (req_friend, acc_friend, accepted, id) VALUES
            (?, ?, ?, ?)
        `;
        const values = [user_id, friend_id, false, uniqueCombination(user_id, friend_id)];
        try {
            var connection = await db.getConnection(); // eslint-disable-line no-var
            logger.debug(sql);
            await connection.execute(sql, values);
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
        finally {
            connection && connection.release();
        }
    }

    static async deleteFriend(user_id: number, friend_id: number) {
        const sql = `
            DELETE FROM friendship WHERE id = ?
        `;
        const values = [uniqueCombination(user_id, friend_id)];
        try {
            var connection = await db.getConnection(); // eslint-disable-line no-var
            await connection.execute(sql, values);
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
        finally {
            connection && connection.release();
        }
    }
}