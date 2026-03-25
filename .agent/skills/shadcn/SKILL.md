---
name: shadcn
description: The ultimate guide to implementing shadcn/ui. Covers installation, component patterns, theming, and common pitfalls. Use this skill when adding, modifying, or auditing shadcn components.
---

# shadcn/ui Skill

This skill provides the **authoritative truth** on how to implement shadcn/ui in this project. 

> **Core Philosophy**: shadcn is NOT a library you install. It is code you copy, own, and **must maintain**.

## 📑 Content Map

| File | Purpose |
| :--- | :--- |
| `installation.md` | How to add components and configure requirements (utils, tailwind). |
| `patterns.md` | Component patterns, slots, and advanced composition. |
| `theming.md` | CSS Variables, radius strategies, and preventing "Generic UI". |

## 📜 The 5 Commandments of shadcn

1.  **Thou Shalt Always Merge Classes w/ `cn()`**:
    *   NEVER: `<div className={"bg-red-500 " + className} />`
    *   ALWAYS: `<div className={cn("bg-red-500", className)} />`
    
2.  **Thou Shalt Keep `forwardRef`**:
    *   Radix primitives rely on refs. If you remove `forwardRef`, you break accessibility and composition.

3.  **Thou Shalt Export Sub-Components**:
    *   Follow the `<Root>`, `<Trigger>`, `<Content>` pattern.
    *   Avoid monolithic props (e.g., `isOpen`, `onClose` inside one giant component).

4.  **Thou Shalt Customize**:
    *   Using the default `slate-900` without checking the project theme is a failure.
    *   Change defaults in `ui/{component}.tsx` to match the project's Design System.

5.  **Thou Shalt Not Hardcode Styles**:
    *   Use `bg-primary`, `text-muted-foreground`.
    *   NEVER use `bg-[#1a2b3c]` inside a reusable component.

## 🚨 Common Pitfalls (Check before commiting)

- **The "Client Component" Trap**:
    - Most shadcn components (Dialog, Sheet, Select) imply interactivity.
    - If a component imports `useState` or `useEffect` (often via Radix), it MUST have `"use client"`.
    - **Exception**: Atoms like `Card`, `Badge`, `Button` typically do NOT need `"use client"`.

- **The "Import Chaos"**:
    - Import from `@/components/ui/button`, not relative paths like `../../../components/ui/button`.
    
- **The "Zod Conflict"**:
    - shadcn forms rely on `zod`. Ensure you are using `zod` schema validation for all forms.
