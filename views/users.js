kiss.app.defineView({
    id: "users",
    renderer: function(id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "users-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: false,
                    canCreateRecord: false,
                    canSelect: false,
                    showAction: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.user,

                    methods: {
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