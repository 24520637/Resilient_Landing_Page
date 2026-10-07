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


    statusFeedback.classList.remove("status-error", "status-success", "status-submitting");

    if (currentFormState === FORM_STATES.IDLE) {
        statusFeedback.textContent =
            "Complete the registration form to receive confirmation.";
        submitButton.textContent = "Register";
    } else if (currentFormState === FORM_STATES.SUBMITTING) {
        statusFeedback.textContent = "Submitting your registration...";
        submitButton.textContent = "Submitting...";
        statusFeedback.classList.add("status-submitting");
    } else if (currentFormState === FORM_STATES.SUCCESS) {
        statusFeedback.textContent =
            "Registration submitted successfully.";
        submitButton.textContent = "Register";
        statusFeedback.classList.add("status-success"); // 👉 Thêm class success
    } else if (currentFormState === FORM_STATES.ERROR) {
        statusFeedback.textContent =
            "Something went wrong. Please try again.";
        submitButton.textContent = "Register";
        statusFeedback.classList.add("status-error"); // 👉 Thêm class error
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

// ==========================================
// fixing
// ==========================================
if (registrationForm) {
registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 👉 ĐÂY LÀ ĐOẠN CẦN THÊM: Nếu đang ở SUCCESS hoặc ERROR thì reset về IDLE trước
    if (currentFormState === FORM_STATES.SUCCESS || currentFormState === FORM_STATES.ERROR) {
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
}

// Khởi chạy UI ban đầu
updateFormUI();

console.log("Initial form state:", currentFormState);

// Expose ra window để test trong Console
/*window.transitionTo = transitionTo;
window.getFormState = getFormState;
window.mockApiSubmit = mockApiSubmit;*/

