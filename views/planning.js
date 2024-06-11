kiss.app.defineView({
    id: "planning",
    renderer: function(id, target) {

        // Restrict the columns to the ones we want to display
        let visibleColumns = ["client", "planeId", "duration", "type"]
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
                    color: "var(--buttons-color)",

                    // Calendar options
                    period: "1 week + details",
                    startOnMonday: true,
                    showWeekend: true,
                    canCreateRecord: isUser("Administrateur"),
                    createRecordText: "RESERVER UN NOUVEAU VOL",
                    height: () => kiss.screen.current.height - 60,
                    
                    // Collection and columns (= fields) to display
                    collection: kiss.app.collections.flight,
                    columns,

                    // Defines what happens when:
                    methods: {
                        // - the user clicks on the "Create" button at the top left
                        createRecord: async function() {
                            const newFlight = kiss.app.models.flight.create()

                            // Check if the user has the right to create a new record of this type
                            const canCreate = await kiss.acl.check({
                                action: "create",
                                record: newFlight
                            })

                            if (!canCreate) {
                                return createNotification("Vous n'avez pas les droits pour créer un vol")
                            }

                            // If it's ok, we save the new record
                            await newFlight.save()

                            createForm(newFlight)
                            createDeleteButton(newFlight)
                        },
                        // - the user clicks on a flight in the calendar
                        selectRecord: function(record) {
                            createForm(record)
                            createDeleteButton(record)
                        }
                    }
                }
            ],
            methods: {
                async load() {
                    if (kiss.app.collections["onlyExercises"]) return

                    const filteredCollection = new kiss.data.Collection({
                        id: "onlyExercises",
                        model: kiss.app.models["training"],
                        isMaster: false,
                        filterSyntax: "mongo",
                        filter: {
                            type: "Exercice en vol"
                        }
                    })

                    filteredCollection.filterBy({
                        type: "Exercice en vol"
                    })
                }
            }
        })
    }
})

;