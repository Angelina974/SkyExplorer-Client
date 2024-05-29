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
            layout: "horizontal",
            items: [
                {
                    class: "home-left",
                    type: "html",
                    color: "#ffffff",
                    background: "#000055",
                    width: "50%",
                    html: `<img src="./resources/img/logo 256x128.png">`
                },
                {
                    layout: "vertical",
                    background: "#00aaee",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    defaultConfig: {
                        iconSize: 20,
                        iconColor: "#00aaee",
                        height: 50,
                        width: 300,
                        margin: 15,
                        borderRadius: 25
                    },
                    items: [
                        {
                            type: "button",
                            icon: "fas fa-clipboard",
                            text: "Voir le planning des vols",
                            action: () => kiss.router.navigateTo("planning")
                        },
                        {
                            type: "button",
                            icon: "fas fa-chart-line",
                            text: "Ma progression",
                            action: () => kiss.router.navigateTo("progress")
                        },
                        {
                            type: "button",
                            icon: "fas fa-dollar-sign",
                            text: "Factures",
                            action: () => kiss.router.navigateTo("invoices")
                        },
                        {
                            type: "button",
                            icon: "fas fa-user-graduate",
                            text: "Gérer le plan de formation",
                            action: () => kiss.router.navigateTo("training")
                        },
                        {
                            type: "button",
                            icon: "fas fa-fighter-jet",
                            text: "Suivi des avions",
                            action: () => kiss.router.navigateTo({
                                ui: "planes",
                                modelId: "plane",
                                viewId: "planes-list"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-users",
                            text: "Gestion des utilisateurs",
                            action: () => kiss.router.navigateTo({
                                ui: "users",
                                modelId: "user",
                                viewId: "users-list"
                            })
                        },                        
                        {
                            type: "button",
                            icon: "fas fa-power-off",
                            text: "Se déconnecter",
                            action: () => kiss.session.logout()
                        }
                    ]
                }
            ]
        })
    }
})

;