export class EventEmitter<T> {
    private listeners: Array<(event: T) => void> = [];

    on(listener: (event: T) => void): void {
        this.listeners.push(listener);
    }

    off(listener: (event: T) => void): void {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) this.listeners.splice(index, 1);
    }

    emit(event: T): void {
        for (const listener of this.listeners) {
            listener(event);
        }
    }

    clear(): void {
        this.listeners = [];
    }
}
