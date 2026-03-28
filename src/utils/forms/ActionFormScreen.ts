import { Player, RawMessage } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { BaseFormScreen, ScreenRequest, ViewRequest } from "../forms/BaseFormScreen";

export type ActionFormButtonCallback = () => Promise<ScreenRequest> | ScreenRequest;

export class ActionFormBuilder {
    protected form: ActionFormData;
    private nextIdx: number = 0;
    protected callbacks: Map<number, ActionFormButtonCallback>;
    
    protected constructor() {
        this.form = new ActionFormData();
        this.callbacks = new Map();
        this.nextIdx = 0;
    }

    /**
     * @remarks
     * Method that sets the body text for the modal form.
     *
     */
    body(text: RawMessage | string): void {
        this.form.body(text);
    }

    /**
     * @remarks
     * Adds a button to this form with an icon from a resource
     * pack.
     *
     */
    button(text: RawMessage | string, iconPath?: string | undefined, callback?: ActionFormButtonCallback | undefined): void {
        // this.form.button(text, iconPath);
        const idx = this.nextIdx++;
        this.form.button(text, iconPath);

        if (callback !== undefined) {
            this.callbacks.set(idx, callback);
        }
    }

    /**
     * @remarks
     * Adds a section divider to the form.
     *
     */
    divider(): void {
        this.form.divider();
        this.nextIdx++;
    }

    /**
     * @remarks
     * Adds a header to the form.
     *
     * @param text
     * Text to display.
     */
    header(text: RawMessage | string): void {
        this.form.header(text);
        this.nextIdx++;
    }

    /**
     * @remarks
     * Adds a label to the form.
     *
     * @param text
     * Text to display.
     */
    label(text: RawMessage | string): void {
        this.form.label(text);
    }

    /**
     * @remarks
     * This builder method sets the title for the modal dialog.
     *
     */
    title(text: RawMessage | string): void {
        this.form.title(text);
    }
}

class ActionFormContext extends ActionFormBuilder {
    public constructor() {
        super();
    }

    getForm(): ActionFormData {
        return this.form;
    } 

    getCallback(idx: number): ActionFormButtonCallback | undefined {
        return this.callbacks.get(idx);
    }
}

/**
 * A utility class for creating action forms
 * - Screens can add buttons with callbacks directly
 * - These callbacks can control if the screen calls render again, or exits.
 * - All screen content should be populated in the render method
 */
export abstract class ActionFormScreen extends BaseFormScreen {
    /**
     * Renders the action form for the given player.
     * - Will be called each time the screen is refreshed
     * @param player The player to render the form for.
     * @param form The form builder to use for constructing the form.
     */
    protected abstract render(player: Player, form: ActionFormBuilder): void | Promise<void | ScreenRequest> | ScreenRequest;

    protected async _render(player: Player): Promise<ScreenRequest> {
        if (!player.isValid) return ViewRequest.Exit;
        
        const util = new ActionFormContext();
        const renderResult = await this.render(player, util);
        if (renderResult !== undefined) return renderResult;

        const form = util.getForm();

        if (!player.isValid) return ViewRequest.Exit;

        try {
            const response = await form.show(player);
            if (response.canceled || response.selection === undefined) {
                return this.onCancelled(player);
            }

            const callback = util.getCallback(response.selection);
            if (callback !== undefined) {
                return await callback();
            }
            
            return ViewRequest.Refresh;
        }
        catch (e) {
            if (player.isValid) return ViewRequest.Exit;
        }

        return ViewRequest.Exit;
    }
}