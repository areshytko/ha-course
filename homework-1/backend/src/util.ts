
import { Request, Response } from "express";
import HTTPStatuses from "statuses";


export interface Error {
    status?: number;
    stack?: string;
    message?: string;
}

export const errorHandler = (err: Error, req: Request, res: Response) => {

    const message: Error = {
        message: err.message || "Unknown error",
        status: err.status || 500,
        stack: process.env.NODE_ENV === "production" ? err.stack : null
    };

    const statusName = HTTPStatuses(message.status);

    res.status(message.status);

    if (req.accepts("html")) {
        // send html
        res.send("<html><head><title>" + message.status + " " + statusName + "</title></head><body><h1>" + message.status + " " + statusName + "</h1>" + message.message + "<br/><br/>" + (message.stack ? message.stack : "") + "</body></html>");
    } else if (req.accepts("json")) {
        // send json
        const responseObject = {
            error: statusName,
            code: message.status,
            message: message.message,
            stack: message.stack
        };
        res.send(responseObject);
    } else {
        // default to plain-text
        res.type("txt").send(statusName + " " + message.message);
    }
};


export const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);


export async function wait(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


export const zip = <T, K>(arr1: Array<T>, arr2: Array<K>): Array<[T, K]> => arr1.map((k, i) => [k, arr2[i]]);


/**
 * @see https://math.stackexchange.com/questions/882877/produce-unique-number-given-two-integers
 */
export const uniqueCombination = (a: number, b: number): number => {
    const max = Math.max(a, b);
    return (max * (max + 1)) / 2 + Math.min(a, b);
};