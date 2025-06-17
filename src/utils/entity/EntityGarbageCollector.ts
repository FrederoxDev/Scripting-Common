import { world } from "@minecraft/server";
import { Sleep } from "../time/Time";
import { getProjectNamespace } from "../../Index";

export class EntityGarbageCollector {
    private static entities = new Set<string>();

    static async cleanupAfterWorldLoad() {
        const str = (world.getDynamicProperty(`${getProjectNamespace()}:entity_gc`) ?? "[]") as string;
        const data = JSON.parse(str) as string[];

        let current: string[] = data;
        let nextRun: string[] = [];

        const maxAttempts = 50;
        let failed = true;

        for (let i = 0; i < maxAttempts; i++) {
            current.forEach(eID => {
                const entity = world.getEntity(eID);
                if (!entity || !entity.isValid) {
                    nextRun.push(eID);
                    return;
                }

                entity.remove();
            })

            if (nextRun.length === 0) {
                failed = false;
                break;
            }

            current = [...nextRun];
            nextRun = [];
            await Sleep(40);
        }

        if (failed) console.error(`EntityGarbageCollector failed to delete all entities on world load after ${maxAttempts} attempts. Remaining entitiy IDS: ${JSON.stringify(current)}`)
    }

    static addEntityToCleanup(entityID: string) {
        this.entities.add(entityID);
        EntityGarbageCollector.serializeData();
    }

    static removeEntityFromCleanup(entityID: string) {
        this.entities.delete(entityID);
        EntityGarbageCollector.serializeData();
    }

    private static serializeData() {
        const serialzed = JSON.stringify([...this.entities])
        world.setDynamicProperty(`${getProjectNamespace()}:entity_gc`, serialzed);
    }
}