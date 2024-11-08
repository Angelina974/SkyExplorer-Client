/**
 * Entry point of the final application.
 * 
 * Your application modules must be bundled and minified into a single file (app.min.js)
 */
window.onload = async function () {
    
    // Switch https instead of http for production environment
    kiss.session.secure = true

    // Set the lib language
    kiss.language.current = "fr"

    // Start the app
    app.init
        .logo()
        .host("skyexplorer-server.onrender.com")
        .databaseMode()
        .logger(false)
        .session()
        .router()
        .applicationLoader()

    // Load application scripts dynamically
    await kiss.loader.loadScript("./app.min")

    // Init the KissJS app
    await kiss.app.init()

    // Translate delete message for documents
    kiss.app.defineTexts({
        "#warning delete docs": { 
            fr: "Voulez-vous vraiment supprimer les documents selctionnés ?",
            en: "Do you really want to delete the selected documents ?",
            es: "¿Realmente quieres eliminar los documentos seleccionados ?"
        },
        "delete selected documents": {
            fr: "Supprimer les documents sélectionnés",
            en: "Delete selected documents",
            es: "Eliminar los documentos seleccionados"
        }
    })

    // Remove the splash screen
    $("splash").remove()
};