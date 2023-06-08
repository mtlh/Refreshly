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
} from "@thisbeyond/solid-dnd";
import { batch, For, onMount, VoidComponent} from "solid-js";
import { createStore } from "solid-js/store";
import Big from "big.js";
import Cookies from "js-cookie";
import server$ from "solid-start/server";
import { getAuth } from "~/functions/getAuth";
import { db } from "~/functions/db_client";
import { and, eq } from "drizzle-orm";
import { planner } from "~/db/schema";
import { useNavigate } from "solid-start";

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
  startdate?: Date;
  duedate?: Date;
  progress: "" | "Not Started" | "Ongoing" | "Complete";
  description: string;
  checklist: checklist[];
  priority: "High" | "Medium" | "Low" | "Urgent" | "";
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
      <div class="column-header text-2xl mb-2" onDblClick={""}>{props.name}</div>
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
    for (var x in item.checklist) { checked_count += 1;};
    const [itemstore, setItemStore] = createStore(item);
    return (
      <>
        <label
          for={itemstore.id.toString()}
        >
          <div
          use:sortable
          class="sortable bg-gray-100 rounded-lg p-2 m-2 text-left ring-1 ring-gray-300 shadow-lg container relative"
          classList={{ "opacity-25": sortable.isActiveDraggable }}
          >
            <p class="text-lg text-black font-normal w-full mb-6">{itemstore.name}</p>
            {itemstore.checklist &&
              <p class="text-md text-black font-normal text-left mb-2">{checked_count}/{itemstore.checklist.length}</p>
            }
            <ul>
              <For each={itemstore.checklist}>{(checklist, i) =>
                <li>
                  <p>{checklist.checked}</p>
                  <p>{checklist.content}</p>
                </li>
              }</For> 
            </ul>
            { itemstore.duedate?.getUTCDate() ? 
              <p class="absolute bottom-0 left-0 p-2 italic">{itemstore.duedate?.getUTCDate()}</p>
              :
              <p class="absolute bottom-0 left-0 p-2 italic">Unscheduled</p>
            }
          </div>
        </label>
        <input type="checkbox" id={itemstore.id.toString()} class="modal-toggle" />
        <label for={itemstore.id.toString()} class="modal cursor-pointer">
          <label class="modal-box relative rounded-lg" for="">
            <h3 class="text-lg font-bold">{itemstore.name}</h3>
            <p class="py-2">id: {itemstore.id}</p>
            <p class="py-2">group: {itemstore.group}</p>
            <p class="py-2">order: {itemstore.order}</p>
            <p class="py-2">progress: {itemstore.progress}</p>
            <p class="py-2">priority: {itemstore.priority}</p>
            <input class="py-2" value={itemstore.name} onChange={(e) => {setItemStore("name", e.target.value); setEntities(itemstore.id, itemstore); saveEntities()}}/>
            <button onclick={() => deletetask(itemstore.id)}>DELETE TASK</button>
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
            const checktasks = await db.select().from(planner).where(and(eq(planner.id, item.id), eq(planner.username, auth_checked.user.username)))
            if (checktasks.length > 0) {
              const updatetasks = await db.update(planner).set({
                name: item.name,
                ordernum: item.order,
                groupid: item.group,
                startdate: item.startdate,
                duedate: item.duedate,
                progress: item.progress,
                description: item.description,
                checklist: JSON.stringify(item.checklist),
                priority: item.priority
              }).where(and(eq(planner.id, item.id), eq(planner.username, auth_checked.user.username)))
            } else {
              const inserttasks = await db.insert(planner).values({
                username: auth_checked.user.username,
                id: item.id,
                name: item.name,
                type: item.type,
                ordernum: item.order,
                groupid: item.group,
                startdate: item.startdate,
                duedate: item.duedate,
                progress: item.progress,
                description: item.description,
                checklist: JSON.stringify(item.checklist),
                priority: item.priority
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

  const addItem = (id: number, order: string, name: string, group: Id, startdate?: Date, duedate?: Date, progress: "" | "Not Started" | "Ongoing" | "Complete",
    description: string, checklist: checklist[], priority: "High" | "Medium" | "Low" | "Urgent" | "") => {
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
      addItem(getNextID(), getNextOrder(), "Task 1", 1);
      addItem(getNextID(), getNextOrder(), "Task 2", 1);
      addItem(getNextID(), getNextOrder(), "Task 3", 2);
      addItem(getNextID(), getNextOrder(), "Task 4", 3);
    } else {
      for (var entity in planneritems) {
        if (planneritems[entity].type == "item") {
          addItem(planneritems[entity].id, planneritems[entity].ordernum, planneritems[entity].name, planneritems[entity].groupid, planneritems[entity].startdate
          , planneritems[entity].duedate, planneritems[entity].progress, planneritems[entity].description, JSON.parse(planneritems[entity].checklist), planneritems[entity].priority)
        } else {
          addGroup(planneritems[entity].id, planneritems[entity].name, planneritems[entity].ordernum)
        }
        if (planneritems[entity].id >= nextID) {
          nextID = (planneritems[entity].id + 1); 
        }
        nextOrder += 1;
      }
    }
    console.log(entities, nextID)
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

    let ids, orders, order;

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
    <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mt-5 gap-2 self-stretch">
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
  );
};