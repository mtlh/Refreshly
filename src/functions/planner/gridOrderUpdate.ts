import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { config } from "../db_config";
import { connect } from "@planetscale/database";

const conn = connect(config);

export const gridOrderUpdate = server$(async (token:string|undefined, id1: number, id2: number) => {
    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {

      const queryString = "UPDATE planner SET ordernum = CASE WHEN id = ? THEN (SELECT ordernum FROM (SELECT ordernum FROM planner WHERE id = ?) AS t) WHEN id = ? THEN (SELECT ordernum FROM (SELECT ordernum FROM planner WHERE id = ?) AS t) ELSE ordernum END WHERE id IN (?, ?)";

      const execidswap = await conn.execute(queryString, [id1, id2, id2, id1, id1, id2]);

      console.log(execidswap);
    }
})