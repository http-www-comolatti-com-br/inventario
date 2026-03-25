# Component Patterns

## 1. The Slot Pattern (Polymorphism)

shadcn components often use `@radix-ui/react-slot`. This allows you to merge props onto a child element.

**Usage:**

```tsx
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // If asChild is true, we render the Slot, which merges props onto the immediate child
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Why use it?**
It lets your component act as a wrapper without adding an extra DOM node.
```tsx
<Button asChild>
  <Link href="/login">Login</Link>
</Button>
```
Here, the `Link` receives the button styles, but the tag is `<a>` (from Link), not `<button>`.

## 2. Forms (Zod + React Hook Form)

The "shadcn way" for forms is strict.

1.  **Define Schema**:
    ```tsx
    const formSchema = z.object({
      username: z.string().min(2),
    })
    ```
2.  **Use Hook**:
    ```tsx
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
    })
    ```
3.  **Render Field**:
    ```tsx
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="shadcn" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    ```

**Rule**: NEVER use raw `<input>` or manual state handling if you can use the `<Form>` wrapper. It handles accessibility, error states, and focus management automatically.

## 3. Composition vs Configuration

- **Don't** create a `Card` that takes a `title` prop and renders it internally if you can avoid it.
- **Do** export `CardHeader`, `CardTitle`, `CardContent`.

**Bad (Rigid):**
```tsx
<Card title="My Card" content="Hello" />
```

**Good (Composable):**
```tsx
<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Hello
  </CardContent>
</Card>
```
This allows you to insert anything (icons, badges, buttons) into the header without modifying the component definition.
