kiss.app.defineModel({
    id: "training",
    name: "Formation",
    icon: "fas fa-clipboard",
    color: "var(--buttons-color)",

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
                    options: ["Apprentissage", "Maniabilité", "Pilotage", "Procédures particulières"]
                },
                // Sous-catégorie de formation
                {
                    id: "subcategory",
                    type: "select",
                    label: "Sous-catégorie",
                    labelPosition: "top",
                    allowValuesNotInList: true,
                    options: ["Croisière", "Décollage", "Mise en oeuvre / Roulage / Effet primaire des gouvernes", "Montée", "Opérations au sol"]
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

;