import { Random } from "../math/Random";
import {
    LootTable, LootPool, LootEntry, LootFunction, LootCondition,
    LootContext, LootResult, SMELT_MAP,
} from "./LootTableTypes";

/**
 * Evaluates a Bedrock-style loot table definition using seeded randomness.
 *
 * Pass a lookup function for resolving `loot_table` entry references.
 */
export class LootTableEvaluator {
    /**
     * Evaluate a loot table and return deterministic results.
     * @param table - The loot table definition
     * @param rng - Seeded Random instance
     * @param context - Kill context (player, looting, fire)
     * @param lookupTable - Optional resolver for `loot_table` type entries
     */
    static evaluate(
        table: LootTable,
        rng: Random,
        context: LootContext,
        lookupTable?: (name: string) => LootTable | undefined,
    ): LootResult[] {
        const results: LootResult[] = [];

        for (const pool of table.pools) {
            LootTableEvaluator.evaluatePool(pool, rng, context, results, lookupTable);
        }

        return results;
    }

    private static evaluatePool(
        pool: LootPool,
        rng: Random,
        context: LootContext,
        results: LootResult[],
        lookupTable?: (name: string) => LootTable | undefined,
    ): void {
        // Check pool-level conditions
        if (pool.conditions && !LootTableEvaluator.checkConditions(pool.conditions, rng, context)) {
            return;
        }

        // Determine number of rolls
        const rolls = typeof pool.rolls === "number"
            ? pool.rolls
            : rng.nextInt(pool.rolls.min, pool.rolls.max);

        for (let r = 0; r < rolls; r++) {
            const entry = LootTableEvaluator.selectWeightedEntry(pool.entries, rng);
            if (!entry) continue;

            if (entry.type === "empty") continue;

            if (entry.type === "loot_table") {
                if (entry.name && lookupTable) {
                    const subTable = lookupTable(entry.name);
                    if (subTable) {
                        const subResults = LootTableEvaluator.evaluate(subTable, rng, context, lookupTable);
                        results.push(...subResults);
                    }
                }
                continue;
            }

            // type === "item"
            if (!entry.name) continue;

            let itemId = entry.name;
            let count = 1;
            let data: number | undefined;

            // Apply functions
            if (entry.functions) {
                for (const fn of entry.functions) {
                    const fnResult = LootTableEvaluator.applyFunction(fn, itemId, count, data, rng, context);
                    itemId = fnResult.itemId;
                    count = fnResult.count;
                    data = fnResult.data;
                }
            }

            if (count > 0) {
                results.push({ itemId, count, ...(data !== undefined ? { data } : {}) });
            }
        }
    }

    private static selectWeightedEntry(entries: LootEntry[], rng: Random): LootEntry | null {
        if (entries.length === 0) return null;
        if (entries.length === 1) return entries[0]!;

        let totalWeight = 0;
        for (const entry of entries) {
            totalWeight += entry.weight ?? 1;
        }

        let roll = rng.nextFloat() * totalWeight;
        for (const entry of entries) {
            roll -= entry.weight ?? 1;
            if (roll <= 0) return entry;
        }

        return entries[entries.length - 1]!;
    }

    private static checkConditions(conditions: LootCondition[], rng: Random, context: LootContext): boolean {
        for (const condition of conditions) {
            if (!LootTableEvaluator.checkCondition(condition, rng, context)) {
                return false;
            }
        }
        return true;
    }

    private static checkCondition(condition: LootCondition, rng: Random, context: LootContext): boolean {
        switch (condition.condition) {
            case "killed_by_player":
            case "killed_by_player_or_pets":
                return context.killedByPlayer;

            case "random_chance_with_looting": {
                const chance = condition.chance + context.lootingLevel * condition.looting_multiplier;
                return rng.nextFloat() < chance;
            }

            case "entity_properties":
                if (condition.properties.on_fire !== undefined) {
                    return condition.properties.on_fire === context.onFire;
                }
                return true;

            case "killed_by_entity":
                // In speedrun context, player kills everything
                return context.killedByPlayer;

            case "damaged_by_entity":
                // Assume true — player dealt damage
                return true;

            case "is_baby":
                // We don't track baby state; assume false
                return false;

            case "passenger_of_entity":
                // Rare condition; assume false
                return false;

            default:
                return true;
        }
    }

    private static applyFunction(
        fn: LootFunction,
        itemId: string,
        count: number,
        data: number | undefined,
        rng: Random,
        context: LootContext,
    ): { itemId: string; count: number; data?: number } {
        switch (fn.function) {
            case "set_count": {
                const c = fn.count;
                count = typeof c === "number" ? c : rng.nextInt(c.min, c.max);
                break;
            }
            case "looting_enchant": {
                if (context.lootingLevel > 0) {
                    const bonus = rng.nextInt(fn.count.min, fn.count.max) * context.lootingLevel;
                    count += bonus;
                }
                break;
            }
            case "furnace_smelt": {
                // Check sub-conditions (e.g., only smelt if on fire)
                const shouldSmelt = fn.conditions
                    ? LootTableEvaluator.checkConditions(fn.conditions, rng, context)
                    : true;
                if (shouldSmelt && SMELT_MAP[itemId]) {
                    itemId = SMELT_MAP[itemId]!;
                }
                break;
            }
            case "set_data": {
                data = fn.data;
                break;
            }
        }
        return { itemId, count, data };
    }
}
