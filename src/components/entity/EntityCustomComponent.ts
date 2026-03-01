// import { Entity, EntityRideableComponent, system } from "@minecraft/server";
// import { assert } from "../../utils/error/Error";

// export interface EntityComponentMountedEvent {
//     readonly entity: Entity;
//     readonly rider: Entity;
// }

// export interface EntityCustomComponent {
//     /**
//      * @remarks
//      * Invoked when an entity is mounted by another entity.
//      * - requires the entity to have a server anim_controller that sends a script event any time a rider is detected.
//      */
//     onEntityMounted?(ev: EntityComponentMountedEvent): void;
// }

// let initialized = false;
// const entityComponents = new Map<string, EntityCustomComponent>();

// /**
//  * Registers an entity component
//  */
// export function registerEntityComponent(entityID: string, component: EntityCustomComponent) {
//     assert(initialized, "Must call function 'initialize' in module EntityCustomComponent before registering components.");
//     entityComponents.set(entityID, component);
// }

// export function initializeEntityComponents(projectNamespace: string) {
//     assert(!initialized, "Don't call function 'initialize' in module EntityCustomComponent more than once.");
//     initialized = true;

//     const listenFor = `${projectNamespace}:rider_detected`;

//     system.run(() => {
//         system.afterEvents.scriptEventReceive.subscribe((ev) => {
//             if (ev.id !== listenFor || !ev.sourceEntity) return;

//             const entityComponent = entityComponents.get(ev.sourceEntity.typeId);
//             if (!entityComponent || !entityComponent.onEntityMounted) return;

//             const ridable = ev.sourceEntity.getComponent("minecraft:rideable") as EntityRideableComponent;

//             entityComponent.onEntityMounted({
//                 entity: ev.sourceEntity,
//                 rider: ridable.getRiders()[0]
//             })
//         })
//     })
// }

