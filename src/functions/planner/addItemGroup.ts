import { Id } from "@thisbeyond/solid-dnd";
import { SetStoreFunction } from "solid-js/store";
import { Entity, Item } from "~/types_const/planner";

export const addItem = (item: Item, setEntities: SetStoreFunction<Record<Id, Entity>>) => {
    if (!item.lastupdate) {
        item.lastupdate = new Date()
    }
    setEntities(item.id, item);
};

export const addGroup = (id: number, name: string, order: string, setEntities: SetStoreFunction<Record<Id, Entity>>) => {
    setEntities(id, {
        id,
        name,
        type: "group",
        order,
    });
};