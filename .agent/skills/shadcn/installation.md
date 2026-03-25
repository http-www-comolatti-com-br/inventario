# shadcn Installation & Setup

## 1. Project Initialization

If `components.json` is missing, run:

```bash
npx shadcn@latest init
```

### Recommended Configuration (Project Standards)

```json
{
  "style": "default",
  "rsc": true, 
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts", // or .js
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true, 
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

> **CRITICAL**: Always enable `cssVariables: true`. We generally avoid the `new-york` style unless specifically requested, as `default` is more flexible.

## 2. The `cn` Utility

This is the heart of shadcn. It MUST exist at `@/lib/utils.ts` (or configured path).

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- **Why?** It handles Tailwind conflicts. `cn("bg-red-500", "bg-blue-500")` -> `"bg-blue-500"`.
- Without `twMerge`, you get CSS specificity wars.

## 3. Adding Components

Use the shadcn CLI or MCP tool:

```bash
npx shadcn@latest add [component]
```

**After Adding:**
1.  **Check the file**: It's now YOUR code.
2.  **Lint it**: Run project linter.
3.  **Adapt it**: If the project uses `lucide-react`, ensure icons are consistent.
