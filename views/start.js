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
                    width: "50%",
                    html: `<img src="./resources/img/skyExplorer.svg">`
                },
                {
                    layout: "vertical",
                    background: "#000055",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    defaultConfig: {
                        iconSize: 22,
                        iconColor: "var(--buttons-color)",
                        height: 50,
                        width: 300,
                        margin: 20,
                        borderRadius: "var(--panel-border-radius)",
                        fontSize: 16,
                        boxShadow: "none",
                        boxShadowHover: "0 0 20px #0077c8"
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
                            text: "Ma progression (exercices)",
                            action: () => kiss.router.navigateTo({
                                ui: "exercises",
                                modelId: "exercise",
                                viewId: "exercises-list"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-dollar-sign",
                            text: "Factures",
                            action: () => kiss.router.navigateTo({
                                ui: "invoices",
                                modelId: "invoice",
                                viewId: "invoices-list"
                            })
                        },
                        {
                            type: "button",
                            icon: "fas fa-user-graduate",
                            text: "Gérer le plan de formation",
                            action: () => kiss.router.navigateTo({
                                ui: "training",
                                modelId: "training",
                                viewId: "training-list"
                            })
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
                            icon: "fas fa-question",
                            text: "Questions & Réponses",
                            action: () => kiss.router.navigateTo({
                                ui: "questions",
                                modelId: "question",
                                viewId: "questions-list"
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