import { EquipmentSlot, GameMode, Player } from "@minecraft/server";

declare module "@minecraft/server" {
    interface Player {
        getMainhand(): ContainerSlot;
        getHeldItem(): ItemStack | undefined;
        getHeldContainerSlot(): ContainerSlot;
        isInCreative(): boolean;

    }
}

Player.prototype.getMainhand = function() {
    return this.getEquippable().getEquipmentSlot(EquipmentSlot.Mainhand);
}

Player.prototype.isInCreative = function() {
    return this.getGameMode() === GameMode.Creative;
}

Player.prototype.getHeldItem = function() {
    return this.getEquippable().getEquipment(EquipmentSlot.Mainhand);
}

Player.prototype.getHeldContainerSlot = function() {
    return this.getEquippable().getEquipmentSlot(EquipmentSlot.Mainhand);
}