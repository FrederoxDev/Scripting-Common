import { world } from "@minecraft/server";
import { BlockCustomComponentV2 } from "./BlockCustomComponentV2";

const componentsToRegister: [string, BlockCustomComponentV2][] = [];
let hasInitialized = false;

export function registerBlockComponent(componentID: string, component: BlockCustomComponentV2) {
    if (!hasInitialized) {
        world.beforeEvents.worldInitialize.subscribe(e => {
            componentsToRegister.forEach(component => {
                try {
                    e.blockComponentRegistry.registerCustomComponent(component[0], component[1]);
                }
                catch (e) {
                    console.error(`Failed to automatically register block component ${component[0]}`);
                    console.error(e);
                };
            })
        });

        hasInitialized = true;
    }

    componentsToRegister.push([componentID, component]);
}