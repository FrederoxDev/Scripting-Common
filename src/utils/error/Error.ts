export function assert(conditional: boolean, ...data: unknown[]): asserts conditional {
    if (conditional) return;

    throw new Error(data.map((arg) => {
        if (typeof arg === "object" && arg !== null) {
            return JSON.stringify(arg);
        }

        return arg;
    }).join(" "));
}

export function unreachable(): never {
    throw new Error("This code should be unreachable");
}