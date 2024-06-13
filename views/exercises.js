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
                    canEdit: false,
                    canCreateRecord: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.exercise,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les exercices sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--trash-button-color)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
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