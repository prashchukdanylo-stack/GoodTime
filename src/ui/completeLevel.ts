import { LEVEL_IDS } from "../levelIds";

export async function completeLevel(levelName:string) {
    const playerId = localStorage.getItem("playerId");
    if (!playerId) return;

    try {
        const levelId = LEVEL_IDS[levelName];
        const response = await fetch("http://localhost:3000/api/save-level-progress", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                playerId: playerId,
                levelId: levelId,
                isCompleted:true
            })
        });
        if (response.ok) {
            console.log(`Location ${levelId} successfully saved`);
        }
    } catch(error){
        console.error(error);
    }
}