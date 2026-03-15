import { assert } from "./Error";

export class Result<T, E = string> {
    protected value: T | undefined;
    protected error: E | undefined;

    static ok(): Result<void, never>;
    static ok<T, E = string>(value: T): Result<T, E>;
    static ok<T, E = string>(value?: T): Result<T | void, E> {
        const result = new Result<T | void, E>();
        result.value = value;
        result.error = undefined;
        return result;
    }

    static err<T, E = string>(err: E): Result<T, E> {
        const result = new Result<T, E>();
        result.value = undefined;
        result.error = err;
        return result;
    }

    isOk(): this is { value: T; error: undefined } {
        return this.error === undefined;
    }

    isErr(): this is { value: undefined; error: E } {
        return this.error !== undefined;
    }

    unwrap(): T {
        assert(this.error === undefined, JSON.stringify(this.error));
        return this.value as T;
    }

    unwrapErr(): E {
        assert(this.error !== undefined, "Tried to unwrapErr on an Ok result");
        return this.error as E;
    }

    unwrapOr(defaultValue: T): T {
        if (this.isOk()) {
            return this.value as T;
        }
        return defaultValue;
    }

    toString(): string {
        if (this.isOk()) {
            return `Result: Ok(${JSON.stringify(this.value)})`;
        }
        return `Result: Err(${JSON.stringify(this.error)})`;
    }
}
