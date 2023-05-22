// @ts-nocheck
import { verify } from "jsonwebtoken";
import server$ from "solid-start/server";
import { db } from "./db_client";
import { auth } from "~/db/schema";
import { eq } from "drizzle-orm";

export const getAuth = server$(async (token) => {

    var decodejwtfromuser = "nothing";
    verify(token, process.env.JWTSECRET, function(err, decoded) { 
        decodejwtfromuser = decoded.token;
    });
    //console.log(decodejwtfromuser);

    var decodejwtfromdb = "blank";
    const getuser = await db.select().from(auth).where(eq(auth.token, token));
    verify(getuser[0].token, process.env.JWTSECRET, function(err, decoded) { 
        decodejwtfromdb = decoded.token;
    });
    //console.log(decodejwtfromdb);

    if (decodejwtfromdb == decodejwtfromuser) {
        return {loggedin: true, user: {
            username: getuser[0].username,
            displayname: getuser[0].displayname,
            email: getuser[0].email,
            imgurl: getuser[0].imgurl,
        }};
    } else {
        return {loggedin: false, user: {
            username: "",
            displayname: "",
            email: "",
            imgurl: "",
        }};
    }
});