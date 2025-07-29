import { assert } from "../error/Error";

export class ComponentSystem<T> {
    private _internalRegistered: Record<string, T> = {};

    registerComponent(id: string, component: T): void {
        this._internalRegistered[id] = component;
    }

    get(id: string): T | undefined {
        return this._internalRegistered[id];
    }

    forceGet(id: string): T {
        const component = this._internalRegistered[id];
        assert(component !== undefined, `Component with id ${id} is not registered`);
        return component;
    }
}