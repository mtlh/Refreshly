import server$ from "solid-start/server";
import { compareSync, genSaltSync, hashSync } from "bcryptjs";

export async function encrypt (str: string) {
    const process = server$(async (str) => {
        var salt = genSaltSync(10);
        var hash = hashSync(str, salt);
        return hash;
    })
    return await process(str);
}

export async function encryptCheck (str: string, str2: string) {
    const process = server$(async (str, str2) => {
        return compareSync(str, str2);
    })
    return await process(str, str2);
}