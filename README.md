# @revenge-mod/react-devtools-core

## Build

Install dependencies:

```bash
bun install
```

Build bundle:

```bash
# File will be placed at dist/index.js
bun run build
```

## Usage

Load the given file before React. You can access exports thru `window.__reactDevToolsCore.exports`.
