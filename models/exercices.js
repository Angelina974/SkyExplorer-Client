kiss.app.defineModel({
    id: "exercices",
    name: "exercices",
    icon: "fas fa-fighter-jet",
    color: "#00aaee",

    items: [
        {
            id: "Exercices",
            type: "text",
            label: "Exercices"
        },
        {
            id: "notes",
            type: "select",
            label: "notes",
            options: [
                {   value: "A", color: "#00FF08" },
                {   value: "B", color: "#A8FFCD" },
                {   value: "C", color: "#FCFF42" },
                {   value: "D", color: "#FFB44D" },
                {   value: "E", color: "#FF784D" },

            ]
        },
     ]
     
});