import { Entity, EntityComponent, EntityComponentTypes, EntityEquippableComponent, EntityInventoryComponent, EquipmentSlot, Player } from "@minecraft/server";

declare module "@minecraft/server" {
    interface Player {
        getMainhand(): ContainerSlot;
    }
}


Player.prototype.getMainhand = function() {
    return this.getEquippable().getEquipmentSlot(EquipmentSlot.Mainhand);
}