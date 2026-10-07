const targetTime = "2026-12-14T01:00:00.000Z";

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

const targetTimestamp = Date.parse(targetTime);

let intervalId = null;

function calculateRemainingTime() {
    const remaining = targetTimestamp - Date.now();

    if (remaining <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    const totalSeconds = Math.floor(remaining / 1000);

    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
    };
}

function updateCountdown() {
    const remainingMilliseconds = targetTimestamp - Date.now();

    // 1. Kiểm tra nếu đã hết giờ -> Hủy interval và dọn dẹp bộ nhớ
    if (remainingMilliseconds <= 0) {
        clearInterval(intervalId);
        intervalId = null;

        daysElement.textContent = "00";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        console.log("Countdown completed. intervalId canceled:", intervalId);
        return;
    }

    // 2. Tính toán và cập nhật thời gian thực
    const remaining = calculateRemainingTime();

    daysElement.textContent = String(remaining.days).padStart(2, "0");
    hoursElement.textContent = String(remaining.hours).padStart(2, "0");
    minutesElement.textContent = String(remaining.minutes).padStart(2, "0");
    secondsElement.textContent = String(remaining.seconds).padStart(2, "0");
}

// Chạy lần đầu tiên ngay khi tải trang
updateCountdown();

// Bắt đầu vòng lặp đếm ngược nếu mốc thời gian còn ở tương lai
if (targetTimestamp > Date.now()) {
    intervalId = setInterval(updateCountdown, 1000);
}