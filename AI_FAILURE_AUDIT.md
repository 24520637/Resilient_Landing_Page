# AI Failure Audit

## 1. Form Layout Error — Missing `.form-group`

### Defect Description

The AI omitted `.form-group` wrappers, causing labels and form controls to cluster inline instead of forming a vertical layout.

### Diagnostic Method

Detected in **Chrome DevTools → Elements** by inspecting `#registration-form`. The missing `.form-group` structure was also confirmed with `git diff`.

### Refactored Solution

**`index.html`**

```html
<form id="registration-form" class="registration-form">
    <p class="form-title">Registration Form</p>

    <div class="form-group">
        <label for="name">Full Name</label>
        <input id="name" name="name" type="text" autocomplete="name" required>
    </div>

    <div class="form-group">
        <label for="email">Email Address</label>
        <input id="email" name="email" type="email" autocomplete="email" required>
    </div>

    <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5"></textarea>
    </div>

    <button type="submit">Register Now</button>
</form>
```

**`css/styles.css`**

```css
.registration-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group input,
.form-group textarea {
    width: 100%;
    box-sizing: border-box;
}
```

---

## 2. Missing `:focus-visible`

### Defect Description

The AI did not provide a visible keyboard focus indicator, making it difficult to identify the currently focused element.

### Diagnostic Method

Used **Chrome DevTools → Elements** and pressed `Tab` to check keyboard focus. The missing `:focus-visible` rule was also confirmed with `git diff`.

### Refactored Solution

**`css/styles.css`**

```css
:focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 3px;
}

input:focus-visible,
textarea:focus-visible,
button:focus-visible,
a:focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 3px;
}
```

---

## 3. Broken Frame at 375px

### Defect Description

The AI-generated responsive layout allowed elements to exceed the viewport width, causing horizontal overflow and a broken mobile frame at 375px.

### Diagnostic Method

Used **Chrome DevTools → Device Mode** at `375px` and checked:

```javascript
document.documentElement.scrollWidth <=
document.documentElement.clientWidth
```

Expected result: `true`.

### Refactored Solution

**`css/styles.css`**

```css
.registration-container {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    gap: 40px;
}

.registration-form,
.form-group {
    min-width: 0;
    max-width: 100%;
}

.form-group input,
.form-group textarea {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}

@media (max-width: 375px) {
    .container {
        width: calc(100% - 24px);
        max-width: 100%;
    }

    .registration-container {
        grid-template-columns: minmax(0, 1fr);
        gap: 28px;
    }
}
```

