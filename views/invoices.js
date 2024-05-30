kiss.app.defineView({
    id: "invoices",
    renderer: function(id, target) {
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
                    canEdit: true,
                    canCreateRecord: true,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.invoice,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les facturs sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newInvoice = kiss.app.models.invoice.create()
                            await newInvoice.save()
                            createForm(newInvoice)
                        },
                        selectRecord: function(record) {
                            createForm(record)
                        }
                    }
                }
            ]
        })
    }
})