function createDeleteButton(record) {
    $(record.id).addHeaderButton({
        icon: "fas fa-trash",
        height: 24,
        iconSize: 22,
        iconColor: "#CF0000",
        backgroundColor: "transparent",
        borderWidth: 0,
        margin: "0 10px 0 0",
        tip: "Supprimer cette fiche",
        action: async () => {
            createDialog({
                title: "Supprimer le vol",
                message: "Etes-vous sûr de vouloir supprimer le vol?",
                type: "danger",
                action: async () => {
                    await record.delete()
                    $(record.id).close()
                }
            })
        }
    })    
}

;