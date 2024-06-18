// Création d'un composant TopBar de type block
function createTopBar() {
    return {
        // Propriétés de CSS directement appliquées
        layout: "horizontal",
        alignItems: "center",
        height: 70,
        background: "var(--skyexplorer-color)",

        // Liste des éléments enfants que va contenir tout le composant TopBar
        items: [

            // Bouton de retour
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
                boxShadow: "0 0 5px #000055",
                fontSize: 18,
                borderWidth: 0,

                // Fonction qui permet de revenir à la page d'accueil
                action: () => kiss.router.navigateTo("home-start"),

                // Animation au survol
                events: {
                    mouseOver: function () {
                        this.setAnimation({
                            name: 'bounceIn',
                            speed: 'faster'
                        })
                    }
                }
            },

            // Espace qui prend tout l'espace disponible
            {
                type: "spacer",
                flex: 1
            },

            // Logo de Sky Explorer
            {
                type: "image",
                src: "./resources/img/sky-explorer white-logo.svg",
                width: 100,

                // Animation au survol
                events: {
                    mouseOver: function () {
                        this.setAnimation({
                            name: 'bounceIn',
                            speed: 'faster'
                        })
                    }
                }
            },

            // Espace qui prend tout l'espace disponible
            {
                type: "spacer",
                flex: 1
            },
            // Nom de l'utilisateur connecté
            {
                type: "html",
                color: "#ffffff",
                margin: "0 14px 0 0",
                // Récupère le nom de l'utilisateur connecté avec la fonction kiss.session.getUserName()
                html: `<span class="fas fa-user" style="font-size: 20px;"></span> &nbsp; &nbsp; <span style="font-size: 18px;">${kiss.session.getUserName()}</span>`
            },

            // Boutons de configuration 
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
                boxShadow: "0 0 5px #000055",
                borderWidth: 0,

                // Fonction qui permet de changer le thème de l'application
                action: () => kiss.theme.select(),

                // Animation au survol
                events: {
                    mouseOver: function () {
                        this.setAnimation({
                            name: 'bounceIn',
                            speed: 'faster'
                        })
                    }
                }
            },

            // Bouton de déconnexion
            {
                type: "button",
                icon: "fas fa-power-off",

                // Propriétés de CSS directement appliquées
                margin: "0 10px 0 0",
                width: 35,
                height: 35,
                borderRadius: 16,
                iconColor: "#ffffff",
                iconSize: 15,
                color: "#ffffff",
                background: "var(--buttons-color)",
                boxShadow: "0 0 5px #000055",
                borderWidth: 0,

                // Fonction qui permet de se déconnecter
                action: () => kiss.session.logout(),

                // Animation au survol
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
}

;