import { BlockComponentEntityFallOnEvent, BlockComponentOnPlaceEvent, BlockComponentPlayerDestroyEvent, BlockComponentPlayerInteractEvent, BlockComponentPlayerPlaceBeforeEvent, BlockComponentRandomTickEvent, BlockComponentStepOffEvent, BlockComponentStepOnEvent, BlockComponentTickEvent, BlockCustomComponent } from "@minecraft/server";

/**
 * Block custom components with better intellisense auto-completions for functions
 */
export interface BlockCustomComponentV2 extends BlockCustomComponent {
    beforeOnPlayerPlace?(ev: BlockComponentPlayerPlaceBeforeEvent): void;
    onEntityFallOn?(ev: BlockComponentEntityFallOnEvent): void;
    onPlace?(ev: BlockComponentOnPlaceEvent): void;
    onPlayerDestroy?(ev: BlockComponentPlayerDestroyEvent): void;
    onPlayerInteract?(ev: BlockComponentPlayerInteractEvent): void;
    onRandomTick?(ev: BlockComponentRandomTickEvent): void;
    onStepOff?(ev: BlockComponentStepOffEvent): void;
    onStepOn?(ev: BlockComponentStepOnEvent): void;
    onTick?(ev: BlockComponentTickEvent): void;
}