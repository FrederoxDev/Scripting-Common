import { Player } from "@minecraft/server";

export class ScriptBindings {
    static set(player: Player, bindingID: string, value: string) {
        player.onScreenDisplay.setTitle(`${bindingID}${value}`, { fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 0 });
    }   
};