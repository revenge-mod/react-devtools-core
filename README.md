# @revenge-mod/react-devtools-core

## Build

Install dependencies:

```bash
bun install
```

Build bundle:

```bash
# File will be placed at dist/index.js and dist/index.bundle
bun run build
```

## Usage

Load the given file before React. You can access exports thru `globalThis.__REACT_DEVTOOLS__.exports`, and the version at `globalThis.__REACT_DEVTOOLS__.version`.
