import { EntityEquippableComponent, EquipmentSlot, ItemComponentMineBlockEvent, ItemCustomComponent, ItemDurabilityComponent } from "@minecraft/server";

export class ItemDurability implements ItemCustomComponent {
    onMineBlock(ev: ItemComponentMineBlockEvent) {
        const newStack = ev.itemStack;
        if (newStack === undefined) return; /** Item Broke? */

        const durability = newStack.getComponent("durability") as ItemDurabilityComponent | undefined;
        if (durability === undefined) {
            throw new Error(`ItemDurabilityComponent expected '${newStack.typeId}' to have the 'minecraft:durability' component.`);
        }

        const equippable = ev.source.getComponent("equippable") as EntityEquippableComponent | undefined;
        if (durability === undefined) {
            throw new Error(`ItemDurabilityComponent expected '${ev.source}' to have the 'minecraft:equippable' component.`);
        }

        const mainHand = equippable!.getEquipmentSlot(EquipmentSlot.Mainhand);

        durability.damage += 1;
        newStack.setLore([`Durability: ${durability.maxDurability - durability.damage} / ${durability.maxDurability}`]);
        mainHand.setItem(newStack);
    }
}