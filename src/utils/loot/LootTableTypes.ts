export interface LootTable {
    pools: LootPool[];
}

export interface LootPool {
    rolls: number | { min: number; max: number };
    conditions?: LootCondition[];
    entries: LootEntry[];
}

export interface LootEntry {
    type: "item" | "empty" | "loot_table";
    name?: string;
    weight?: number;
    functions?: LootFunction[];
    conditions?: LootCondition[];
}

export type LootFunction =
    | SetCountFunction
    | LootingEnchantFunction
    | FurnaceSmeltFunction
    | SetDataFunction;

export interface SetCountFunction {
    function: "set_count";
    count: { min: number; max: number } | number;
}

export interface LootingEnchantFunction {
    function: "looting_enchant";
    count: { min: number; max: number };
}

export interface FurnaceSmeltFunction {
    function: "furnace_smelt";
    conditions?: LootCondition[];
}

export interface SetDataFunction {
    function: "set_data";
    data: number;
}

export type LootCondition =
    | { condition: "killed_by_player" }
    | { condition: "killed_by_player_or_pets" }
    | { condition: "random_chance_with_looting"; chance: number; looting_multiplier: number }
    | { condition: "entity_properties"; entity: string; properties: { on_fire?: boolean } }
    | { condition: "killed_by_entity"; entity_type: string }
    | { condition: "damaged_by_entity"; entity_type: string }
    | { condition: "passenger_of_entity"; entity_type: string }
    | { condition: "is_baby" };

export interface LootContext {
    killedByPlayer: boolean;
    lootingLevel: number;
    onFire: boolean;
}

export interface LootResult {
    itemId: string;
    count: number;
    data?: number;
}

/** Smelt map for furnace_smelt function */
export const SMELT_MAP: Record<string, string> = {
    "minecraft:porkchop": "minecraft:cooked_porkchop",
    "minecraft:beef": "minecraft:cooked_beef",
    "minecraft:chicken": "minecraft:cooked_chicken",
    "minecraft:rabbit": "minecraft:cooked_rabbit",
    "minecraft:mutton": "minecraft:cooked_mutton",
    "minecraft:cod": "minecraft:cooked_cod",
    "minecraft:salmon": "minecraft:cooked_salmon",
    "minecraft:potato": "minecraft:baked_potato",
    "minecraft:kelp": "minecraft:dried_kelp",
    "minecraft:iron_ore": "minecraft:iron_ingot",
    "minecraft:gold_ore": "minecraft:gold_ingot",
};
