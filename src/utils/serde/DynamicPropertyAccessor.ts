import { Entity, ItemStack, world, World } from "@minecraft/server";

export class DynamicPropertyAccessor<T> {
    propertyName: string;

    constructor(propertyName: string) {
        this.propertyName = propertyName;
    }

    set(entity: Entity | World | ItemStack, value: T): void {
        entity.setDynamicProperty(this.propertyName, JSON.stringify(value));
    }

    get<Fallback extends T | undefined>(entity: Entity | World | ItemStack, fallback?: Fallback): T | Fallback {
        const rawValue = entity.getDynamicProperty(this.propertyName);
        if (rawValue === undefined) return fallback as Fallback;
        return JSON.parse(rawValue as string) as T;
    }
}

export class DynamicPropertyEntityAccessor {
    propertyName: string;

    constructor(propertyName: string) {
        this.propertyName = propertyName;
    }

    set(entity: Entity | World | ItemStack, value: Entity | undefined): void {
        entity.setDynamicProperty(this.propertyName, value?.id);
    }

    get(entity: Entity | World | ItemStack): Entity | undefined {
        const rawValue = entity.getDynamicProperty(this.propertyName) as string | undefined;
        if (rawValue === undefined) return undefined;
        return world.getEntity(rawValue);
    }
}