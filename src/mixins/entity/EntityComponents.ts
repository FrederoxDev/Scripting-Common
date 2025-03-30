import { Entity, EntityComponent, EntityComponentTypes, EntityEquippableComponent, EntityInventoryComponent, EntityTypeFamilyComponent } from "@minecraft/server";

declare module "@minecraft/server" {
    interface Entity {
        getInventory(): EntityInventoryComponent;
        getEquippable(): EntityEquippableComponent;
        getTypeFamily(): EntityTypeFamilyComponent;
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