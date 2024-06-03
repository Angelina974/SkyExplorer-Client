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

                    // Calendar options
                    period: "1 week + details",
                    startOnMonday: true,
                    showWeekend: true,
                    canCreateRecord: true,
                    height: () => kiss.screen.current.height - 60,
                    
                    // Collection and columns (= fields) to display
                    collection: kiss.app.collections.flight,
                    columns,

                    // Defines what happens when:
                    methods: {
                        // - the user clicks on the "Create" button at the top left
                        createRecord: async function() {
                            const newFlight = kiss.app.models.flight.create()
                            await newFlight.save()
                            createForm(newFlight)
                        },
                        // - the user clicks on a flight in the calendar
                        selectRecord: function(record) {
                            createForm(record)
                        }
                    }
                }
            ]
        })
    }
})

;