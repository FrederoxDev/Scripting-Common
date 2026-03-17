import { Random } from "../math/Random";
import {
    LootTable, LootPool, LootEntry, LootFunction, LootCondition,
    LootContext, LootResult, LootEnchantment, SMELT_MAP,
} from "./LootTableTypes";

/** All enchantments that can appear on a given item type in Java 1.16 */
const ENCHANTMENTS_FOR_ITEM: Record<string, { id: string; maxLevel: number }[]> = {
    "minecraft:diamond_sword": [
        { id: "sharpness", maxLevel: 5 }, { id: "smite", maxLevel: 5 }, { id: "bane_of_arthropods", maxLevel: 5 },
        { id: "knockback", maxLevel: 2 }, { id: "fire_aspect", maxLevel: 2 }, { id: "looting", maxLevel: 3 },
        { id: "sweeping", maxLevel: 3 }, { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:diamond_chestplate": [
        { id: "protection", maxLevel: 4 }, { id: "fire_protection", maxLevel: 4 }, { id: "blast_protection", maxLevel: 4 },
        { id: "projectile_protection", maxLevel: 4 }, { id: "thorns", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:diamond_helmet": [
        { id: "protection", maxLevel: 4 }, { id: "fire_protection", maxLevel: 4 }, { id: "blast_protection", maxLevel: 4 },
        { id: "projectile_protection", maxLevel: 4 }, { id: "respiration", maxLevel: 3 }, { id: "aqua_affinity", maxLevel: 1 },
        { id: "thorns", maxLevel: 3 }, { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:diamond_leggings": [
        { id: "protection", maxLevel: 4 }, { id: "fire_protection", maxLevel: 4 }, { id: "blast_protection", maxLevel: 4 },
        { id: "projectile_protection", maxLevel: 4 }, { id: "thorns", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:diamond_boots": [
        { id: "protection", maxLevel: 4 }, { id: "fire_protection", maxLevel: 4 }, { id: "blast_protection", maxLevel: 4 },
        { id: "projectile_protection", maxLevel: 4 }, { id: "feather_falling", maxLevel: 4 }, { id: "depth_strider", maxLevel: 3 },
        { id: "frost_walker", maxLevel: 2 }, { id: "thorns", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:crossbow": [
        { id: "multishot", maxLevel: 1 }, { id: "piercing", maxLevel: 4 }, { id: "quick_charge", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:diamond_shovel": [
        { id: "efficiency", maxLevel: 5 }, { id: "silk_touch", maxLevel: 1 }, { id: "fortune", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:golden_hoe": [
        { id: "efficiency", maxLevel: 5 }, { id: "silk_touch", maxLevel: 1 }, { id: "fortune", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:golden_sword": [
        { id: "sharpness", maxLevel: 5 }, { id: "smite", maxLevel: 5 }, { id: "bane_of_arthropods", maxLevel: 5 },
        { id: "knockback", maxLevel: 2 }, { id: "fire_aspect", maxLevel: 2 }, { id: "looting", maxLevel: 3 },
        { id: "sweeping", maxLevel: 3 }, { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:golden_chestplate": [
        { id: "protection", maxLevel: 4 }, { id: "fire_protection", maxLevel: 4 }, { id: "blast_protection", maxLevel: 4 },
        { id: "projectile_protection", maxLevel: 4 }, { id: "thorns", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:golden_helmet": [
        { id: "protection", maxLevel: 4 }, { id: "fire_protection", maxLevel: 4 }, { id: "blast_protection", maxLevel: 4 },
        { id: "projectile_protection", maxLevel: 4 }, { id: "respiration", maxLevel: 3 }, { id: "aqua_affinity", maxLevel: 1 },
        { id: "thorns", maxLevel: 3 }, { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:golden_leggings": [
        { id: "protection", maxLevel: 4 }, { id: "fire_protection", maxLevel: 4 }, { id: "blast_protection", maxLevel: 4 },
        { id: "projectile_protection", maxLevel: 4 }, { id: "thorns", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:golden_boots": [
        { id: "protection", maxLevel: 4 }, { id: "fire_protection", maxLevel: 4 }, { id: "blast_protection", maxLevel: 4 },
        { id: "projectile_protection", maxLevel: 4 }, { id: "feather_falling", maxLevel: 4 }, { id: "depth_strider", maxLevel: 3 },
        { id: "frost_walker", maxLevel: 2 }, { id: "soul_speed", maxLevel: 3 }, { id: "thorns", maxLevel: 3 },
        { id: "unbreaking", maxLevel: 3 }, { id: "mending", maxLevel: 1 },
    ],
    "minecraft:book": [
        // Books can get any enchantment — handled specially
    ],
};

interface FnAccumulator {
    itemId: string;
    count: number;
    data?: number;
    enchantments: LootEnchantment[];
    damageFraction?: number;
}

export class LootTableEvaluator {
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
        if (pool.conditions && !LootTableEvaluator.checkConditions(pool.conditions, rng, context)) {
            return;
        }

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

            if (!entry.name) continue;

            const acc: FnAccumulator = { itemId: entry.name, count: 1, enchantments: [] };

            if (entry.functions) {
                for (const fn of entry.functions) {
                    LootTableEvaluator.applyFunction(fn, acc, rng, context);
                }
            }

            if (acc.count > 0) {
                const result: LootResult = { itemId: acc.itemId, count: acc.count };
                if (acc.data !== undefined) result.data = acc.data;
                if (acc.enchantments.length > 0) result.enchantments = acc.enchantments;
                if (acc.damageFraction !== undefined) result.damageFraction = acc.damageFraction;
                results.push(result);
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
                return context.killedByPlayer;

            case "damaged_by_entity":
                return true;

            case "is_baby":
                return false;

            case "passenger_of_entity":
                return false;

            default:
                return true;
        }
    }

    private static applyFunction(
        fn: LootFunction,
        acc: FnAccumulator,
        rng: Random,
        context: LootContext,
    ): void {
        switch (fn.function) {
            case "set_count": {
                const c = fn.count;
                acc.count = typeof c === "number" ? c : rng.nextInt(c.min, c.max);
                break;
            }
            case "looting_enchant": {
                if (context.lootingLevel > 0) {
                    const bonus = rng.nextInt(fn.count.min, fn.count.max) * context.lootingLevel;
                    acc.count += bonus;
                }
                break;
            }
            case "furnace_smelt": {
                const shouldSmelt = fn.conditions
                    ? LootTableEvaluator.checkConditions(fn.conditions, rng, context)
                    : true;
                if (shouldSmelt && SMELT_MAP[acc.itemId]) {
                    acc.itemId = SMELT_MAP[acc.itemId]!;
                }
                break;
            }
            case "set_data": {
                acc.data = fn.data;
                break;
            }
            case "enchant_randomly": {
                if (fn.enchantments && fn.enchantments.length > 0) {
                    // Specific enchantment list provided — pick one at random
                    const idx = rng.nextInt(0, fn.enchantments.length - 1);
                    const enchId = fn.enchantments[idx]!.replace("minecraft:", "");
                    // For soul_speed the max level is 3, for generic pick level 1
                    const maxLevel = enchId === "soul_speed" ? 3 : 1;
                    const level = rng.nextInt(1, maxLevel);
                    acc.enchantments.push({ id: enchId, level });
                } else {
                    // Pick a random applicable enchantment for this item
                    const applicable = ENCHANTMENTS_FOR_ITEM[acc.itemId];
                    if (applicable && applicable.length > 0) {
                        const idx = rng.nextInt(0, applicable.length - 1);
                        const ench = applicable[idx]!;
                        const level = rng.nextInt(1, ench.maxLevel);
                        acc.enchantments.push({ id: ench.id, level });
                    } else {
                        // Unknown item or book — just pick unbreaking as fallback
                        const level = rng.nextInt(1, 3);
                        acc.enchantments.push({ id: "unbreaking", level });
                    }
                }
                break;
            }
            case "set_damage": {
                // damage is a fraction where 1.0 = full durability, 0.0 = broken
                // Store as damage fraction (inverted: how much damage has been taken)
                const dmgFrac = rng.nextFloat() * (fn.damage.max - fn.damage.min) + fn.damage.min;
                acc.damageFraction = 1.0 - dmgFrac;
                break;
            }
        }
    }
}
