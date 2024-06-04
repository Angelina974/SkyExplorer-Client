kiss.app.defineModel({
    id: "user",
    name: "User",
    namePlural: "Users",
    icon: "fas fa-user",
    color: "#00aaee",

    items: [{
            id: "accountId"
        },
        {
            id: "email",
            type: "text",
            label: "Email",
            primary: true
        },
        {
            id: "firstName",
            type: "text",
            label: "Prénom"
        },
        {
            id: "lastName",
            type: "text",
            label: "Nom"
        },
        {
            id: "type",
            type: "select",
            label: "Type",
            options: [
                "Administrateur",
                "Instructeur",
                "Elève pilote",
                "Pilote"
            ]
        },
        {
            id: "active"
        },
        {
            id: "password"
        },
        {
            id: "isCollaboratorOf"
        },
        {
            id: "invitedBy"
        },
        {
            id: "currentAccountId"
        }
    ],

    acl: {
        permissions: {
            update: [{
                    isOwner: true
                }
            ],
            delete: [{
                    isOwner: true
                }
            ]
        },

        validators: {
            async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            }
        }
    }
})

;