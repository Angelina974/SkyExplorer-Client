kiss.app.defineView({
    id: "exercises",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "exercises-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.exercise,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les exercices sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newExercise = kiss.app.models.exercise.create()
                            await newExercise.save()
                            createForm(newExercise)
                            createDeleteButton(newExercise)
                        },
                        selectRecord: function(record) {
                            createForm(record)
                            createDeleteButton(record)
                        }
                    }
                }
            ]
        })
    }
})

;kiss.app.defineView({
    id: "invoices",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "invoices-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.invoice,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les factures sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newInvoice = kiss.app.models.invoice.create()
                            await newInvoice.save()
                            createForm(newInvoice)
                            createDeleteButton(newInvoice)
                        },
                        selectRecord: function(record) {
                            createForm(record)
                            createDeleteButton(record)
                        }
                    }
                }
            ]
        })
    }
})

;/**
 * Authentication => login
 */
kiss.app.defineView({
    id: "authentication-login",
    renderer: function (id, target) {

        // Define the possible login methods and build connection buttons accordingly
        let loginMethods = kiss.router.getRoute().lm
        if (!loginMethods) loginMethods = kiss.session.getLoginMethods()

        const allLoginButtons = kiss.session.getLoginMethodTypes().slice(1).map(loginMethod => {
            return {
                type: "button",
                alias: loginMethod.alias,
                text: loginMethod.text,
                icon: loginMethod.icon,
                action: async () => {

                    // Some environment (ex: docker) don't allow external auth
                    const serverEnvironment = await kiss.session.getServerEnvironment()
                    if (serverEnvironment == "docker") {
                        return createNotification(txtTitleCase("#feature not available"))
                    }

                    $("login").showLoading({
                        fullscreen: true,
                        spinnerSize: 128
                    })

                    let acceptInvitationOf = kiss.context.acceptInvitationOf || ''
                    if (acceptInvitationOf) acceptInvitationOf = '?acceptInvitationOf=' + acceptInvitationOf

                    document.location = loginMethod.callback + acceptInvitationOf
                }
            }
        })

        const loginButtons = Array.from(loginMethods).map(loginMethodAlias => allLoginButtons.find(button => button.alias == loginMethodAlias))
        const hasInternalLogin = loginMethods.includes("i")
        const hasExternalLogin = loginMethods.includes("g")

        // Default login infos (useful for test mode)
        const username = kiss.router.getRoute().username
        const password = kiss.router.getRoute().password

        // Get the required redirection after login, if any, or points to the default home page
        const redirectTo = kiss.context.redirectTo || {
            ui: kiss.session.defaultViews.home
        }
        delete kiss.context.redirectTo

        /**
         * Generates the panel containing the login infos
         */
        return createBlock({
            id,
            target,

            items: [
                // Fullscreen background with cover image
                {
                    id: "login-page",
                    fullscreen: true,
                    layout: "horizontal",
                    overflow: "auto",

                    items: [
                        // White color + logo
                        {
                            flex: 1,
                            background: "white"
                        },
                        // Blue color
                        {
                            flex: 1,
                            background: "var(--skyexplorer-color)",
                        }
                    ]
                },

                // Logo and login window
                {
                    items: [
                        // Logo
                        {
                            hidden: !app.logo,
                            position: "absolute",
                            top: "calc(50% - 75px)",
                            left: "calc(25% - 175px)",
                            
                            type: "image",
                            src: app.logo,
                            alt: "Logo",

                        },
                        {
                            id: "login",
                            type: "panel",
                            icon: "fas fa-key",
                            title: "Identifiez-vous",
                            headerBackgroundColor: "var(--skyexplorer-color)",
                            draggable: true,
                            

                            width: 800,
                            maxHeight: () => kiss.screen.current.height,
                            
                            align: "center",
                            verticalAlign: "center",
                            layout: "horizontal",
                            overflowY: "auto",

                            // Language buttons
                            // headerButtons: kiss.templates.authLanguageButtons(),

                            items: [
                                // LOCAL LOGIN METHOD
                                {
                                    hidden: !hasInternalLogin,

                                    flex: 1,
                                    class: "auth-block",
                                    overflow: "hidden",

                                    defaultConfig: {
                                        width: "100%",
                                        fieldWidth: "100%",
                                        labelPosition: "top",
                                        padding: 0
                                    },

                                    items: [
                                        // EMAIL
                                        {
                                            type: "text",
                                            id: "username",
                                            label: txtTitleCase("email"),
                                            required: true,
                                            validationType: "email",
                                            value: username
                                        },
                                        // PASSWORD
                                        {
                                            type: "password",
                                            id: "password",
                                            label: txtTitleCase("password"),
                                            value: password,
                                            events: {
                                                keydown: (event) => {
                                                    if (event.key == "Enter") {
                                                        $("login").login()
                                                    }
                                                }
                                            }
                                        },
                                        // LOGIN button
                                        {
                                            type: "button",
                                            icon: "fa fa-check",
                                            text: txtTitleCase("login"),
                                            iconColor: "#00aaee",
                                            height: 40,
                                            margin: "20px 0",
                                            events: {
                                                click: () => $("login").login()
                                            }
                                        },
                                        // LINK TO PASSWORD RESET
                                        {
                                            type: "html",
                                            html: `
                                            <div class="auth-reset-password">${txtTitleCase("forgot password?")}</div>
                                        `,
                                            events: {
                                                click: () => $("login").requestPasswordReset()
                                            }
                                        },                                        
                                        // LINK TO REGISTER PAGE
                                        {
                                            hidden: kiss.screen.isMobile,
                                            type: "html",
                                            html: `
                                            <div class="auth-create-account">${txtTitleCase("#no account")}</div>
                                        `,
                                            events: {
                                                click: () => kiss.router.navigateTo({
                                                    ui: "authentication-register",
                                                    lm: loginMethods
                                                }, true)
                                            }
                                        }
                                    ]
                                },

                                // Separation between login methods
                                {
                                    hidden: !hasInternalLogin || !hasExternalLogin,

                                    id: "auth-login-separator",
                                    class: "auth-separator",

                                    layout: "vertical",
                                    items: [{
                                            type: "spacer",
                                            flex: 1
                                        },
                                        {
                                            type: "html",
                                            class: "auth-separator-text",
                                            html: txtUpperCase("or")
                                        },
                                        {
                                            type: "spacer",
                                            flex: 1
                                        }
                                    ]
                                },

                                // OTHER LOGIN METHODS
                                {
                                    hidden: !hasExternalLogin,
                                    id: "auth-login-external",
                                    flex: 1,
                                    class: "auth-block",
                                    layout: "vertical",
                                    justifyContent: "center",

                                    defaultConfig: {
                                        margin: "5px",
                                        colorHover: "#00aaee",
                                        backgroundColorHover: "#ffffff",
                                        iconSize: "20px",
                                        iconColorHover: "#00aaee",
                                        height: 40
                                    },

                                    items: loginButtons.concat({
                                        hidden: hasInternalLogin,
                                        type: "html",
                                        html: `<div class="auth-create-account">${txtTitleCase("#no account")}</div>`,
                                        events: {
                                            click: () => kiss.router.navigateTo({
                                                ui: "authentication-register",
                                                lm: loginMethods
                                            }, true)
                                        }
                                    })
                                }
                            ],

                            methods: {
                                async load() {
                                    // Check if a token was returned from a 3rd party service (Microsoft, Google, ...)
                                    // If yes, update the session with the token before routing
                                    const token = kiss.router.getRoute().token
                                    if (token) {
                                        this.hide()
                                        const success = await kiss.session.login({
                                            token: token
                                        })

                                        if (success) {
                                            await kiss.router.navigateTo(redirectTo, true)
                                        } else {
                                            $("login").setAnimation("shakeX")
                                        }
                                    } else {

                                        // Responsiveness
                                        this.adjustToScreen()
                                    }
                                },

                                /**
                                 * Try to login
                                 */
                                async login() {
                                    const fieldUsername = $("username")
                                    const fieldPassword = $("password")

                                    if (fieldUsername.isValid && fieldPassword.isValid) {
                                        const success = await kiss.session.login({
                                            username: fieldUsername.getValue(),
                                            password: fieldPassword.getValue()
                                        })

                                        if (success) {
                                            await kiss.router.navigateTo(redirectTo, true)
                                        } else {
                                            $("login").setAnimation("shakeX")
                                        }
                                    } else {
                                        $("login").setAnimation("shakeX")
                                    }
                                },

                                /**
                                 * Send a request to reset the password
                                 */
                                async requestPasswordReset() {
                                    const fieldUsername = $("username")
                                    if (!fieldUsername.isValid) {
                                        createNotification(txtTitleCase("#email missing"))
                                        return
                                    }

                                    await kiss.ajax.request({
                                        url: "/requestPasswordReset",
                                        method: "post",
                                        showLoading: true,
                                        body: JSON.stringify({
                                            username: fieldUsername.getValue(),
                                            language: kiss.language.current
                                        })
                                    })

                                    createDialog({
                                        type: "message",
                                        message: txtTitleCase("#password reset request")
                                    })
                                },

                                /**
                                 * Adjust layout to screen size
                                 */
                                adjustToScreen() {
                                    if (!$("authentication-login")) return

                                    if (kiss.screen.isVertical()) {
                                        // $("common-matrix").hide()
                                        $("login").config.width = "380px"
                                        $("panel-body-login").style.flexFlow = "column"
                                        $("auth-login-separator").style.flexFlow = "row"
                                    } else {
                                        // $("common-matrix").show()
                                        $("login").config.width = "760px"    
                                        $("panel-body-login").style.flexFlow = "row"
                                        $("auth-login-separator").style.flexFlow = "column"
                                    }
                                    
                                    if (kiss.screen.isMobile) {
                                        $("login").config.width = "95%" 
                                    }
                                }
                            },

                            // Responsiveness
                            subscriptions: {
                                EVT_WINDOW_RESIZED: function () {
                                    this.adjustToScreen()
                                }
                            }
                        }
                    ]
                }
            ]
        })
    }
})

;kiss.app.defineView({
    id: "planes",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "planes-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: true,
                    createRecordText: "Ajouter un nouvel avion à la flotte",
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.plane,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les avions sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newPlane = kiss.app.models.plane.create()
                            await newPlane.save()
                            createForm(newPlane)
                            createDeleteButton(newPlane)
                        },
                        selectRecord: function(record) {
                            createForm(record)
                            createDeleteButton(record)
                        }
                    }
                }
            ]
        })
    }
})

;kiss.app.defineView({
    id: "planning",
    renderer: function(id, target) {

        // Restrict the columns to the ones we want to display
        let visibleColumns = ["time", "client", "type", "duration", "planeId"]
        let columns = kiss.app.models.flight.getFieldsAsColumns()
        columns.forEach(column => {
            column.hidden = !visibleColumns.includes(column.id)
        })

        return createBlock({
            id, 
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    type: "calendar",
                    color: "var(--buttons-color)",

                    // Calendar options
                    period: "1 week + details",
                    startOnMonday: true,
                    showWeekend: true,
                    canCreateRecord: true,
                    createRecordText: "RESERVER UN NOUVEAU VOL",
                    height: () => kiss.screen.current.height - 60,
                    
                    // Collection and columns (= fields) to display
                    collection: kiss.app.collections.flight,
                    columns,

                    // Defines what happens when:
                    methods: {
                        // - the user clicks on the "Create" button at the top left
                        createRecord: async function() {
                            const newFlight = kiss.app.models.flight.create()
                            await newFlight.save()
                            createForm(newFlight)
                            createDeleteButton(newFlight)
                        },
                        // - the user clicks on a flight in the calendar
                        selectRecord: function(record) {
                            createForm(record)
                            createDeleteButton(record)
                        }
                    }
                }
            ],
            methods: {
                async load() {
                    if (kiss.app.collections["onlyExercises"]) return

                    const filteredCollection = new kiss.data.Collection({
                        id: "onlyExercises",
                        model: kiss.app.models["training"],
                        isMaster: false,
                        filterSyntax: "mongo",
                        filter: {
                            type: "Exercice en vol"
                        }
                    })

                    filteredCollection.filterBy({
                        type: "Exercice en vol"
                    })
                }
            }
        })
    }
})

;kiss.app.defineView({
    id: "questions",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "questions-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: true,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.question,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les questions sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newQuestion = kiss.app.models.question.create()
                            await newQuestion.save()
                            createForm(newQuestion)
                            createDeleteButton(newQuestion)
                        },
                        selectRecord: function(record) {
                            createForm(record)
                            createDeleteButton(record)
                        }
                    }
                }
            ]
        })
    }
})

;/**
 * Authentication => registration process
 */
kiss.app.defineView({
    id: "authentication-register",
    renderer: function (id, target) {
        // Grab parameters sent through URL
        const userEmail = kiss.router.getRoute().email
        const pendingUserId = kiss.router.getRoute().userId

        // Define the possible login methods and build registration buttons accordingly
        let loginMethods = kiss.router.getRoute().lm
        if (!loginMethods) loginMethods = kiss.session.getLoginMethods()

        const allLoginButtons = kiss.session.getLoginMethodTypes().slice(1).map(loginMethod => {
            return {
                type: "button",
                alias: loginMethod.alias,
                text: loginMethod.text,
                icon: loginMethod.icon,
                action: async () => {

                    // Some environment (ex: docker) don't allow external registration
                    const serverEnvironment = await kiss.session.getServerEnvironment()
                    if (serverEnvironment == "docker") {
                        return createNotification(txtTitleCase("#feature not available"))
                    }

                    document.location = loginMethod.callback
                }
            }
        })

        const loginButtons = Array.from(loginMethods).map(loginMethodAlias => allLoginButtons.find(button => button.alias == loginMethodAlias))
        const hasInternalLogin = loginMethods.includes("i")
        const hasExternalLogin = loginMethods.includes("g")

        /**
         * Show a welcome popup once the registration is complete
         */
        const showWelcome = () => {
            $("register").hide()

            createPanel({
                type: "panel",
                title: txtUpperCase("welcome onboard"),
                icon: "fas fa-handshake",
                headerBackgroundColor: "var(--background-blue)",
                position: "absolute",
                top: () => ((window.innerHeight - 128) / 2) + "px",
                width: () => Math.min(window.innerWidth - 100, 600),
                align: "center",

                items: [{
                    type: "html",
                    html: "<center>" + txtTitleCase("#thanks for registration") + "</center>",
                    padding: "32px"
                }]
            }).render()
        }

        /**
         * Generates the panel containing the login infos
         */
        return createBlock({
            id,
            target,

            items: [
                // Fullscreen background with cover image
                {
                    id: "register-page",
                    fullscreen: true,
                    layout: "horizontal",
                    overflow: "auto",

                    items: [
                        // White color + logo
                        {
                            flex: 1,
                            background: "white"
                        },
                        // Blue color
                        {
                            id: "welcome-image",
                            flex: 1,
                            background: "var(--skyexplorer-color)",
                        }
                    ]
                },

                // Logo and register window
                {
                    margin: "0px 0px 200px 0px",

                    items: [
                        // Logo
                        {
                            hidden: !app.logo,
                            position: "absolute",
                            top: "calc(50% - 75px)",
                            left: "calc(25% - 175px)",

                            type: "image",
                            src: app.logo,
                            alt: "Logo"
                        },
                        {
                            id: "register",
                            type: "panel",
                            icon: "fas fa-key",
                            title: "Enregistez-vous",
                            headerBackgroundColor: "var(--skyexplorer-color)",
                            draggable: true,

                            width: 800,
                            align: "center",
                            verticalAlign: "center",
                            layout: "horizontal",

                            // Language buttons
                            // headerButtons: kiss.templates.authLanguageButtons(),

                            items: [
                                // LOCAL REGISTRATION METHOD
                                {
                                    hidden: !hasInternalLogin,

                                    flex: 1,
                                    class: "auth-block",

                                    defaultConfig: {
                                        width: "100%",
                                        fieldWidth: "100%",
                                        labelPosition: "top",
                                        padding: "2px 0"
                                    },

                                    items: [
                                        // FIRST NAME
                                        {
                                            type: "text",
                                            id: "firstName",
                                            placeholder: txtTitleCase("first name"),
                                            required: true
                                        },
                                        // LAST NAME
                                        {
                                            type: "text",
                                            id: "lastName",
                                            placeholder: txtTitleCase("last name"),
                                            required: true
                                        },
                                        // COMPANY
                                        {
                                            hidden: (pendingUserId) ? true : false,
                                            type: "text",
                                            id: "company",
                                            placeholder: txtTitleCase("company")
                                        },
                                        // TELEPHONE
                                        {
                                            hidden: (pendingUserId) ? true : false,
                                            type: "text",
                                            id: "telephone",
                                            placeholder: txtTitleCase("telephone")
                                        },
                                        // EMAIL
                                        {
                                            type: "text",
                                            id: "email",
                                            placeholder: txtTitleCase("email"),
                                            required: true,
                                            validationType: "email",
                                            value: userEmail
                                        },
                                        // PASSWORD
                                        {
                                            type: "password",
                                            id: "password",
                                            placeholder: txtTitleCase("password"),
                                            required: true
                                        },
                                        // PASSWORD CONFIRMATION
                                        {
                                            type: "password",
                                            id: "passwordConfirmation",
                                            placeholder: txtTitleCase("password confirmation"),
                                            required: true
                                        },
                                        // BUTTONS
                                        {
                                            layout: "horizontal",
                                            margin: "20px 0px 0px 0px",
                                            items: [
                                                // REGISTER button
                                                {
                                                    type: "button",
                                                    icon: "fa fa-check",
                                                    text: txtTitleCase("register"),
                                                    iconColor: "#00aaee",
                                                    flex: 1,
                                                    height: 40,
                                                    events: {
                                                        click: async function () {
                                                            let fieldFirstName = $("firstName")
                                                            let fieldLastName = $("lastName")
                                                            let fieldEmail = $("email")
                                                            let fieldPassword = $("password")
                                                            let fieldPasswordConfirmation = $("passwordConfirmation")

                                                            fieldFirstName.validate()
                                                            fieldLastName.validate()
                                                            fieldEmail.validate()
                                                            fieldPassword.validate()
                                                            fieldPasswordConfirmation.validate()

                                                            if (fieldFirstName.isValid && fieldLastName.isValid && fieldEmail.isValid && fieldPassword.isValid && fieldPasswordConfirmation.isValid) {
                                                                let firstName = fieldFirstName.getValue()
                                                                let lastName = fieldLastName.getValue()
                                                                let email = fieldEmail.getValue()
                                                                let password = fieldPassword.getValue()
                                                                let passwordConfirmation = fieldPasswordConfirmation.getValue()

                                                                if (password != passwordConfirmation) {
                                                                    createNotification(txtTitleCase("#password don't match"))
                                                                    return $("register").setAnimation("shakeX")
                                                                }

                                                                kiss.ajax.request({
                                                                        url: "/register",
                                                                        method: "post",
                                                                        body: JSON.stringify({
                                                                            userId: pendingUserId,
                                                                            firstName: firstName,
                                                                            lastName: lastName,
                                                                            language: kiss.language.current,
                                                                            email: email,
                                                                            password: password,
                                                                            passwordConfirmation: passwordConfirmation
                                                                        })
                                                                    })
                                                                    .then(response => {
                                                                        if (response.error) {
                                                                            $("register").setAnimation("shakeX")

                                                                            // Beta closed!
                                                                            if (response.error == "#beta closed") {
                                                                                createDialog({
                                                                                    title: "Beta test is closed",
                                                                                    message: response.msg,
                                                                                    noCancel: true
                                                                                })
                                                                            }
                                                                        } else {
                                                                            // Jump to welcome page
                                                                            showWelcome()
                                                                        }
                                                                    }).catch(err => {
                                                                        $("register").setAnimation("shakeX")
                                                                    })
                                                            } else {
                                                                $("register").setAnimation("shakeX")
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        // LINK TO LOGIN PAGE
                                        {
                                            type: "html",
                                            html: `
                                            <div class="auth-create-account">${txtTitleCase("#already an account")}</div>
                                        `,
                                            events: {
                                                click: () => kiss.router.navigateTo({
                                                    ui: "authentication-login",
                                                    lm: loginMethods
                                                }, true)
                                            }
                                        }
                                    ]
                                },

                                // Separation between registration methods
                                {
                                    hidden: !hasInternalLogin || !hasExternalLogin,

                                    id: "auth-separator",
                                    class: "auth-separator",

                                    layout: "vertical",
                                    items: [{
                                            type: "spacer",
                                            flex: 1
                                        },
                                        {
                                            type: "html",
                                            class: "auth-separator-text",
                                            html: txtUpperCase("or")
                                        },
                                        {
                                            type: "spacer",
                                            flex: 1
                                        }
                                    ]
                                },

                                // OTHER REGISTRATION METHODS
                                {
                                    hidden: !hasExternalLogin,
                                    flex: 1,
                                    class: "auth-block",
                                    layout: "vertical",
                                    justifyContent: "center",

                                    defaultConfig: {
                                        margin: "5px",
                                        colorHover: "#00aaee",
                                        backgroundColorHover: "#ffffff",
                                        iconSize: "20px",
                                        iconColorHover: "#00aaee",
                                        height: 40
                                    },

                                    items: loginButtons.concat({
                                        hidden: hasInternalLogin,
                                        type: "html",
                                        html: `<div class="auth-create-account">${txtTitleCase("#already an account")}</div>`,
                                        events: {
                                            click: () => kiss.router.navigateTo({
                                                ui: "authentication-login",
                                                lm: loginMethods
                                            }, true)
                                        }
                                    })
                                }
                            ],

                            methods: {
                                load: function () {
                                    this.adjustToScreen()
                                },

                                /**
                                 * Adjust layout to screen size
                                 */
                                adjustToScreen: () => {
                                    if (kiss.context.ui != "authentication-register") return

                                    if (kiss.screen.isVertical()) {
                                        $("welcome-image").hide()
                                        $("register").config.width = (kiss.screen.isMobile) ? "320px" : "380px"
                                        $("panel-body-register").style.flexFlow = "column"
                                        $("auth-separator").style.flexFlow = "row"
                                    } else {
                                        $("welcome-image").show()
                                        $("register").config.width = "760px"
                                        $("panel-body-register").style.flexFlow = "row"
                                        $("auth-separator").style.flexFlow = "column"
                                    }
                                }
                            },

                            // Responsiveness
                            subscriptions: {
                                EVT_WINDOW_RESIZED: function () {
                                    this.adjustToScreen()
                                }
                            }
                        }
                    ]
                }

            ]
        })
    }
})

;/**
 * Home start.
 * This is the entry point of pickaform.
 */
kiss.app.defineView({
    id: "home-start",
    renderer: function (id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "horizontal",
            items: [
                {
                    class: "home-left",
                    type: "html",
                    width: "50%",
                    html: `<img src="./resources/img/skyExplorer.svg">`
                },
                {
                    layout: "vertical",
                    background: "#000055",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    defaultConfig: {
                        iconSize: 22,
                        iconColor: "var(--buttons-color)",
                        height: 50,
                        width: 300,
                        margin: 20,
                        borderRadius: "var(--panel-border-radius)",
                        fontSize: 16,
                        boxShadow: "none",
                        boxShadowHover: "0 0 20px #0077c8"
                    },
                    items: [
                        {
                            type: "button",
                            icon: "fas fa-clipboard",
                            text: "Voir le planning des vols",
                            action: () => kiss.router.navigateTo("planning")
                        },
                        {
                            type: "button",
                            icon: "fas fa-chart-line",
                            text: "Ma progression (exercices)",
                            action: () => kiss.router.navigateTo({
                                ui: "exercises",
                                modelId: "exercise",
                                viewId: "exercises-list"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-dollar-sign",
                            text: "Factures",
                            action: () => kiss.router.navigateTo({
                                ui: "invoices",
                                modelId: "invoice",
                                viewId: "invoices-list"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-user-graduate",
                            text: "Gérer le plan de formation",
                            action: () => kiss.router.navigateTo({
                                ui: "training",
                                modelId: "training",
                                viewId: "training-list"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-fighter-jet",
                            text: "Suivi des avions",
                            action: () => kiss.router.navigateTo({
                                ui: "planes",
                                modelId: "plane",
                                viewId: "planes-list"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-users",
                            text: "Gestion des utilisateurs",
                            action: () => kiss.router.navigateTo({
                                ui: "users",
                                modelId: "user",
                                viewId: "users-list"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-question",
                            text: "Questions & Réponses",
                            action: () => kiss.router.navigateTo({
                                ui: "questions",
                                modelId: "question",
                                viewId: "questions-list"
                            })
                        },                                             
                        {
                            type: "button",
                            icon: "fas fa-power-off",
                            text: "Se déconnecter",
                            action: () => kiss.session.logout()
                        }
                    ]
                }
            ]
        })
    }
})

;kiss.app.defineView({
    id: "training",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "training-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: true,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.training,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les formations sélectionnées"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newTraining = kiss.app.models.training.create()
                            await newTraining.save()
                            createForm(newTraining)
                            createDeleteButton(newTraining)
                            
                        },
                        selectRecord: function(record) {
                            createForm(record)
                            createDeleteButton(record)
                        }
                    }
                }
            ]
        })
    }
})

;kiss.app.defineView({
    id: "users",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "users-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: false,
                    canCreateRecord: false,
                    canSelect: false,
                    showAction: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.user,

                    methods: {
                        selectRecord: function(record) {
                            createForm(record)
                        }
                    }
                }
            ]
        })
    }
})

;kiss.app.defineModel({
    id: "account",
    name: "Account",
    namePlural: "Accounts",
    icon: "fas fa-home",
    color: "#00aaee",

    items: [{
            primary: true,
            id: "owner",
            dataType: String
        },
        {
            isACL: true,
            id: "managers",
            dataType: Array
        },
        {
            id: "planId",
            dataType: String
        },
        {
            id: "planUsers",
            dataType: String
        },
        {
            id: "planApps",
            dataType: String
        },
        {
            id: "stripeCustomerId",
            dataType: String
        },
        {
            id: "stripeSubscriptionId",
            dataType: String
        },
        {
            id: "periodStart",
            dataType: String
        },
        {
            id: "periodEnd",
            dataType: String
        },
        {
            id: "status",
            dataType: String
        },
        {
            id: "createdAt",
            dataType: String
        },
        {
            id: "collaborators",
            dataType: Array
        },
        {
            id: "invited",
            dataType: Array
        },
        {
            id: "smtp",
            dataType: Object
        }
    ],

    acl: {
        permissions: {
            create: [{
                isCreator: true
            }],
            update: [{
                isSupportTeam: true
            }],
            delete: [{
                isDeleter: true
            }]
        },

        validators: {
            async isCreator() {
                return false
            },
            
            async isSupportTeam({req, record}) {
                const userId = (kiss.isServer) ? req.token.userId : kiss.session.getUserId()
                if (userId.split("@")[1] === "pickaform.com") return true
                return false
            },

            async isDeleter() {
                return false
            }
        }
    }
})

;kiss.app.defineModel({
    id: "exercise",
    name: "Exercice",
    icon: "fas fa-clipboard",
    color: "#000055",

    items: [
        // Flight date
        {
            id: "flightDate",
            type: "lookup",
            label: "Date du vol",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "date",
                type: "date"
            }
        },
        // Block client & instructeur
        {
            title: "test",
            layout: "horizontal",

            defaultConfig: {
                width: "50%",
                labelWidth: "100%",
                fieldWidth: "100%",
                labelPosition: "top"
            },

            items: [
                // Client
                {
                    id: "client",
                    type: "lookup",
                    label: "Elève pilote",
                    computed: true,
                    lookup: {
                        linkId: "flight",
                        fieldId: "client"
                    }
                },
                // Instructor
                {
                    id: "instructor",
                    type: "lookup",
                    label: "Instructeur",
                    computed: true,
                    lookup: {
                        linkId: "flight",
                        fieldId: "instructor"
                    }
                }
            ],
        },
        // Field to pick a training subject and get other fields
        {
            id: "subject",
            type: "selectViewColumns",
            label: "Sujet",
            collectionId: "onlyExercises",
            fieldId: ["subject", "category", "subcategory"]
        },
        // Block category & subcategory
        {
            title: "test",
            layout: "horizontal",

            defaultConfig: {
                width: "50%",
                labelWidth: "100%",
                fieldWidth: "100%",
                labelPosition: "top"
            },

            items: [
                // Category
                {
                    id: "category",
                    type: "text",
                    label: "Catégorie"
                },
                // Subcategory
                {
                    id: "subcategory",
                    type: "text",
                    label: "Sous-catégorie"
                }
            ]
        },
        // Rate
        {
            id: "note",
            type: "rating",
            label: "Note",
            max: 5
        },
        // Link the flight
        {
            id: "flight",
            type: "link",
            label: "Vol",
            multiple: false,
            link: {
                modelId: "flight",
                fieldId: "exercises"
            }
        }
    ],

    acl: {
        permissions: {
            read: [{
                isMyFlight: true
            }]
        },

        validators: {
            async isMyFlight({
                record,
                req
            }) {
                const userId = (kiss.isServer) ? req.token.userId : kiss.session.getUserId()
                return record.client == userId
            }
        }
    }
})

;/**
 * A "file" record stores informations about file attachments
 */
kiss.app.defineModel({
    id: "file",
    splitBy: "account",
    
    name: "File",
    namePlural: "Files",
    icon: "fas fa-file",
    color: "#00aaee",

    items: [
        {
            id: "accountId",
            dataType: String
        },
        {
            id: "userId",
            dataType: String
        },
        {
            id: "type", // local, amazon_s3
            dataType: String
        },
        {
            id: "path",
            dataType: String
        },
        {
            id: "downloadPath",
            dataType: String
        },
        {
            id: "name",
            dataType: String
        },
        {
            id: "size",
            dataType: Boolean
        },
        {
            id: "fieldname",
            dataType: String
        },
        {
            id: "originalname",
            dataType: String
        },
        {
            id: "encoding",
            dataType: String
        },
        {
            id: "mimeType",
            dataType: String
        },
	    {
			id: 'accessReaders',
		    dataType: Array
	    },
        {
            id: "destination",
            dataType: String
        }
    ]    
})

;kiss.app.defineModel({
    id: "flight",
    name: "Vol",
    namePlural: "Vols",
    icon: "fas fa-clipboard",
    color: "var(--buttons-color)",

    items: [
        // Section avec les informations sur le vol
        {
            type: "panel",
            title: "Informations sur le vol",
            icon: "fas fa-clipboard",
            collapsible: true,

            defaultConfig: {
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
            },

            items: [
                {
                    id: "flightId",
                    type: "text",
                    label: "Identifiant du vol",
                    value: "unid"
                },
                {
                    id: "date",
                    type: "date",
                    label: "Date du vol",
                    value: "today"
                },
                {
                    id: "time",
                    type: "select",
                    label: "Heure du vol",
                    template: "time",
                    min: 7,
                    max: 19,
                    interval: 60
                },
                {
                    id: "client",
                    type: "directory",
                    label: "Pilote"
                },
                {
                    id: "instructor",
                    type: "directory",
                    label: "Instructeur"
                },        
                {
                    id: "type",
                    type: "select",
                    label: "Type de vol",
                    options: [
                        {
                            label: "Formation",
                            value: "Formation",
                            color: "#00aaee"
                        },
                        {
                            label: "Loisir",
                            value: "Loisir",
                            color: "#ee3333"
                        }
                    ]
                },
                {
                    id: "description",
                    type: "text",
                    label: "Description du vol"
                },
                {
                    id: "duration",
                    type: "number",
                    unit: "mn",
                    label: "Durée du vol"
                }
            ]
        },

        // Section avec les informations sur l'avion
        {
            type: "panel",
            title: "Informations sur l'avion",
            icon: "fas fa-fighter-jet",

            defaultConfig: {
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
            },

            items: [
                {
                    id: "plane",
                    type: "link",
                    label: "Avion",
                    canCreateRecord: true,
                    canDeleteLinks: true,
                    canLinkRecords: false,
                    multiple: false,
                    link: {
                        modelId: "plane",
                        fieldId: "flights"
                    }
                },
                {
                    id: "planeId",
                    type: "lookup",
                    label: "Immatriculation",
                    computed: true,
                    lookup: {
                        linkId: "plane",
                        fieldId: "planeId"
                    }
                },        
                {
                    id: "planeBrand",
                    type: "lookup",
                    label: "Marque d'avion",
                    computed: true,
                    lookup: {
                        linkId: "plane",
                        fieldId: "planeBrand"
                    }
                },
                {
                    id: "planeType",
                    type: "lookup",
                    label: "Type d'avion",
                    computed: true,
                    lookup: {
                        linkId: "plane",
                        fieldId: "planeType"
                    }
                },
                {
                    id: "hourPrice",
                    type: "lookup",
                    label: "Tarif horaire",
                    unit: "€HT/h",
                    computed: true,
                    lookup: {
                        linkId: "plane",
                        fieldId: "hourPrice",
                        type: "number"
                    }
                }
            ]
        },
        // Section pour les exercices en vol
        {
            type: "panel",
            title: "Exercices en vol",
            icon: "fas fa-check",
            collapsible: true,

            defaultConfig: {
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
            },

            items: [
                {
                    id: "exercises",
                    type: "link",
                    label: "Exercices effectués",
                    multiple: true,
                    canLinkRecord: false,
                    canDeleteLinks: true,
                    link: {
                        modelId: "exercise",
                        fieldId: "flight"
                    }
                }
            ]
        },
        // Section avec les informations sur la facturation
        {
            type: "panel",
            title: "Facturation",
            icon: "fas fa-dollar-sign",
            collapsible: true,

            defaultConfig: {
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
            },

            items: [
                {
                    id: "totalPrice",
                    type: "number",
                    unit: "€HT",
                    label: "Prix total du vol",
                    computed: true,
                    formula: "ROUND ( {{Tarif horaire}} * {{Durée du vol}} / 60, 2 )"
                },
                {
                    id: "invoice",
                    type: "link",
                    label: "Facture",
                    canCreateRecord: true,
                    canDeleteLinks: true,
                    canLinkRecord: false,
                    multiple: false,
                    link: {
                        modelId: "invoice",
                        fieldId: "flight"
                    }
                }
            ]
        }
    ]
})

;kiss.app.defineModel({
    id: "formation",
    name: "Nouveau",
    icon: "fas fa-fighter-jet",
    color: "var(--buttons-color)",

    items: [{
            id: "Phases",
            type: "text",
            label: "Phases"
        },
        {
            id: "Competences",
            type: "text",
            label: "Compétences"
        },
        {
            id: "subject",
            type: "text",
            label: "Sujets"
        }, {
            id: "exercice",
            type: "link",
            label: "exercice",
            canCreateRecord: true,
            canDeleteLinks: true,
            canLinkRecords: false,
            multiple: false,
            link: {
                modelId: "exercices",
                fieldId: "formation"
            }
        }
    ]
})

;kiss.app.defineModel({
    id: "group",
    name: "Group",
    namePlural: "Groups",
    icon: "fas fa-users",
    color: "#00aaee",

    items: [{
            id: "name",
            dataType: String
        },
        {
            id: "description",
            dataType: String
        },
        {
            id: "icon",
            dataType: String
        },
        {
            id: "color",
            dataType: String
        },
        {
            id: "users",
            dataType: [String],
            isACL: true
        }
    ],

    acl: {
        permissions: {
            create: [{
                    isOwner: true
                },
                {
                    isManager: true
                }
            ],
            update: [{
                    isOwner: true
                },
                {
                    isManager: true
                }
            ],
            delete: [{
                    isOwner: true
                },
                {
                    isManager: true
                }
            ]
        },

        validators: {
            async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            },

            async isManager({
                req
            }) {
                return (kiss.isServer) ? req.token.isManager : kiss.session.isAccountManager()
            }
        }
    }
})

;kiss.app.defineModel({
    id: "invoice",
    name: "Facture",
    namePlural: "Factures",
    icon: "fas fa-check-circle",
    color: "#9700ee",

    items: [
        {
            id: "invoiceId",
            type: "text",
            label: "Référence",
            value: "unid"
        },
        {
            id: "date",
            type: "date",
            label: "Date de la facture",
            value: "today"
        },
        // Liaison avec le modèle flight avec un champ "link"
        {
            id: "flight",
            type: "link",
            label: "Vol",
            canCreateRecord: false,
            canDeleteLinks: true,
            canLinkRecord: true,
            multiple: false,
            link: {
                modelId: "flight",
                fieldId: "invoice"
            }
        },
        // Récupération des informations du vol avec des champs "lookup"
        // - ID du vol
        {
            id: "flightId",
            type: "lookup",
            label: "ID du vol",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "flightId",
                type: "text"
            }
        },
        // - ID de l'avion
        {
            id: "flightPlaneId",
            type: "lookup",
            label: "Avion",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "planeId",
                type: "text"
            }
        },
        // - Date du vol
        {
            id: "flightDate",
            type: "lookup",
            label: "Date du vol",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "date",
                type: "date"
            }
        },
        // - Type du vol
        {
            id: "flightType",
            type: "lookup",
            label: "Type du vol",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "type",
                type: "select"
            }
        },
        // - Durée du vol
        {
            id: "flightDuration",
            type: "lookup",
            label: "Durée du vol",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "duration",
                type: "number"
            }
        },                    
        // - Client
        {
            id: "client",
            type: "lookup",
            label: "Client",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "client",
                type: "text"
            }
        },
        // - Prix du vol
        {
            id: "totalPrice",
            type: "lookup",
            label: "Montant de la facture",
            unit: "€HT/h",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "totalPrice",
                type: "number"
            }
        }
    ]
})

;/**
 * A "link" record connects 2 records X and Y together, and they are structured like:
 * {
 *      mX: ..., // m: model id of record X
 *      rX: ..., // r: record id of record X
 *      fX: ..., // f: field id for record X
 *      mY: ...,
 *      rY: ...,
 *      fY: ...
 * }
 */
kiss.app.defineModel({
    id: "link",
    // splitBy: "account",

    name: "Link",
    namePlural: "Links",
    icon: "fas fa-link",
    color: "#00aaee",

    items: [
        {
            id: "mX",
            dataType: String
        },
        {
            id: "rX",
            dataType: String
        },
        {
            id: "fX",
            dataType: String
        },
        {
            id: "mY",
            dataType: String
        },
        {
            id: "rY",
            dataType: String
        },
        {
            id: "fY",
            dataType: String
        },
        {
            id: "auto",
            dataType: Boolean
        }
    ],

    acl: {
        permissions: {
            create: [
                {isCreator: true}
            ],
            update: [
                {isUpdater: true}
            ],
            delete: [
                {isDeleter: true}
            ]
        },

        /**
         * Note: creating or deleting a link is like performing an update on the linked record.
         * So, to allow the creation or deletion of a link, we check if the user is allowed to update the linked record.
         * We only check the record which is on the left side (mX / rX) of the link, because we assume the rights should be symetrical.
         */
        validators: {
            async isCreator({userACL, req, model, record}) {
                if (kiss.isServer) {
                    if (Array.isArray(req.body)) {
                        // insertMany links
                        req.path_0 = req.body[0].mX
                        req.path_1 = req.body[0].rX
                    }
                    else {
                        // insertOne link
                        req.path_0 = req.body.mX
                        req.path_1 = req.body.rX
                    }
                    return await kiss.acl.check({action: "update", req})
                }
                else {
                    const modelId = record.mX
                    const recordId = record.rX
                    const linkedRecord = await kiss.app.collections[modelId].findOne(recordId)
                    return await kiss.acl.check({action: "update", record: linkedRecord})
                }
            },

            async isUpdater() {
                // A link can't be modified
                return false
            },

            async isDeleter({userACL, req, model, record}) {
                if (kiss.isServer) {
                    req.path_0 = record.mX
                    req.path_1 = record.rX
                    return await kiss.acl.check({action: "update", req})
                }
                else {
                    const modelId = record.mX
                    const recordId = record.rX
                    const linkedRecord = await kiss.app.collections[modelId].findOne(recordId)
                    return await kiss.acl.check({action: "update", record: linkedRecord})
                }
            }
        }
    }
})

;kiss.app.defineModel({
    id: "model",
    name: "Model",
    namePlural: "Models",
    icon: "fas fa-clipboard-list",
    color: "#00aaee",

    items: [{
            id: "createdAt",
            label: "#createdAt",
            type: "date",
            dataType: Date,
            acl: {
                update: false
            }
        },
        {
            primary: true,
            id: "name",
            label: "#name",
            dataType: String,
            required: true
        },
        {
            id: "namePlural",
            dataType: String,
            required: true
        },
        {
            id: "fullscreen",
            label: "#fullscreen",
            type: "checkbox",
            shape: "switch",
            dataType: Boolean
        },
        {
            id: "align",
            type: "select",
            options: ["center", "right"],
            dataType: String,
            value: "center"
        },        
        {
            id: "icon",
            label: "#icon",
            type: "icon",
            dataType: String,
            value: "fas fa-th"
        },
        {
            id: "color",
            label: "#color",
            type: "color",
            dataType: String,
            value: "#00aaee"
        },
        {
            id: "backgroundColor",
            type: "color",
            dataType: String,
            value: "#ffffff"
        },
        {
            id: "items",
            dataType: [Object],
            required: true
        },
        {
            id: "features",
            dataType: Object
        },
        {
            id: "form",
            dataType: [Object]
        },
        {
            id: "applicationId", // The model was originally created inside this application
            dataType: String
        },
        {
            id: "public",
            label: "#public",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        },
        {
            id: "publicEmailTo",
            type: "directory",
            multiple: true,
            dataType: [String]
        },
        {
            id: "publicFormActionId",
            type: "text",
            dataType: String
        },
        {
            id: "publicFormHeader",
            type: "checkbox",
            dataType: Boolean
        },
        {
            id: "publicFormWidth",
            type: "text",
            dataType: String
        },
        {
            id: "publicFormMargin",
            type: "text",
            dataType: String
        },
        {
            id: "authenticatedCanCreate",
            label: "#authenticatedCanCreate",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        },
        {
            id: "accessCreate",
            label: "#accessCreate",
            type: "directory",
            multiple: true,
            roles: ["everyone"],
            dataType: [String],
            isACL: true
        },
        {
            id: "authenticatedCanRead",
            label: "#authenticatedCanRead",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        },
        {
            id: "accessRead",
            // label: "#accessRead",
            type: "directory",
            multiple: true,
            dataType: [String],
            isACL: true
        },
        {
            id: "authenticatedCanUpdate",
            label: "#authenticatedCanUpdate",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        },
        {
            id: "accessUpdate",
            label: "#accessUpdate",
            type: "directory",
            multiple: true,
            roles: ["creator", "nobody"],
            dataType: [String],
            isACL: true
        },
        {
            id: "authenticatedCanDelete",
            label: "#authenticatedCanDelete",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        },
        {
            id: "accessDelete",
            label: "#accessDelete",
            type: "directory",
            multiple: true,
            roles: ["creator", "nobody"],
            dataType: [String],
            isACL: true
        },
        {
            id: "ownerCanManage",
            label: "#ownerCanManage",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        },
        {
            id: "accessManage",
            label: "#accessManage",
            type: "directory",
            multiple: true,
            dataType: [String],
            isACL: true
        },
        {
            id: "templateId",
            dataType: "string"
        }
    ],

    acl: {
        permissions: {
            create: [{
                    isOwner: true
                },
                {
                    isManager: true
                },
                {
                    isApplicationDesigner: true
                }
            ],
            update: [{
                    isOwner: true
                },
                {
                    isManager: true
                },
                {
                    isModelManager: true
                }
            ],
            // TODO
            // delete: [{
            //     isDeleter: true
            // }]
        },

        validators: {
            async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            },

            async isManager({
                req
            }) {
                return (kiss.isServer) ? req.token.isManager : kiss.session.isAccountManager()
            },

            // Role to CREATE new models in the application
            // Only possible if the user is a designer of the host application
            async isApplicationDesigner({
                userACL,
                model,
                record,
                req
            }) {
                // Get the host application
                const applicationId = record.applicationId
                let applicationRecord

                if (kiss.isServer) {
                    applicationRecord = await kiss.db.findOne("application", {
                        _id: applicationId
                    })
                } else {
                    applicationRecord = await kiss.app.collections.application.findOne(applicationId)
                }

                if (!applicationRecord) return false

                // Only the owner can update the target application
                if (applicationRecord.ownerCanUpdate == true) return false

                // Access is not defined
                if (applicationRecord.accessUpdate == undefined) return false

                // Other people can update the target application
                return kiss.tools.intersects(userACL, applicationRecord.accessUpdate)
            },

            // Role to MANAGE existing models in the application
            async isModelManager({
                userACL,
                model,
                record,
                req
            }) {
                // Only the owner can manage the model
                if (record.ownerCanManage == true) return false

                // Access is not defined
                if (record.accessManage == undefined) return false

                // Other people can manage the model
                if (kiss.tools.intersects(userACL, record.accessManage)) return true

                return false
            }
        }
    }
})

;kiss.app.defineModel({
    id: "plane",
    name: "Avion",
    namePlural: "Avions",
    icon: "fas fa-fighter-jet",
    color: "#00aaee",

    items: [
        {
            id: "planeId",
            type: "text",
            label: "Immatriculation"
        },
        {
            id: "planeBrand",
            type: "text",
            label: "Marque"
        },
        {
            id: "planeType",
            type: "text",
            label: "Type"
        },
        {
            id: "hourPrice",
            type: "number",
            unit: "€/h",
            label: "Tarif horaire"
        },
        {
            id: "flights",
            type: "link",
            label: "Vols",
            canCreateRecord: false,
            canDeleteLinks: false,
            canLinkRecord: false,
            multiple: true,
            link: {
                modelId: "flight",
                fieldId: "plane"
            }
        }
    ]
})

;kiss.app.defineModel({
    id: "question",
    name: "Question",
    namePlural: "Questions",
    icon: "fas fa-question",
    color: "#00aaee",

    items: [
        {
            id: "student",
            label: "Elève",
            type: "directory",
            value: "username"
        },
        {
            id: "instructor",
            label: "Instructeur",
            type: "directory"
        },
        {
            id: "question",
            type: "textarea",
            label: "Question",
            rows: 10
        },
        {
            id: "answer",
            type: "textarea",
            label: "Réponse",
            rows: 10
        }
    ]
})

;kiss.app.defineModel({
    id: "training",
    name: "Formation",
    icon: "fas fa-clipboard",
    color: "var(--buttons-color)",

    items: [{
            id: "type",
            type: "select",
            label: "Type",
            labelPosition: "top",
            multiple: false,
            options: [{
                    value: "Cours théoriques",
                    color: "#0075FF"
                },
                {
                    value: "Briefings longs",
                    color: "#ED3757"
                },
                {
                    value: "Formation pratique",
                    color: "#55CC00"
                },
                {
                    value: "Exercice en vol",
                    color: "#F77D05"
                }
            ]
        },
        {
            id: "category",
            type: "select",
            label: "Catégorie",
            labelPosition: "top",
            allowValuesNotInList: true,
            options: ["Apprentissage", "Maniabilité", "Pilotage", "Procédures particulières"]
        },
        {
            id: "subcategory",
            type: "select",
            label: "Sous-catégorie",
            labelPosition: "top",
            allowValuesNotInList: true,
            options: ["Croisière", "Décollage", "Mise en oeuvre / Roulage / Effet primaire des gouvernes", "Montée", "Opérations au sol"]
        },
        {
            id: "subject",
            type: "text",
            primary: true,
            label: "Sujet",
            labelPosition: "top"
        },
        {
            id: "order",
            type: "number",
            label: "Ordre",
            labelPosition: "top",
            precision: 0,
            min: 0,
            value: 0
        }
    ]

})

;kiss.app.defineModel({
    id: "trash",
    splitBy: "account",
    
    name: "Trash",
    namePlural: "Trashes",
    icon: "fas fa-trash",
    color: "#8833ee",

    items: [
        {
            id: "sourceModelId",
            label: "model",
            dataType: String
        },
        {
            id: "name",
            label: "name",
            dataType: String
        },
        {
            id: "icon",
            label: "icon",
            type: "icon",
            dataType: String
        },
        {
            id: "color",
            label: "color",
            type: "color",
            dataType: String
        },
        {
            id: "deletedAt",
            label: "#deletedAt",
            type: "data",
            dataType: Date
        },
        {
            id: "deletedBy",
            label: "#deletedBy",
            type: "directory",
            dataType: [String]
        }        
    ],

    acl: {
        permissions: {
            update: [
                {isUpdater: true},
            ],
            delete: [
                {isOwner: true},
                {isManager: true},
                {isRestorer: true}
            ]
        },

        validators: {
            async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            },

            async isManager({
                req
            }) {
                return (kiss.isServer) ? req.token.isManager : kiss.session.isAccountManager()
            },            

            // A deleted record can't be modified
            async isUpdater() {
                return false
            },

            // Anyone who deleted a record can restore it
            async isRestorer({userACL, req, model, record}) {
                const userId = (kiss.isClient) ? kiss.session.getUserId() : req.token.userId
                return record.deletedBy == userId
            }
        }
    }    
})

;kiss.app.defineModel({
    id: "user",
    name: "User",
    namePlural: "Users",
    icon: "fas fa-user",
    color: "#00aaee",

    items: [{
            id: "accountId"
        },
        {
            id: "email",
            type: "text",
            label: "Email",
            primary: true
        },
        {
            id: "firstName",
            type: "text",
            label: "Prénom"
        },
        {
            id: "lastName",
            type: "text",
            label: "Nom"
        },
        {
            id: "type",
            type: "select",
            label: "Type",
            options: [
                "Administrateur",
                "Instructeur",
                "Elève pilote",
                "Pilote"
            ]
        },
        {
            id: "active"
        },
        {
            id: "password"
        },
        {
            id: "isCollaboratorOf"
        },
        {
            id: "invitedBy"
        },
        {
            id: "currentAccountId"
        }
    ],

    acl: {
        permissions: {
            update: [{
                    isOwner: true
                }
            ],
            delete: [{
                    isOwner: true
                }
            ]
        },

        validators: {
            async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            }
        }
    }
})

;kiss.app.defineModel({
    id: "view",
    name: "View",
    namePlural: "Views",
    icon: "fas fa-table",
    color: "#ed3757",

    items: [
        {
            id: "createdAt",
            label: "#createdAt",
            type: "date",
            dataType: Date,
            acl: {
                update: false
            }
        },
        {
            primary: true,
            id: "name",
            label: "#name",
            type: "text",
            dataType: String
        },
        {
            id: "description",
            dataType: String
        },
        {
            id: "applicationIds",
            dataType: [String]
        },
        {
            id: "modelId",
            label: "#form",
            dataType: String,
            acl: {
                update: false
            }
        },
        {
            id: "fieldId",
            dataType: String,
            acl: {
                update: false
            }
        },        
        {
            id: "type",
            dataType: String
        },
        {
            id: "filter",
            dataType: Object,
            value: {}
        },
        {
            id: "sort",
            dataType: [Object],
            value: []
        },
        {
            id: "projection",
            dataType: Object,
            value: {}
        },
        {
            id: "group",
            dataType: [String]
        },
        {
            id: "config",
            dataType: Object
        },
        {
            id: "authenticatedCanRead",
            label: "#authenticatedCanRead",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        },
        {
            id: "accessRead",
            label: "#accessRead",
            type: "directory",
            multiple: true,
            dataType: [String],
            isACL: true
        },
        {
            id: "ownerCanUpdate",
            label: "#ownerCanUpdate",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        },      
        {
            id: "accessUpdate",
            label: "#accessUpdate",
            type: "directory",
            multiple: true,
            dataType: [String],
            isACL: true
        },
        {
            id: "canCreateRecord",
            label: "#show create button",
            type: "checkbox",
            shape: "switch",
            iconColorOn: "#20c933",
            dataType: Boolean
        }
    ],

    acl: {
        permissions: {
            create: [
                { isOwner: true },
                { isManager: true },
                { isModelDesigner: true },
                { isPrivateView: true }
            ],
            read: [
                { isViewOwner: true },
                { authenticatedCanRead: true },
                { isViewReader: true },
            ],
            update: [
                { isOwner: true },
                { isManager: true },
                { isViewOwner: true },
                { isViewDesigner: true },
                { isModelDesigner: true }
            ],
            delete: [
                { isOwner: true },
                { isManager: true },
                { isViewOwner: true },
                { isViewDesigner: true },
                { isModelDesigner: true }
            ]
        },
    
        validators: {
            /**
             * ACL validator that checks if the active user is the account owner
             */
             async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            },

            /**
             * ACL validator that checks if the active user is an account manager
             */
            async isManager({
                req
            }) {
                return (kiss.isServer) ? req.token.isManager : kiss.session.isAccountManager()
            },            

            /**
             * Check if it's a private view that's being created
             */
            async isPrivateView({req, record}) {
                const userId = (kiss.isServer) ? req.token.userId : kiss.session.getUserId()
                if (record.accessUpdate.includes(userId)) return true
                return false
            },

            /**
             * ACL validator that checks if the active user is the view owner
             */
            async isViewOwner({req, record}) {
                const userId = (kiss.isServer) ? req.token.userId : kiss.session.getUserId()
                if (record.createdBy == userId) return true
                return false
            },

            /**
             * ACL validator that checks if the active user can update the view
             */
            async isViewDesigner({userACL, record}) {
                // Only the owner can update
                if (record.ownerCanUpdate == true) return false
    
                // Access is not defined
                if (record.accessUpdate == undefined) return false
    
                // Other people can update
                if (kiss.tools.intersects(userACL, record.accessUpdate)) return true
    
                return false
            },            

            /**
             * Check if the active user can manage the view's model
             */
            async isModelDesigner({userACL, req, record}) {
                let model
                const modelId = record.modelId

                if (kiss.isServer) {
                    model = await kiss.db.findOne("model", {_id: modelId})
                }
                else {
                    model = await kiss.app.collections.model.findOne(modelId)
                }
                if (!model) return false

                // Only the owner can manage the model
                if (model.ownerCanManage == true) return false

                // Access is not defined
                if (model.accessManage == undefined) return false

                // Other people can manage the model
                if (kiss.tools.intersects(userACL, model.accessManage)) return true

                return false
            },

            /**
             * ACL validator that checks if all authenticated users can read the record
             */
            async authenticatedCanRead({record}) {
                return !!record.authenticatedCanRead
            },
    
            /**
             * ACL validator that checks if the active user can read the view
             */
            async isViewReader({userACL, record}) {
                if (record.accessRead && kiss.tools.intersects(userACL, record.accessRead)) return true
            }            
        }
    },

    methods: {
        /**
         * Get the collection of records associated to this view
         */
        getCollection() {
            let collection = kiss.app.collections[this.id]
            if (!collection) {
                collection = new kiss.data.Collection({
                    id: this.id,
                    model: kiss.app.models[this.modelId],
                    sort: this.sort,
                    filter: this.filter,
                    group: this.group,
                    projection: this.projection
                })
            }
            return collection
        }        
    }
})

;function createDeleteButton(record) {
    $(record.id).addHeaderButton({
        icon: "fas fa-trash",
        height: 24,
        iconSize: 22,
        iconColor: "#CF0000",
        backgroundColor: "transparent",
        borderWidth: 0,
        margin: "0 10px 0 0",
        tip: "Supprimer cette fiche",
        action: async () => {
            createDialog({
                title: "Supprimer le vol",
                message: "Etes-vous sûr de vouloir supprimer le vol?",
                type: "danger",
                action: async () => {
                    await record.delete()
                    $(record.id).close()
                }
            })
        }
    })    
}

;function createTopBar() {
    return {
        layout: "horizontal",
        alignItems: "center",
        height: 70,
        background: "#000055",
        items: [
            {
                type: "button",
                text: "Retour",
                icon: "fas fa-chevron-left",
                iconSize: 15,
                iconColor: "#ffffff",
                color: "#ffffff",
                background: "var(--buttons-color)",
                margin: "0 10px",
                height: 32,
                boxShadow: "0 0 5px #000000",
                fontSize: 18,
                borderWidth: 0,
                action: () => kiss.router.navigateTo("home-start")
            },
            {
                type: "spacer",
                flex: 1
            },
            {
                type: "html",
                color: "#ffffff",
                margin: "0 14px 0 0",
                html: `<span class="fas fa-user" style="font-size: 20px;"></span> &nbsp; &nbsp; <span style="font-size: 18px;">${kiss.session.getUserName()}</span>`
            },
            {
                type: "button",
                icon: "fas fa-sliders-h",
                margin: "0 10px 0 0",
                width: 35,
                height: 35,
                borderRadius: 16,
                iconColor: "#ffffff",
                iconSize: 20,
                color: "#ffffff",
                background: "var(--buttons-color)",
                boxShadow: "0 0 5px #000000",
                borderWidth: 0,
                action: () => kiss.theme.select()
            },
            {
                type: "button",
                icon: "fas fa-power-off",
                margin: "0 10px 0 0",
                width: 35,
                height: 35,
                borderRadius: 16,
                iconColor: "#ffffff",
                iconSize: 15,
                color: "#ffffff",
                background: "var(--buttons-color)",
                boxShadow: "0 0 5px #000000",
                borderWidth: 0,
                action: () => kiss.session.logout()
            }
        ]
    }
}

;/**
 * 
 * Application texts
 * 
 */
kiss.app.defineTexts({
    "welcome text": {
        "en": "Welcome to Fly Explorer",
        "fr": "Bienvenue sur Fly Explorer"
    }
})

;