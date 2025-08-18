import { BlockPermutation, ItemStack } from "@minecraft/server";
import { assert } from "../../utils/error/Error";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";

declare module "@minecraft/server" {
    interface ItemStack {
        /**
         * Attempts to merge this item stack with another item stack.
         * If the stacks are not stackable or would exceed the maximum amount, returns undefined.
         * @param other - The other item stack to merge with.
         * @return A new ItemStack with the merged amount, or undefined if merging is not possible.
         */
        tryMerge(other: ItemStack | undefined): ItemStack | undefined;

        /**
         * Takes a specified amount from the item stack.
         * @param amount The amount to take from the stack.
         * @returns A stack with the amount taken
         * @throws Error if the amount is greater than the current stack amount.
         */
        takeAmount(amount: number): ItemStack | undefined;


        /**
         * Adds a specified amount to the item stack.
         * @param amount The amount to add to the stack.
         * @returns The item stack with the new amount or undefined if the amount exceeds the maximum stack size.
         */
        tryAddAmount(amount: number): ItemStack | undefined;

        isBlockitem(): boolean;

        // isHandEquipped(): boolean;
    }
}

ItemStack.prototype.tryMerge = function(other) {
    if (other === undefined) {
        return this.clone();
    }
    
    if (!this.isStackableWith(other)) return undefined;

    const totalAmount = this.amount + other.amount;
    if (totalAmount > this.maxAmount) return undefined;

    const newItem = this.clone();
    newItem.amount = totalAmount;
    return newItem;
}

ItemStack.prototype.takeAmount = function(amount) {
    assert(this.amount >= amount, "Cannot take more than the current stack amount");

    if (this.amount === amount) return undefined;

    const newItem = this.clone();
    newItem.amount -= amount;
    return newItem;
}

ItemStack.prototype.tryAddAmount = function(amount) {
    const totalAmount = this.amount + amount;
    if (totalAmount > this.maxAmount) return undefined;

    const newItem = this.clone();
    newItem.amount = totalAmount;
    return newItem;
}

ItemStack.prototype.isBlockitem = function() {
    try {
        // throws if the typeId is not a block item
        BlockPermutation.resolve(this.typeId);
        return true;
    }
    catch { /* empty */ }

    return false;
}

// ItemStack.prototype.isHandEquipped = function() {
//     console.log("todo implement ItemStack.isHandEquipped");
//     return false;
// }

const handEquippedItems = new Set<string>([
    MinecraftItemTypes.Stick
]);

const handEquippedKeywords = ["sword", "pickaxe", "axe", "shovel", "hoe"];

export function IsVanillaItemHandEquipped(itemStack: ItemStack): boolean {
    const id = itemStack.typeId;
    return handEquippedKeywords.some(keyword => id.includes(keyword)) || handEquippedItems.has(id);
}