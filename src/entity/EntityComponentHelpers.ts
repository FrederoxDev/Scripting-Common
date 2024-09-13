import { Entity, EntityComponentTypes, EntityEquippableComponent, EntityInventoryComponent } from "@minecraft/server";

declare module "@minecraft/server" {
    interface Entity {
        getInventory(): EntityInventoryComponent | undefined;
        getEquippable(): EntityEquippableComponent | undefined;
    }
}

Entity.prototype.getInventory = function(): EntityInventoryComponent | undefined {
    return this.getComponent(EntityComponentTypes.Inventory) as EntityInventoryComponent | undefined;
}

Entity.prototype.getEquippable = function(): EntityEquippableComponent | undefined {
    return this.getComponent(EntityComponentTypes.Equippable) as EntityEquippableComponent | undefined;
}