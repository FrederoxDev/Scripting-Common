import { BlockComponentEntityFallOnEvent, BlockComponentOnPlaceEvent, BlockComponentPlayerBreakEvent, BlockComponentPlayerInteractEvent, BlockComponentPlayerPlaceBeforeEvent, BlockComponentRandomTickEvent, BlockComponentStepOffEvent, BlockComponentStepOnEvent, BlockComponentTickEvent, BlockCustomComponent, CustomComponentParameters } from "@minecraft/server";

/**
 * Block custom components with better intellisense auto-completions for functions
 */
export interface BlockCustomComponentV2 extends BlockCustomComponent {
    beforeOnPlayerPlace?(ev: BlockComponentPlayerPlaceBeforeEvent, params: CustomComponentParameters): void;
    onEntityFallOn?(ev: BlockComponentEntityFallOnEvent, params: CustomComponentParameters): void;
    onPlace?(ev: BlockComponentOnPlaceEvent, params: CustomComponentParameters): void;
    onPlayerBreak?(ev: BlockComponentPlayerBreakEvent, params: CustomComponentParameters): void;
    onPlayerInteract?(ev: BlockComponentPlayerInteractEvent, params: CustomComponentParameters): void;
    onRandomTick?(ev: BlockComponentRandomTickEvent, params: CustomComponentParameters): void;
    onStepOff?(ev: BlockComponentStepOffEvent, params: CustomComponentParameters): void;
    onStepOn?(ev: BlockComponentStepOnEvent, params: CustomComponentParameters): void;
    onTick?(ev: BlockComponentTickEvent, params: CustomComponentParameters): void;
}