import { Player } from "@minecraft/server";
import { assert } from "../error/Error";

export enum ViewRequest {
    Refresh,
    Pop,
    Exit
}

export enum ScreenPushBehaviour {
    /**
     * After the pushed screen is closed, return to the previous screen and re-render it.
     */
    Stack,

    /**
     * After the pushed screen is closed, exit the previous screen instead of returning to it.
     */
    Replace
}

type ScreenPushRequest = {
    behaviour: ScreenPushBehaviour;
    screen: BaseFormScreen;
};

export interface ScreenFactoryRequest {
    factory: string;
    context?: Record<string, string>;
    behaviour?: ScreenPushBehaviour;
}

export type ScreenRequest = ViewRequest | ScreenPushRequest | ScreenFactoryRequest;

/**
 * A base class for form screens that can be shown to players.
 * - Screens should implement the _render method to populate their content
 */
export abstract class BaseFormScreen {
    private static screenResolver?: (name: string, player: Player, context: Record<string, string>) => BaseFormScreen;

    public static setScreenResolver(resolver: (name: string, player: Player, context: Record<string, string>) => BaseFormScreen): void {
        BaseFormScreen.screenResolver = resolver;
    }

    protected abstract _render(player: Player): Promise<ScreenRequest>;

    /**
     * Begins showing the screen to the player, until there is a ViewRequest.Exit.
     */
    public async show(player: Player): Promise<ViewRequest> {
        while (true) {
            const result = await this._render(player);
            
            // Pushed screens
            if (typeof result === "object") {
                let screen: BaseFormScreen;
                let behaviour: ScreenPushBehaviour;

                if ("factory" in result) {
                    assert(BaseFormScreen.screenResolver !== undefined, "No screen resolver registered");
                    screen = BaseFormScreen.screenResolver(result.factory, player, result.context ?? {});
                    behaviour = result.behaviour ?? ScreenPushBehaviour.Stack;
                } else {
                    screen = result.screen;
                    behaviour = result.behaviour;
                }

                const nestedResult = await screen.show(player);

                // Propagate exits
                if (nestedResult === ViewRequest.Exit) {
                    return ViewRequest.Exit;
                }

                if (behaviour === ScreenPushBehaviour.Replace) {
                    return ViewRequest.Exit;
                }

                continue;
            }
            
            if (result === ViewRequest.Refresh) continue;
            return result;
        }
    }

    /**
     * Handles the case when the player cancels the form.
     * - By default, this will pop the screen.
     * @param player The player who cancelled the form.
     * @returns The view request indicating what to do next.
     */
    protected onCancelled(_player: Player): ViewRequest {
        return ViewRequest.Pop;
    }
}