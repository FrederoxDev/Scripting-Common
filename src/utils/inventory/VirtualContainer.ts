import { Container, ContainerSlot, ItemStack } from "@minecraft/server";

/**
 * A virtual container that represents groups of items inside of one real container.
 */
export class VirtualContainer {
    private container: Container;
    private slots: number[];

    /**
     * @param realContainer The underlaying container to use in our virutal container
     * @param slots The slots in that container to use virtually.
     */
    constructor(realContainer: Container, slots: number[]) {
        this.container = realContainer;
        this.slots = slots;
    }

    /**
     * @returns The size of the virtual container.
     */
    size(): number {
        return this.slots.length;
    }

    /**
     * Returns a slot using a virtual slot index.
     * @param slot 
     * @returns 
     */
    getSlot(slot: number): ContainerSlot {
        return this.container.getSlot(this.slots[slot]);
    }
    
    /**
     * Checks if the entire virtual container is empty.
     */
    isEmpty(): boolean {
        for (let i = 0; i < this.slots.length; i++) {
            if (!this.container.getSlot(this.slots[i]).hasItem()) return false;
        }
        return true;
    }

    /**
     * Finds the first slot that returns true for the provided function.
     */
    findSlot(predicate: (item: ItemStack) => boolean): ContainerSlot | undefined{
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.container.getSlot(this.slots[i]);
            if (slot.hasItem() && predicate(slot.getItem()!)) return slot;
        }
        return undefined;
    }

    /**
     * Finds the first slot index (in virtual container space) that returns true for the provided function.
     */
    findSlotIdx(predicate: (item: ItemStack) => boolean): number | undefined{
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.container.getSlot(this.slots[i]);
            if (slot.hasItem() && predicate(slot.getItem()!)) return i;
        }
        return undefined;
    }

    forEachItem(predicate: (item: ItemStack) => void): void {
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.container.getSlot(this.slots[i]);
            if (slot.hasItem()) predicate(slot.getItem()!);
        }
    }
}