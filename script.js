/* =========================================================
   APEX GAMES LAUNCH CENTER
   script.js

   Official launch:
   September 20, 2026
   3:00 PM EDT
   America/New_York

   EDT = UTC-04:00
========================================================= */


/* =========================================================
   LAUNCH CONFIGURATION
========================================================= */

// Keep the timezone offset on this date.
// September 20, 2026 is during Eastern Daylight Time.
const LAUNCH_DATE = new Date("2026-09-20T15:00:00-04:00");

// Main Apex Games website.
const APEX_GAMES_URL =
    "https://apexgamesofficial.github.io/Apex-Games/";


/* =========================================================
   ELEMENTS
========================================================= */

const daysElement =
    document.getElementById("days");

const hoursElement =
    document.getElementById("hours");

const minutesElement =
    document.getElementById("minutes");

const secondsElement =
    document.getElementById("seconds");

const launchedScreen =
    document.getElementById("launchedScreen");

const registrationForm =
    document.getElementById("registrationForm");

const registerButton =
    document.getElementById("registerButton");

const formMessage =
    document.getElementById("formMessage");


/* =========================================================
   COUNTDOWN HELPERS
========================================================= */

function padNumber(value) {
    return String(value).padStart(2, "0");
}


function setCountdownValues(
    days,
    hours,
    minutes,
    seconds
) {
    if (daysElement) {
        daysElement.textContent =
            padNumber(days);
    }

    if (hoursElement) {
        hoursElement.textContent =
            padNumber(hours);
    }

    if (minutesElement) {
        minutesElement.textContent =
            padNumber(minutes);
    }

    if (secondsElement) {
        secondsElement.textContent =
            padNumber(seconds);
    }
}


/* =========================================================
   LAUNCH STATE
========================================================= */

function showLaunchScreen() {

    setCountdownValues(
        0,
        0,
        0,
        0
    );

    if (!launchedScreen) {
        return;
    }

    launchedScreen.hidden = false;

    document.body.style.overflow =
        "hidden";
}


function hideLaunchScreen() {

    if (!launchedScreen) {
        return;
    }

    launchedScreen.hidden = true;

    document.body.style.overflow =
        "";
}


/* =========================================================
   COUNTDOWN
========================================================= */

function updateCountdown() {

    const now =
        Date.now();

    const launchTime =
        LAUNCH_DATE.getTime();

    const distance =
        launchTime - now;


    /* ---------------------------------------------
       LAUNCHED
    ---------------------------------------------- */

    if (distance <= 0) {

        showLaunchScreen();

        return false;
    }


    /* ---------------------------------------------
       TIME CALCULATIONS
    ---------------------------------------------- */

    const totalSeconds =
        Math.floor(
            distance / 1000
        );

    const days =
        Math.floor(
            totalSeconds / 86400
        );

    const hours =
        Math.floor(
            (totalSeconds % 86400) / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;


    setCountdownValues(
        days,
        hours,
        minutes,
        seconds
    );


    return true;
}


/* =========================================================
   START COUNTDOWN
========================================================= */

// Run immediately so the user doesn't see 00:00:00:00
// for one second after opening the page.

const countdownActive =
    updateCountdown();


let countdownInterval = null;


if (countdownActive) {

    countdownInterval =
        window.setInterval(
            () => {

                const stillActive =
                    updateCountdown();

                if (!stillActive) {

                    clearInterval(
                        countdownInterval
                    );

                    countdownInterval =
                        null;
                }

            },
            1000
        );
}
