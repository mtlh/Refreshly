// @ts-nocheck
import { jwtVerify } from "jose";
import server$ from "solid-start/server";
import { db } from "./db_client";
import { auth } from "~/db/schema";
import { eq } from "drizzle-orm";

export const getAuth = server$(async (token) => {
    var decodejwtfromdb = "blank";
    var decodejwtfromuser = "nothing";
    let getuser;
    if (token) {
        // @ts-ignore
        const key = new TextEncoder().encode(process.env.JWTSECRET);
        //console.log(key);

        var decodejwtfromuser = "nothing";
        try {
            const verifyuser = await jwtVerify(token, key);
            decodejwtfromuser = verifyuser.payload.token;
            //console.log(decodejwtfromuser);

            getuser = await db.select().from(auth).where(eq(auth.token, token));
            const verifydb = await jwtVerify(getuser[0].token, key);
            decodejwtfromdb = verifydb.payload.token;
            //console.log(decodejwtfromdb);
        } catch {
            return {loggedin: false, user: {
                username: "none",
                displayname: "none",
                email: "none",
                imgurl: "none",
                created: new Date.toUTCString()
            }};
        }
    }

    if (decodejwtfromdb == decodejwtfromuser) {
        return {loggedin: true, user: {
            username: getuser[0].username,
            displayname: getuser[0].displayname,
            email: getuser[0].email,
            imgurl: getuser[0].imgurl,
            created: getuser[0].created.toUTCString()
        }};
    } else {
        return {loggedin: false, user: {
            username: "none",
            displayname: "none",
            email: "none",
            imgurl: "none",
            created: new Date.toUTCString()
        }};
    }
});