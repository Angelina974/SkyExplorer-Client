/**
 * Global application namespace
 * 
 * Includes:
 * - application custom initialization methods
 * - application custom tools
 * - application custom API
 * 
 */
const app = {
    /**
     * Main loading method to start up the application in the KissJS context.
     * 
     * This method is called by kiss.app.load:
     * - once at startup
     * - every time the application is not considered "loaded" (kiss.app.isLoaded), for example after a session expired
     * 
     * @returns {boolean} false if the application couldn't load properly, true otherwise
     */
    async load() {
        // Load directory (users & groups)
        const directoryLoaded = await kiss.directory.init()
        if (!directoryLoaded) {
            return false
        }

        // Load links between records
        await app.init.links()

        kiss.app.isLoaded = true
        return true
    },

    /**
     * Group all the application init methods
     * 
     * @namespace
     */
    init: {
        /**
         * Init KissJS application "load" method.
         * 
         * Defines what should be loaded by KissJS each time the application is not considered "loaded".
         * The KissJS application "load" method is called:
         * - once when the KissJS app is starting
         * - each time the KissJS session expires
         */
        applicationLoader() {
            kiss.app.load = async () => await app.load()
            return app.init
        },

        /**
         * Init the application logo
         */
        logo() {
            app.logo = "./resources/img/skyExplorer.svg"
            return app.init
        },

        /**
         * Init the application host:
         * - for the session requests
         * - for the ajax requests
         */
        host() {
            // Session host
            kiss.session.setHost({
                host: "localhost"
            })

            // Ajax host
            const host = kiss.session.getHttpHost()
            kiss.ajax.setHost(host)

            return app.init
        },

        /**
         * Init global mode and database mode
         */
        databaseMode() {
            kiss.global.mode = "online"
            kiss.db.mode = "online"
            return app.init
        },

        /**
         * Init KissJS logger
         */
        logger(debug) {
            let categories = ["😘"]

            if (debug) {
                categories = categories.concat([
                    "*"
                ])
            }

            kiss.logger.init({
                data: true,
                types: [0, 1, 2, 3, 4],
                categories
            })

            return app.init
        },

        /**
         * Init KissJS session parameters
         * 
         * Tell what to do just after the session is initialized, or restored (after a browser refresh)
         * In our case, load the account informations
         */
        session() {
            kiss.session.addHook("afterInit", async () => await app.init.account())
            kiss.session.addHook("afterRestore", async () => await app.init.account())

            // Restrict the login methods to "internal"
            // No time to implement SSO with Google, Facebook, etc.
            kiss.session.setLoginMethods(["internal"])

            return app.init
        },

        /**
         * Init KissJS router parameters.
         * Defines public routes (which doesn't require authentication)
         */
        router() {
            kiss.router.addPublicRoutes([
                "templates-list",
                "form-public",
                "form-view"
            ])

            return app.init
        },

        /**
         * Init the session account by retrieving the record which holds the account data.
         */
        async account() {
            kiss.session.account = await kiss.app.collections.account.findOne(kiss.session.getCurrentAccountId())
        },

        /**
         * Load relations between records
         * 
         * Create the "link" model for NxN relationships.
         * This model holds the links between records.
         * 
         * All the links are stored in a single dedicated collection per account,
         * that's why the link model's name is dynamic, like link_{{accountId}}
         */
        async links() {
            await kiss.app.collections.link.find()
        }
    },

    /**
     * Defines global api
     */
    api: {
        // Just a test:
        goToHome() {
            kiss.router.navigateTo({
                ui: "home-start"
            })
        }
    }
}

;