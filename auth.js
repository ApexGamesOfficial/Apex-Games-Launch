/* =========================================================
   APEX GAMES LAUNCH CENTER
   auth.js

   Handles pre-launch Apex Games account registration.
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
       GET VALUES
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
                        "online"
                });


        if (profileError) {
            throw profileError;
        }


        /* -----------------------------------------
           SUCCESS
        ------------------------------------------ */

        showRegistrationMessage(
            "You're pre-registered! Your Apex Games Account is ready.",
            "success"
        );


        registrationForm.reset();


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
