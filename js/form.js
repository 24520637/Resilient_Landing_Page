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

    if (isSubmitting) {
        statusFeedback.textContent = "Submitting your registration...";
        statusFeedback.setAttribute("role", "status");
        statusFeedback.setAttribute("aria-live", "polite");
        submitButton.textContent = "Submitting...";
    } else if (currentFormState === FORM_STATES.IDLE) {
        statusFeedback.textContent =
            "Complete the registration form to receive confirmation.";
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

// ==========================================
// THÊM ĐOẠN CODE FIX LỖI TẠI ĐÂY:
// ==========================================
if (registrationForm) {
    registrationForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Ngăn trang reload

        // 1. Chuyển state sang SUBMITTING
        transitionTo(FORM_STATES.SUBMITTING);

        try {
            // Đổi thành mockApiSubmit(false) nếu muốn test trường hợp lỗi API
            const response = await mockApiSubmit(true);

            // 2. Thành công -> Chuyển state sang SUCCESS
            transitionTo(FORM_STATES.SUCCESS);
            statusFeedback.textContent = response.message;

        } catch (error) {
            // 3. Thất bại -> Bắt lỗi êm đẹp, chuyển state sang ERROR (Không bị nổ Unhandled Rejection)
            transitionTo(FORM_STATES.ERROR);
            statusFeedback.textContent = "Registration failed. Please try again.";
            console.error("Submission Error:", error.message);
        }
    });
}

// Khởi chạy UI ban đầu
updateFormUI();

console.log("Initial form state:", currentFormState);

// Expose ra window để test trong Console (Xóa hoặc comment lại sau khi test)
window.FORM_STATES = FORM_STATES;
window.transitionTo = transitionTo;
window.getFormState = getFormState;
window.mockApiSubmit = mockApiSubmit;