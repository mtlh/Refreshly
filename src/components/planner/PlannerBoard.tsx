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
import { batch, createEffect, createSignal, For, onMount, VoidComponent} from "solid-js";
import { createStore, produce } from "solid-js/store";
import Big from "big.js";
import moment from "moment";
import { getBoardCol } from "./PlannerOptions";
import { Entity, Item, ORDER_DELTA, checklist } from "~/types_const/planner";
import { addItem } from "~/functions/planner/addItemGroup";
import { saveEntities } from "~/functions/planner/saveEntities";
import { getEntities } from "~/functions/planner/getEntities";
import { UpdateGroupShowFilter, getGroupShowFilter } from "~/functions/planner/filterGroupShow";
import { getProgressChoice } from "~/functions/planner/progressChoice";
import { getPriorityChoice } from "~/functions/planner/priorityChoice";
import { TaskItem } from "./ItemModal";

export const sortByOrder = (entities: Entity[]) => {
  const sorted = entities.map((item) => ({ order: new Big(item.order), item }));
  sorted.sort((a, b) => a.order.cmp(b.order));
  return sorted.map((entry) => entry.item);
};

const ItemOverlay = () => {
  return <div class="sortable"></div>;
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

export const PlannerBoard = (props: { type: string; }) => {
  const [entities, setEntities] = createStore<Record<Id, Entity>>({});

  let nextOrder = 1;
  let nextID = 1;

  const Item = (item: Item) => {
    const sortable = createSortable(item.id, {
      type: "item",
      group: item.group,
    });
    const [checkedcount, setCheckedCount] = createSignal(0);
    const [itemstore, setItemStore] = createStore(item);
    createEffect(() => {
      let count = 0;
      for (var x in itemstore.checklist) { if (itemstore.checklist[x].checked) {count += 1; }};
      setCheckedCount(count);
    }, [itemstore.checklist])
    const createIdsArray = (items: checklist[]): number[] => {
      return items.map((item, index) => index);
    };
    let startidarray: number[] = [];
    if (itemstore.checklist != null && itemstore.checklist != undefined) {
      startidarray = createIdsArray(itemstore.checklist);
    }
  const [isdueclass, setIsDueClass] = createSignal(" bg-transparent ");
  createEffect(() => {
    if (moment(itemstore.duedate).isBefore(moment(new Date())) == true) {
      setIsDueClass(" text-white bg-red-500 ")
    } else { 
      setIsDueClass(" bg-transparent ")
    }
  }, [itemstore.duedate]);

  return (
      <>
        <label
          for={itemstore.id.toString()}
        >
          <div
          use:sortable
          class="sortable bg-gray-100 rounded-lg p-1 text-left ring-1 ring-gray-300 shadow-sm container hover:shadow-2xl w-[92%] m-2"
          classList={{ "opacity-25": sortable.isActiveDraggable }}
          >
            <p class="text-lg text-black w-full py-0.5 px-2.5 font-bold">{itemstore.name}</p>
            <For each={progressChoice()}>
              {(progress) => (
                <>
                  {itemstore.progress == progress.name &&
                    <p class={`text-white text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md mx-2 my-1`} style={{background: progress.colour}}>{progress.name}</p>
                  }
                </>
              )}
            </For>
            <For each={priorityChoice()}>
              {(priority) => (
                <>
                  {itemstore.priority == priority.name &&
                    <p class={`text-white text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md mx-2 my-1`} style={{background: priority.colour}}>{priority.name}</p>
                  }
                </>
              )}
            </For>
            <p class="text-sm text-black w-full py-0.5 px-2.5 mb-8 mt-1">{itemstore.description}</p>
            <div class="relative">
              {itemstore.checklist &&
                <p class="absolute bottom-0 right-0 text-right py-0.5 px-2.5 italic text-sm">{checkedcount()}/{itemstore.checklist.length}</p>
              }
              <input type="date" class={"py-0.5 px-2.5 absolute italic bottom-0 left-0 text-sm border-0 rounded-lg w-[7.5rem] focus:ring-sky-800 focus:ring-2" + isdueclass()} value={itemstore.duedate} onChange={(e) => {setItemStore("duedate", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}} />
            </div>
          </div>
        </label>
        <input type="checkbox" id={itemstore.id.toString()} class="modal-toggle" />
        <TaskItem item={itemstore} entities={entities} setEntities={setEntities} progressChoice={progressChoice()} priorityChoice={priorityChoice()} type={props.type} />
      </>
    );
  };

  const Group: VoidComponent<{ id: Id; name: string; items: Item[]}> = (
    props
  ) => {
    const sortable = createSortable(props.id, { type: "group" });
    const sortedItemIds = () => props.items.map((item) => item.id);
    const [isOpen, setIsOpen] = createSignal(false);
    const toggleDropdown = () => {
      setIsOpen(!isOpen());
    };
    const [completed_count, setCompletedCount] = createSignal(0);
    createEffect(() => {
      setCompletedCount(props.items.filter(item => item.progress === 'Completed').length);
    });
    return (
      <div
        ref={sortable.ref}
        style={maybeTransformStyle(sortable.transform)}
        classList={{ "opacity-25": sortable.isActiveDraggable }}
      >
        <div class={"column-header text-2xl mb-2 text-left p-2"} {...sortable.dragActivators}>
          {props.name}
        </div>
        <div class="column cursor-move overflow-y-auto" style={{ "max-height": "60vh" }}>
          <SortableProvider ids={sortedItemIds()}>
            <For each={props.items}>
              {(item) => (
                <>
                  { item.progress != "Completed" &&
                    <Item {...item} />
                  }
                </>
              )}
            </For>
          </SortableProvider>
        </div>
        <button onClick={()=> {addItem({
          name: "new task",
          type: "item",
          group: props.id,
          progress: "",
          description: "",
          checklist: [],
          priority: "",
          lastupdate: new Date(),
          id: nextID+=1,
          order: (nextOrder+=1).toString()
        }, setEntities); saveEntities(entities)}} class="bg-grey-100 text-2xl rounded-sm w-[95%] text-black p-1 hover:ring-2 m-auto">+</button>
        <div class="relative mt-2">
          <button
            class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-sm w-[95%] focus:outline-none focus:bg-gray-300 m-auto"
            onClick={toggleDropdown}
          >
            Completed - 
            {completed_count()}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class={`ml-2 w-4 h-4 transition-transform duration-300 ${
                isOpen() ? "transform rotate-180" : ""
              }`}
            >
              <path
                fill-rule="evenodd"
                d="M5.293 6.293a1 1 0 0 1 1.414 0L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          {isOpen() && (
            <div class="absolute z-40 w-full bg-white mt-2 rounded-lg overflow-y-auto" style={{"max-height":"60vh"}}>
              <div class="column cursor-move">
                <SortableProvider ids={sortedItemIds()}>
                  <For each={props.items}>
                    {(item) => (
                      <>
                        { item.progress == "Completed" &&
                          <Item {...item} />
                        }
                      </>
                    )}
                  </For>
                </SortableProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const groups = () =>
    sortByOrder(
      Object.values(entities).filter((item) => item.type === "group")
    ) as Group[];

  const [boardcol, SetBoardCol] = createSignal(0);
  const [groupfilter, SetGroupFilter] = createSignal(Array.from({length: groups().length}, () => true));

  const [progressChoice, setProgressChoice] = createSignal(0);
  const [priorityChoice, setPriorityChoice] = createSignal(0);

  function updateGroupFilterAtIndex(index: number, newValue: boolean) {
    SetGroupFilter(produce((draft) => {
      draft[index] = newValue;
    }));
  }

  const setup = () => {
    batch(async () => {
      let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;

      SetGroupFilter(await getGroupShowFilter());

      SetBoardCol(await getBoardCol());

      // Progress/Priority Options
      let priority: string[] = await getPriorityChoice();
      // @ts-ignore
      setPriorityChoice(priority);
      let progress: string[] = await getProgressChoice();
      // @ts-ignore
      setProgressChoice(progress);
    });
  };

  onMount(setup);

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
        order: order?.toString(),
        group: droppableGroupId,
      }));
      saveEntities(entities);
    }
  };

  const onDragOver: DragEventHandler = ({ draggable, droppable }) =>
    move(draggable, droppable);

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) =>
    move(draggable, droppable, false);
  
  return (
    <>
      {(boardcol() != 0 && JSON.stringify(groupfilter()[0]) != "" && priorityChoice() != 0 && progressChoice() != 0) ? 
        <>    
          <div class="relative">
            <div class="absolute dropdown dropdown-bottom dropdown-end top-0 right-0 -translate-y-28 md:-translate-y-14 z-30">
              <label tabindex="0" class="btn flex text-md md:text-lg bg-gray-100 rounded-lg m-1 text-black hover:bg-gray-200 capitalize border-0">
                Filter
                <svg class="w-6 h-6 ml-2" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 10.5A3.502 3.502 0 0 0 18.355 8H21a1 1 0 1 0 0-2h-2.645a3.502 3.502 0 0 0-6.71 0H3a1 1 0 0 0 0 2h8.645A3.502 3.502 0 0 0 15 10.5zM3 16a1 1 0 1 0 0 2h2.145a3.502 3.502 0 0 0 6.71 0H21a1 1 0 1 0 0-2h-9.145a3.502 3.502 0 0 0-6.71 0H3z" fill="#000000"></path></g></svg>
              </label>
              <div tabindex="0" class="dropdown-content card card-compact w-60 rounded-sm shadow bg-white text-black z-30">
                <div class="card-body">
                  <ul class="p-0 space-y-2 text-lg text-gray-700 dark:text-gray-200" aria-labelledby="dropdownCheckboxButton">
                    <For each={groups()}>
                      {(group, v) => (
                        <>
                          <li>
                            <div class="flex items-center">
                                <input checked={groupfilter()[v()]} onchange={() => { updateGroupFilterAtIndex(v(), !groupfilter()[v()]); UpdateGroupShowFilter(groupfilter()); } } id="checkbox-item-2" type="checkbox" value="" 
                                  class="w-6 h-6 text-sky-800 bg-gray-100 border-gray-300 rounded focus:ring-sky-700"
                                 />
                                <label for="checkbox-item-2" class="ml-1 text-lg font-medium text-gray-900 dark:text-gray-300">{group.name}</label>
                              </div>
                          </li>
                        </>
                      )}
                    </For>
                  </ul>
                  <button onclick={()=> {location.reload()}} class="bg-sky-800 hover:bg-sky-700 text-white rounded-sm m-1 p-2 text-lg">Save</button>
                </div>
              </div>
            </div>
          </div>
          {/* <div class={`grid gap-2 p-2 self-stretch grid-cols-2 md:grid-cols-3 lg:grid-cols-${boardcol()}`}></div> */}
          <div class={`grid gap-2 p-2 self-stretch grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}>
            <DragDropProvider
              onDragOver={onDragOver}
              onDragEnd={(e)=> {onDragEnd(e); saveEntities(entities)}}
              collisionDetector={closestEntity}
            >
              <DragDropSensors />
                <SortableProvider ids={groupIds()}>
                  <For each={groups()}>
                    {(group, x) => (
                      <>
                        {groupfilter()[x()] == true &&
                          <Group
                            id={group.id}
                          name={group.name}
                          items={groupItems(group.id)}
                          />
                        }
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
        :
          <div class="">
          </div>
      }
    </>
  );
};