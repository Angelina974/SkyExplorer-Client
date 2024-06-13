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
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: true,
                    createRecordText: "AJOUTER UN NOUVEL AVION A LA FLOTTE",
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.plane,

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les avions sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--trash-button-color)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newPlane = kiss.app.models.plane.create()

                            // Check if the user has the right to create a new record of this type
                            const canCreate = await kiss.acl.check({
                                action: "create",
                                record: newPlane
                            })

                            if (!canCreate) {
                                return createNotification("Vous n'avez pas les droits pour créer un avion")
                            }

                            // If it's ok, we save the new record
                            await newPlane.save()
                            createForm(newPlane)
                            createDeleteButton(newPlane)
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