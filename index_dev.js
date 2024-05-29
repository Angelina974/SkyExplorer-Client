/**
 * Entry point of the application while in development.
 * 
 * In development :
 * - KissJS library is loaded dynamically from the local folder, using its non-minified version to ease the debugging
 * - Your custom application scripts and styles are loaded dynamically and must be added to the list below
 * - HTTPs is disabled
 */
kiss
    .loader.loadLibrary({
        libraryPath: "./kissjs"
    })
    .then(() => {
        // Load scripts dynamically
        kiss.loader.loadScripts([
            // KissJS extensions
            "kissjs/client/ux/link/link",

            // VIEWS
            "views/start",
            "views/planes",
            "views/planning",

            // TEMPLATES
            "templates/topbar",
            
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
                "models/view",
                "models/file",
                "models/link",
                "models/trash",
                "models/flight",
                "models/plane"
            ])

            // Load styles dynamically
            kiss.loader.loadStyles([
                // KissJS extensions
                "kissjs/client/ux/link/link",

                // VIEWS
                "views/start",
            ])
        })
    })

window.onload = async function () {
    // Switch http instead of https for local dev
    kiss.session.secure = false
    
    // Start the app
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