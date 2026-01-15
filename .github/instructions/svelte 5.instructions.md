---
name: Svelte 5 Syntax
description: Provides examples of changes from Svelte 4 to Svelte 5, to guide code generation towards Svelte 5 syntax.
applyTo: "**/*.svelte"
---

This file is as a preamble in every prompt so your AI helper consistently uses Svelte 5 syntax. It explains the new **Runes API** for reactivity (`$state`, `$derived`, `$effect`, `$props`), the shift from slots to **snippets**, the update of **event handlers** to DOM attributes, and the new **component mounting** API. There are side-by-side code comparisons (Svelte 4 → Svelte 5) for the most common patterns, ensuring your AI produces idiomatic Svelte 5 code without manual edits.

---

## 1. Reactivity: Runes API

### 1.1 State (`let` → `$state`)

```svelte
<!-- Svelte 4 -->
<script>
  let count = 0;
</script>
<button on:click={() => count++}>
  Count: {count}
</button>
```

```svelte
<!-- Svelte 5 -->
<script>
  import { $state } from 'svelte';
  let count = $state(0);
</script>
<button onclick={() => count++}>
  Count: {count}
</button>
```

> In Svelte 5, top-level `let` declarations are no longer implicitly reactive; wrap them in `$state(...)` instead.

### 1.2 Derived & Effects (`$:` → `$derived`, `$effect`)

```svelte
<!-- Svelte 4 -->
<script>
  let count = 0;
  $: double = count * 2;
  $: if (count > 5) console.warn('High!');
</script>
```

```svelte
<!-- Svelte 5 -->
<script>
  import { $derived, $effect } from 'svelte';
  let count = $state(0);
  const double = $derived(() => count * 2);
  $effect(() => {
    if (count > 5) console.warn('High!');
  });
</script>
```

> Use `$derived` for pure computations and `$effect` for side-effects; they run more predictably than the old `$:`.

---

## 2. Props (`export let` → `$props`)

```svelte
<!-- Svelte 4 -->
<script>
  export let title;
  export let count = 0;
</script>
```

```svelte
<!-- Svelte 5 -->
<script>
  import { $props } from 'svelte';
  const { title, count = 0 } = $props();
</script>
```

> All component inputs come from a single `$props()` call, letting you rename or forward props more flexibly.

---

## 3. Template Syntax

### 3.1 Event Handlers (`on:foo` → `onclick`)

```svelte
<!-- Svelte 4 -->
<button on:click|preventDefault={handle}>Go</button>
```

```svelte
<!-- Svelte 5 -->
<script>
  import { preventDefault } from 'svelte/legacy';
</script>
<button onclick={preventDefault(handle)}>
  Go
</button>
```

> DOM events are now standard attributes; legacy modifiers live in `svelte/legacy` until you refactor them away.

### 3.2 Snippets vs Slots

```svelte
<!-- Svelte 4 -->
<Child>
  <div slot="header">Header</div>
  Content
</Child>
```

```svelte
<!-- Svelte 5 -->
<Child>
  {#snippet header()}
    <div>Header</div>
  {/snippet}
  {#snippet default()}
    Content
  {/snippet}
</Child>
```

> Snippets unify named and default slots into a consistent, freestanding block syntax.

---

## 4. Component Instantiation

```js
// Svelte 4
import App from "./App.svelte";
const app = new App({ target: document.body });
```

```js
// Svelte 5
import { mount } from "svelte";
import App from "./App.svelte";
mount(App, { target: document.body });
```

> Components are now plain functions; use `mount` (or `hydrate`) instead of `new`.
