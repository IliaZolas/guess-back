export async function gameLogic (req: any, res: any) {
    const min = 1; 
    const max = 100;
    const gameId = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log("game id", gameId)

    const minGame = 1;
    const maxGame = 1000;
    const gameNumber = Math.floor(Math.random() * (maxGame - minGame + 1)) + minGame;
    console.log("game number", gameNumber)
    res.json({ gameId, gameNumber });
}

export default gameLogic;