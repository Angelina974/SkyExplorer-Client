kiss.app.defineModel({
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
    color: "var(--skyexplorer-color)",

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
    color: "var(--skyexplorer-color)",

    items: [
        // Section avec les informations sur le vol
        {
            type: "panel",
            title: "Informations sur le vol",
            icon: "fas fa-clipboard",
            collapsible: true,

            items: [
                // Numéro de vol
                {
                    id: "flightId",
                    type: "text",
                    label: "Identifiant du vol",
                    value: "unid",
                    width: "50%",
                    fieldWidth: "100%",
                    labelWidth: "100%",
                    labelPosition: "top"
                },

                // Section "Pilote & Instructeur"
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },

                    items: [
                        // Pilote
                        {
                            id: "client",
                            type: "directory",
                            label: "Pilote"
                        },
                        // Instructeur
                        {
                            id: "instructor",
                            type: "directory",
                            label: "Instructeur"
                        }
                    ]
                },

                // Section avec la description du vol et sa durée finale
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },

                    items: [
                        // Description
                        {
                            id: "description",
                            type: "text",
                            label: "Description du vol"
                        },
                        // Durée
                        {
                            id: "duration",
                            type: "number",
                            unit: "mn",
                            label: "Durée du vol"
                        }
                    ]
                },
            ]
        },

        // Panel pour la réservation
        {
            type: "panel",
            title: "Réservation",
            colored: false,
            items: [
                // Section pour choisir l'avion et le type de vol
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },

                    items: [
                        // Avion
                        {
                            id: "plane",
                            type: "link",
                            label: "Avion",
                            canCreateRecord: false,
                            canDeleteLinks: true,
                            canLinkRecord: true,
                            multiple: false,
                            linkStyle: "compact",
                            link: {
                                modelId: "plane",
                                fieldId: "flights"
                            }
                        },
                        // Type de vol
                        {
                            id: "type",
                            type: "select",
                            label: "Type de vol",
                            options: [{
                                    label: "Formation",
                                    value: "Formation",
                                    color: "#000055"
                                },
                                {
                                    label: "Loisir",
                                    value: "Loisir",
                                    color: "#00aaee"
                                }
                            ]
                        }
                    ]
                },

                // Section pour choisir la date et l'heure du vol
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },

                    items: [
                        // Date
                        {
                            id: "date",
                            type: "date",
                            label: "Date du vol",

                            // Vériication de la disponibilité de l'avion à la date et l'heure choisies
                            validationFunction: async function () {
                                return await checkAvailability()
                            }
                        },
                        // Heure
                        {
                            id: "time",
                            type: "select",
                            label: "Heure du vol",
                            template: "time",
                            min: 7,
                            max: 19,
                            interval: 60,

                            // Vériication de la disponibilité de l'avion à la date et l'heure choisies
                            validationFunction: async function () {
                                return await checkAvailability()
                            }
                        }
                    ]
                }
            ]
        },

        // Section avec les informations sur l'avion
        {
            type: "panel",
            title: "Informations sur l'avion",
            icon: "fas fa-fighter-jet",
            colored: false,
            collapsible: true,
            collapsed: true,

            defaultConfig: {
                width: "100%",
                fieldWidth: "75%",
                labelWidth: "25%",
            },

            items: [
                // Immatriculation
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
                // Marque
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
                // Type
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
                // Tarif horaire
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
                fieldWidth: "75%",
                labelWidth: "25%",
            },

            items: [
                // Liaison vers les exercices effectués
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
                fieldWidth: "75%",
                labelWidth: "25%",
            },

            items: [
                // Prix total du vol = tarif horaire * durée du vol / 60
                {
                    id: "totalPrice",
                    type: "number",
                    unit: "€HT",
                    label: "Prix total du vol",
                    computed: true,
                    formula: "ROUND ( {{Tarif horaire}} * {{Durée du vol}} / 60, 2 )"
                },
                // Liaison vers la facture
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
    ],

    acl: {
        permissions: {
            create: [{
                isOwner: true
            }, {
                userType: "Administrateur"
            }, {
                userType: "Instructeur"
            }],
            update: [{
                userType: "Administrateur"
            }, {
                userType: "Instructeur"
            }],
            delete: [{
                userType: "Administrateur"
            }, {
                userType: "Instructeur"
            }]
        },

        validators: {
            async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            },

            async userType({
                req
            }) {
                if (kiss.isServer) {
                    const accountUsers = kiss.directory.users[req.token.currentAccountId]
                    const user = accountUsers[req.token.userId]
                    return user.type
                } else {
                    return getUserType()
                }
            }
        }
    }
})

;kiss.app.defineModel({
    id: "formation",
    name: "Nouveau",
    icon: "fas fa-fighter-jet",
    color: "var(--skyexplorer-color)",

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
            canLinkRecord: false,
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
    color: "var(--skyexplorer-color)",

    items: [{
            type: "panel",
            title: "Informations sur la facture",
            icon: "fas fa-clipboard",
            collapsible: true,

            defaultConfig: {
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
                labelPosition: "top"
            },

            items: [
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },
                    items: [
                        // Numéro de facture
                        {
                            id: "invoiceId",
                            type: "text",
                            label: "Référence",
                            value: "unid"
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
                    ]
                },
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },
                    items: [
                        // Date de la facture
                        {
                            id: "date",
                            type: "date",
                            label: "Date de la facture",
                            value: "today"
                        },
                        // Calcul année / mois pour les regroupements
                        {
                            id: "month",
                            type: "text",
                            label: "Année / Mois",
                            computed: true,
                            formula: `YEAR_MONTH( {{Date de la facture}} )`
                        },
                    ]
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
                },
            ]
        },
        {
            type: "panel",
            title: "Informations sur le vol",
            icon: "fas fa-fighter-jet",
            collapsible: true,

            defaultConfig: {
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
                labelPosition: "top"
            },

            items: [
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
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },

                    items: [
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
                    ]

                },
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },

                    items: [
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

                    ]
                },
            ]
        }
    ],

    acl: {
        permissions: {
            create: [{
                userType: "Administrateur"
            }, {
                userType: "Instructeur"
            }],
            read: [{
                userType: "Administrateur"
            }, {
                userType: "Instructeur"
            }],
            update: [{
                userType: "Administrateur"
            }, {
                userType: "Instructeur"
            }],
            delete: [{
                userType: "Administrateur"
            }, {
                userType: "Instructeur"
            }],
            printInvoice: [{
                canPrintInvoice: "Administrateur"
            },{
                canPrintInvoice: "Instructeur"
            }]
        },

        validators: {
            async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            },

            async userType({
                req
            }) {
                if (kiss.isServer) {
                    const accountUsers = kiss.directory.users[req.token.currentAccountId]
                    const user = accountUsers[req.token.userId]
                    return user.type
                } else {
                    return getUserType()
                }
            },

            async canPrintInvoice() {
                if (kiss.isServer) {
                    const accountUsers = kiss.directory.users[req.token.currentAccountId]
                    const user = accountUsers[req.token.userId]
                    return user.type 
                } else {
                    return getUserType()
                }
            },
        }
    }    
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
    id: "plane",
    name: "Avion",
    namePlural: "Avions",
    icon: "fas fa-fighter-jet",
    color: "var(--skyexplorer-color)",

    items: [
        // Section pour les infos de l'avion
        {
            type: "panel",
            title: "Informations sur l'avion",
            icon: "fas fa-clipboard",
            collapsible: true,

            defaultConfig: {
                labelPosition: "top",
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
            },

            items: [
                // Immatriculation
                {
                    id: "planeId",
                    type: "text",
                    label: "Immatriculation"
                },
                {
                    layout: "horizontal",
                    defaultConfig: {
                        width: "50%",
                        fieldWidth: "100%",
                        labelWidth: "100%",
                        labelPosition: "top"
                    },

                    items: [
                        // Marque
                        {
                            id: "planeBrand",
                            type: "text",
                            label: "Marque"
                        },
                        // type de l'avion
                        {
                            id: "planeType",
                            type: "text",
                            label: "Type"
                        },
                    ]
                },
                // Tarif horaire
                {
                    id: "hourPrice",
                    type: "number",
                    unit: "€/h",
                    label: "Tarif horaire"
                },
                // Notes
                {
                    id: "notes",
                    type: "textarea",
                    label: "Notes complémentaires",
                    rows: 5
                },
                // Image URL
                {
                    id: "planeImageUrl",
                    type: "text",
                    label: "URL image de l'avion"
                },
                // Image insertion point
                {
                    id: "planeImage",
                    type: "html"
                }
            ]
        },
        // Section pour la liste des vols
        {
            type: "panel",
            title: "Informations sur les vols",
            icon: "fas fa-clipboard",
            collapsible: true,

            defaultConfig: {
                labelPosition: "top",
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
            },

            items: [
                // Total heures des vols
                {
                    id: "flightHours",
                    type: "summary",
                    label: "Total heures des vols",
                    unit: "h",
                    summary: {
                        linkId: "flights",
                        fieldId: "duration",
                        operation: "SUM"
                    }
                },
                // Report des heures précédentes
                {
                    id: "initialHours",
                    type: "number",
                    label: "Report des heures précédentes",
                    unit: "h"
                },
                // Total général du nombre d'heures de vol
                {
                    id: "totalHours",
                    type: "number",
                    label: "Total général",
                    unit: "h",
                    computed: true,
                    formula: `{{Total heures des vols}} + {{Report des heures précédentes}}`
                },
                // Liste des vols
                {
                    id: "flights",
                    type: "link",
                    label: "Liste des vols",
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
        }
    ]
})

;kiss.app.defineModel({
    id: "question",
    name: "Question",
    namePlural: "Questions",
    icon: "fas fa-question",
    color: "var(--skyexplorer-color)",

    items: [
        {
            id: "date",
            type: "date",
            label: "Date de la question",
            value: "today"
        },
        {
            layout: "horizontal",
            defaultConfig: {
                width: "50%",
                fieldWidth: "100%",
                labelWidth: "100%",
                labelPosition: "top"
            },
            items: [
                // Eleve
                {
                    id: "student",
                    label: "Elève",
                    type: "directory",
                    value: "username"
                },
                // Instructeur
                {
                    id: "instructor",
                    label: "Instructeur",
                    type: "directory"
                }
            ]
        },
        // Question
        {
            id: "question",
            type: "textarea",
            label: "Question",
            rows: 10
        },
        // Réponse
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
    color: "var(--skyexplorer-color)",

    items: [
        // Type de formation
        {
            id: "type",
            type: "select",
            label: "Type",
            labelPosition: "top",
            multiple: false,
            options: [{
                    value: "Cours théoriques",
                    color: "#000055"
                },
                {
                    value: "Briefings longs",
                    color: "#eeaa00"
                },
                {
                    value: "Formation pratique",
                    color: "#72951A"
                },
                {
                    value: "Exercice en vol",
                    color: "#00aaee"
                }
            ]
        },
        {
            layout: "horizontal",
            defaultConfig: {
                width: "50%",
                fieldWidth: "100%",
                labelWidth: "100%",
                labelPosition: "top"
            },
            items: [
                // Catégorie de formation
                {
                    id: "category",
                    type: "select",
                    label: "Catégorie",
                    labelPosition: "top",
                    allowValuesNotInList: true,
                    options: [
                        {
                            value: "Apprentissage",
                            color: "#00A39E"
                        },
                        {
                            value: "Maniabilité",
                            color: "#6A00A3"
                        },
                        {
                            value: "Pilotage",
                            color: "#A30054"
                        },
                        {
                            value: "Procédures particulières",
                            color: "#AF3800"
                        }]
                },
                // Sous-catégorie de formation
                {
                    id: "subcategory",
                    type: "select",
                    label: "Sous-catégorie",
                    labelPosition: "top",
                    allowValuesNotInList: true,
                    options: [
                        {
                            value: "Croisière",
                            color: "#009295"
                        },
                        {
                            value: "Décollage",
                            color: "#005895"
                        },
                        {
                            value: "Mise en oeuvre / Roulage / Effet primaire des gouvernes",
                            color: "#628D00"
                        },
                        {
                            value: "Montée",
                            color: "#AB7400"
                        },
                        {
                            value: "Opérations au sol",
                            color: "#1A3581"
                        }]
                },
            ]
        },
        // Sujet
        {
            id: "subject",
            type: "text",
            primary: true,
            label: "Sujet",
            labelPosition: "top"
        },
        // Ordre
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
    color: "var(--skyexplorer-color)",

    items: [{
            id: "accountId"
        },
        // Email de l'utilisateur
        {
            id: "email",
            type: "text",
            label: "Email",
            primary: true
        },
        {
            layout: "horizontal",
            defaultConfig: {
                width: "50%",
                fieldWidth: "100%",
                labelWidth: "100%",
                labelPosition: "top"
            },
            
            items: [
                // Prénom
                {
                    id: "firstName",
                    type: "text",
                    label: "Prénom"
                },
                // Nom
                {
                    id: "lastName",
                    type: "text",
                    label: "Nom"
                },
            ]
        },
        {
            id: "type",
            type: "select",
            label: "Type",
            options: [
                {
                    value: "Administrateur",
                    color: "#ff0000"
                },
                {
                    value: "Instructeur",
                    color: "#00aaee"
                },
                {
                    value: "Elève pilote",
                    color: "#55cc00"
                },
                {
                    value: "Pilote",
                    color: "#556677"
                }
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

;kiss.app.defineView({
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
                    canEdit: false,
                    canCreateRecord: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.exercise,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les exercices sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--trash-button-color)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
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

        // Cherche la colonne "Montant" de la facture et active la propriété "summary" pour faire la somme sur cette colonne
        let columns = kiss.app.models.invoice.getFieldsAsColumns()
        let visibleColumns = ["Référence", "Date de la facture", "Client", "Montant de la facture", "Type du vol"]
        columns.forEach(column => {
            if (column.title == "Montant de la facture") {
                column.summary = "sum"
            }

            if (!visibleColumns.includes(column.title)) {
                column.hidden = true
            }
        })

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
                    columns,

                    // Regroupe les factures par mois
                    // Cela permettra de voir les sommes aggrégées par mois
                    group: ["month"],

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les factures sélectionnées"),
                            icon: "fas fa-trash",
                            iconColor: "var(--trash-button-color)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        },
                        {
                            text: txtTitleCase("Générer une facture globale à partir des factures sélectionnées"),
                            icon: "fas fa-file-pdf",
                            iconColor: "var(--pdf-button-color)",
                            action: async () => generatePDF()
                        }                       
                    ],

                    methods: {
                        selectRecord: function(record) {
                            createForm(record)
                            createPrintButton(record)
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
                                            iconColor: "var(--skyexplorer-color)",
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
                                            <div class="auth-reset-password" style="color: var(--skyexplorer-color);">${txtTitleCase("forgot password?")}</div>
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
                                            <div class="auth-create-account" style="color: var(--skyexplorer-color);">${txtTitleCase("#no account")}</div>
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
                                        $("login").config.width = "600px"    
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
                    createRecordText: "AJOUTER UN NOUVEL AVION A LA FLOTTE",
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.plane,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les avions sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--trash-button-color)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newPlane = kiss.app.models.plane.create()

                            // Check if the user has the right to create a new record of this type
                            const canCreate = await kiss.acl.check({
                                action: "create",
                                record: newPlane
                            })

                            if (!canCreate) {
                                return createNotification("Vous n'avez pas les droits pour créer un avion")
                            }

                            // If it's ok, we save the new record
                            await newPlane.save()
                            createForm(newPlane)
                            createDeleteButton(newPlane)
                        },
                        selectRecord: function(record) {
                            createForm(record)
                            createDeleteButton(record)

                            setTimeout(() => {
                                const imageUrl = $("planeImageUrl").getValue()
                                if (!imageUrl) return
                                
                                const html = `<img src="${imageUrl}" style="width: 100%;">`
                                $("planeImage").setInnerHtml(html)
                                
                            }, 1000)
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
        let visibleColumns = ["client", "planeId", "duration", "type"]
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
                    canCreateRecord: isUser("Administrateur"),
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

                            // Check if the user has the right to create a new record of this type
                            const canCreate = await kiss.acl.check({
                                action: "create",
                                record: newFlight
                            })

                            if (!canCreate) {
                                return createNotification("Vous n'avez pas les droits pour créer un vol")
                            }

                            // If it's ok, we save the new record
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
                    createRecordText: "POSER UNE NOUVELLE QUESTION",
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
                                        // EMAIL
                                        {
                                            type: "text",
                                            id: "email",
                                            placeholder: txtTitleCase("email"),
                                            required: true,
                                            validationType: "email",
                                            value: userEmail
                                        },
                                        // TELEPHONE
                                        {
                                            hidden: (pendingUserId) ? true : false,
                                            type: "text",
                                            id: "telephone",
                                            placeholder: txtTitleCase("telephone")
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
                                                    iconColor: "var(--skyexplorer-color)",
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
                                            <div class="auth-create-account" style="color: var(--skyexplorer-color);">${txtTitleCase("#already an account")}</div>
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
                                        $("register").config.width = "600px"
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
                // Partie gauche de la Home page
                {
                    class: "home-left",
                    type: "html",
                    width: "50%",
                    html: `<img src="./resources/img/skyExplorer.svg">`
                },
                // Conteneur pour les boutons de la Home page
                {
                    layout: "vertical",
                    background: "var(--skyexplorer-color)",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    defaultConfig: {
                        iconSize: 22,
                        iconColor: "var(--buttons-color)",
                        height: 50,
                        width: 300,
                        margin: "1.5vh",
                        borderRadius: "var(--panel-border-radius)",
                        fontSize: 16,
                        boxShadow: "none",
                        boxShadowHover: "0 0 10px #4269C9",
                        backgroundColorHover: "var(--skyexplorer-color)",
                        colorHover: "#ffffff"
                    },
                    items: [
                        // Planning des vols
                        {
                            hidden: !isUser(["Administrateur", "Instructeur"]),
                            type: "button",
                            icon: "fas fa-clipboard",
                            text: "Voir le planning des vols",
                            action: () => kiss.router.navigateTo("planning")
                        },
                        // Liste des exercices (progression élève)
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
                        // Factures
                        {
                            hidden: !isUser(["Administrateur"]),
                            type: "button",
                            icon: "fas fa-dollar-sign",
                            text: "Factures",
                            action: () => kiss.router.navigateTo({
                                ui: "invoices",
                                modelId: "invoice",
                                viewId: "invoices-list"
                            })
                        },
                        // Gestion du plan de formation
                        {
                            hidden: !isUser(["Administrateur", "Instructeur"]),
                            type: "button",
                            icon: "fas fa-user-graduate",
                            text: "Gérer le plan de formation",
                            action: () => kiss.router.navigateTo({
                                ui: "training",
                                modelId: "training",
                                viewId: "training-list"
                            })
                        },
                        // Gestion des avions
                        {
                            hidden: !isUser(["Administrateur", "Instructeur"]),
                            type: "button",
                            icon: "fas fa-fighter-jet",
                            text: "Suivi des avions",
                            action: () => kiss.router.navigateTo({
                                ui: "planes",
                                modelId: "plane",
                                viewId: "planes-list"
                            })
                        },
                        // Gestion des utilisateurs
                        {
                            hidden: !isUser(["Administrateur"]) && !kiss.session.isOwner,
                            type: "button",
                            icon: "fas fa-users",
                            text: "Gestion des utilisateurs",
                            action: () => kiss.router.navigateTo({
                                ui: "users",
                                modelId: "user",
                                viewId: "users-list"
                            })
                        },
                        // Gestion des questions & réponses
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
                        // Déconnexion
                        {
                            type: "button",
                            icon: "fas fa-power-off",
                            text: "Se déconnecter",
                            action: () => kiss.session.logout(),
                            events: {
                                mouseOver: function () {
                                    this.setAnimation({
                                        name: 'bounceIn',
                                        speed: 'faster'
                                    })
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
    id: "training",
    renderer: function (id, target) {
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
                    createRecordText: "AJOUTER UN NOUVEL ELEMENT A LA FORMATION",
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.training,

                    sortSyntax: "normalized",
                    sort: [{
                            type: "asc"
                        }, {
                            category: "asc"
                        }, {
                            subcategory: "asc"
                        }, {
                            order: "asc"
                        }
                    ],

                    actions: [{
                        text: txtTitleCase("Supprimer les formations sélectionnées"),
                        icon: "fas fa-trash",
                        iconColor: "var(--red)",
                        action: () => kiss.selection.deleteSelectedRecords()
                    }],

                    methods: {
                        createRecord: async function () {
                            const newTraining = kiss.app.models.training.create()

                            // Check if the user has the right to create a new record of this type
                            const canCreate = await kiss.acl.check({
                                action: "create",
                                record: newTraining
                            })

                            if (!canCreate) {
                                return createNotification("Vous n'avez pas les droits pour créer une formation")
                            }

                            await newTraining.save()
                            createForm(newTraining)
                            createDeleteButton(newTraining)

                        },
                        selectRecord: function (record) {
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

        // Génère les colonnes à partir des champs du modèle, et ajoute une colonne de type "bouton"
        let columns = kiss.app.models.invoice.getFieldsAsColumns()
        columns.push({
            title: "Actions",
            type: "button",
            button: {
                icon: "fas fa-key",
                text: "Modifier les accès",
                action: function(rowIndex, columnId, recordId, record) {

                    // Empêche de modifier les droits de l'utilisateur connecté (on ne peut pas se retirer ses propres droits)
                    if (kiss.session.userId == record.email) {
                        // return createNotification("Vous ne pouvez pas modifier vos propres droits")
                    }

                    // Affiche une boite de dialogue pour modifier les droits de l'utilisateur
                    createDialog({
                        title: "Modifier les droits de l'utilisateur",
                        icon: "fas fa-key",
                        type: "select",
                        autoClose: false,
                        message: "Choisissez le nouveau type d'utilisateur :",
                        options: [
                            {
                                value: "Administrateur",
                                color: "#ff0000"
                            },
                            {
                                value: "Instructeur",
                                color: "#00aaee"
                            },
                            {
                                value: "Elève pilote",
                                color: "#55cc00"
                            },
                            {
                                value: "Pilote",
                                color: "#556677"
                            }
                        ],
                        action: async function(newUserType) {

                            if (newUserType === "") {
                                createNotification("Vous devez choisir un type d'utilisateur")
                                return false
                            }

                            // Vérifie les droits côté client
                            const canUpdate = await kiss.acl.check({
                                action: "update",
                                record
                            })

                            // Si on ne peut pas mettre à jour, on affiche une notification
                            if (!canUpdate) {
                                return createNotification("Vous n'avez pas les droits pour modifier un utilisateur")
                            }

                            // Sinon on lance la mise à jour (qui sera aussi vérifiée côté serveur)
                            await record.update({
                                email: record.email,
                                type: newUserType
                            })
                            
                            // Si le user mis à jour est le même que le user connecté => reload pour mettre à jour les droits
                            if (kiss.session.userId == record.email) {
                                document.location.reload()
                            }

                            return true
                        }
                    }).render()
                }
            }
        })

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
                    columns,
                    methods: {
                        selectRecord: function(record) {
                            record.isLocked = true
                            createForm(record)

                            // Ajoute un bouton pour supprimer la fiche seulement si :
                            // - l'utilisateur connecté est administrateur
                            if (!isUser("Administrateur")) {
                                return
                            }

                            // - le user à supprimer n'est PAS le propriétaire du compte principal (= super admin)
                            const currentAccountId = kiss.session.getCurrentAccountId()
                            if (record.accountId == currentAccountId) {
                                return
                            }

                            // - le user à supprimer n'est PAS le user connecté
                            if (record.email == kiss.session.userId) {
                                return
                            }
                            
                            createDeleteButton(record)
                        }
                    }
                }
            ]
        })
    }
})

;function createDeleteButton(record) {
    $(record.id).addHeaderButton({
        icon: "fas fa-trash",
        height: 24,
        iconSize: 22,
        iconColor: "var(--trash-button-color)",
        backgroundColor: "transparent",
        borderWidth: 0,
        margin: "0 10px 0 0",
        tip: "Supprimer cette fiche",
        action: async () => {
            createDialog({
                title: "Supprimer le vol",
                message: "Etes-vous sûr de vouloir supprimer cette fiche ?",
                type: "danger",
                action: async () => {
                    await record.delete()
                    $(record.id).close()
                }
            })
        },
        events: {
            mouseOver: function () {
                this.setAnimation({
                    name: 'bounceIn',
                    speed: 'faster'
                })
            }
        }
    })    
}

function createPrintButton(record) {
    $(record.id).addHeaderButton({
        icon: "fas fa-file-pdf",
        height: 24,
        iconSize: 22,
        iconColor: "var(--pdf-button-color)",
        backgroundColor: "transparent",
        borderWidth: 0,
        margin: "0 10px 0 0",
        tip: "Imprimer cette facture",
        action: () => displayPdf([record]),
        events: {
            mouseOver: function () {
                this.setAnimation({
                    name: 'bounceIn',
                    speed: 'faster'
                })
            }
        }
    })    
}

;// Création d'un composant TopBar de type block
function createTopBar() {
    return {
        // Propriétés de CSS directement appliquées
        layout: "horizontal",
        alignItems: "center",
        height: 70,
        background: "var(--skyexplorer-color)",

        // Liste des éléments enfants que va contenir tout le composant TopBar
        items: [

            // Bouton de retour
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
                boxShadow: "0 0 5px #000055",
                fontSize: 18,
                borderWidth: 0,

                // Fonction qui permet de revenir à la page d'accueil
                action: () => kiss.router.navigateTo("home-start"),

                // Animation au survol
                events: {
                    mouseOver: function () {
                        this.setAnimation({
                            name: 'bounceIn',
                            speed: 'faster'
                        })
                    }
                }
            },

            // Espace qui prend tout l'espace disponible
            {
                type: "spacer",
                flex: 1
            },

            // Logo de Sky Explorer
            {
                type: "image",
                src: "./resources/img/sky-explorer white-logo.svg",
                width: 100,

                // Animation au survol
                events: {
                    mouseOver: function () {
                        this.setAnimation({
                            name: 'bounceIn',
                            speed: 'faster'
                        })
                    }
                }
            },

            // Espace qui prend tout l'espace disponible
            {
                type: "spacer",
                flex: 1
            },
            // Nom de l'utilisateur connecté
            {
                type: "html",
                color: "#ffffff",
                margin: "0 14px 0 0",
                // Récupère le nom de l'utilisateur connecté avec la fonction kiss.session.getUserName()
                html: `<span class="fas fa-user" style="font-size: 20px;"></span> &nbsp; &nbsp; <span style="font-size: 18px;">${kiss.session.getUserName()}</span>`
            },

            // Boutons de configuration 
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
                boxShadow: "0 0 5px #000055",
                borderWidth: 0,

                // Fonction qui permet de changer le thème de l'application
                action: () => kiss.theme.select(),

                // Animation au survol
                events: {
                    mouseOver: function () {
                        this.setAnimation({
                            name: 'bounceIn',
                            speed: 'faster'
                        })
                    }
                }
            },

            // Bouton de déconnexion
            {
                type: "button",
                icon: "fas fa-power-off",

                // Propriétés de CSS directement appliquées
                margin: "0 10px 0 0",
                width: 35,
                height: 35,
                borderRadius: 16,
                iconColor: "#ffffff",
                iconSize: 15,
                color: "#ffffff",
                background: "var(--buttons-color)",
                boxShadow: "0 0 5px #000055",
                borderWidth: 0,

                // Fonction qui permet de se déconnecter
                action: () => kiss.session.logout(),

                // Animation au survol
                events: {
                    mouseOver: function () {
                        this.setAnimation({
                            name: 'bounceIn',
                            speed: 'faster'
                        })
                    }
                }
            }
        ]
    }
}

;/**
 * Code of the button to generate a PDF
 */
async function generatePDF() {

    // Vérifie si l'utilisateur a le droit d'imprimer une facture globale
    const selectedRecords = await kiss.selection.getRecordsFromActiveView()
    const record = selectedRecords[0]
    const canPrintInvoice = await kiss.acl.check({
        action: "printInvoice",
        record
    })

    if (canPrintInvoice) {
        displayPdf(selectedRecords)
    } else {
        createNotification('Vous n\'avez pas les droits pour imprimer cette facture')
    }
}

/**
 * Display PDF document in the browser
 * 
 * @param {Array} selectedRecords - Invoices to display in the PDF
 */
async function displayPdf(selectedRecords) {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    const img = new Image()
    img.src = './resources/img/facture.png' // Fond de page

    img.onload = function () {
        const pdfWidth = 210
        const pdfHeight = 297
        const startX = 20
        const columnX1 = 120
        const lineYadd = 7
        const lineYadd2 = 100
        let lineY = lineYadd2 + 10

        doc.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // Numéro de facture
        doc.setFont('Helvetica', "bold")
        doc.setFontSize(30)
        doc.setTextColor("#24265A")
        doc.text("Facture N° :", 120, 45)
        doc.setFont('Helvetica', "normal")
        doc.setFontSize(25)
        doc.text(kiss.tools.shortUid().toUpperCase(), 120, 56)

        // Description
        doc.setFontSize(14)
        doc.setTextColor("#24265A")

        // Date, Emetteur de la facture
        let today = new Date()
        totay = today.toLocaleDateString()

        doc.text("Date : " + totay, columnX1, 65)
        doc.text("Emis par : ", columnX1, 72)

        doc.setFont('Helvetica', "normal")
        doc.text(`${kiss.session.getUserName()}`, columnX1 + 26, 72)

        // Entête du tableau
        doc.setFont('Helvetica', "normal")
        doc.setFontSize(14)
        doc.setTextColor("#000000")

        doc.text("Référence", startX, lineYadd2)
        doc.text("Client", startX + 40, lineYadd2)
        doc.text("Date", startX + 80, lineYadd2)
        doc.text("Type", startX + 120, lineYadd2)
        doc.text("€HT/h", startX + 155, lineYadd2)

        doc.setFontSize(12)
        doc.setTextColor("#24265A")

        let sum = 0
        for (let i = 0; i < selectedRecords.length; i++) {
            const reference = selectedRecords[i].invoiceId
            const client = selectedRecords[i].client
            const clientName = kiss.directory.getEntryName(client)
            const date = selectedRecords[i].date
           
            // Si le type de vol n'est pas renseigné, on affiche une chaîne vide
            if (!selectedRecords[i].flightType){
                selectedRecords[i].flightType = ""
            }

            const type = selectedRecords[i].flightType
            const montant = selectedRecords[i].totalPrice

            doc.text(reference, startX, lineY)
            doc.text(clientName, startX + 40, lineY)
            doc.text(date, startX + 80, lineY)
            doc.text(type, startX + 120, lineY)
            doc.text(montant.toFixed(2) + "€", startX + 155, lineY)
            
            lineY += lineYadd
            sum += montant
        }

        // Total
        doc.text("Total HT : " + sum.toFixed(2) + "€", startX, lineY + 20)
        doc.text("TVA 20% : " + (sum * 0.2).toFixed(2) + "€", startX, lineY + 27)
        doc.text("Total TTC : " + (sum * 1.2).toFixed(2) + "€", startX, lineY + 34)

        doc.setDrawColor('#24265A')
        doc.setLineWidth(0.3)
        doc.setLineDash([3, 3], 0)
        doc.line(startX - 4, 93, 192, 93)
        doc.line(startX - 4, 102, 192, 102)

        // Reglement
        doc.setFont('Helvetica', "normal")
        doc.setFontSize(14)
        doc.setTextColor("")
        doc.text("En votre aimable règlement à réception.", startX, 220)

        window.open(doc.output('bloburl'))
    }
}

;/**
 * Get the user type
 * 
 * @returns {string} The user type: "Administrateur", "Instructeur", "Elève pilote" or "Pilote"
 * 
 * @example
 * getUserType() // "Administrateur"
 */
function getUserType() {
    const user = kiss.directory.users.find(user => user.email == kiss.session.userId)
    return user.type
}

/**
 * Test if the user belongs to certain types
 * 
 * @param {string|string[]} types
 * @returns {boolean}
 * 
 * @example
 * isUser("Administrateur") // true if the user is an administrator
 * isUser(["Administrateur", "Instructeur"]) // true if the user is an administrator or an instructor
 */
function isUser(type) {
    if (Array.isArray(type)) {
        return type.includes(getUserType())
    }
    else {
        return getUserType() === type
    }
}

;/**
 * Méthode pour vérifier si un avion est disponible au jour et à l'heure demandée
 * 
 * @async
 * @returns {boolean} true si l'avion est disponible, false sinon
 */
async function checkAvailability() {
    const planeId = $("planeId").getValue()
    if (!planeId) {
        createNotification("Merci de choisir un avion pour pouvoir vérifier sa disponibilité à cette date & heure")
        return false
    }

    const hour = $("time").getValue()
    const date = $("date").getValue()

    const flights = kiss.app.collections.flight.records
    const planeFlights = flights.filter(flight => flight.planeId === planeId)
    const reservationsAtTheSameDateAndTime = planeFlights.filter(flight => flight.date === date && flight.time === hour)

    if (reservationsAtTheSameDateAndTime.length > 0) {
        createNotification("Désolé, l'avion est déjà réservé à cette date & heure !")
        return false
    }

    return true
}

;