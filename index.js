import * as rdt from 'react-devtools-core'

// TODO: Fix 6.0.0, this is one step in the right direction
// reactDevToolsCore.initialize({
//     appendComponentStack: false,
//     breakOnConsoleErrors: false,
//     showInlineWarningsAndErrors: false,
//     hideConsoleLogsInStrictMode: false,
// });

globalThis.__REACT_DEVTOOLS__ = {
    version: __RDT_VERSION,
    exports: rdt,
}
