import { Entity } from "@minecraft/server";

export type EntityUniqueID = string;

declare module "@minecraft/server" {
    interface Entity {
        readonly id: EntityUniqueID;
        
        getJsonDynamicProperty<T>(key: string, fallback: T): T;
        setJsonDynamicProperty<T>(key: string, value: T): void;
    }
}

Entity.prototype.getJsonDynamicProperty = function<T>(key: string, fallback: T): T {
    const str = this.getDynamicProperty(key) as string | undefined;
    if (!str) return fallback;
    return JSON.parse(str) as T;
}

Entity.prototype.setJsonDynamicProperty = function<T>(key: string, value: T): void {
    this.setDynamicProperty(key, JSON.stringify(value));
}