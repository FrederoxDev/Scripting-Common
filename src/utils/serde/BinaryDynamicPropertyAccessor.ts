import { Entity, ItemStack, World } from "@minecraft/server";
import { BinaryStream, ReadOnlyBinaryStream } from "./BinaryStream";

export class BinaryDynamicPropertyAccessor {
    propertyName: string;

    constructor(propertyName: string) {
        this.propertyName = propertyName;
    }

    write(entity: Entity | World | ItemStack, value: BinaryStream | ReadOnlyBinaryStream): void {
        entity.setDynamicProperty(this.propertyName, value.toBase64());
    }

    read(entity: Entity | World | ItemStack): ReadOnlyBinaryStream | undefined {
        const rawValue = entity.getDynamicProperty(this.propertyName);
        if (rawValue === undefined) return undefined;
        return new ReadOnlyBinaryStream(rawValue as string);
    }

    delete(entity: Entity | World | ItemStack): void {
        entity.setDynamicProperty(this.propertyName, undefined);
    }
}