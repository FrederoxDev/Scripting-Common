import { BlockRaycastHit, Player, system, world } from "@minecraft/server";

export interface PlayerComponentTickEvent {
    readonly player: Player;
    readonly lookingAtBlock: BlockRaycastHit | undefined;
}

export interface CustomPlayerComponent {
    /**
     * @remarks
     * This function will be called when a player ticks.
     * - Contains the current block the player is looking at
     */
    onTick?(ev: PlayerComponentTickEvent):void;
}

const tickListeners: CustomPlayerComponent[] = [];

export function registerPlayerComponent(component: CustomPlayerComponent) {
    if (component.onTick) {
        tickListeners.push(component);
    }
}

system.runInterval(() => {
    const players = world.getAllPlayers();

    players.forEach(player => {
        const lookingAtBlock = player.getBlockFromViewDirection();

        tickListeners.forEach(listener => {
            listener.onTick!({
                player,
                lookingAtBlock
            }) 
        })
    })
});