function createTopBar() {
    return {
        layout: "horizontal",
        alignItems: "center",
        height: 50,
        background: "#00aaee",
        items: [
            {
                type: "button",
                icon: "fas fa-chevron-left",
                margin: "0 20px 0 10px",
                height: 40,
                borderRadius: "32px",
                action: () => kiss.router.navigateTo("home-start")
            },
            {
                type: "html",
                html: "TOP BAR"
            }
        ]
    }
}