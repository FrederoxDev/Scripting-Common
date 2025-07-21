import { ItemStack } from "@minecraft/server";

declare module "@minecraft/server" {
    interface ItemStack {
        /**
         * Attempts to merge this item stack with another item stack.
         * If the stacks are not stackable or would exceed the maximum amount, returns undefined.
         * @param other - The other item stack to merge with.
         * @return A new ItemStack with the merged amount, or undefined if merging is not possible.
         */
        tryMerge(other: ItemStack): ItemStack | undefined;
    }
}

ItemStack.prototype.tryMerge = function(other) {
    if (!this.isStackableWith(other)) return undefined;

    const totalAmount = this.amount + other.amount;
    if (totalAmount > this.maxAmount) return undefined;

    const newItem = this.clone();
    newItem.amount = totalAmount;
    return newItem;
}