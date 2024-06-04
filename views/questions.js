kiss.app.defineView({
    id: "questions",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "questions-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: true,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.question,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les questions sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newQuestion = kiss.app.models.question.create()
                            await newQuestion.save()
                            createForm(newQuestion)
                            createDeleteButton(newQuestion)
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