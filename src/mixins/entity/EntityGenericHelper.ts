export type EntityUniqueID = string;

declare module "@minecraft/server" {
    interface Entity {
        readonly id: EntityUniqueID;
    }
}
