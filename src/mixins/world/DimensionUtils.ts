import { Dimension, Vector3, world, system } from "@minecraft/server";
import { uuidv4 } from "../../utils/math/UUID";

declare module "@minecraft/server" {
    interface Dimension {
        /**
         * Force loads an area between two positions, once loaded calls the provided async callback.
         * - Once the callback resolves, the area will be unloaded (if not loaded by other factors).
         * @returns The value returned by the onLoaded callback.
         */
        ensureAreaLoaded<T = void>(from: Vector3, to: Vector3, onLoaded: () => Promise<T> | T): Promise<T>;
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    try {
        world.getDimension("overworld").runCommand("tickingarea list all-dimensions");
    } catch {
        // No ticking areas to clear, or command failed — that's fine
    }
});

const MAX_TICKING_AREAS = 10;
let activeTickingAreas = 0;

type QueueItem = {
    dimension: Dimension;
    from: Vector3;
    to: Vector3;
    onLoaded: () => Promise<unknown> | unknown;
    resolve: (value: unknown) => void;
    reject: (e: unknown) => void;
};

const queue: QueueItem[] = [];

function processQueue() {
    if (activeTickingAreas >= MAX_TICKING_AREAS) return;
    const item = queue.shift();
    if (!item) return;

    activeTickingAreas++;

    (async () => {
        const areaName = `_ensureArea_${uuidv4()}`;

        // ticking area manager doesnt exist yet on scripting 2.5.0, this should be replaced when it comes out
        try {
            // Create a ticking area via command
            const fx = Math.floor(item.from.x);
            const fy = Math.floor(item.from.y);
            const fz = Math.floor(item.from.z);
            const tx = Math.floor(item.to.x);
            const ty = Math.floor(item.to.y);
            const tz = Math.floor(item.to.z);

            item.dimension.runCommand(
                `tickingarea add ${fx} ${fy} ${fz} ${tx} ${ty} ${tz} "${areaName}"`
            );

            // Poll until the chunks containing our area corners are loaded
            while (
                !item.dimension.isChunkLoaded(item.from) ||
                !item.dimension.isChunkLoaded(item.to)
            ) {
                await system.waitTicks(1);
            }

            const result = await item.onLoaded();
            item.resolve(result);
        } catch (e) {
            item.reject(e);
        } finally {
            // Remove the ticking area
            try {
                item.dimension.runCommand(`tickingarea remove "${areaName}"`);
            } catch {
                // May have already been removed
            }

            activeTickingAreas--;
            processQueue();
        }
    })();
}

Dimension.prototype.ensureAreaLoaded = function<T>(
    from: Vector3,
    to: Vector3,
    onLoaded: () => Promise<T> | T
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        queue.push({
            dimension: this,
            from,
            to,
            onLoaded,
            resolve: resolve as (value: unknown) => void,
            reject
        });

        processQueue();
    });
};
