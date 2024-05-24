kiss.app.defineModel({
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
            label: "Taris horaire"
        }
    ]
});