import { ContainerSlot, ItemStack } from "@minecraft/server";
import { ContainerLike } from "./ContainerLike";

/**
 * A virtual container that represents groups of items inside of one real container.
 */
export class VirtualContainer {
    private slots: number[];

    /**
     * @param slots The slots in that container to use virtually.
     */
    constructor(slots: number[]) {
        this.slots = slots;
    }

    /**
     * @returns The size of the virtual container.
     */
    get size(): number {
        return this.slots.length;
    }

    /**
     * @returns The underlying real slot indices.
     */
    get indices(): readonly number[] {
        return this.slots;
    }

    /**
     * Returns a slot using a virtual slot index.
     * @param slot 
     * @returns 
     */
    getSlot(container: ContainerLike, slot: number): ContainerSlot {
        return container.getSlot(this.slots[slot]!);
    }

    getItem(container: ContainerLike, slot: number): ItemStack | undefined {
        return container.getItem(this.slots[slot]!);
    }
    
    /**
     * Checks if the entire virtual container is empty.
     */
    isEmpty(container: ContainerLike): boolean {
        for (let i = 0; i < this.slots.length; i++) {
            if (!container.getSlot(this.slots[i]!).hasItem()) return false;
        }
        return true;
    }

    /**
     * Finds the first slot that returns true for the provided function.
     */
    findSlot(container: ContainerLike, predicate: (item: ItemStack) => boolean): ContainerSlot | undefined{
        for (let i = 0; i < this.slots.length; i++) {
            const slot = container.getSlot(this.slots[i]!);
            if (slot.hasItem() && predicate(slot.getItem()!)) return slot;
        }
        return undefined;
    }

    /**
     * Finds the first slot index (in virtual container space) that returns true for the provided function.
     */
    findSlotIdx(container: ContainerLike, predicate: (item: ItemStack) => boolean): number | undefined{
        for (let i = 0; i < this.slots.length; i++) {
            const slot = container.getSlot(this.slots[i]!);
            if (slot.hasItem() && predicate(slot.getItem()!)) return i;
        }
        return undefined;
    }

    forEachItem(container: ContainerLike, predicate: (item: ItemStack) => void): void {
        for (let i = 0; i < this.slots.length; i++) {
            const slot = container.getSlot(this.slots[i]!);
            if (slot.hasItem()) predicate(slot.getItem()!);
        }
    }

    canAddItems(container: ContainerLike, items: ItemStack[]): boolean {
        // Snapshot current slot state (simulation)
        const simulated = this.slots.map(i => {
            const slot = container.getSlot(i);
            return slot.hasItem() ? slot.getItem()!.clone() : undefined;
        });

        // Simulate insertion
        for (const incoming of items) {
            let remaining = incoming.amount;

            // Merge into existing stacks
            for (const item of simulated) {
                if (!item) continue;
                if (item.typeId !== incoming.typeId) continue;

                const space = item.maxAmount - item.amount;
                if (space <= 0) continue;

                const used = Math.min(space, remaining);
                item.amount += used;
                remaining -= used;

                if (remaining === 0) break;
            }

            // Fill empty slots
            for (let i = 0; i < simulated.length && remaining > 0; i++) {
                if (simulated[i]) continue;

                const placed = Math.min(incoming.maxAmount, remaining);
                const clone = incoming.clone();
                clone.amount = placed;

                simulated[i] = clone;
                remaining -= placed;
            }

            if (remaining > 0) return false;
        }

        return true;
    }

    /**
     * Attempts to add the provided items into the virtual container.
     * @returns true if all items were added, false if there was not enough space.
     */
    tryAddItems(
        container: ContainerLike,
        items: ItemStack[],
        canPlace?: (slotIndex: number, item: ItemStack) => boolean,
    ): boolean {
        const simulated = this.slots.map(i => {
            const slot = container.getSlot(i);
            return slot.hasItem() ? slot.getItem()!.clone() : undefined;
        });

        // Simulate insertion
        for (const incoming of items) {
            let remaining = incoming.amount;

            for (let i = 0; i < simulated.length; i++) {
                const item = simulated[i];
                if (!item) continue;
                if (item.typeId !== incoming.typeId) continue;

                const space = item.maxAmount - item.amount;
                if (space <= 0) continue;
                if (canPlace && !canPlace(this.slots[i]!, incoming)) continue;

                const used = Math.min(space, remaining);
                item.amount += used;
                remaining -= used;

                if (remaining === 0) break;
            }

            for (let i = 0; i < simulated.length && remaining > 0; i++) {
                if (simulated[i]) continue;
                if (canPlace && !canPlace(this.slots[i]!, incoming)) continue;

                const placed = Math.min(incoming.maxAmount, remaining);
                const clone = incoming.clone();
                clone.amount = placed;

                simulated[i] = clone;
                remaining -= placed;
            }

            if (remaining > 0) return false;
        }

        for (let i = 0; i < simulated.length; i++) {
            const realSlot = container.getSlot(this.slots[i]!);
            const item = simulated[i]!;

            if (item) {
                realSlot.setItem(item);
            } else {
                realSlot.setItem(undefined);
            }
        }

        return true;
    }

    takeItems(container: ContainerLike, items: ItemStack[]): void {
        for (const requested of items) {
            let remaining = requested.amount;

            for (let i = 0; i < this.slots.length && remaining > 0; i++) {
                const slot = container.getSlot(this.slots[i]!);
                if (!slot.hasItem()) continue;

                const item = slot.getItem()!;
                if (item.typeId !== requested.typeId) continue;

                if (item.amount > remaining) {
                    item.amount -= remaining;
                    slot.setItem(item);
                    remaining = 0;
                } else {
                    remaining -= item.amount;
                    slot.setItem(undefined);
                }
            }
        }
    }

    firstNonEmptySlot(container: ContainerLike): ContainerSlot | undefined {
        for (let i = 0; i < this.slots.length; i++) {
            const slot = container.getSlot(this.slots[i]!);
            if (slot.hasItem()) return slot;
        }
        return undefined;
    }
}