import { system } from "@minecraft/server"

export async function Sleep(ticks: number): Promise<void> {
    return new Promise((res) => {
        system.runInterval(res, ticks);
    })
}

