import { RawMessage } from "@minecraft/server";

export enum ColorCode {
    Black = "§0",
    DarkBlue = "§1",
    DarkGreen = "§2",
    DarkAqua = "§3",
    DarkRed = "§4",
    DarkPurple = "§5",
    Gold = "§6",
    Gray = "§7",
    DarkGray = "§8",
    Blue = "§9",
    Green = "§a",
    Aqua = "§b",
    Red = "§c",
    LightPurple = "§d",
    Yellow = "§e",
    White = "§f",
    Rest = "§r",
    Bold = "§l",
}

/**
 * Creates a RawMessage translation.
 */
export function translate(key: string): RawMessage {
    return {
        translate: key
    };
}

/**
 * Creates a RawMessage translation with "with" arguments.
 */
export function translateWith(key: string, ...args: (string | RawMessage | number)[]): RawMessage {
    return {
        translate: key,
        with: {
            rawtext: args.map(arg => {
                if (typeof arg === "string") {
                    return { text: arg } as RawMessage;
                }
                if (typeof arg === "number") {
                    return { text: arg.toString() } as RawMessage;
                }

                return arg as RawMessage;
            })
        }
    };
}