    let arrayUsers = [];
    let htmlAdd = "";

    function usersFind() {
        kiss.db.find("user")
            .then(users => {
                users.forEach(user => {
                    console.log("user :", user);
                    arrayUsers.push(user);
                    document.getElementById("userSelect").innerHTML += "<option value='" + user['firstName'] + " " + user['lastName'] + "'>" + user['firstName'] + " " + user['lastName'] + "</select>";
                });
                
            })
            .catch(error => {
                console.error("Error retrieving users:", error);
            });


    }

    usersFind();

    kiss.app.defineView({
        id: "formations",
        renderer: function(id, target) {
            usersFind();
            return createBlock({
                id,
                target,
                fullscreen: true,
                layout: "vertical",
                items: [
                    createTopBar(),
                    {
                        type: "html",
                        html: `<select class="userSelect" id="userSelect">

                        </select>`
                    },
                    {
                        type: "directory",
                        width: 300,
                        label: "User",
                        labelPosition: "top"
                    },
                    {
                        id: "usersDelete",
                        type: "datatable",
                        height: () => kiss.screen.current.height - 90,
                        collection: kiss.app.collections.formation,
    
                        actions: [
                            {
                                text: txtTitleCase("Supprimer les users"),
                                icon: "fas fa-trash",
                                iconColor: "var(--red)",
                                action: () => kiss.selection.deleteSelectedRecords()
                            }                        
                        ],
    
                        methods: {
                            createRecord: async function() {
                                const newFormation = kiss.app.models.formation.create()
                                await newFormation.save()
                                createForm(newFormation)
                            },
                            selectRecord: function(record) {
                                createForm(record)
                            }
                        }
                    },
                ]
    
    
            })
            }
    
        })    