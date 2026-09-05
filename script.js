/* =========================================================
   APEX GAMES LAUNCH CENTER
   script.js

   Official Launch:
   September 20, 2026
   3:00 PM EDT
========================================================= */


/* =========================================================
   LAUNCH CONFIGURATION
========================================================= */

const LAUNCH_DATE =
    new Date("2026-09-20T15:00:00-04:00");

const APEX_GAMES_URL =
    "https://apexgamesofficial.github.io/Apex-Games/";


/* =========================================================
   COUNTDOWN ELEMENTS
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


/* =========================================================
   HELPERS
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
   LAUNCH SCREEN
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
       LAUNCH HAS ARRIVED
    ---------------------------------------------- */

    if (distance <= 0) {

        showLaunchScreen();

        return false;
    }


    /* ---------------------------------------------
       MAKE SURE LAUNCH SCREEN IS HIDDEN
    ---------------------------------------------- */

    hideLaunchScreen();


    /* ---------------------------------------------
       CALCULATE REMAINING TIME
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


    /* ---------------------------------------------
       UPDATE PAGE
    ---------------------------------------------- */

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

updateCountdown();


const countdownInterval =
    window.setInterval(
        () => {

            const stillActive =
                updateCountdown();

            if (!stillActive) {

                window.clearInterval(
                    countdownInterval
                );
            }

        },
        1000
    );
