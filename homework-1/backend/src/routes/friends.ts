
import { NextFunction, Request, Response, Router } from "express";
import createError from "http-errors";
import Joi from "joi";
import { getLogger } from "log4js";
import { FriendMapper, FriendStatus } from "../model/friend";



const logger = getLogger(__filename);

const router = Router();


const getProfileRequest = Joi.object({
    status: Joi.number().valid(
        FriendStatus.FRIEND,
        FriendStatus.SENT_REQUEST,
        FriendStatus.FRIEND | FriendStatus.SENT_REQUEST)
        .required(),
    paginated: Joi.array().length(2).items(Joi.number().min(0))
});

router.get("/:profileId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = getProfileRequest.validate(req.body);
        if (error) {
            logger.error(error.details[0].message);
            return next(createError(400, error.details[0].message));
        }

        const profileId: number = parseInt(req.params.profileId, 10);

        const friends = await FriendMapper.query({
            userId: profileId,
            status: value.status,
            paginated: value.paginated
        });

        res.json(friends);
    }
    catch (err) {
        logger.error(err);
        next(createError(500, err));
    }
});

/**
 * Send friend request
 */
router.post("/:profileId", async (req: Request, res: Response) => {
    throw Error("Not implemented");
});

/**
 * Accept friendship
 */
router.put("/:profileId", async (req: Request, res: Response) => {
    throw Error("Not implemented");
});

/**
 * Delete from friends
 */
router.delete("/:profileId", async (req: Request, res: Response) => {
    throw Error("Not implemented");
});


export default router;