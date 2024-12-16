import { ItemStack, Container } from "@minecraft/server";

declare module "@minecraft/server" {
    interface Container {
        findSlot(predicate: (item: ItemStack) => boolean): ContainerSlot | undefined;

        /**
         * Returns a map containing item identifiers to the number of that item
         */
        getContentOverview(): Map<string, number>;
    }
}

Container.prototype.findSlot = function(predicate) {
    for (let i = 0; i < this.size; i++) {
        const slot = this.getSlot(i);
        if (!slot.hasItem()) continue;
        if (predicate(slot.getItem()!)) return slot;
    }
    
    return undefined;
}

Container.prototype.getContentOverview = function() {
    const items = new Map<string, number>;

    for (let i = 0; i < this.size; i++) {
        const slot = this.getSlot(i);
        if (!slot.hasItem()) continue;
        items.set(slot.typeId, (items.get(slot.typeId) ?? 0) + slot.amount);
    }

    return items;
}