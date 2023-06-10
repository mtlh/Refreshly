import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  createSortable,
  closestCenter,
  maybeTransformStyle,
  Id,
  DragEventHandler,
  Draggable,
  Droppable,
  CollisionDetector,
  useDragDropContext,
} from "@thisbeyond/solid-dnd";
import { batch, createSignal, For, onMount, VoidComponent} from "solid-js";
import { createStore, produce } from "solid-js/store";
import Big from "big.js";
import Cookies from "js-cookie";
import server$ from "solid-start/server";
import { getAuth } from "~/functions/getAuth";
import { db } from "~/functions/db_client";
import { and, eq } from "drizzle-orm";
import { planner } from "~/db/schema";
import { useNavigate } from "solid-start";
import moment from "moment";

export const ORDER_DELTA = 1;
export const ID_DELTA = 1;

interface checklist {
  checked: boolean,
  content: string
}

interface Base {
  id: number;
  name: string;
  type: "group" | "item";
  order: string;
}

interface Group extends Base {
  type: "group";
}

interface Item extends Base {
  type: "item";
  group: number;
  startdate?: string;
  duedate?: string;
  progress: "" | "Not Started" | "Ongoing" | "Complete";
  description: string;
  checklist: checklist[];
  priority: "High" | "Medium" | "Low" | "Urgent" | "";
  lastupdate: Date;
}

type Entity = Group | Item;

const sortByOrder = (entities: Entity[]) => {
  const sorted = entities.map((item) => ({ order: new Big(item.order), item }));
  sorted.sort((a, b) => a.order.cmp(b.order));
  return sorted.map((entry) => entry.item);
};

const ItemOverlay = (props: Item) => {
  return <div class="sortable bg-sky-400 rounded-2xl p-2 m-2 text-center">{props.name}</div>;
};

const GroupOverlay: VoidComponent<{ name: string; items: Item[] }> = (
  props
) => {
  return (
    <div>
      <div class="column-header text-2xl mb-2">{props.name}</div>
      <div class="column cursor-move">
        <For each={props.items}>
          {(item) => <ItemOverlay {...item} />}
        </For>
      </div>
    </div>
  );
};

export const BoardExample = () => {
  const nav = useNavigate();
  const [entities, setEntities] = createStore<Record<Id, Entity>>({});

  let nextOrder = 1;
  let nextID = 1;

  const getNextID = () => {
    nextID += ID_DELTA;
    return nextID;
  }

  const getNextOrder = () => {
    nextOrder += ORDER_DELTA;
    return nextOrder.toString();
  };

  const Item = (item: Item) => {
    const sortable = createSortable(item.id, {
      type: "item",
      group: item.group,
    });
    var checked_count = 0;
    for (var x in item.checklist) { if (item.checklist[x].checked) {checked_count += 1; }};
    const [itemstore, setItemStore] = createStore(item);    
    const createIdsArray = (items: checklist[]): number[] => {
      return items.map((item, index) => index);
    };
    console.log(itemstore.checklist);
    let startidarray: number[] = [];
    if (itemstore.checklist != null && itemstore.checklist != undefined) {
      startidarray = createIdsArray(itemstore.checklist);
    }
    const [items, setItems] = createSignal(startidarray);
    console.log(items());
    const [activeItem, setActiveItem] = createSignal(null);
    const ids = () => items();
    const ChecklistonDragStart = ({ draggable }: any) => setActiveItem(draggable.id);
    const ChecklistonDragEnd = ({ draggable, droppable }: any) => {
      if (draggable && droppable) {
        const currentItems = ids();
        const fromIndex = currentItems.indexOf(draggable.id);
        const toIndex = currentItems.indexOf(droppable.id);
        if (fromIndex !== toIndex) {
          const updatedItems = currentItems.slice();
          updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
          setItems(updatedItems);
          const rearrangeItemsArray = (items: checklist[], ids: number[]): checklist[] => {
            return ids.map(id => items[id]);
          };
          const rearrange = rearrangeItemsArray(itemstore.checklist, updatedItems);
          setItemStore("checklist", rearrange);
          setItemStore("lastupdate", new Date());
          setEntities(itemstore.id, itemstore);
          setItems(createIdsArray(itemstore.checklist));
          saveEntities();
        }
      }
  };
  const Sortable = (props: any) => {
    const sortable = createSortable(props.item);
    const [state] = useDragDropContext();
    return (
      <div class="grid grid-cols-12 sortable" use:sortable classList={{"opacity-80": sortable.isActiveDraggable, "transition-transform": !!state.active.draggable}}>
        <div class="col-span-2 m-auto">
          {itemstore.checklist[props.item].checked ?
            <svg fill="#000000" version="1.1" width={"18%"} class="m-auto" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <polygon points="452.253,28.326 197.831,394.674 29.044,256.875 0,292.469 207.253,461.674 490,54.528 "></polygon> </g></svg>
            :
            <svg fill="#000000" width={"18%"} class="m-auto" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 14.545L1.455 16 8 9.455 14.545 16 16 14.545 9.455 8 16 1.455 14.545 0 8 6.545 1.455 0 0 1.455 6.545 8z" fill-rule="evenodd"></path> </g></svg>
          }
        </div>
        <input
        class="input my-1 w-full text-sm col-span-10 m-auto"
        value={itemstore.checklist[props.item].content}
        onchange={(e)=> {setItemStore("checklist", props.item, {checked: itemstore.checklist[props.item].checked, content: e.target.value}); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities() }}
       />
      </div>
    );
  };
    return (
      <>
        <label
          for={itemstore.id.toString()}
        >
          <div
          use:sortable
          class="sortable bg-gray-100 rounded-lg p-2 m-2 text-left ring-1 ring-gray-300 shadow-sm container hover:shadow-xl"
          classList={{ "opacity-25": sortable.isActiveDraggable }}
          >
            <p class="text-lg text-black font-normal w-full mb-6">{itemstore.name}</p>
            {itemstore.checklist &&
              <p class="text-md text-black font-normal text-left mb-2">{checked_count}/{itemstore.checklist.length}</p>
            }
            <ul>
              <For each={itemstore.checklist}>{(checklist) =>
                <li>
                  <p>{checklist.checked}</p>
                  <p>{checklist.content}</p>
                </li>
              }</For> 
            </ul>
            { itemstore.duedate ?
              <p class="p-2 italic">{moment(itemstore.duedate).format("DD-MM-YYYY")}</p>
              :
              <p class="p-2 italic">Unscheduled</p>
            }
          </div>
        </label>
        <input type="checkbox" id={itemstore.id.toString()} class="modal-toggle" />
        <label for={itemstore.id.toString()} class="modal cursor-pointer">
          <label class="modal-box relative rounded-lg w-5/6 h-3/4" for="">
            <input class="py-1 w-full text-lg font-bold" value={itemstore.name} onChange={(e) => {setItemStore("name", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities()}}/>
            <p class="py-1 text-left italic font-light">Last updated: {moment(itemstore.lastupdate).format("HH:mm DD-MM-YYYY")}</p>
            <div class="grid grid-cols-2">
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Startdate:</span>
                </label>
                <input type="date" class="input" value={itemstore.startdate} onChange={(e) => {setItemStore("startdate", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities()}} />
              </div>
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Duedate:</span>
                </label>
                <input type="date" class="input" value={itemstore.duedate} onChange={(e) => {setItemStore("duedate", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities()}} />
              </div>
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Progress:</span>
                </label>
                <select class="select" value={itemstore.progress} onChange={(e) => {setItemStore("progress", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities()}}>
                  <option>Completed</option>
                  <option>Ongoing</option>
                  <option>Not Started</option>
                  <option></option>
                </select>
              </div>
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Priority:</span>
                </label>
                <select class="select" value={itemstore.priority} onChange={(e) => {setItemStore("priority", e.target.value); setEntities(itemstore.id, itemstore); saveEntities()}}>
                  <option>Urgent</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                  <option></option>
                </select>
              </div>
            </div>
            <div class="form-control w-full my-1 m-auto">
              <label class="label">
                <span class="label-text">Description:</span>
              </label>
              <textarea class="textarea textarea-bordered h-full rounded-lg" value={itemstore.description} onChange={(e) => {setItemStore("description", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities()}}></textarea>
            </div>
            <div class="form-control w-full my-1 m-auto">
              <label class="label">
                <span class="label-text">Checklist:</span>
              </label>
              <ul>
                <DragDropProvider
                  onDragStart={ChecklistonDragStart}
                  onDragEnd={ChecklistonDragEnd}
                  collisionDetector={closestCenter}
                >
                  <DragDropSensors />
                  <div class="column self-stretch">
                    <SortableProvider ids={ids()}>
                      <For each={items()}>{(item) => <Sortable item={item} />}</For>
                    </SortableProvider>
                  </div>
                  <DragOverlay>
                    <div class="sortable">{activeItem()}</div>
                  </DragOverlay>
                </DragDropProvider>
                <button onClick={() => {try {setItemStore("checklist", l => [...l, {checked: false, content: "new checklist"}])}catch{setItemStore("checklist", [{checked: false, content: "new checklist"}])}; setItems(createIdsArray(itemstore.checklist)); setItems(createIdsArray(itemstore.checklist)); setEntities(itemstore.id, itemstore); saveEntities()}} 
                  class="text-lg my-4 font-bold">
                  +
                </button>
              </ul>
            </div>
            <button onclick={() => deletetask(itemstore.id)} class="py-1 w-full bg-red-500 text-white rounded-lg hover:bg-red-700">DELETE TASK</button>
          </label>
        </label>
      </>
    );
  };

  const deletetask = async (itemid: number) => {
    const DeleteFromPlanner = server$(async (removeid: number, entities: Entity[], token:string|undefined) => {
      const auth_checked = await getAuth(token);
      let newarr = [];
      if (auth_checked.loggedin == true) {
        for (var x in entities) {
          if (entities[x].id == removeid) {
            await db.delete(planner).where(and(eq(planner.id, entities[x].id), eq(planner.username, auth_checked.user.username)));
          } else {
            newarr.push(entities[x]);
          }
        }
      }
      return newarr;
    })
    const newarr = await DeleteFromPlanner(itemid, entities, Cookies.get("auth"));
    location.reload();
  }
  const saveEntities = async () => {
    const db_insert_entities = server$(async (entities: Entity[], token:string|undefined) => {
      const auth_checked = await getAuth(token);
      if (auth_checked.loggedin == true) {
        for (var x in entities) {
          if (entities[x].type == "item") {
            // @ts-ignore
            let item: Item = entities[x];
            let startdate = item.startdate; let duedate = item.duedate
            if (item.startdate) {startdate = moment(item.startdate).format("YYYY-MM-DD"); }
            if (item.duedate) {duedate = moment(item.duedate).format("YYYY-MM-DD"); }
            const checktasks = await db.select().from(planner).where(and(eq(planner.id, item.id), eq(planner.username, auth_checked.user.username)))
            if (checktasks.length > 0) {
              const updatetasks = await db.update(planner).set({
                name: item.name,
                ordernum: item.order,
                groupid: item.group,
                startdate: startdate,
                duedate: duedate,
                progress: item.progress,
                description: item.description,
                checklist: JSON.stringify(item.checklist),
                priority: item.priority,
                lastupdate: new Date(item.lastupdate)
              }).where(and(eq(planner.id, item.id), eq(planner.username, auth_checked.user.username)))
            } else {
              const inserttasks = await db.insert(planner).values({
                username: auth_checked.user.username,
                id: item.id,
                name: item.name,
                type: item.type,
                ordernum: item.order,
                groupid: item.group,
                startdate: startdate,
                duedate: duedate,
                progress: item.progress,
                description: item.description,
                checklist: JSON.stringify(item.checklist),
                priority: item.priority,
                lastupdate: new Date(item.lastupdate)
              });
            }
          } else {
            // @ts-ignore
            let group: Group = entities[x];
            const checkgroup = await db.select().from(planner).where(and(eq(planner.id, group.id), eq(planner.username, auth_checked.user.username)))
            if (checkgroup.length > 0) {
              const updategroups = await db.update(planner).set({
                name: group.name,
                ordernum: group.order
              }).where(and(eq(planner.id, group.id), eq(planner.username, auth_checked.user.username)))
            } else {
              const updategroups = await db.insert(planner).values({
                username: auth_checked.user.username,
                id: group.id,
                name: group.name,
                type: group.type,
                ordernum: group.order
              });
            }
          }
        }
      }
    })
    await db_insert_entities(entities, Cookies.get("auth"));
  }

  const addGroup = (id: number, name: string, order: string) => {
    setEntities(id, {
      id,
      name,
      type: "group",
      order,
    });
  };

  const addItem = (id: number, order: string, name: string, group: number, startdate?: string, duedate?: string, progress: any,
    description: string, checklist: checklist[], priority: "High" | "Medium" | "Low" | "Urgent" | "", lastupdate:  string) => {
    if (!lastupdate) {
      lastupdate = moment(new Date()).format("HH:mm DD-MM-YYYY").toString()
    }
    setEntities(id, {
      id,
      name,
      group,
      startdate,
      duedate,
      priority,
      description,
      checklist,
      progress,
      type: "item",
      order,
      lastupdate
    });
  };

  const Group: VoidComponent<{ id: Id; name: string; items: Item[] }> = (
    props
  ) => {
    const sortable = createSortable(props.id, { type: "group" });
    const sortedItemIds = () => props.items.map((item) => item.id);
    return (
      <div
        ref={sortable.ref}
        style={maybeTransformStyle(sortable.transform)}
        classList={{ "opacity-25": sortable.isActiveDraggable }}
      >
        <div class="column-header text-2xl mb-2" {...sortable.dragActivators}>
          {props.name}
        </div>
        <div class="column cursor-move">
          <SortableProvider ids={sortedItemIds()}>
            <For each={props.items}>
              {(item) => (
                <Item {...item} />
              )}
            </For>
          </SortableProvider>
        </div>
        <button onClick={()=> {addItem(getNextID() , getNextOrder(), "New Task", props.id); saveEntities()}} class="bg-grey-100 text-2xl rounded-2xl w-[96%] text-black p-1 hover:ring-2">+</button>
      </div>
    );
  };

  const getEntities = async () => {
    const getAllEntities = server$(async (token:string|undefined) => {
      const auth_checked = await getAuth(token);
      if (auth_checked.loggedin == true) {
        const userplanner = await db.select().from(planner).where(eq(planner.username, auth_checked.user.username));
        return userplanner;
      } else {
        return null;
      }
    })
    const planneritems = await getAllEntities(Cookies.get("auth"));
    if (planneritems?.length == 0) {
      addGroup(getNextID(), "Group 1", getNextOrder());
      addGroup(getNextID(), "Group 2", getNextOrder());
      addGroup(getNextID(), "Group 3", getNextOrder());
    } else {
      for (var entity in planneritems) {
        if (planneritems[entity].type == "item") {
          addItem(planneritems[entity].id, planneritems[entity].ordernum, planneritems[entity].name, planneritems[entity].groupid, planneritems[entity].startdate
          , planneritems[entity].duedate, planneritems[entity].progress, planneritems[entity].description, JSON.parse(planneritems[entity].checklist), planneritems[entity].priority, planneritems[entity].lastupdate)
        } else {
          addGroup(planneritems[entity].id, planneritems[entity].name, planneritems[entity].ordernum)
        }
        if (planneritems[entity].id >= nextID) {
          nextID = (planneritems[entity].id + 1); 
        }
        nextOrder += 1;
      }
    }
  }

  const setup = () => {
    batch(() => {
      getEntities();
    });
  };

  onMount(setup);

  const groups = () =>
    sortByOrder(
      Object.values(entities).filter((item) => item.type === "group")
    ) as Group[];

  const groupIds = () => groups().map((group) => group.id);

  const groupOrders = () => groups().map((group) => group.order);

  const groupItems = (groupId: Id) =>
    sortByOrder(
      Object.values(entities).filter(
        (entity) => entity.type === "item" && entity.group === groupId
      )
    ) as Item[];

  const groupItemIds = (groupId: Id) =>
    groupItems(groupId).map((item) => item.id);

  const groupItemOrders = (groupId: Id) =>
    groupItems(groupId).map((item) => item.order);

  const isSortableGroup = (sortable: Draggable | Droppable) =>
    sortable.data.type === "group";

  const closestEntity: CollisionDetector = (draggable, droppables, context) => {
    const closestGroup = closestCenter(
      draggable,
      droppables.filter((droppable) => isSortableGroup(droppable)),
      context
    );
    if (isSortableGroup(draggable)) {
      return closestGroup;
    } else if (closestGroup) {
      const closestItem = closestCenter(
        draggable,
        droppables.filter(
          (droppable) =>
            !isSortableGroup(droppable) &&
            droppable.data.group === closestGroup.id
        ),
        context
      );

      if (!closestItem) {
        return closestGroup;
      }

      const changingGroup = draggable.data.group !== closestGroup.id;
      if (changingGroup) {
        const belowLastItem =
          groupItemIds(closestGroup.id).at(-1) === closestItem.id &&
          draggable.transformed.center.y > closestItem.transformed.center.y;

        if (belowLastItem) return closestGroup;
      }

      return closestItem;
    }
  };

  const move = (
    draggable: Draggable,
    droppable: Droppable,
    onlyWhenChangingGroup = true
  ) => {
    if (!draggable || !droppable) return;

    const draggableIsGroup = isSortableGroup(draggable);
    const droppableIsGroup = isSortableGroup(droppable);

    const draggableGroupId = draggableIsGroup
      ? draggable.id
      : draggable.data.group;

    const droppableGroupId = droppableIsGroup
      ? droppable.id
      : droppable.data.group;

    if (
      onlyWhenChangingGroup &&
      (draggableIsGroup || draggableGroupId === droppableGroupId)
    ) {
      return;
    }

    let ids, orders, order: Big | undefined;

    if (draggableIsGroup) {
      ids = groupIds();
      orders = groupOrders();
    } else {
      ids = groupItemIds(droppableGroupId);
      orders = groupItemOrders(droppableGroupId);
    }

    if (droppableIsGroup && !draggableIsGroup) {
      order = new Big(orders.at(-1) ?? -ORDER_DELTA).plus(ORDER_DELTA).round();
    } else {
      const draggableIndex = ids.indexOf(draggable.id);
      const droppableIndex = ids.indexOf(droppable.id);
      if (draggableIndex !== droppableIndex) {
        let orderAfter, orderBefore;
        if (draggableIndex === -1 || draggableIndex > droppableIndex) {
          orderBefore = new Big(orders[droppableIndex]);
          orderAfter = new Big(
            orders[droppableIndex - 1] ?? orderBefore.minus(ORDER_DELTA * 2)
          );
        } else {
          orderAfter = new Big(orders[droppableIndex]);
          orderBefore = new Big(
            orders[droppableIndex + 1] ?? orderAfter.plus(ORDER_DELTA * 2)
          );
        }

        if (orderAfter !== undefined && orderBefore !== undefined) {
          order = orderAfter.plus(orderBefore).div(2.0);
          const rounded = order.round();
          if (rounded.gt(orderAfter) && rounded.lt(orderBefore)) {
            order = rounded;
          }
        }
      }
    }

    if (order !== undefined) {
      setEntities(draggable.id, (entity) => ({
        ...entity,
        order: order.toString(),
        group: droppableGroupId,
      }));
    }
  };

  const onDragOver: DragEventHandler = ({ draggable, droppable }) =>
    move(draggable, droppable);

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) =>
    move(draggable, droppable, false);

  return (
    <>
      <div class="w-full mb-4 text-right">
        <button class="m-auto ">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="flex-shrink-0 w-8 h-8 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"  stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M56 32a23.74 23.74 0 0 0-.32-3.89L48 25.37 51.5 18a24.41 24.41 0 0 0-5.5-5.5L38.63 16l-2.74-7.68a23.8 23.8 0 0 0-7.78 0L25.37 16 18 12.5a24.41 24.41 0 0 0-5.5 5.5l3.5 7.37-7.68 2.74a23.8 23.8 0 0 0 0 7.78L16 38.63 12.5 46a24.41 24.41 0 0 0 5.5 5.5l7.37-3.5 2.74 7.68a23.8 23.8 0 0 0 7.78 0L38.63 48 46 51.5a24.41 24.41 0 0 0 5.5-5.5L48 38.63l7.68-2.74A23.74 23.74 0 0 0 56 32z"></path><circle cx="32" cy="32" r="4"></circle></g></svg>
        </button>
      </div>
      <div class={"grid grid-cols-2 md:grid-cols-2 mt-5 gap-2 self-stretch lg:grid-cols-3"}>
        <DragDropProvider
          onDragOver={onDragOver}
          onDragEnd={(e)=> {onDragEnd(e); saveEntities()}}
          collisionDetector={closestEntity}
        >
          <DragDropSensors />
            <SortableProvider ids={groupIds()}>
              <For each={groups()}>
                {(group) => (
                  <>
                    <Group
                      id={group.id}
                      name={group.name}
                      items={groupItems(group.id)}
                    />
                  </>
                )}
              </For>
            </SortableProvider>
          <DragOverlay>
            {(draggable) => {
              const entity = entities[draggable.id];
              return isSortableGroup(draggable) ? (
                <GroupOverlay name={entity.name} items={groupItems(entity.id)} />
              ) : (
                <ItemOverlay name={entity.name} />
              );
            }}
          </DragOverlay>
        </DragDropProvider>
      </div>
    </>
  );
};