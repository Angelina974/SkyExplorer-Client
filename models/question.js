kiss.app.defineModel({
    id: "question",
    name: "Question",
    namePlural: "Questions",
    icon: "fas fa-question",
    color: "#00aaee",

    items: [
        {
            layout: "horizontal",
            defaultConfig: {
                width: "50%",
                fieldWidth: "100%",
                labelWidth: "100%",
                labelPosition: "top"
            },
            items: [
                // Eleve
                {
                    id: "student",
                    label: "Elève",
                    type: "directory",
                    value: "username"
                },
                // Instructeur
                {
                    id: "instructor",
                    label: "Instructeur",
                    type: "directory"
                }
            ]
        },
        // Question
        {
            id: "question",
            type: "textarea",
            label: "Question",
            rows: 10
        },
        // Réponse
        {
            id: "answer",
            type: "textarea",
            label: "Réponse",
            rows: 10
        }
    ]
})

;