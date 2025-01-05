const oldConsoleLog = console.log

console.log = function (...args) {
    const newArgs = args.map((arg) => {
        if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg);
        }

        return arg;
    });

    oldConsoleLog.apply(console, newArgs);
};