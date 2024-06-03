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
                    canEdit: true,
                    canCreateRecord: true,
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
                        },
                        selectRecord: function(record) {
                            createForm(record)
                        }
                    }
                }
            ]
        })
    }
})

;let arrayUsers = [];
let htmlAdd = "";

function usersFind() {
    kiss.db.find("user")
        .then(users => {
            users.forEach(user => {
                console.log("user :", user);
                arrayUsers.push(user);
                document.getElementById("userSelect").innerHTML += "<option value='" + user['firstName'] + " " + user['lastName'] + "'>" + user['firstName'] + " " + user['lastName'] + "</select>";
            });

        })
        .catch(error => {
            console.error("Error retrieving users:", error);
        });


}

usersFind();

kiss.app.defineView({
    id: "formations",
    renderer: function (id, target) {
        usersFind();
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    type: "html",
                    html: `<select class="userSelect" id="userSelect">

                    </select>`
                },
                {
                    type: "directory",
                    width: 300,
                    label: "User",
                    labelPosition: "top"
                },
                {
                    id: "usersDelete",
                    type: "datatable",
                    height: () => kiss.screen.current.height - 90,
                    collection: kiss.app.collections.formation,

                    actions: [{
                        text: txtTitleCase("Supprimer les users"),
                        icon: "fas fa-trash",
                        iconColor: "var(--red)",
                        action: () => kiss.selection.deleteSelectedRecords()
                    }],

                    methods: {
                        createRecord: async function () {
                            const newFormation = kiss.app.models.formation.create()
                            await newFormation.save()
                            createForm(newFormation)
                        },
                        selectRecord: function (record) {
                            createForm(record)
                        }
                    }
                },
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
                        },
                        selectRecord: function(record) {
                            createForm(record)
                        }
                    }
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
                    canEdit: true,
                    canCreateRecord: true,
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
                        },
                        selectRecord: function(record) {
                            createForm(record)
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

                    // Calendar options
                    period: "1 week + details",
                    startOnMonday: true,
                    showWeekend: true,
                    canCreateRecord: true,
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
                        },
                        // - the user clicks on a flight in the calendar
                        selectRecord: function(record) {
                            createForm(record)
                        }
                    }
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
                        iconColor: "#000055",
                        height: 50,
                        width: 300,
                        margin: 20,
                        borderRadius: 25,
                        fontSize: 16,
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
                        },
                        selectRecord: function(record) {
                            createForm(record)
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
            collectionId: "training",
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
    ]
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
    color: "#ee3500",

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
            type: "text",
            label: "Client"
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
                    value: "formation",
                    color: "#00aaee"
                },
                {
                    label: "Loisir",
                    value: "loisir",
                    color: "#ee3333"
                }
            ]
        },
        {
            id: "duration",
            type: "number",
            unit: "mn",
            label: "Durée du vol"
        },
        {
            id: "description",
            type: "text",
            label: "Description du vol"
        },
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
        },
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
        },
        {
            id: "exercises",
            type: "link",
            label: "Exercices",
            multiple: true,
            canDeleteLinks: true,
            link: {
                modelId: "exercise",
                fieldId: "flight"
            }
        }
    ]
})

;kiss.app.defineModel({
    id: "formation",
    name: "Nouveau",
    icon: "fas fa-fighter-jet",
    color: "#00aaee",

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
});kiss.app.defineModel({
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
            id: "flightDate",
            type: "lookup",
            label: "Type du vol",
            computed: true,
            lookup: {
                linkId: "flight",
                fieldId: "type",
                type: "text"
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
});/**
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
});kiss.app.defineModel({
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
});kiss.app.defineModel({
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
});kiss.app.defineModel({
    id: "training",
    name: "Formation",
    icon: "fas fa-clipboard",
    color: "#000055",

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

});kiss.app.defineModel({
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
});kiss.app.defineModel({
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
});kiss.app.defineModel({
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
});function createTopBar() {
    return {
        layout: "horizontal",
        alignItems: "center",
        height: 60,
        background: "#000055",
        items: [
            {
                type: "button",
                text: "Retour",
                icon: "fas fa-chevron-left",
                iconColor: "#ffffff",
                color: "#ffffff",
                background: "#414180",
                margin: "0 10px",
                height: 32,
                action: () => kiss.router.navigateTo("home-start")
            },
            {
                type: "spacer",
                flex: 1
            },
            {
                type: "html",
                color: "#ffffff",
                margin: "0 10px 0 0",
                html: `<span class="fas fa-user"></span> &nbsp; &nbsp;` + kiss.session.getUserName()
            },
            {
                type: "button",
                icon: "fas fa-power-off",
                margin: "0 10px 0 0",
                width: 32,
                height: 32,
                borderRadius: 16,
                iconColor: "#ffffff",
                color: "#ffffff",
                background: "#414180",
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