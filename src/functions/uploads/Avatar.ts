import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { config } from "../db_config";
import { connect } from "@planetscale/database";

const conn = connect(config);

export const UploadAvatar = server$(async (blob: Blob, token: string) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {

        const updatefileblob: string = 'UPDATE auth SET imgtest = ? WHERE username = ?';
        const fileupdate = await conn.execute(updatefileblob, [blob, auth_checked.user.username]);

        return true;
    }
    return false;
});

export const GetAvatar = server$(async (token: string) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {

        const selectimgtest: string = 'SELECT imgtest FROM auth WHERE username = ?';
        const fileselect = await conn.execute(selectimgtest, [auth_checked.user.username]);
        // @ts-ignore
        return fileselect.rows[0].imgtest;
    }
    return null;
});

export const parseAvatar = (dataUrl: string) => {
    try {
        const parts = dataUrl.split(",");
        const mimeType = parts[0].split(":")[1];
        const base64Data = parts[1];
        const blob = base64ToBlob(base64Data, mimeType);
        return URL.createObjectURL(blob);
    } catch { 
        return null;
    }
}

export const base64ToBlob = (base64String: string, mimeType: string) => {
    const byteCharacters = atob(base64String);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
};

const validateFileSize = (file: any) => {
    const maxSize = 800 * 400; // Maximum size of 800x400 pixels
    const fileSize = file.size;
    return fileSize <= maxSize;
};

const validateFileType = (file: any) => {
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif'];
    const fileType = file.type;
    return allowedTypes.includes(fileType);
};

export const validateFile = (file: any) => {
    return validateFileSize(file) && validateFileType(file);
};