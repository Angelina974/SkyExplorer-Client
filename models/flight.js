kiss.app.defineModel({
    id: "flight",
    name: "Vol",
    namePlural: "Vols",
    icon: "fas fa-clipboard",
    color: "#00aaee",

    items: [
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
            id: "planeId",
            type: "text",
            label: "Immatriculation de l'avion"
        },
        {
            id: "planeBrand",
            type: "text",
            label: "Marque d'avion"
        },
        {
            id: "planeType",
            type: "text",
            label: "Type d'avion"
        },
        {
            id: "hourPrice",
            type: "number",
            label: "Tarif horaire"
        }
    ]
});