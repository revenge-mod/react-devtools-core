import * as rdt from 'react-devtools-core'

rdt.initialize()

globalThis.__REACT_DEVTOOLS__ = {
    version: __RDT_VERSION,
    exports: rdt,
}
