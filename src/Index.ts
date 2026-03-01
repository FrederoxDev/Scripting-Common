import './mixins/world/Dimension'
import './mixins/block/BlockEntity'
import './mixins/block/BlockGenericHelpers'
import './mixins/entity/EntityComponents'
import './mixins/entity/EntityGenericHelper'
import './mixins/entity/PlayerHelpers'
import './mixins/inventory/Container'
import './mixins/world/Dimension'
import './mixins/world/World'
import './mixins/inventory/ItemStack'

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