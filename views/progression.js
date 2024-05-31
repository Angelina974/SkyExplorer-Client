kiss.app.defineView({
    id: "progression",
    renderer: function (id, target) {
        function usersAdd() {
            $("students").innerHtml = "oiuyt";
        }
        usersAdd();
        return createBlock({
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "content",
                    type: "block",
                    height: () => kiss.screen.current.height - 60,
                    width: 200,
                    borderStyle: "dashed",
                    borderColor: "#dfdfdf",
                    borderRadius: "10px",
                    padding: "20px",
                    margin: 10,
                    overflow : "scroll",
                    items: [
                        {
                            type: "html",
                            html: "<div id='students'>dsfg</div>"
                        }
                    ]
                },
            ]

        })
    }
})