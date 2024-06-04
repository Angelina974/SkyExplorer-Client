kiss.app.defineView({
    id: "exercises",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "exercises-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.exercise,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les exercices sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newExercise = kiss.app.models.exercise.create()
                            await newExercise.save()
                            createForm(newExercise)
                            createDeleteButton(newExercise)
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