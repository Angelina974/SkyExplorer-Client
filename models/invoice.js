kiss.app.defineView({
    id: "invoice",
    name: "Invoice",
    namePlural: "Invoices",
    icon: "fas fa-users",
    color: "#00aaee",

    items: [
        {
            id: "invoiceId",
            type: "text",
            label: "Référence"
        },
        {
            id: "flightId",
            type: "link",
            label: "Identifiant du vol",
            link: {
                modelId: "flight",
                fieldId: "planeId"
            }
        },
        {
            id: "client",
            type: "link",
            label: "Client",
            link: {
                modelId: "user",
                fieldId: "userId"
            }
        },
        {
            id: "invoiceDate",
            type: "date",
            label: "Date de la facture"
        },
        {
            id: "vols",
            type: "link",
            unit: "€/h",
            label: "Tarif horaire",
            link: {
                modelId: "plane",
                fieldId: "hourPrice"
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
            id: "flights",
            type: "link",
            label: "Vols",
            canCreateRecord: true,
            canDeleteLinks: true,
            canLinkRecords: false,
            multiple: true,
            link: {
                modelId: "flight",
                fieldId: "planeId"
            }
        },
    ]
})