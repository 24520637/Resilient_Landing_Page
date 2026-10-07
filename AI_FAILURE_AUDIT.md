# AI Failure Audit

## 1. Form Layout Error - Missing `.form-group`

### 1. Defect Description

The AI omitted `.form-group` wrappers around the form controls, causing labels and form controls to cluster inline instead of forming a clear vertical layout.

### 2. Diagnostic Method

Inspected `#registration-form` using **Chrome DevTools → Elements** and confirmed that the `.form-group` wrapper structure was missing.

The issue was also verified through **Git diff inspection**.

### 3. Refactored Solution

Added `.form-group` wrappers around each label and form control and applied a vertical Flexbox layout.

#### `index.html`

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

#### `css/styles.css`

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

### 1. Defect Description

The AI did not provide a visible keyboard focus indicator. As a result, keyboard users could not clearly identify which interactive element currently had focus.

### 2. Diagnostic Method

Used **Chrome DevTools → Elements** and pressed `Tab` to navigate through the form. The focused element did not have a visible focus indicator.

The absence of the `:focus-visible` CSS rule was also confirmed through **Git diff inspection**.

### 3. Refactored Solution

Added a visible `:focus-visible` outline for interactive elements.

#### `css/styles.css`

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

### 1. Defect Description

The AI-generated responsive layout allowed elements to exceed the viewport width, causing horizontal overflow and breaking the mobile layout at `375px`.

### 2. Diagnostic Method

Used **Chrome DevTools → Device Mode** with the viewport set to `375px`.

Verified horizontal overflow using:

```javascript
document.documentElement.scrollWidth <=
document.documentElement.clientWidth
```

The expected result is:

```text
true
```

The responsive layout was also inspected through **Git diff inspection**.

### 3. Refactored Solution

Added `min-width: 0`, `max-width: 100%`, `box-sizing: border-box`, and a responsive single-column layout for screens up to `375px`.

#### `css/styles.css`

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

---

## 4. Redundant UI State Overwrite / Multiple Unnecessary DOM Renders

### 1. Defect Description

The AI directly assigned `statusFeedback.textContent` immediately after calling `transitionTo()`:

```javascript
transitionTo(FORM_STATES.SUCCESS);

statusFeedback.textContent =
    "Registration submitted successfully.";
```

and:

```javascript
transitionTo(FORM_STATES.ERROR);

statusFeedback.textContent =
    "Something went wrong. Please try again.";
```

This is redundant because `transitionTo()` already calls `updateFormUI()`, which updates `statusFeedback.textContent` based on the current form state.

The `finally` block then calls:

```javascript
unlockSubmission();
```

which also calls `updateFormUI()`.

Therefore, the submit flow performs unnecessary UI updates and creates multiple competing locations responsible for rendering the status message.

### 2. Diagnostic Method

Used **Git diff inspection** to identify the direct `statusFeedback.textContent` assignments outside `updateFormUI()`.

Also added a temporary breakpoint/log at the beginning of `updateFormUI()`:

```javascript
function updateFormUI() {
    console.log("Render UI");

    const isSubmitting = currentFormState === FORM_STATES.SUBMITTING;

    // ...
}
```

Submitting the form showed that `updateFormUI()` was triggered by multiple state-management functions.

A dynamic message test was also used:

```javascript
resolve({
    success: true,
    message: "Dynamic API success message."
});
```

When `statusFeedback.textContent = result.message` was assigned in the `try` block, the message was subsequently overwritten by `updateFormUI()`.

### 3. Refactored Solution

Removed the redundant direct DOM assignments from the `try/catch` block and kept `updateFormUI()` as the single source of truth for UI rendering.

#### Refactored Submit Handler

```javascript
registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isLocked) {
        console.log("Submit event ignored because submission is locked.");
        return;
    }

    if (
        currentFormState === FORM_STATES.SUCCESS ||
        currentFormState === FORM_STATES.ERROR
    ) {
        transitionTo(FORM_STATES.IDLE);
    }

    if (!transitionTo(FORM_STATES.SUBMITTING)) {
        return;
    }

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");

    const sanitizedName = sanitizeInput(nameInput.value);
    const sanitizedEmail = sanitizeInput(emailInput.value);
    const sanitizedMessage = sanitizeInput(messageInput.value);

    submissionContract.input.name = sanitizedName;
    submissionContract.input.email = sanitizedEmail;
    submissionContract.input.message = sanitizedMessage;

    console.log("Sanitized input:", submissionContract.input);

    lockSubmission();

    try {
        const result = await mockApiSubmit(true);

        console.log("API success:", result);

        transitionTo(FORM_STATES.SUCCESS);
    } catch (error) {
        console.error("API error:", error);

        transitionTo(FORM_STATES.ERROR);
    } finally {
        unlockSubmission();
    }
});
```

The resulting rendering flow is:

```text
State transition
       ↓
transitionTo()
       ↓
updateFormUI()
       ↓
DOM update
```