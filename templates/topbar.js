function createTopBar() {
    return {
        layout: "horizontal",
        alignItems: "center",
        height: 60,
        background: "#00aaee",
        items: [
            {
                type: "button",
                text: "Retour",
                icon: "fas fa-chevron-left",
                iconColor: "#ffffff",
                color: "#ffffff",
                background: "#00aaee",
                margin: "0 10px",
                height: 32,
                action: () => kiss.router.navigateTo("home-start")
            }
        ]
    }
}