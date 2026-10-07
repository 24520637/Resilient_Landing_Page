const FORM_STATES = {
    IDLE: "IDLE",
    SUBMITTING: "SUBMITTING",
    SUCCESS: "SUCCESS",
    ERROR: "ERROR"
};

const VALID_TRANSITIONS = {
    [FORM_STATES.IDLE]: [
        FORM_STATES.SUBMITTING
    ],
    [FORM_STATES.SUBMITTING]: [
        FORM_STATES.SUCCESS,
        FORM_STATES.ERROR
    ],
    [FORM_STATES.SUCCESS]: [
        FORM_STATES.IDLE
    ],
    [FORM_STATES.ERROR]: [
        FORM_STATES.IDLE
    ]
};

const submissionContract = {
    state: FORM_STATES.IDLE,
    locked: false,
    input: {
        name: "",
        email: "",
        message: ""
    }
};

let currentFormState = FORM_STATES.IDLE;
let isLocked = false;

const registrationForm = document.getElementById("registration-form");
const submitButton = registrationForm.querySelector("button[type='submit']");
const statusFeedback = document.getElementById("status-feedback");

function sanitizeInput(str) {
    const text = String(str);

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updateFormUI() {
    const isSubmitting = currentFormState === FORM_STATES.SUBMITTING;

    submitButton.disabled = isSubmitting || isLocked;
    submitButton.setAttribute(
        "aria-disabled",
        String(isSubmitting || isLocked)
    );

    statusFeedback.classList.remove(
        "status-success",
        "status-error"
    );

    if (currentFormState === FORM_STATES.IDLE) {
        statusFeedback.textContent =
            "Complete the registration form to receive confirmation.";
        submitButton.textContent = "Register";
    } else if (currentFormState === FORM_STATES.SUBMITTING) {
        statusFeedback.textContent = "Submitting your registration...";
        submitButton.textContent = "Submitting...";
    } else if (currentFormState === FORM_STATES.SUCCESS) {
        statusFeedback.textContent =
            "Registration submitted successfully.";
        statusFeedback.classList.add("status-success");
        submitButton.textContent = "Register";
    } else if (currentFormState === FORM_STATES.ERROR) {
        statusFeedback.textContent =
            "Something went wrong. Please try again.";
        statusFeedback.classList.add("status-error");
        submitButton.textContent = "Register";
    }
}

function transitionTo(nextState) {
    const allowedStates = VALID_TRANSITIONS[currentFormState];

    if (!allowedStates.includes(nextState)) {
        console.error(
            `Invalid form state transition: ${currentFormState} -> ${nextState}`
        );
        return false;
    }

    currentFormState = nextState;
    submissionContract.state = currentFormState;

    updateFormUI();

    console.log(`Form state changed to: ${currentFormState}`);

    return true;
}

function lockSubmission() {
    isLocked = true;
    submissionContract.locked = true;

    updateFormUI();

    console.log("Submission locked:", isLocked);
}

function unlockSubmission() {
    isLocked = false;
    submissionContract.locked = false;

    updateFormUI();

    console.log("Submission unlocked:", isLocked);
}

function getFormState() {
    return currentFormState;
}

function getSubmissionLock() {
    return isLocked;
}

function mockApiSubmit(shouldSucceed = true) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldSucceed) {
                resolve({
                    success: true,
                    message: "Registration submitted successfully."
                });
            } else {
                reject(new Error("Mock API request failed."));
            }
        }, 1500);
    });
}

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

updateFormUI();

console.log("Initial form state:", currentFormState);
console.log("Initial submission lock:", isLocked);

/*
window.FORM_STATES = FORM_STATES;
window.submissionContract = submissionContract;
window.transitionTo = transitionTo;
window.getFormState = getFormState;
window.getSubmissionLock = getSubmissionLock;
window.mockApiSubmit = mockApiSubmit;
window.lockSubmission = lockSubmission;
window.unlockSubmission = unlockSubmission;
window.sanitizeInput = sanitizeInput;*/