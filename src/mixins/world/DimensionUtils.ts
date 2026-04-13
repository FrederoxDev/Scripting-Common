import { Dimension, Vector3, world, system } from "@minecraft/server";
import { uuidv4 } from "../../utils/math/UUID";
import { Result } from "../../utils/error/Result";

const DEFAULT_TIMEOUT_TICKS = 200;

function withTimeout<T>(promise: Promise<T>, timeoutTicks: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let settled = false;
        const runId = system.runTimeout(() => {
            if (!settled) {
                settled = true;
                reject(new Error(`Ticking area timed out after ${timeoutTicks} ticks: ${label}`));
            }
        }, timeoutTicks);
        promise.then(
            (v) => { if (!settled) { settled = true; system.clearRun(runId); resolve(v); } },
            (e) => { if (!settled) { settled = true; system.clearRun(runId); reject(e); } },
        );
    });
}

declare module "@minecraft/server" {
    interface Dimension {
        /**
         * Force loads an area between two positions, once loaded calls the provided callback.
         * - Once the callback resolves, the area will be unloaded (if not loaded by other factors).
         * @returns A Result — Ok with the callback return value, or Err with a string describing the failure.
         */
        ensureAreaLoaded<T = void>(from: Vector3, to: Vector3, onLoaded: () => Promise<T> | T, timeoutTicks?: number): Promise<Result<T, string>>;

        /**
         * Loads two separate areas simultaneously, then calls the callback once both are loaded.
         * Both ticking areas are reserved atomically to avoid deadlocks under concurrency.
         * Use this instead of nesting ensureAreaLoaded calls.
         */
        dualEnsureAreaLoaded<T = void>(
            fromA: Vector3, toA: Vector3,
            fromB: Vector3, toB: Vector3,
            onLoaded: () => Promise<T> | T,
            timeoutTicks?: number
        ): Promise<Result<T, string>>;
    }
}

let resolveCleanup!: () => void;
/**
 * Resolves after `removeAllTickingAreas()` has run on worldLoad. Systems that
 * spawn entities via `ensureAreaLoaded` at world-load time should await this
 * first to avoid having their ticking areas nuked mid-creation.
 */
export const tickingAreaCleanupComplete: Promise<void> = new Promise<void>(r => { resolveCleanup = r; });

world.afterEvents.worldLoad.subscribe(() => {
    try { world.tickingAreaManager.removeAllTickingAreas(); } catch {}
    resolveCleanup();
});

const MAX_TICKING_AREAS = 10;
let activeTickingAreas = 0;

type SingleQueueItem = {
    kind: "single";
    dimension: Dimension;
    from: Vector3;
    to: Vector3;
    timeoutTicks: number;
    onLoaded: () => Promise<unknown> | unknown;
    resolve: (value: Result<unknown, string>) => void;
};

type DualQueueItem = {
    kind: "dual";
    dimension: Dimension;
    fromA: Vector3;
    toA: Vector3;
    fromB: Vector3;
    toB: Vector3;
    timeoutTicks: number;
    onLoaded: () => Promise<unknown> | unknown;
    resolve: (value: Result<unknown, string>) => void;
};

type QueueItem = SingleQueueItem | DualQueueItem;

const queue: QueueItem[] = [];

function processQueue() {
    while (queue.length > 0) {
        const item = queue[0]!;
        const slotsNeeded = item.kind === "dual" ? 2 : 1;
        if (activeTickingAreas + slotsNeeded > MAX_TICKING_AREAS) return;

        queue.shift();
        activeTickingAreas += slotsNeeded;

        if (item.kind === "single") {
            processSingle(item);
        } else {
            processDual(item);
        }
    }
}

function processSingle(item: SingleQueueItem) {
    (async () => {
        const areaId = `_ensureArea_${uuidv4()}`;
        const options = {
            dimension: item.dimension,
            from: item.from,
            to: item.to,
        };

        try {
            if (!world.tickingAreaManager.hasCapacity(options)) {
                item.resolve(Result.err(`No ticking area capacity for (${item.from.x},${item.from.y},${item.from.z})→(${item.to.x},${item.to.y},${item.to.z})`));
                return;
            }

            try {
                await withTimeout(
                    world.tickingAreaManager.createTickingArea(areaId, options),
                    item.timeoutTicks,
                    `single (${item.from.x},${item.from.y},${item.from.z})→(${item.to.x},${item.to.y},${item.to.z})`,
                );
            } catch (e) {
                // Timed out — clean up and re-queue to try again later
                console.warn(`[DimensionUtils] ${e} — re-queuing`);
                try { world.tickingAreaManager.removeTickingArea(areaId); } catch {}
                activeTickingAreas--;
                queue.push(item);
                processQueue();
                return;
            }

            let callbackResult: unknown;
            try {
                callbackResult = await item.onLoaded();
            } catch (e) {
                item.resolve(Result.err(`Callback threw: ${e}`));
                return;
            }

            item.resolve(Result.ok(callbackResult));
        } catch (e) {
            item.resolve(Result.err(`Unexpected error in ensureAreaLoaded: ${e}`));
        } finally {
            try {
                world.tickingAreaManager.removeTickingArea(areaId);
            } catch {
                // May have already been removed
            }

            activeTickingAreas--;
            processQueue();
        }
    })();
}

function processDual(item: DualQueueItem) {
    (async () => {
        const areaIdA = `_ensureArea_${uuidv4()}`;
        const areaIdB = `_ensureArea_${uuidv4()}`;
        const optionsA = { dimension: item.dimension, from: item.fromA, to: item.toA };
        const optionsB = { dimension: item.dimension, from: item.fromB, to: item.toB };

        try {
            if (!world.tickingAreaManager.hasCapacity(optionsA)) {
                item.resolve(Result.err(`No ticking area capacity for area A`));
                return;
            }

            try {
                await withTimeout(
                    world.tickingAreaManager.createTickingArea(areaIdA, optionsA),
                    item.timeoutTicks,
                    `dual area A`,
                );
            } catch (e) {
                console.warn(`[DimensionUtils] ${e} — re-queuing`);
                try { world.tickingAreaManager.removeTickingArea(areaIdA); } catch {}
                activeTickingAreas -= 2;
                queue.push(item);
                processQueue();
                return;
            }

            if (!world.tickingAreaManager.hasCapacity(optionsB)) {
                item.resolve(Result.err(`No ticking area capacity for area B`));
                return;
            }

            try {
                await withTimeout(
                    world.tickingAreaManager.createTickingArea(areaIdB, optionsB),
                    item.timeoutTicks,
                    `dual area B`,
                );
            } catch (e) {
                console.warn(`[DimensionUtils] ${e} — re-queuing`);
                try { world.tickingAreaManager.removeTickingArea(areaIdA); } catch {}
                try { world.tickingAreaManager.removeTickingArea(areaIdB); } catch {}
                activeTickingAreas -= 2;
                queue.push(item);
                processQueue();
                return;
            }

            let callbackResult: unknown;
            try {
                callbackResult = await item.onLoaded();
            } catch (e) {
                item.resolve(Result.err(`Callback threw: ${e}`));
                return;
            }

            item.resolve(Result.ok(callbackResult));
        } catch (e) {
            item.resolve(Result.err(`Unexpected error in dualEnsureAreaLoaded: ${e}`));
        } finally {
            try { world.tickingAreaManager.removeTickingArea(areaIdA); } catch {}
            try { world.tickingAreaManager.removeTickingArea(areaIdB); } catch {}

            activeTickingAreas -= 2;
            processQueue();
        }
    })();
}

Dimension.prototype.ensureAreaLoaded = function<T>(
    from: Vector3,
    to: Vector3,
    onLoaded: () => Promise<T> | T,
    timeoutTicks?: number,
): Promise<Result<T, string>> {
    return new Promise<Result<T, string>>((resolve) => {
        queue.push({
            kind: "single",
            dimension: this,
            from,
            to,
            timeoutTicks: timeoutTicks ?? DEFAULT_TIMEOUT_TICKS,
            onLoaded,
            resolve: resolve as (value: Result<unknown, string>) => void,
        });

        processQueue();
    });
};

Dimension.prototype.dualEnsureAreaLoaded = function<T>(
    fromA: Vector3, toA: Vector3,
    fromB: Vector3, toB: Vector3,
    onLoaded: () => Promise<T> | T,
    timeoutTicks?: number,
): Promise<Result<T, string>> {
    return new Promise<Result<T, string>>((resolve) => {
        queue.push({
            kind: "dual",
            dimension: this,
            fromA,
            toA,
            fromB,
            toB,
            timeoutTicks: timeoutTicks ?? DEFAULT_TIMEOUT_TICKS,
            onLoaded,
            resolve: resolve as (value: Result<unknown, string>) => void,
        });

        processQueue();
    });
};
