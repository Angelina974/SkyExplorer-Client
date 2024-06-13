kiss.app.defineView({
    id: "training",
    renderer: function (id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "training-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: true,
                    createRecordText: "AJOUTER UN NOUVEL ELEMENT A LA FORMATION",
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.training,

                    sortSyntax: "normalized",
                    sort: [{
                            type: "asc"
                        }, {
                            category: "asc"
                        }, {
                            subcategory: "asc"
                        }, {
                            order: "asc"
                        }
                    ],

                    actions: [{
                        text: txtTitleCase("Supprimer les formations sélectionnées"),
                        icon: "fas fa-trash",
                        iconColor: "var(--red)",
                        action: () => kiss.selection.deleteSelectedRecords()
                    }],

                    methods: {
                        createRecord: async function () {
                            const newTraining = kiss.app.models.training.create()

                            // Check if the user has the right to create a new record of this type
                            const canCreate = await kiss.acl.check({
                                action: "create",
                                record: newTraining
                            })

                            if (!canCreate) {
                                return createNotification("Vous n'avez pas les droits pour créer une formation")
                            }

                            await newTraining.save()
                            createForm(newTraining)
                            createDeleteButton(newTraining)

                        },
                        selectRecord: function (record) {
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