# AI Failure Audit

## 1. Form Layout Error - Missing `.form-group`

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
1. Error Name

Redundant UI State Overwrite / Multiple Unnecessary DOM Renders

2. Error Description

In the submit event handler, the try/catch block directly assigns statusFeedback.textContent immediately after transitionTo():

transitionTo(FORM_STATES.SUCCESS);

statusFeedback.textContent =
    "Registration submitted successfully.";

and:

transitionTo(FORM_STATES.ERROR);

statusFeedback.textContent =
    "Something went wrong. Please try again.";

This is redundant because transitionTo() already calls:

updateFormUI();

and updateFormUI() already updates statusFeedback.textContent according to the current form state.

Afterward, the finally block calls:

unlockSubmission();

which also calls:

updateFormUI();

Therefore, the UI is unnecessarily rendered multiple times during one submission flow. The manual textContent assignments also violate the Single Source of Truth principle because updateFormUI() should be the centralized owner of UI state rendering.

3. Error Identification Method
A. Tracing Call Stack

Temporarily add:

console.log("Render UI");

at the beginning of updateFormUI():

function updateFormUI() {
    console.log("Render UI");

    const isSubmitting = currentFormState === FORM_STATES.SUBMITTING;

    // ...
}

Submit the form once and observe the Console.

The updateFormUI() function is triggered by:

transitionTo(FORM_STATES.SUBMITTING)
lockSubmission()
transitionTo(FORM_STATES.SUCCESS) or transitionTo(FORM_STATES.ERROR)
unlockSubmission()

The SUCCESS/ERROR path additionally performs a direct statusFeedback.textContent assignment outside updateFormUI().

This demonstrates unnecessary UI updates rather than a single centralized rendering path.

B. Dynamic Message Overwrite Test

Modify the mock API response:

resolve({
    success: true,
    message: "Dynamic API success message."
});

Then assign:

statusFeedback.textContent = result.message;

inside the try block.

The message is subsequently overwritten when:

finally {
    unlockSubmission();
}

calls:

updateFormUI();

which restores the default SUCCESS message.

This demonstrates that direct DOM manipulation outside updateFormUI() can be immediately overwritten.

4. Impact Level

Medium

Impact
Creates a code smell through redundant DOM updates.
Violates the Single Source of Truth principle.
Performs unnecessary DOM calculations/renders.
Makes future dynamic API messages harder to maintain.
Creates competing responsibilities between the submit handler and updateFormUI().
5. Modified Code (Refactored Code)

Remove the redundant statusFeedback.textContent assignments from the try/catch block.

Refactored submit handler
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
Result

updateFormUI() becomes the single source of truth for UI rendering:

State transition
      ↓
transitionTo()
      ↓
updateFormUI()
      ↓
DOM update

The redundant manual assignments:

statusFeedback.textContent = "...";

are removed from the try/catch block, preventing the unnecessary overwrite and keeping UI state management centralized.