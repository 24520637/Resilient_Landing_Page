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

let currentFormState = FORM_STATES.IDLE;

const registrationForm = document.getElementById("registration-form");
const submitButton = registrationForm.querySelector("button[type='submit']");
const statusFeedback = document.getElementById("status-feedback");

function updateFormUI() {
    const isSubmitting = currentFormState === FORM_STATES.SUBMITTING;

    submitButton.disabled = isSubmitting;
    submitButton.setAttribute("aria-disabled", String(isSubmitting));

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

    updateFormUI();

    console.log(`Form state changed to: ${currentFormState}`);

    return true;
}

function getFormState() {
    return currentFormState;
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

    if (currentFormState === FORM_STATES.SUBMITTING) {
        console.log("Duplicate submit event ignored.");
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

    try {
        const result = await mockApiSubmit(true);

        console.log("API success:", result);

        transitionTo(FORM_STATES.SUCCESS);
    } catch (error) {
        console.error("API error:", error);

        transitionTo(FORM_STATES.ERROR);
    }
});

updateFormUI();

console.log("Initial form state:", currentFormState);

/*
window.FORM_STATES = FORM_STATES;
window.transitionTo = transitionTo;
window.getFormState = getFormState;
window.mockApiSubmit = mockApiSubmit;*/