function createTopBar() {
    return {
        layout: "horizontal",
        alignItems: "center",
        height: 60,
        background: "#000055",
        items: [
            {
                type: "button",
                text: "Retour",
                icon: "fas fa-chevron-left",
                iconColor: "#ffffff",
                color: "#ffffff",
                background: "#414180",
                margin: "0 10px",
                height: 32,
                action: () => kiss.router.navigateTo("home-start")
            },
            {
                type: "spacer",
                flex: 1
            },
            {
                type: "html",
                color: "#ffffff",
                margin: "0 10px 0 0",
                html: `<span class="fas fa-user"></span> &nbsp; &nbsp;` + kiss.session.getUserName()
            },
            {
                type: "button",
                icon: "fas fa-power-off",
                margin: "0 10px 0 0",
                width: 32,
                height: 32,
                borderRadius: 16,
                iconColor: "#ffffff",
                color: "#ffffff",
                background: "#414180",
                action: () => kiss.session.logout()
            }
        ]
    }
}