# Theming & CSS Variables

shadcn relies on **CSS Variables** defined in `globals.css` that map to Tailwind colors.

## 🎨 Semantic Token Mapping

DO NOT use color names (Red, Blue) in your components. Use **Semantic Tokens**.

| Token | Usage | Tailwind Class |
| :--- | :--- | :--- |
| `--background` | Page background | `bg-background` |
| `--foreground` | Default text | `text-foreground` |
| `--card` | Card/Sheet background | `bg-card` |
| `--popover` | Dropdowns/Dialogs | `bg-popover` |
| `--primary` | Main brand action | `bg-primary text-primary-foreground` |
| `--secondary` | Less important action | `bg-secondary text-secondary-foreground` |
| `--muted` | De-emphasized areas | `bg-muted text-muted-foreground` |
| `--accent` | Hover states | `bg-accent text-accent-foreground` |
| `--destructive` | Error/Delete actions | `bg-destructive text-destructive-foreground` |
| `--border` | Borders/Dividers | `border-border` |
| `--input` | Input fields borders | `border-input` |
| `--ring` | Focus rings | `ring-ring` |

## 📐 Radius Strategy

shadcn uses a global `--radius` variable.

**Usage:**
```css
:root {
  --radius: 0.5rem;
}
```

Components referencing it:
```tsx
// Inside ui/button.tsx
classNames(..., "rounded-md") // defaults map to --radius hierarchy
```

**Project Rules:**
- **Rounded**: `rounded-[var(--radius)]` (root)
- **Buttons**: Often `rounded-md` (maps to radius)
- **Inputs**: `rounded-md`

## 🌑 Dark Mode Strategy

1.  **Never** use `dark:bg-slate-900`.
2.  **Always** redefine the CSS variables in the `.dark` class.

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... mappings shift automatically ... */
}
```

This ensures components don't need `dark:` modifiers. They just use `bg-background`, and the browser swaps the HSL value.
