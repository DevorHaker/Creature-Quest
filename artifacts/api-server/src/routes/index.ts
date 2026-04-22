import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gameRouter from "./game";
import PokemonRouter from "./Pokemon";
import battleRouter from "./battle";
import worldRouter from "./world";
import inventoryRouter from "./inventory";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/game", gameRouter);
router.use(PokemonRouter);
router.use(battleRouter);
router.use(worldRouter);
router.use(inventoryRouter);
router.use(leaderboardRouter);

export default router;
