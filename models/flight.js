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

            defaultConfig: {
                width: "100%",
                fieldWidth: "100%",
                labelWidth: "25%",
            },

            items: [{
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

            items: [{
                    id: "plane",
                    type: "link",
                    label: "Avion",
                    canCreateRecord: false,
                    canDeleteLinks: true,
                    canLinkRecord: true,
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

            items: [{
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
            }]
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

            items: [{
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

;