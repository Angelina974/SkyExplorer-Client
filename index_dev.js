kiss
    .loader.loadLibrary({
        libraryPath: "./kissjs"
    })
    .then(() => {
        // Load scripts dynamically
        kiss.loader.loadScripts([
            // VIEWS
            "views/home/start",

            // TEXTS
            "resources/texts"

        ]).then(() => {

            // Load models & plugins at the last moment because they rely on other libraries (like their renderers)
            kiss.loader.loadScripts([
                // MODELS
                "models/account",
                "models/user",
                "models/group",
                "models/model",
                "models/file",
                "models/link",
                "models/trash",
                "models/flight",
                "models/plane"
            ])

            // Load styles dynamically
            kiss.loader.loadStyles([
                // VIEWS
            ])
        })
    })


window.onload = async function () {
    app.init
        .logo()
        .host()
        .databaseMode()
        .logger(true)
        .session()
        .router()
        .applicationLoader()

    // Init the KissJS app
    await kiss.app.init()

    // Remove the splash screen
    $("splash").remove()
};