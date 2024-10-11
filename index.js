import * as reactDevToolsCore from "react-devtools-core";

// TODO: Fix 6.0.0, this is one step in the right direction
// reactDevToolsCore.initialize({
//     appendComponentStack: true,
//     breakOnConsoleErrors: false,
//     showInlineWarningsAndErrors: true,
//     hideConsoleLogsInStrictMode: false,
// });

globalThis.__reactDevTools = {
    version: __RDTC_VERSION,
    exports: reactDevToolsCore,
};
