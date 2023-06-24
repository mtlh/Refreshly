import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { config } from "../db_config";
import { connect } from "@planetscale/database";

const conn = connect(config);

export const SaveFiles = server$(async (blobArr: any[], token: string, index: number) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {
        let textresult = "";
        blobArr.forEach((text: string)=> {
            textresult += text + "$"
        });
        const updatefileblob: string = 'UPDATE planner SET externalfiles = ? WHERE username = ?'; // AND id = ?
        const fileupdate = await conn.execute(updatefileblob, [textresult, auth_checked.user.username]); // , index
        return true;
    }
    return false;
});

export const LoadFiles = server$(async (token: string, index: number) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {

        const selectfileblob: string = 'SELECT externalfiles FROM planner WHERE username = ?'; // AND id = ?
        const fileselect = await conn.execute(selectfileblob, [auth_checked.user.username]); // , index
        try {
            // @ts-ignore
            let result = fileselect.rows[0].externalfiles.split("$");
            result.pop();
            return result;
        } catch {
            return [];
        }
    }
    return [];
});


export const convertToBlob = async (files: File[]) => {
    const blobarr: any[] = [];
    const promises: Promise<any>[] = [];
    let filenames: any[] = [];
    files.forEach((file: File) => {
        filenames.push(file.name);
        const reader = new FileReader();
        const promise = new Promise<any>((resolve) => {
            reader.onload = () => {
            resolve(reader.result);
            };
        });
        promises.push(promise);
        reader.readAsDataURL(file);
    });
    await Promise.all(promises);
    let count: number = 0;
    for (const promise of promises) {
      let result = await promise;
      result = filenames[count] + ";" + result;
      blobarr.push(result);
      count +=1
    }
    return blobarr;
};

export const parseFile = (dataUrl: string) => {

    try {
        const original = dataUrl.split(';');
        const fileName = original[0];
        const base64Str = original[1];
        const parts = base64Str.split(',');
        const mimeType = parts[0].split(':')[1].split(';')[0];
    
        // Extract the Base64 string without additional prefixes
        const base64String = parts.slice(1).join(',');
    
        const binaryString = atob(base64String);
        const byteArray = new Uint8Array(binaryString.length);
    
        for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
        }
        const file = new File([byteArray], fileName, { type: mimeType });
        return file;

    } catch { 
        return [];
    }
}