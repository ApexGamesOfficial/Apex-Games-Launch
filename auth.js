/* =========================================================
   APEX GAMES LAUNCH CENTER
   auth.js

   Handles:
   - Apex Games account creation
   - Profile creation
   - Launch pre-registration
   - Beta Tester badge eligibility
   - Live launch registration count
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://efjkeknzhwsyauoqsksi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_feCrfb3oxSrozPnHXSZvWQ_a0lrB8mR";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   ELEMENTS
========================================================= */

const registrationForm =
    document.getElementById("registrationForm");

const registerButton =
    document.getElementById("registerButton");

const formMessage =
    document.getElementById("formMessage");

const launchCountElement =
    document.getElementById("launchRegistrationCount");


/* =========================================================
   MESSAGE
========================================================= */

function showRegistrationMessage(
    message,
    type = ""
) {

    if (!formMessage) {
        return;
    }

    formMessage.textContent =
        message;

    formMessage.classList.remove(
        "success",
        "error"
    );

    if (type) {
        formMessage.classList.add(type);
    }
}


/* =========================================================
   BUTTON STATE
========================================================= */

function setRegistrationLoading(
    loading
) {

    if (!registerButton) {
        return;
    }

    registerButton.disabled =
        loading;

    registerButton.textContent =
        loading
            ? "Creating Account..."
            : "Create My Apex Games Account";
}


/* =========================================================
   CLEAN GAMERTAG
========================================================= */

function cleanGamertag(value) {

    return value
        .trim()
        .replace(/\s+/g, "");
}


/* =========================================================
   FORMAT REGISTRATION COUNT
========================================================= */

function formatLaunchCount(value) {

    const count =
        Number(value) || 0;


    if (count < 1000) {
        return count.toLocaleString();
    }


    if (count < 1000000) {

        const shortCount =
            count / 1000;

        return (
            shortCount.toFixed(
                shortCount >= 100
                    ? 0
                    : 1
            ) + "K+"
        );
    }


    const shortCount =
        count / 1000000;

    return (
        shortCount.toFixed(
            shortCount >= 100
                ? 0
                : 1
        ) + "M+"
    );
}


/* =========================================================
   LOAD PUBLIC REGISTRATION COUNT
========================================================= */

async function loadLaunchRegistrationCount() {

    if (!launchCountElement) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "get_launch_registration_count"
                );


        if (error) {
            throw error;
        }


        launchCountElement.textContent =
            formatLaunchCount(data);


    } catch (error) {

        console.error(
            "Launch registration count error:",
            error
        );

        launchCountElement.textContent =
            "0";
    }
}


/* =========================================================
   CHECK GAMERTAG
========================================================= */

async function gamertagExists(
    gamertag
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("id")
            .ilike(
                "gamertag",
                gamertag
            )
            .limit(1);


    if (error) {
        throw error;
    }


    return (
        Array.isArray(data) &&
        data.length > 0
    );
}


/* =========================================================
   REGISTER
========================================================= */

async function registerAccount(event) {

    event.preventDefault();


    /* ---------------------------------------------
       GET INPUTS
    ---------------------------------------------- */

    const gamertagInput =
        document.getElementById("gamertag");

    const displayNameInput =
        document.getElementById("displayName");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById(
            "confirmPassword"
        );


    if (
        !gamertagInput ||
        !displayNameInput ||
        !emailInput ||
        !passwordInput ||
        !confirmPasswordInput
    ) {

        showRegistrationMessage(
            "Registration form is unavailable.",
            "error"
        );

        return;
    }


    const gamertag =
        cleanGamertag(
            gamertagInput.value
        );

    const displayName =
        displayNameInput.value.trim();

    const email =
        emailInput.value
            .trim()
            .toLowerCase();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    /* ---------------------------------------------
       BASIC VALIDATION
    ---------------------------------------------- */

    showRegistrationMessage("");


    if (gamertag.length < 3) {

        showRegistrationMessage(
            "Gamertag must be at least 3 characters.",
            "error"
        );

        return;
    }


    if (gamertag.length > 24) {

        showRegistrationMessage(
            "Gamertag cannot be longer than 24 characters.",
            "error"
        );

        return;
    }


    if (
        !/^[a-zA-Z0-9_.-]+$/.test(
            gamertag
        )
    ) {

        showRegistrationMessage(
            "Gamertags can use letters, numbers, underscores, periods, and hyphens.",
            "error"
        );

        return;
    }


    if (!displayName) {

        showRegistrationMessage(
            "Enter a display name.",
            "error"
        );

        return;
    }


    if (!email) {

        showRegistrationMessage(
            "Enter an email address.",
            "error"
        );

        return;
    }


    if (password.length < 8) {

        showRegistrationMessage(
            "Password must be at least 8 characters.",
            "error"
        );

        return;
    }


    if (
        password !==
        confirmPassword
    ) {

        showRegistrationMessage(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    /* ---------------------------------------------
       START
    ---------------------------------------------- */

    setRegistrationLoading(true);


    try {

        /* -----------------------------------------
           CHECK GAMERTAG
        ------------------------------------------ */

        const alreadyExists =
            await gamertagExists(
                gamertag
            );


        if (alreadyExists) {

            showRegistrationMessage(
                "That gamertag is already taken.",
                "error"
            );

            return;
        }


        /* -----------------------------------------
           CREATE AUTH ACCOUNT
        ------------------------------------------ */

        const {
            data: authData,
            error: authError
        } =
            await supabaseClient
                .auth
                .signUp({
                    email,
                    password
                });


        if (authError) {
            throw authError;
        }


        const user =
            authData.user;


        if (!user) {

            throw new Error(
                "Account creation did not return a user."
            );
        }


        /* -----------------------------------------
           CREATE PROFILE
        ------------------------------------------ */

        const {
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .insert({
                    id: user.id,

                    gamertag:
                        gamertag,

                    display_name:
                        displayName,

                    status:
                        "offline"
                });


        if (profileError) {
            throw profileError;
        }


        /* -----------------------------------------
           CREATE LAUNCH REGISTRATION
           Database assigns:
           - registered_at
           - Beta Tester badge
        ------------------------------------------ */

        const {
            error: launchRegistrationError
        } =
            await supabaseClient
                .from(
                    "launch_registrations"
                )
                .insert({
                    user_id:
                        user.id
                });


        if (launchRegistrationError) {
            throw launchRegistrationError;
        }


        /* -----------------------------------------
           SUCCESS
        ------------------------------------------ */

        showRegistrationMessage(
            "You're pre-registered! Your Apex Games Account is ready, and you've earned the Beta Tester badge.",
            "success"
        );


        registrationForm.reset();


        /* -----------------------------------------
           REFRESH COUNTER
        ------------------------------------------ */

        await loadLaunchRegistrationCount();


    } catch (error) {

        console.error(
            "Apex Games registration error:",
            error
        );


        let message =
            "We couldn't create your account. Please try again.";


        const errorText =
            String(
                error?.message || ""
            ).toLowerCase();


        if (
            errorText.includes(
                "already registered"
            ) ||
            errorText.includes(
                "already been registered"
            )
        ) {

            message =
                "An Apex Games Account already exists with that email.";
        }


        if (
            errorText.includes(
                "duplicate"
            ) &&
            errorText.includes(
                "gamertag"
            )
        ) {

            message =
                "That gamertag is already taken.";
        }


        if (
            errorText.includes(
                "duplicate key"
            ) &&
            errorText.includes(
                "launch_registrations"
            )
        ) {

            message =
                "This account is already pre-registered.";
        }


        if (
            errorText.includes(
                "pre-registration has ended"
            )
        ) {

            message =
                "Apex Games pre-registration has ended.";
        }


        showRegistrationMessage(
            message,
            "error"
        );


    } finally {

        setRegistrationLoading(false);
    }
}


/* =========================================================
   START
========================================================= */

if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        registerAccount
    );
}


loadLaunchRegistrationCount();
