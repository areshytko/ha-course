
import { getLogger } from "log4js";
import db, { isRowDataPacket } from "../db";
import { zip } from "../util";



const logger = getLogger(__filename);


const convertValue = (value: any): any => {
    if (value instanceof Date) {
        return value;
    }
    else if (Array.isArray(value) || typeof (value) === "object") {
        return JSON.stringify(value);
    }
    return value;
};

interface UserProfileParams {
    id?: number,
    email?: string
}

class UserProfile {
    id?: number = null;
    email?: string = null;
    firstName?: string = null;
    lastName?: string = null;
    gender?: "male" | "female" = null;
    birthday?: Date = null;
    city?: string = null;
    interests?: Array<string> = null;

    constructor({ id = null, email = null }: UserProfileParams) {
        if (!id && !email) {
            throw new Error("either id or email is required to identify a profile");
        }
        this.id = id;
        this.email = email;
    }
}

interface UserProfileRow {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    gender: "male" | "female",
    birthday: Date,
    city: string,
    interests: Array<string>
}

const isUserProfileRow = (value: any): value is UserProfileRow => {
    return (
        value &&
        value.id && typeof value.id === "number" &&
        (value.email === null || typeof value.email === "string") &&
        (value.first_name === null || typeof value.first_name === "string") &&
        (value.last_name === null || typeof value.last_name === "string") &&
        (value.gender === null || value.gender === "male" || value.gender === "female") &&
        (value.birthday === null || value.birthday instanceof Date) &&
        (value.city === null || typeof value.city === "string") &&
        (value.interests === null || Array.isArray(value.interests))
    );
};

const key2column = new Map<keyof UserProfile, keyof UserProfileRow>([
    ["id", "id"],
    ["email", "email"],
    ["firstName", "first_name"],
    ["lastName", "last_name"],
    ["gender", "gender"],
    ["birthday", "birthday"],
    ["city", "city"],
    ["interests", "interests"]
]);

class UserProfileMapper {

    private static getColumns(profile: UserProfile): [Array<keyof UserProfile>, Array<string>] {
        const keys = Object.keys(profile).filter((k: keyof UserProfile) => profile[k] && k !== "id") as Array<keyof UserProfile>;
        const columns = keys.map((k: keyof UserProfile) => key2column.get(k));
        return [keys, columns];
    }

    static async query(id: number): Promise<UserProfile> {
        try {
            const sql = `
            SELECT users.id, email, first_name, last_name, gender, birthday, interests, cities.name as city
            FROM users LEFT JOIN cities ON users.city = cities.id
            WHERE users.id = ?
            `;
            var connection = await db.getConnection(); // eslint-disable-line no-var
            const [rows,] = await connection.execute(sql, [id]);
            if (isRowDataPacket(rows) && rows.length === 1) {
                const profileRow = rows[0];
                if (isUserProfileRow(profileRow)) {
                    const userProfile = new UserProfile({ id: profileRow.id, email: profileRow.email });
                    userProfile.birthday = profileRow.birthday;
                    userProfile.city = profileRow.city;
                    userProfile.firstName = profileRow.first_name;
                    userProfile.lastName = profileRow.last_name;
                    userProfile.interests = profileRow.interests;
                    userProfile.gender = profileRow.gender;
                    return userProfile;
                }
            }
            logger.error("Unexpected query response", rows);
            throw Error("Unexpected query response");
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
        finally {
            connection && connection.release();
        }
    }

    static async save(profile: UserProfile) {
        if (profile.id) await this.update(profile);
        else await this.create(profile);
    }

    private static makeValuePlaceholder(profile: UserProfile, k: keyof UserProfile): string {
        if (k === "city") {
            return `(SELECT id FROM cities WHERE name = '${profile[k]}')`;
        }
        else {
            return "?";
        }
    }

    static async create(profile: UserProfile): Promise<number> {

        if (!profile.email || profile.id) {
            throw new Error("a profile is required to have an email and not id");
        }

        try {
            const [keys, columns] = this.getColumns(profile);
            const valuePlaceholders = keys.map((k: keyof UserProfile) => this.makeValuePlaceholder(profile, k));
            const values = keys.filter((k) => k !== "city").map((k: keyof UserProfile) => convertValue(profile[k]));
            const sql = `INSERT INTO users (${columns.join(",")}) VALUES (${valuePlaceholders.join(",")});`;
            logger.debug(sql);
            var connection = await db.getConnection(); // eslint-disable-line no-var
            await connection.execute(sql, values);
            const [rows,] = await connection.execute("SELECT id FROM users WHERE email = ?", [profile.email]);
            if (isRowDataPacket(rows) && rows.length === 1) {
                const id = (rows[0] as { id: number }).id;
                profile.id = id;
                return id;
            }
            logger.error("Unexpected query response", rows);
            throw Error("This code should never be executed");
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
        finally {
            connection && connection.release();
        }
    }

    static async update(profile: UserProfile) {

        if (!profile.id) {
            throw new Error("a profile is required to have an id");
        }
        try {
            const [keys, columns] = this.getColumns(profile);
            const valuePlaceholders = keys.map((k: keyof UserProfile) => this.makeValuePlaceholder(profile, k));
            const values = keys.filter((k) => k !== "city").map((k: keyof UserProfile) => convertValue(profile[k]));
            const updateStr = zip(columns, valuePlaceholders).map(pair => `${pair[0]}=${pair[1]}`).join(",");
            const sql = `UPDATE users SET ${updateStr} WHERE id = ${profile.id}`;
            logger.debug(sql);
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

export { UserProfile, UserProfileMapper };
