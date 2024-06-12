kiss.app.defineView({
    id: "users",
    renderer: function(id, target) {

        // Génère les colonnes à partir des champs du modèle, et ajoute une colonne de type "bouton"
        let columns = kiss.app.models.invoice.getFieldsAsColumns()
        columns.push({
            title: "Actions",
            type: "button",
            button: {
                icon: "fas fa-key",
                text: "Modifier les accès",
                action: function(rowIndex, columnId, recordId, record) {

                    // Empêche de modifier les droits de l'utilisateur connecté (on ne peut pas se retirer ses propres droits)
                    if (kiss.session.userId == record.email) {
                        // return createNotification("Vous ne pouvez pas modifier vos propres droits")
                    }

                    // Affiche une boite de dialogue pour modifier les droits de l'utilisateur
                    createDialog({
                        title: "Modifier les droits de l'utilisateur",
                        icon: "fas fa-key",
                        type: "select",
                        autoClose: false,
                        message: "Choisissez le nouveau type d'utilisateur :",
                        options: [
                            {
                                value: "Administrateur",
                                color: "#ff0000"
                            },
                            {
                                value: "Instructeur",
                                color: "#00aaee"
                            },
                            {
                                value: "Elève pilote",
                                color: "#55cc00"
                            },
                            {
                                value: "Pilote",
                                color: "#556677"
                            }
                        ],
                        action: async function(newUserType) {

                            if (newUserType === "") {
                                createNotification("Vous devez choisir un type d'utilisateur")
                                return false
                            }

                            // Vérifie les droits côté client
                            const canUpdate = await kiss.acl.check({
                                action: "update",
                                record
                            })

                            // Si on ne peut pas mettre à jour, on affiche une notification
                            if (!canUpdate) {
                                return createNotification("Vous n'avez pas les droits pour modifier un utilisateur")
                            }

                            // Sinon on lance la mise à jour (qui sera aussi vérifiée côté serveur)
                            await record.update({
                                email: record.email,
                                type: newUserType
                            })
                            
                            // Si le user mis à jour est le même que le user connecté => reload pour mettre à jour les droits
                            if (kiss.session.userId == record.email) {
                                document.location.reload()
                            }

                            return true
                        }
                    }).render()
                }
            }
        })

        return createBlock({
            id,
            target,
            fullscreen: true,
            layout: "vertical",
            items: [
                createTopBar(),
                {
                    id: "users-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: false,
                    canCreateRecord: false,
                    canSelect: false,
                    showAction: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.user,
                    columns,
                    methods: {
                        selectRecord: function(record) {
                            record.isLocked = true
                            createForm(record)
                            createDeleteButton(record)
                        }
                    }
                }
            ]
        })
    }
})

;