/**
 * Entry point of the application while in development.
 * 
 * In development :
 * - Your custom application scripts and styles are loaded dynamically and must be added to the list below
 * - HTTPs is disabled
 */

// Load scripts dynamically
kiss.loader.loadScripts([
    
    // KISSJS BUILT-IN MODELS
    "models/account",
    "models/user",
    "models/group",
    "models/model",
    "models/view",
    "models/file",
    "models/link",
    "models/trash",

    // MODELS
    "models/flight",
    "models/plane",
    "models/user",
    "models/invoice",
    "models/formation",
    "models/exercise",
    "models/training",
    "models/question",

    // VIEWS
    "views/start",
    "views/planes",
    "views/planning",
    "views/users",
    "views/invoices",
    "views/training",
    "views/exercises",
    "views/questions",
    "views/login",
    "views/register",

    // TEMPLATES
    "templates/topbar",
    "templates/formButton",

    // CONTROLLERS
    "controllers/planning"
])

// Load styles dynamically
kiss.loader.loadStyles([

    // VIEWS
    "views/start",
    "views/parameters"
])

/**
 * Your application starts here
 */
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