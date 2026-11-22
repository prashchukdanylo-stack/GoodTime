import bcrypt from "bcrypt";

export async function hashPassword(plainPassword: string):Promise<string> {
    const saltCounts = 12;

    const passwordHash = await bcrypt.hash(plainPassword, saltCounts);
    return passwordHash;
}