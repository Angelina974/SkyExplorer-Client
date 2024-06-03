kiss.app.defineView({
    id: "planes",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "planes-list",
                    type: "datatable",
                    canEdit: true,
                    canCreateRecord: true,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.plane,

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
                            const newPlane = kiss.app.models.plane.create()
                            await newPlane.save()
                            createForm(newPlane)
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

;