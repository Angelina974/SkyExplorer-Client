kiss.app.defineModel({
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
                                    color: "#00aaee"
                                },
                                {
                                    label: "Loisir",
                                    value: "Loisir",
                                    color: "#ee3333"
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
                            value: "today",

                            // Vériication de la disponibilité de l'avion à la date et l'heure choisies
                            validationFunction: async function () {
                                return await this.record.checkAvailability()
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
                                return await this.record.checkAvailability()
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

    methods: {
        /**
         * Méthode du modèle pour vérifier si l'avion est disponible au jour et à l'heure demandée
         * 
         * @async
         * @returns {boolean} true si l'avion est disponible, false sinon
         */
        async checkAvailability() {
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
    }
})

;