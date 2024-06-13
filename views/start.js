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
                // Partie gauche de la Home page
                {
                    class: "home-left",
                    type: "html",
                    width: "50%",
                    html: `<img src="./resources/img/skyExplorer.svg">`
                },
                // Conteneur pour les boutons de la Home page
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
                        margin: "1.5vh",
                        borderRadius: "var(--panel-border-radius)",
                        fontSize: 16,
                        boxShadow: "none",
                        boxShadowHover: "0 0 20px #0077c8"
                    },
                    items: [
                        // Planning des vols
                        {
                            hidden: !isUser(["Administrateur", "Instructeur"]),
                            type: "button",
                            icon: "fas fa-clipboard",
                            text: "Voir le planning des vols",
                            action: () => kiss.router.navigateTo("planning")
                        },
                        // Liste des exercices (progression élève)
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
                        // Factures
                        {
                            hidden: !isUser(["Administrateur"]),
                            type: "button",
                            icon: "fas fa-dollar-sign",
                            text: "Factures",
                            action: () => kiss.router.navigateTo({
                                ui: "invoices",
                                modelId: "invoice",
                                viewId: "invoices-list"
                            })
                        },
                        // Gestion du plan de formation
                        {
                            hidden: !isUser(["Administrateur", "Instructeur"]),
                            type: "button",
                            icon: "fas fa-user-graduate",
                            text: "Gérer le plan de formation",
                            action: () => kiss.router.navigateTo({
                                ui: "training",
                                modelId: "training",
                                viewId: "training-list"
                            })
                        },
                        // Gestion des avions
                        {
                            hidden: !isUser(["Administrateur", "Instructeur"]),
                            type: "button",
                            icon: "fas fa-fighter-jet",
                            text: "Suivi des avions",
                            action: () => kiss.router.navigateTo({
                                ui: "planes",
                                modelId: "plane",
                                viewId: "planes-list"
                            })
                        },
                        // Gestion des utilisateurs
                        {
                            hidden: !isUser(["Administrateur"]) && !kiss.session.isOwner,
                            type: "button",
                            icon: "fas fa-users",
                            text: "Gestion des utilisateurs",
                            action: () => kiss.router.navigateTo({
                                ui: "users",
                                modelId: "user",
                                viewId: "users-list"
                            })
                        },
                        // Gestion des questions & réponses
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
                        // Déconnexion
                        {
                            type: "button",
                            icon: "fas fa-power-off",
                            text: "Se déconnecter",
                            action: () => kiss.session.logout(),
                            events: {
                                mouseOver: function () {
                                    this.setAnimation({
                                        name: 'bounceIn',
                                        speed: 'faster'
                                    })
                                }
                            } 
                        }
                    ]
                }
            ]
        })
    }
})

;