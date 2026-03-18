import { Dimension, Vector3, world, system } from "@minecraft/server";
import { uuidv4 } from "../../utils/math/UUID";
import { Result } from "../../utils/error/Result";

export interface AreaLoadedOk<T> {
    value: T;
    /** Milliseconds spent waiting for chunks to load before running the callback. */
    waitMs: number;
}

declare module "@minecraft/server" {
    interface Dimension {
        /**
         * Force loads an area between two positions, once loaded calls the provided callback.
         * - Once the callback resolves, the area will be unloaded (if not loaded by other factors).
         * @returns A Result — Ok with { value, waitMs }, or Err with a string describing the failure.
         */
        ensureAreaLoaded<T = void>(from: Vector3, to: Vector3, onLoaded: () => Promise<T> | T): Promise<Result<AreaLoadedOk<T>, string>>;

        /**
         * Same as ensureAreaLoaded but retries up to `maxRetries` times on failure.
         * @param tag - Label for warning logs (e.g. "[NPCs]")
         */
        ensureAreaLoadedWithRetries<T = void>(from: Vector3, to: Vector3, onLoaded: () => Promise<T> | T, maxRetries: number, tag: string): Promise<Result<AreaLoadedOk<T>, string>>;
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    const dimensions = ["overworld", "nether", "the_end"];
    for (const dimName of dimensions) {
        try {
            world.getDimension(dimName).runCommand("tickingarea remove_all");
        } catch {
            // No ticking areas to clear, or command failed — that's fine
        }
    }
});

const MAX_TICKING_AREAS = 10;
let activeTickingAreas = 0;

type QueueItem = {
    dimension: Dimension;
    from: Vector3;
    to: Vector3;
    onLoaded: () => Promise<unknown> | unknown;
    resolve: (value: Result<AreaLoadedOk<unknown>, string>) => void;
};

const queue: QueueItem[] = [];

function processQueue() {
    if (activeTickingAreas >= MAX_TICKING_AREAS) return;
    const item = queue.shift();
    if (!item) return;

    activeTickingAreas++;

    (async () => {
        const areaName = `_ensureArea_${uuidv4()}`;

        try {
            const fx = Math.floor(item.from.x);
            const fy = Math.floor(item.from.y);
            const fz = Math.floor(item.from.z);
            const tx = Math.floor(item.to.x);
            const ty = Math.floor(item.to.y);
            const tz = Math.floor(item.to.z);

            let addResult;
            try {
                addResult = item.dimension.runCommand(
                    `tickingarea add ${fx} ${fy} ${fz} ${tx} ${ty} ${tz} "${areaName}" true`
                );
            } catch (e) {
                item.resolve(Result.err(`Failed to create tickingarea: ${e}`));
                return;
            }

            if (addResult.successCount === 0) {
                item.resolve(Result.err(`tickingarea add failed (${fx},${fy},${fz})→(${tx},${ty},${tz})`));
                return;
            }

            // Poll until chunks are loaded (max 1.5s)
            const MAX_WAIT_TICKS = 30;
            let waited = 0;
            const waitStart = Date.now();
            while (
                (!item.dimension.isChunkLoaded(item.from) || !item.dimension.isChunkLoaded(item.to)) &&
                waited < MAX_WAIT_TICKS
            ) {
                await system.waitTicks(1);
                waited++;
            }
            const waitMs = Date.now() - waitStart;

            if (waited >= MAX_WAIT_TICKS) {
                item.resolve(Result.err(
                    `Timeout after ${MAX_WAIT_TICKS} ticks waiting for chunks (${fx},${fy},${fz})→(${tx},${ty},${tz})`
                ));
                return;
            }

            let callbackResult: unknown;
            try {
                callbackResult = await item.onLoaded();
            } catch (e) {
                item.resolve(Result.err(`Callback threw: ${e}`));
                return;
            }

            item.resolve(Result.ok({ value: callbackResult, waitMs }));
        } catch (e) {
            item.resolve(Result.err(`Unexpected error in ensureAreaLoaded: ${e}`));
        } finally {
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
): Promise<Result<AreaLoadedOk<T>, string>> {
    return new Promise<Result<AreaLoadedOk<T>, string>>((resolve) => {
        queue.push({
            dimension: this,
            from,
            to,
            onLoaded,
            resolve: resolve as (value: Result<AreaLoadedOk<unknown>, string>) => void,
        });

        processQueue();
    });
};

Dimension.prototype.ensureAreaLoadedWithRetries = async function<T>(
    from: Vector3,
    to: Vector3,
    onLoaded: () => Promise<T> | T,
    maxRetries: number,
    tag: string
): Promise<Result<AreaLoadedOk<T>, string>> {
    let lastResult: Result<AreaLoadedOk<T>, string> | undefined;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        lastResult = await this.ensureAreaLoaded<T>(from, to, onLoaded);
        if (lastResult.isOk()) return lastResult;
        console.warn(`${tag} Attempt ${attempt + 1}/${maxRetries} failed: ${lastResult.unwrapErr()}`);
    }
    return lastResult!;
};
