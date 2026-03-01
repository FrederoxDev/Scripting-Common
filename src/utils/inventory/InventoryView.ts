import { Container, ContainerSlot, ItemStack } from "@minecraft/server";

/**
 * A virtual container that represents groups of items inside of one real container.
 */
export class InventoryView {
    private slots: number[];
    private useAllSlots: boolean = false;

    /**
     * @param realContainer The underlaying container to use in our virutal container
     * @param slots The slots in that container to use virtually.
     */
    constructor(slots: number[] | undefined) {
        this.slots = [];

        if (slots !== undefined) {
            this.slots = slots;
        }
        else {
            this.useAllSlots = true;
        }
    }

    /**
     * @returns The size of the virtual container.
     */
    size(container: Container): number {
        if (this.useAllSlots) return container.size;
        return this.slots.length;
    }

    /**
     * Returns a slot using a virtual slot index.
     * @param slot 
     * @returns 
     */
    getSlot(container: Container, slot: number): ContainerSlot {
        if (this.useAllSlots) {
            return container.getSlot(slot);
        }

        return container.getSlot(this.slots[slot]!);
    }
    
    /**
     * Checks if the entire virtual container is empty.
     */
    isEmpty(container: Container): boolean {
        if (this.useAllSlots) {
            for (let i = 0; i < container.size; i++) {
                if (!container.getSlot(i).hasItem()) return false;
            }

            return true;
        }

        for (let i = 0; i < this.slots.length; i++) {
            if (!container.getSlot(this.slots[i]!).hasItem()) return false;
        }
        return true;
    }

    /**
     * Finds the first slot that returns true for the provided function.
     */
    findSlot(container: Container, predicate: (item: ItemStack) => boolean): ContainerSlot | undefined {
        if (this.useAllSlots) {
            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i);
                if (slot.hasItem() && predicate(slot.getItem()!)) return slot;
            }
            return undefined;
        }

        for (let i = 0; i < this.slots.length; i++) {
            const slot = container.getSlot(this.slots[i]!);
            if (slot.hasItem() && predicate(slot.getItem()!)) return slot;
        }
        return undefined;
    }

    /**
     * Finds the first slot index (in virtual container space) that returns true for the provided function.
     */
    findSlotIdx(container: Container, predicate: (item: ItemStack) => boolean): number | undefined{
        if (this.useAllSlots) {
            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i);
                if (slot.hasItem() && predicate(slot.getItem()!)) return i;
            }
            return undefined;
        }

        for (let i = 0; i < this.slots.length; i++) {
            const slot = container.getSlot(this.slots[i]!);
            if (slot.hasItem() && predicate(slot.getItem()!)) return i;
        }
        return undefined;
    }

    forEachItem(container: Container, predicate: (item: ItemStack) => void): void {
        if (this.useAllSlots) {
            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i);
                if (slot.hasItem()) predicate(slot.getItem()!);
            }
            return;
        }

        for (let i = 0; i < this.slots.length; i++) {
            const slot = container.getSlot(this.slots[i]!);
            if (slot.hasItem()) predicate(slot.getItem()!);
        }
    }

    forEachSlot(container: Container, predicate: (slot: ContainerSlot, realIndex: number) => void): void {
        if (this.useAllSlots) {
            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i);
                predicate(slot, i);
            }
            return;
        }

        for (let i = 0; i < this.slots.length; i++) {
            const index = this.slots[i]!;
            const slot = container.getSlot(index)!;
            predicate(slot, index);
        }
    }

    /**
     * Attempts to add an item stack to the container
     * - if unsuccessful, it will return false and the item stack will be unchanged.
     */
    tryAddItem(container: Container, item: ItemStack): boolean {
        if (this.useAllSlots) {
            return this.tryAddItemFull(container, item);
        }
        
        let amountRemaining = item.amount;
        const maxStackSize = item.maxAmount;
        const itemsToDistribute: [ContainerSlot, number][] = [];

        for (let i = 0; i < this.slots.length; i++) {
            // const slot = container.getSlot(this.slots[i]);
            const slot = this.getSlot(container, i);

            // Move the full stack
            if (!slot.hasItem()) {
                slot.setItem(item);
                return true;
            }

            if (!slot.isStackableWith(item)) continue;

            const amountToAdd = Math.min(maxStackSize - slot.amount, amountRemaining);
            if (amountToAdd > 0) {
                itemsToDistribute.push([slot, amountToAdd]);
                amountRemaining -= amountToAdd;
            }

            if (amountRemaining <= 0) break;
        }

        if (amountRemaining > 0) return false; // Not enough space

        // Distribute the items
        for (const [slot, amount] of itemsToDistribute) {
            const itemToAdd = slot.getItem()!;
            itemToAdd.amount += amount;
            slot.setItem(itemToAdd);
        }

        return true;
    }

    private tryAddItemFull(container: Container, item: ItemStack): boolean {
        let amountRemaining = item.amount;
        const maxStackSize = item.maxAmount;
        const itemsToDistribute: [ContainerSlot, number][] = [];

        for (let i = 0; i < container.size; i++) {
            // const slot = container.getSlot(this.slots[i]);
            const slot = this.getSlot(container, i);

            // Move the full stack
            if (!slot.hasItem()) {
                slot.setItem(item);
                return true;
            }

            if (!slot.isStackableWith(item)) continue;

            const amountToAdd = Math.min(maxStackSize - slot.amount, amountRemaining);
            if (amountToAdd > 0) {
                itemsToDistribute.push([slot, amountToAdd]);
                amountRemaining -= amountToAdd;
            }

            if (amountRemaining <= 0) break;
        }

        if (amountRemaining > 0) return false; // Not enough space

        // Distribute the items
        for (const [slot, amount] of itemsToDistribute) {
            const itemToAdd = slot.getItem()!;
            itemToAdd.amount += amount;
            slot.setItem(itemToAdd);
        }

        return true;
    }
}