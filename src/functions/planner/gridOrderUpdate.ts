import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { config } from "../db_config";
import { connect } from "@planetscale/database";
import { Item } from "~/types_const/planner";

const conn = connect(config);

export const gridOrderUpdate = server$(async (token:string|undefined, id1: number, id2: number, alltasks: Item[], plannerid: number) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {

      const dupArray = findDuplicates(alltasks);
      for (var idnum in dupArray) {
        if (dupArray[idnum].length > 1) {
          for (var id in dupArray[idnum]) {
            const index = alltasks.findIndex((task) => task.id === dupArray[idnum][id]);
            const updateString = "UPDATE plannerdata SET ordernum = ? WHERE id = ? AND plannerid = ?";
            const orderNum: number = parseFloat(alltasks[index].order) + generateRandomNumber();
            const updateOrder = await conn.execute(updateString, [orderNum, dupArray[idnum][id], plannerid]);
          }
        }
      }

      const queryString = 
      `UPDATE plannerdata AS p1
      JOIN plannerdata AS p2 ON p1.id IN (?, ?)
      JOIN (SELECT ordernum FROM plannerdata WHERE id = ?) AS p3 ON 1=1
      JOIN (SELECT ordernum FROM plannerdata WHERE id = ?) AS p4 ON 1=1
      SET p1.ordernum = CASE
          WHEN p1.id = ? THEN p3.ordernum
          WHEN p1.id = ? THEN p4.ordernum
          ELSE p1.ordernum
        END
      WHERE p1.id IN (?, ?)`;

      const execidswap = await conn.execute(queryString, [id1, id2, id2, id1, id1, id2, id1, id2]);

      // console.log(execidswap);
      // console.log(id1, id2);
    }
})

function findDuplicates(inputArray: Item[]) {
  const orderMap = new Map(); // Map to store order values and their occurrences
  const dupArray = []; // Resultant 2D array

  // Iterate through the input array
  for (const obj of inputArray) {
    const order = obj.order;
    // Check if the order value is already in the map
    if (orderMap.has(order)) {
      // If yes, add the object ID to the corresponding inner array in the result
      const duplicateIndices = orderMap.get(order);
      duplicateIndices.push(obj.id);
    } else {
      // If not, create a new array for the order value and store it in the map
      orderMap.set(order, [obj.id]);
    }
  }
  // Iterate through the map and add the inner arrays to the result array
  for (const duplicateIndices of orderMap.values()) {
    dupArray.push(duplicateIndices);
  }

  return dupArray;
}

function generateRandomNumber(): number {
  // Generate a random number between 0 and 1
  const random = Math.random();

  // Scale the random number to the desired range
  const scaledNumber = random * 0.004 + 0.001;

  // Round the scaled number to three decimal places
  const roundedNumber = Number(scaledNumber);

  return roundedNumber;
}