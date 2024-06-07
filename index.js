/**
 * Entry point of the final application.
 * 
 * Your application modules must be bundled and minified into a single file (app.min.js)
 */
window.onload = async function () {
    // Set the lib language
    kiss.language.current = "fr"

    // Start the app
    app.init
        .logo()
        .host()
        .databaseMode()
        .logger(false)
        .session()
        .router()
        .applicationLoader()

    // Load application scripts dynamically
    await kiss.loader.loadScript("./app.min")


    // Init the KissJS app
    await kiss.app.init()

    // Remove the splash screen
    $("splash").remove()
};