export class AsyncTaskPool {
    static async run<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
        const results: T[] = [];
        let index = 0;
        async function next(): Promise<void> {
            while (index < tasks.length) {
                const i = index++;
                results[i] = await tasks[i]!();
            }
        }
        await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => next()));
        return results;
    }
}
