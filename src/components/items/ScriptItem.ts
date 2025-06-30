import { ItemComponentBeforeDurabilityDamageEvent, ItemComponentCompleteUseEvent, ItemComponentConsumeEvent, ItemComponentHitEntityEvent, ItemComponentMineBlockEvent, ItemComponentUseEvent, ItemComponentUseOnEvent, ItemCustomComponent, system } from "@minecraft/server";

const componentsToRegister: [string, ItemCustomComponent][] = [];

export class ScriptItem implements ItemCustomComponent {
    constructor(itemID: string) {
        componentsToRegister.push([itemID, this]);
    }

    onBeforeDurabilityDamage?(ev: ItemComponentBeforeDurabilityDamageEvent): void;
    onCompleteUse?(ev: ItemComponentCompleteUseEvent): void;
    onConsume?(ev: ItemComponentConsumeEvent): void;
    onHitEntity?(ev: ItemComponentHitEntityEvent): void;
    onMineBlock?(ev: ItemComponentMineBlockEvent): void;
    onUse?(ev: ItemComponentUseEvent): void;
    onUseOn?(ev: ItemComponentUseOnEvent): void;
}

system.beforeEvents.startup.subscribe(e => {
    componentsToRegister.forEach(component => {
        e.itemComponentRegistry.registerCustomComponent(component[0], component[1]);
    })
});