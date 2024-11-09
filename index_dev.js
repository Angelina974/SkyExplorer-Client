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
    "controllers/global",
    "controllers/planning",
    "controllers/generatePDF",
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
    // Translate delete message for documents
    kiss.app.defineTexts({
        "#warning delete docs": { 
            fr: "Voulez-vous vraiment supprimer les documents sélectionnés ?",
            en: "Do you really want to delete the selected documents ?",
            es: "¿Realmente quieres eliminar los documentos seleccionados ?"
        },
        "delete selected documents": {
            fr: "Supprimer les documents sélectionnés",
            en: "Delete selected documents",
            es: "Eliminar los documentos seleccionados"
        }
    })

    // Start the app
    await kiss.app.init({
        debug: true,
        name: "skyexplorer",
        logo: "./resources/img/skyExplorer.svg",
        mode: "online",
        host: "localhost",
        https: false,
        loginMethods: ["internal"],
        language: "fr",
        useDirectory: true
    })    
};