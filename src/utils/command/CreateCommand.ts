import { CustomCommand, CustomCommandOrigin, CustomCommandRegistry, CustomCommandResult, CustomCommandStatus, Player, system } from "@minecraft/server";

type CommandCallback<T extends unknown[]> = (player: Player, ...args: T) => void | Promise<void>;

export interface CommandOptions extends Omit<CustomCommand, "permissionLevel" | "cheatsRequired"> {
    permissionLevel?: number;
}

export function createCommand<T extends unknown[]>(
    registry: CustomCommandRegistry,
    options: CommandOptions,
    callback: CommandCallback<T>,
) {
    registry.registerCommand({
        ...options,
        permissionLevel: options.permissionLevel ?? 0,
        cheatsRequired: false,
    }, (origin: CustomCommandOrigin, ...args: unknown[]) => {
        const player = origin.sourceEntity;
        if (!player || !(player instanceof Player)) return undefined;

        const run = async () => {
            await system.waitTicks(1);
            await callback(player, ...args as T);
        };
        run();

        return undefined;
    });
}
