kiss.app.defineView({
    id: "planning",
    renderer: function(id, target) {

        // Restrict the columns to the ones we want to display
        let visibleColumns = ["time", "client", "type", "duration", "planeId"]
        let columns = kiss.app.models.flight.getFieldsAsColumns()
        columns.forEach(column => {
            column.hidden = !visibleColumns.includes(column.id)
        })

        return createBlock({
            id, 
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    type: "calendar",
                    period: "1 week + details",
                    canEdit: true,
                    canCreateRecord: true,
                    startOnMonday: true,
                    showWeekend: true,
                    height: () => kiss.screen.getHeightMinus(50),
                    
                    collection: kiss.app.collections.flight,
                    columns,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les avions sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newFlight = kiss.app.models.flight.create()
                            await newFlight.save()
                            createForm(newFlight)
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