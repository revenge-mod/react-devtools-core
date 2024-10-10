import * as reactDevToolsCore from "react-devtools-core";

globalThis.__reactDevTools = {
    version: __RDTC_VERSION, // Sync with package.json
    exports: reactDevToolsCore
};