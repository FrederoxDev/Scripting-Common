import { Entity, EntityComponent, EntityComponentTypes, EntityEquippableComponent, EntityInventoryComponent, EntityTypeFamilyComponent, ItemStack } from "@minecraft/server";

declare module "@minecraft/server" {
    interface Entity {
        getInventory(): EntityInventoryComponent;
        getEquippable(): EntityEquippableComponent;
        getTypeFamily(): EntityTypeFamilyComponent;

        /**
         * @returns The item in the 0th index of the entities inventory
         */
        getSlot0Item(): ItemStack | undefined;

        getSlot0(): ContainerSlot;

        setSlot0Item(stack: ItemStack | undefined): void;

        replaceMainhandVisual(stack: string): void;
    }
}

function _getComponent<T extends EntityComponent>(entity: Entity, id: EntityComponentTypes): T {
    const component = entity.getComponent(id);
    if (component === undefined) throw new Error(`_getComponent tried to get component '${id}' on entity id: '${entity.typeId}' but it was not found!`);
    return component as T;
}

Entity.prototype.getInventory = function() {
    return _getComponent<EntityInventoryComponent>(this, EntityComponentTypes.Inventory);
}

Entity.prototype.getEquippable = function() {
    return _getComponent<EntityEquippableComponent>(this, EntityComponentTypes.Equippable);
}

Entity.prototype.getTypeFamily = function() {
    return _getComponent<EntityTypeFamilyComponent>(this, EntityComponentTypes.TypeFamily);
}

Entity.prototype.getSlot0Item = function() {
    const component = this.getComponent(EntityComponentTypes.Inventory);
    if (component === undefined) throw new Error(`getItemInInventory expected Inventory Component on ${this.typeId}`);
    return component.container.getItem(0);
}

Entity.prototype.getSlot0 = function() {
    const component = this.getComponent(EntityComponentTypes.Inventory);
    if (component === undefined) throw new Error(`getItemInInventory expected Inventory Component on ${this.typeId}`);
    return component.container.getSlot(0);
}

Entity.prototype.setSlot0Item = function(stack: ItemStack | undefined) {
    const component = this.getComponent(EntityComponentTypes.Inventory);
    if (component === undefined) throw new Error(`setFirstItem expected Inventory Component on ${this.typeId}`);
    component.container.setItem(0, stack);
}

Entity.prototype.replaceMainhandVisual = function(stack: string) {
    this.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${stack}`);
}