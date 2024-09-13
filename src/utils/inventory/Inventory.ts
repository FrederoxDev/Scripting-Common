import { ContainerSlot, Entity, EntityInventoryComponent, ItemStack } from "@minecraft/server";
import { Vec3 } from "../math/Vec3";

export function MoveOneItem(original: ContainerSlot, target: ContainerSlot) {
    const startStack = original.getItem();
    if (startStack === undefined) return;

    // Clone the item, with a stack size of 1
    const stackCopy = startStack.clone();
    stackCopy.amount = 1;
    target.setItem(stackCopy);

    // Handle taking the last item of the slot
    if (startStack.amount - 1 <= 0) {
        original.setItem(undefined);
        return;
    }

    // Decrease the count in the first slot
    startStack.amount -= 1;
    original.setItem(startStack);
}

export function TakeOne(original: ContainerSlot): ItemStack | undefined {
    const originalStack = original.getItem();

    // Nothing to take!
    if (originalStack === undefined || original.amount === 0) return undefined;

    if (originalStack.amount === 1) {
        original.setItem(undefined);
        return originalStack;
    }

    // Decrease the item count in the original stack
    originalStack.amount -= 1;
    original.setItem(originalStack);

    // Set stack size to 1 and pass back
    originalStack.amount = 1;
    return originalStack;
}

export function GiveOneDropIfFull(entity: Entity, stack: ItemStack) {
    const inventory = entity.getComponent("inventory") as EntityInventoryComponent;

    if (inventory.container === undefined || inventory.container.emptySlotsCount === 0) {
        const forward = entity.getViewDirection();
        const spawnPos = Vec3.add(entity.location, forward);
        entity.dimension.spawnItem(stack, spawnPos);
        return;
    }

    inventory.container.addItem(stack);
}