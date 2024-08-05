import { ContainerSlot } from "@minecraft/server";

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