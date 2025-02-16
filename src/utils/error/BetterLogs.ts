import { Block, Entity, ItemStack } from "@minecraft/server";
import { Vec3 } from "../math/Vec3";

const oldConsoleLog = console.log

function deepInspect(obj: any, depth = 3, seen = new WeakSet()) {
    if (depth <= 0) return "...";
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";
    if (typeof obj !== "object") return String(obj);

    if (seen.has(obj)) return "[Circular]";
    seen.add(obj);

    if (obj instanceof Entity) {
        return `[Entity: ${obj.typeId}, id: ${obj.id}]`;
    }
    if (obj instanceof Block) {
        return `[Block: ${obj.typeId}, at: (${obj.location.x}, ${obj.location.y}, ${obj.location.z})]`;
    }
    if (obj instanceof ItemStack) {
        return `[ItemStack: ${obj.typeId}, count: ${obj.amount}]`;
    }

    const properties: Record<string | number | symbol, string> = {};
    let proto = obj;

    // Holy nesting
    while (proto !== null) {
        try {
            Object.getOwnPropertyNames(proto).forEach((key) => {
                if (!(key in properties)) {
                    try {
                        const value = obj[key];
                        if (typeof value !== "function") { // Exclude functions
                            properties[key] = deepInspect(value, depth - 1, seen);
                        }
                    } catch {
                        properties[key] = "[Unreachable]";
                    }
                }
            });
        } catch {
            break;
        }
        proto = Object.getPrototypeOf(proto);
    }

    return `{ ${Object.entries(properties).map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
}

console.log = function (...args) {
    // const newArgs = args.map((arg) => {
    //     if (arg instanceof Entity) {
    //         return `[Entity: ${arg.typeId}, id: ${arg.id}]`;
    //     }

    //     if (arg instanceof Block) {
    //         return `[Block: ${arg.typeId}, at: (${arg.location.x}, ${arg.location.y}, ${arg.location.z})]`;
    //     }
        
    //     if (arg instanceof ItemStack) {
    //         return `[ItemStack: ${arg.typeId}, count: ${arg.amount}]`;
    //     }

    //     if (typeof arg === 'object' && arg !== null) {
    //         return JSON.stringify(arg);
    //     }

    //     return arg;
    // });

    const newArgs = args.map((arg) => deepInspect(arg, 3, new WeakSet()));

    oldConsoleLog.apply(console, newArgs);
};