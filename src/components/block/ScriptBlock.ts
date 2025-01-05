import { world } from "@minecraft/server";
import { BlockCustomComponentV2 } from "./BlockCustomComponentV2";

const componentsToRegister: [string, BlockCustomComponentV2][] = [];

export class ScriptBlock implements BlockCustomComponentV2 {
    constructor(blockID: string) {
        componentsToRegister.push([blockID, this]);
    }
}

world.beforeEvents.worldInitialize.subscribe(e => {
    componentsToRegister.forEach(component => {
        e.blockComponentRegistry.registerCustomComponent(component[0], component[1]);
    })
})

export function registerBlockComponent(componentID: string, component: BlockCustomComponentV2) {
    componentsToRegister.push([componentID, component]);
}