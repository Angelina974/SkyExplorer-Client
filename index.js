/**
 * Entry point of the final application.
 * 
 * Your application modules must be bundled and minified into a single file (app.min.js)
 */
window.onload = async function () {
    // Load application scripts dynamically
    await kiss.loader.loadScript("./app.min")

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
        debug: false,
        name: "skyexplorer",
        logo: "./resources/img/skyExplorer.svg",
        mode: "online",
        host: "skyexplorer-server.onrender.com",
        https: true,
        loginMethods: ["internal"],
        language: "fr",
        useDirectory: true
    })
};