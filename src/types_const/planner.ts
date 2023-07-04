export const ORDER_DELTA = 1;
export const ID_DELTA = 1;

export interface checklist {
  checked: boolean,
  content: string
}

export interface Base {
  id: number;
  name: string;
  type: "group" | "item";
  order: string;
  plannerid: number;
}

export interface Group extends Base {
  type: "group";
}

export interface Item extends Base {
  type: "item";
  group: number;
  startdate?: string;
  duedate?: string;
  progress: string;
  description: string;
  checklist: checklist[];
  priority: string;
  lastupdate: Date;
  externalfiles: any;
  externallinks: Object[]
}

export type Entity = Group | Item;