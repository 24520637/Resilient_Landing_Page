const targetTime = "2026-12-14T01:00:00.000Z";

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

const targetTimestamp = Date.parse(targetTime);

function calculateRemainingTime() {
    const remainingMilliseconds = targetTimestamp - Date.now();

    if (remainingMilliseconds <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    const totalSeconds = Math.floor(remainingMilliseconds / 1000);

    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
    };
}

function updateCountdown() {
    const remaining = calculateRemainingTime();

    daysElement.textContent = String(remaining.days).padStart(2, "0");
    hoursElement.textContent = String(remaining.hours).padStart(2, "0");
    minutesElement.textContent = String(remaining.minutes).padStart(2, "0");
    secondsElement.textContent = String(remaining.seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);