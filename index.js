import * as rdt from 'react-devtools-core'

rdt.initialize({
    appendComponentStack: false,
    breakOnConsoleErrors: false,
    showInlineWarningsAndErrors: false,
    hideConsoleLogsInStrictMode: false,
});

globalThis.__REACT_DEVTOOLS__ = {
    version: __RDT_VERSION,
    exports: rdt,
}
