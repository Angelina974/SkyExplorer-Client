kiss.app.defineView({
    id: "invoices",
    renderer: function(id, target) {

        // Cherche la colonne "Montant" de la facture et active la propriété "summary" pour faire la somme sur cette colonne
        let columns = kiss.app.models.invoice.getFieldsAsColumns()
        columns.forEach(column => {
            if (column.title == "Montant de la facture") {
                column.summary = "sum"
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
                            text: txtTitleCase("Supprimer les factures sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        },
                        {
                            text: txtTitleCase("Générer une facture"),
                            icon: "fas fa-file-pdf",
                            iconColor: "var(--green)",
                            action: async () => generatePDF()
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

;