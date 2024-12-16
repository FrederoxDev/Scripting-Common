import { Player, RawMessage } from "@minecraft/server";

export class ScriptBindings {
    static set(player: Player, bindingID: string, value: RawMessage) {
        player.onScreenDisplay.setTitle({
            rawtext: [
                { text: bindingID },
                value
            ]
        }, { fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 0 });
    }   
};