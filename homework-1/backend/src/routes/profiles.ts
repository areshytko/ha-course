
import { NextFunction, Request, Response, Router } from "express";
import createError from "http-errors";
import Joi from "joi";
import { getLogger } from "log4js";
import { UserProfile, UserProfileMapper } from "../model/profile";


const logger = getLogger(__filename);

const router = Router();

router.get("/:profileId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profileId: number = parseInt(req.params.profileId, 10);
        const profile: UserProfile = await UserProfileMapper.query(profileId);
        res.json(profile);
    }
    catch (err) {
        logger.error(err);
        next(createError(500, err));
    }
});

const postProfileSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } })
        .required(),
    firstName: Joi.string().min(3).max(250),
    lastName: Joi.string().min(3).max(250),
    gender: Joi.string().valid("male", "female"),
    birthday: Joi.date(),
    city: Joi.string().min(2).max(250),
    interests: Joi.array().items(Joi.string())
});

const postProfileResultSchema = Joi.object({
    id: Joi.number()
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { error, value } = postProfileSchema.validate(req.body);
        if (error) {
            logger.error(error.details[0].message);
            return next(createError(400, error.details[0].message));
        }

        const profileId = await UserProfileMapper.create(value as UserProfile);
        const result = {
            id: profileId
        }

        const resultError = postProfileResultSchema.validate(result).error;

        if (resultError) {
            logger.error(resultError.details[0].message);
            return next(createError(500, resultError.details[0].message));
        }

        res.json(result);
    }
    catch (err) {
        logger.error(err);
        next(createError(500, err));
    }
});

const putProfileSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }),
    firstName: Joi.string().min(3).max(250),
    lastName: Joi.string().min(3).max(250),
    gender: Joi.string().valid("male", "female"),
    birthday: Joi.date(),
    city: Joi.string().min(2).max(250),
    interests: Joi.array().items(Joi.string())
});

router.put("/:profileId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = putProfileSchema.validate(req.body);
        if (error) {
            logger.error(error.details[0].message);
            return next(createError(400, error.details[0].message));
        }

        const profileId: number = parseInt(req.params.profileId, 10);

        value.id = profileId;
        await UserProfileMapper.update(value as UserProfile);

        res.json({});
    }
    catch (error) {
        logger.error(error);
        next(createError(500, error));
    }
});


export default router;