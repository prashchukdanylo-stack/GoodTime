const API_URL = "http://localhost:3000";

export interface CharacterDto {
    id: string;
    name: string;
    gender: string;
    description: string;
}

export interface SelectedCharacters {
    male: string;
    female: string;
}

export function loadSelectedCharacters(): SelectedCharacters | null {
    try {
        const raw = localStorage.getItem("selectedCharacters");
        return raw ? (JSON.parse(raw) as SelectedCharacters) : null;    
    } catch {
        return null;
    }
}

export function storeSelectedCharacters(sel: { male: string | undefined, female: string | undefined } | null | undefined) {
    if (sel?.male && sel?.female) {
        localStorage.setItem("selectedCharacters", JSON.stringify(sel));
    }
}

export async function fetchCharacters(): Promise<CharacterDto[]> {
    const res = await fetch(`${API_URL}/api/characters`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return res.json();
}

// Приймаємо і ID (для бекенду), і імена (для localStorage)
export async function saveSelectedCharacters(
    maleId: string, 
    femaleId: string, 
    maleName: string, 
    femaleName: string
) {
    // Зберігаємо імена локально для відновлення інтерфейсу
    storeSelectedCharacters({ male: maleName, female: femaleName });

    const playerId = localStorage.getItem("playerId");
    if (!playerId) return;
    
    // Відправляємо саме ID на бекенд, як очікує server.ts
    const res = await fetch(`${API_URL}/api/players/${playerId}/characters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            maleCharacterId: maleId, 
            femaleCharacterId: femaleId 
        })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export function toPlayersProps(c: CharacterDto) {
    return { name: c.name, texture: `${c.name}_idle`, anim: `${c.name}_anim` };
}