import { Entity, World } from "@minecraft/server";

/**
 * A common interface for any data that would be likely to change across updates.
 *  - Should be used in any production environments to ensure future updatability.
 */
export interface VersionedData {
    format_version: number;
}

export function deserialize<T extends VersionedData>(dataSource: Entity | World, identifier: string): T | undefined {
    const data = dataSource.getDynamicProperty(identifier) as string | undefined;
    if (data === undefined) return undefined;
    return JSON.parse(data) as T;
}