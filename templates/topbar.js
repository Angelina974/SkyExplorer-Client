function createTopBar() {
    return {
        layout: "horizontal",
        alignItems: "center",
        height: 70,
        background: "#000055",
        items: [
            {
                type: "button",
                text: "Retour",
                icon: "fas fa-chevron-left",
                iconSize: 15,
                iconColor: "#ffffff",
                color: "#ffffff",
                background: "var(--buttons-color)",
                margin: "0 10px",
                height: 32,
                boxShadow: "0 0 5px #000000",
                fontSize: 18,
                borderWidth: 0,
                action: () => kiss.router.navigateTo("home-start")
            },
            {
                type: "spacer",
                flex: 1
            },
            {
                type: "html",
                color: "#ffffff",
                margin: "0 14px 0 0",
                html: `<span class="fas fa-user" style="font-size: 20px;"></span> &nbsp; &nbsp; <span style="font-size: 18px;">${kiss.session.getUserName()}</span>`
            },
            {
                type: "button",
                icon: "fas fa-sliders-h",
                margin: "0 10px 0 0",
                width: 35,
                height: 35,
                borderRadius: 16,
                iconColor: "#ffffff",
                iconSize: 20,
                color: "#ffffff",
                background: "var(--buttons-color)",
                boxShadow: "0 0 5px #000000",
                borderWidth: 0,
                action: () => kiss.theme.select()
            },
            {
                type: "button",
                icon: "fas fa-power-off",
                margin: "0 10px 0 0",
                width: 35,
                height: 35,
                borderRadius: 16,
                iconColor: "#ffffff",
                iconSize: 15,
                color: "#ffffff",
                background: "var(--buttons-color)",
                boxShadow: "0 0 5px #000000",
                borderWidth: 0,
                action: () => kiss.session.logout()
            }
        ]
    }
};