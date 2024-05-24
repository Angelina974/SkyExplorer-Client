window.onload = async function () {
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