kiss.app.defineModel({
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

;