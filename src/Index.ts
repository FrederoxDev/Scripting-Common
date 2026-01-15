export * from './components/block/BlockCustomComponentV2'
export * from './components/block/GenericBlockEntity'
export * from './components/block/ScriptBlock'
export * from './components/block/CustomFurnaceComponent'
export * from './components/entity/EntityCustomComponent'
export * from './components/items/ItemDurability'
export * from './components/items/ScriptItem'
export * from './mixins/world/Dimension'
export * from './mixins/block/BlockEntity'
export * from './mixins/block/BlockGenericHelpers'
export * from './mixins/entity/EntityComponents'
export * from './mixins/entity/EntityGenericHelper'
export * from './mixins/entity/PlayerHelpers'
export * from './mixins/inventory/Container'
export * from './mixins/world/Dimension'
export * from './mixins/world/World'
export * from './mixins/inventory/ItemStack'
export * from './utils/animation/Animation'
export * from './utils/animation/AnimationPlayer'
export * from './utils/error/Error'
export * from './utils/inventory/Inventory'
export * from './utils/inventory/VirtualContainer'
export * from './utils/inventory/InventoryView'
export * from './utils/math/AABB'
export * from './utils/math/Direction'
export * from './utils/math/Random'
export * from './utils/math/Vec2'
export * from './utils/math/Vec3'
export * from './utils/serde/VersionedData'
export * from './utils/serde/DynamicPropertyAccessor'
export * from './utils/time/Time'
export * from './utils/ui/ScriptBindings'
export * from './utils/item/ItemAux'
export * from './utils/utility/Pair'
export * from './utils/systems/ComponentSystem'
export * from './utils/math/MathUtils'
export * from './utils/serde/BinaryStream'
export * from './utils/serde/Palette'
import './utils/error/BetterLogs'
export * from "./utils/inventory/ContainerLike"
export * from "./utils/inventory/MultiContainer"

///////////////////////////////////////////////////////////////////
//            Library Initialization stuff
///////////////////////////////////////////////////////////////////

import { assert } from './utils/error/Error'

export let projectNamespace: string | undefined = undefined;

export function initializeScriptingCommon(namespace: string) {
    assert(projectNamespace === undefined, "initializeScriptingCommon can only be called once");
    projectNamespace = namespace;
}

export function getProjectNamespace() {
    assert(projectNamespace !== undefined, "initializeScriptingCommon must be called.");
    return projectNamespace;
}

export function t() {}