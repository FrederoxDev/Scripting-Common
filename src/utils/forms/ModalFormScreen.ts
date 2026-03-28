import { Player, RawMessage } from "@minecraft/server";
import { BaseFormScreen, ScreenRequest, ViewRequest } from "../forms/BaseFormScreen";
import { ModalFormData, ModalFormDataDropdownOptions, ModalFormDataSliderOptions, ModalFormDataTextFieldOptions, ModalFormDataToggleOptions } from "@minecraft/server-ui";
import { assert, unreachable } from "../logs/Assert";

interface BaseBinding {
    index: number;
}

interface DefaultBinding extends BaseBinding {
    type: "default";
}

interface DropdownBinding extends BaseBinding {
    type: "dropdown";
    options: (string | RawMessage)[];
}

type Binding = DropdownBinding | DefaultBinding;

export class ModalFormBuilder {
    protected form: ModalFormData;
    private nextIdx: number;
    protected bindings: Map<string, Binding>;

    constructor() {
        this.form = new ModalFormData();
        this.bindings = new Map();
        this.nextIdx = 0;
    }

    /**
     * @remarks
     * Adds a section divider to the form.
     *
     */
    divider() {
        this.nextIdx++;
        this.form.divider();
    }

    /**
     * @remarks
     * Adds a dropdown with choices to the form.
     *
     * @param label
     * The label to display for the dropdown.
     * @param items
     * The selectable items for the dropdown.
     * @param dropdownOptions
     * The optional additional values for the dropdown creation.
     */
    dropdown(
        id: string,
        label: RawMessage | string,
        items: (RawMessage | string)[],
        dropdownOptions?: ModalFormDataDropdownOptions,
    ) {
        const idx = this.nextIdx++;
        this.bindings.set(id, { type: "dropdown", index: idx, options: items });
        this.form.dropdown(label, items, dropdownOptions);   
    }

    /**
     * @remarks
     * Adds a header to the form.
     *
     * @param text
     * Text to display.
     */
    header(text: RawMessage | string) {
        this.form.header(text);
    }

    /**
     * @remarks
     * Adds a label to the form.
     *
     * @param text
     * Text to display.
     */
    label(text: RawMessage | string) {
        this.nextIdx++;
        this.form.label(text);
    }

    /**
     * @remarks
     * Adds a numeric slider to the form.
     *
     * @param label
     * The label to display for the slider.
     * @param minimumValue
     * The minimum selectable possible value.
     * @param maximumValue
     * The maximum selectable possible value.
     * @param sliderOptions
     * The optional additional values for the slider creation.
     */
    slider(
        id: string,
        label: RawMessage | string,
        minimumValue: number,
        maximumValue: number,
        sliderOptions?: ModalFormDataSliderOptions,
    ) {
        const idx = this.nextIdx++;
        this.bindings.set(id, { type: "default", index: idx });
        this.form.slider(label, minimumValue, maximumValue, sliderOptions);
    }

    submitButton(submitButtonText: RawMessage | string) {
        this.form.submitButton(submitButtonText);
    }

    /**
     * @remarks
     * Adds a textbox to the form.
     *
     * @param label
     * The label to display for the textfield.
     * @param placeholderText
     * The place holder text to display.
     * @param textFieldOptions
     * The optional additional values for the textfield creation.
     */
    textField(
        id: string,
        label: RawMessage | string,
        placeholderText: RawMessage | string,
        textFieldOptions?: ModalFormDataTextFieldOptions,
    ) {
        const idx = this.nextIdx++;
        this.bindings.set(id, { type: "default", index: idx });
        this.form.textField(label, placeholderText, textFieldOptions);
    }

    /**
     * @remarks
     * This builder method sets the title for the modal dialog.
     *
     */
    title(titleText: RawMessage | string) {
        this.form.title(titleText);
    }

    /**
     * @remarks
     * Adds a toggle checkbox button to the form.
     *
     * @param label
     * The label to display for the toggle.
     * @param toggleOptions
     * The optional additional values for the toggle creation.
     */
    toggle(id: string, label: RawMessage | string, toggleOptions?: ModalFormDataToggleOptions) {
        const idx = this.nextIdx++;
        this.bindings.set(id, { type: "default", index: idx });
        this.form.toggle(label, toggleOptions);
    }
}

class ModalFormContext extends ModalFormBuilder {
    getForm(): ModalFormData {
        return this.form;
    }

    getBindings(): Map<string, Binding> {
        return this.bindings;
    }
}

export class ModalFormScreenResult {
    private bindings: Map<string, Binding>;
    private values: (string | number | boolean | undefined)[];

    constructor(bindings: Map<string, Binding>, values: (string | number | boolean | undefined)[]) {
        this.bindings = bindings;
        this.values = values;
    }

    getValue<T>(id: string, fallback: T): T {
        const binding = this.bindings.get(id);
        assert(binding !== undefined, `No binding found for id '${id}'`);

        const value = this.values[binding.index];
        if (value === undefined) return fallback;

        if (binding.type === "default") {
            return value as T;
        }
        else if (binding.type === "dropdown") {
            return binding.options[value as number] as unknown as T;
        }

        unreachable();
    }

    getRawValue<T>(id: string, fallback: T): T {
        const binding = this.bindings.get(id);
        assert(binding !== undefined, `No binding found for id '${id}'`);
        return (this.values[binding.index] as T | undefined) ?? fallback;
    }
}

export abstract class ModalFormScreen extends BaseFormScreen {
     /**
     * Renders the action form for the given player.
     * - Will be called each time the screen is refreshed
     * @param player The player to render the form for.
     * @param form The form builder to use for constructing the form.
     */
    protected abstract render(player: Player, form: ModalFormBuilder): void | Promise<void | ScreenRequest> | ScreenRequest;

    protected abstract onSubmitted(player: Player, result: ModalFormScreenResult): Promise<ScreenRequest> | ScreenRequest;

    protected async _render(player: Player): Promise<ScreenRequest> {
        const util = new ModalFormContext();
        const renderRes = await this.render(player, util);
        if (renderRes !== undefined) {
            return renderRes;
        }

        const form = util.getForm();

        try {
            const response = await form.show(player);
            if (response.canceled || response.formValues === undefined) {
                return this.onCancelled(player);
            }

            return await this.onSubmitted(
                player, 
                new ModalFormScreenResult(
                    util.getBindings(), 
                    response.formValues!
                )
            );
        }
        catch (e) {
            return ViewRequest.Exit;
        }
    }
}