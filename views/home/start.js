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
                    type: "html",
                    color: "#ffffff",
                    background: "#00aaee",
                    width: "50%",
                    html: "<center>Sky Explorer</center>"
                },
                {
                    layout: "vertical",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    defaultConfig: {
                        height: 50,
                        width: 300,
                        margin: 15,
                        borderRadius: 25
                    },
                    items: [
                        {
                            type: "button",
                            icon: "fas fa-check",
                            text: "Voir le planning des vols",
                            action: () => kiss.router.navigateTo("planning")
                        },
                        {
                            type: "button",
                            icon: "fas fa-check",
                            text: "Ma progression",
                            action: () => kiss.router.navigateTo("progress")
                        },
                        {
                            type: "button",
                            icon: "fas fa-check",
                            text: "Factures",
                            action: () => kiss.router.navigateTo("invoices")
                        },
                        {
                            type: "button",
                            icon: "fas fa-check",
                            text: "Gérer le plan de formation",
                            action: () => kiss.router.navigateTo("training")
                        },
                        {
                            type: "button",
                            icon: "fas fa-check",
                            text: "Suivi des avions",
                            action: () => kiss.router.navigateTo({
                                ui: "planes",
                                modelId: "plane",
                                viewId: "planes"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-check",
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