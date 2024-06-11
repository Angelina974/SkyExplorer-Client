kiss.app.defineView({
    id: "invoices",
    renderer: function(id, target) {

        // Cherche la colonne "Montant" de la facture et active la propriété "summary" pour faire la somme sur cette colonne
        let columns = kiss.app.models.invoice.getFieldsAsColumns()
        columns.forEach(column => {
            if (column.title == "Montant de la facture") {
                column.summary = "sum"
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
                    type: "button",
                    text: "hello",
                    action: async () => {
                        const selectedRecords = await kiss.selection.getRecordsFromActiveView()
                        console.log(selectedRecords)
                        const record = selectedRecords[0]
                        const canPrintInvoice = await kiss.acl.check({
                            action: "printInvoice",
                            record
                        })
                        console.log(canPrintInvoice)
                        if (canPrintInvoice) {
                            getPdf()
                        } else {
                            createNotification('Vous n\'avez pas les droits pour imprimer cette facture')
                        }
                        
                    }
                },
                {
                    id: "invoices-list",
                    type: "datatable",
                    color: "var(--buttons-color)",
                    canEdit: true,
                    canCreateRecord: false,
                    height: () => kiss.screen.current.height - 60,
                    collection: kiss.app.collections.invoice,
                    columns,

                    // Regroupe les factures par mois
                    // Cela permettra de voir les sommes aggrégées par mois
                    group: ["month"],

                    actions: [
                        {
                            text: txtTitleCase("Supprimer les factures sélectionnés"),
                            icon: "fas fa-trash",
                            iconColor: "var(--red)",
                            action: () => kiss.selection.deleteSelectedRecords()
                        }                        
                    ],

                    methods: {
                        createRecord: async function() {
                            const newInvoice = kiss.app.models.invoice.create()
                            await newInvoice.save()
                            createForm(newInvoice)
                            createDeleteButton(newInvoice)
                        },
                        selectRecord: function(record) {
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



function getPdf() {
    const rows = document.querySelectorAll('.datatable-row');
    const rowData = [];

    rows.forEach(row => {
        const isSelected = row.classList.contains('datatable-row-selected');
        if (isSelected) {
            const rowNumber = row.getAttribute('row');

            const columns = row.querySelectorAll('.datatable-cell');
            const columnData = [];

            columns.forEach(column => {
                columnData.push(column.textContent.trim());
            });

            rowData.push({
                row: rowNumber,
                columns: columnData
            });
            /*0 Référence
            1 date de la facture
            2 Année / mois
            3 Client
            4 Montant de la facture 0euroHT/h
            5 Vol
            6 id du vol
            7 avion
            8 Date du vol
            9 Type du vol
            10 durée du vol
            */
        }
    });

    console.log(rowData);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const img = new Image();
    img.src = './resources/img/facture.png';  // Utilisez le chemin relatif approprié

    img.onload = function() {
        const imgProps = doc.getImageProperties(img);
        const pdfWidth = 210;
        const pdfHeight = 297;
        const startX = 20;
        const columnX1 = 120;
        const lineYadd = 7;
        const lineYadd2 = 100
        const lineYadd3 = lineYadd2 + 8
        let lineY;


        doc.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);

        //Gros titre
        doc.setFont('Saira sans-serif', "bold");          
        doc.setFontSize(30);
        doc.setTextColor("#000055");
        doc.text("Facture N° :", 120, 45);


        //description
        doc.setFont('Helvetica', "normal");          
        doc.setFontSize(14);
        doc.setTextColor("#000055");

        //${kiss.session.getUserName()}
        
        doc.text("Date :", columnX1, 60);
        doc.text("Echéance : ", columnX1, 67);
        doc.text("Client : ", columnX1, 74);

        doc.setFont('Helvetica', "normal");
        doc.text(`${kiss.session.getUserName()}`, columnX1 + 18, 74);


        //Tableur
        doc.setFont('Helvetica', "normal");          
        doc.setFontSize(14);
        doc.setTextColor("#000000");

        doc.text("Référence", startX, lineYadd2);
        doc.text("Date", startX + 40, lineYadd2);
        doc.text("Client", startX + 80, lineYadd2);
        doc.text("Type", startX + 120, lineYadd2);
        doc.text("€HT/h", startX + 155, lineYadd2);

        doc.setFontSize(12);
        doc.setTextColor("#000055");

        for (let i = 0; i < rowData.length; i++) {
            doc.text(rowData[i]["columns"][0], startX, lineYadd3); //Référence
            doc.text(rowData[i]["columns"][1], startX + 40, lineYadd3); //Date
            doc.text(rowData[i]["columns"][3], startX + 80, lineYadd3); //Client
            doc.text(rowData[i]["columns"][9], startX + 120, lineYadd3); //type du vol
            doc.text(rowData[i]["columns"][4], startX + 155, lineYadd3); //HT/h
            
            lineY += lineYadd;
        }

        doc.setDrawColor('#000000');
        doc.setLineWidth(0.5);
        doc.setLineDash([3, 3], 0);
        doc.line(startX-4, 77, 192, 77)
        doc.line(startX-4, 89, 192, 89)

        //Reglement
        doc.setFont('Helvetica', "normal");
        doc.setFontSize(14);
        doc.setTextColor("#000055");
        doc.text("Modalités et conditions de paiement: ", startX, 220); //Effectué ou pas

        
        window.open(doc.output('bloburl'));


    };//fin image bg

}//fin vrai fonction