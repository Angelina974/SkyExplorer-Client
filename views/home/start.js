/**
 * Home start.
 * This is the entry point of pickaform.
 */
kiss.app.defineView({
    id: "home-start",
    renderer: function (id, target) {
        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                {
                    type: "html",
                    html:
                        `<center>
                            <h1>Welcome to Fly Explorer</h1>
                        </center>`
                },
                {
                    id: "table",
                    type: "datatable",
                    collection: kiss.app.collections.plane,
                    methods: {
                        
                        selectRecord(record) {
                            createForm(record)
                        },

                        async createRecord(model) {
                            const newPlane = model.create()
                            await newPlane.save()
                            createForm(newPlane)
                        }
                    }
                }
            ]
        })
    }
})

;