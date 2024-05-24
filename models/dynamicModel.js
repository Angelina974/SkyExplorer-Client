/**
 * A "dynamicModel" is used to define custom (= user-defined) data structures.
 */
kiss.app.defineModel({
    id: "dynamicModel",
    splitBy: "accountId",
    
    name: "Dynamic model",
    namePlural: "Dynamic models",
    icon: "fas fa-th",
    color: "#00aaee",

    // Items of dynamic models are user-defined
    items: [
        {
            id: "modelId",
            dataType: String
        }
        // + other items created by the user
    ],

    acl: {
        permissions: {
            create: [
                {isOwner: true},
                {isManager: true},
                {authenticatedCanCreate: true},
                {isCreator: true},
                {isRestorer: true}
            ],
            update: [
                {isOwner: true, isLocked: false},
                {isManager: true, isLocked: false},
                {authenticatedCanUpdate: true, isLocked: false},
                {isUpdater: true, isLocked: false}
            ],
            delete: [
                {isOwner: true},
                {isManager: true},
                {authenticatedCanDelete: true},
                {isDeleter: true}
            ]
        },

        validators: {
            async isOwner({
                req
            }) {
                return (kiss.isServer) ? req.token.isOwner : kiss.session.isAccountOwner()
            },

            async isManager({
                req
            }) {
                return (kiss.isServer) ? req.token.isManager : kiss.session.isAccountManager()
            },            

            // Anyone who deleted a record can re-create, even without the right to create
            async isRestorer({userACL, req, model, record}) {
                const userId = (kiss.isClient) ? kiss.session.getUserId() : req.token.userId
                return record.deletedBy == userId
            },

            async authenticatedCanCreate({model}) {
                if (model.authenticatedCanCreate == undefined) return true
                return model.authenticatedCanCreate
            },

            async isCreator({userACL, model}) {
                if (model.accessCreate == undefined) return false
                return (kiss.tools.intersects(userACL, model.accessCreate))
            },

            async authenticatedCanUpdate({model}) {
                if (model.authenticatedCanUpdate == undefined) return true
                return model.authenticatedCanUpdate
            },

            async authenticatedCanDelete({model}) {
                if (model.authenticatedCanDelete == undefined) return true
                return model.authenticatedCanDelete
            },            

            async isUpdater({userACL, req, model, record}) {
                if (model.accessUpdate == undefined) return false

                // The user is a member of the update ACL
                if (kiss.tools.intersects(userACL, model.accessUpdate)) return true

                // The user is the creator of the record
                const userId = (kiss.isClient) ? kiss.session.getUserId() : req.token.userId
                if (model.accessUpdate.includes("$creator") && (userId == record.createdBy)) return true

                return false
            },

            async isDeleter({userACL, req, model, record}) {
                if (model.accessDelete == undefined) return false

                // The user is a member of the ACL
                if (kiss.tools.intersects(userACL, model.accessDelete)) return true

                // The user is the creator of the record
                const userId = (kiss.isClient) ? kiss.session.getUserId() : req.token.userId
                if (model.accessDelete.includes("$creator") && (userId == record.createdBy)) return true

                return false
            },
            
            async isLocked({record}) {
                return record.isLocked === true
            }
        }
    }
});