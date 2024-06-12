kiss.app.defineView({
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
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        },
                        {
                            text: txtTitleCase("Générer une facture globale à partir des factures sélectionnées"),
                            icon: "fas fa-file-pdf",
                            iconColor: "var(--green)",
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

;