

import { Request, Response, Router } from "express";
import path from "path";
import config from "../config";


const router = Router();

router.get("/", async (req: Request, res: Response) => {
    res.sendFile(path.join(config.public_dir, "index.html"));
});

export default router;