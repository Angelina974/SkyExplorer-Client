async function generatePDF() {
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
        let lineY = lineYadd2 + 10;


        doc.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);

        //Numéro de facture
        doc.setFont('Helvetica', "bold");          
        doc.setFontSize(30);
        doc.setTextColor("#000055");
        doc.text("Facture N° :", 120, 45);
        doc.setFont('Helvetica', "normal")
        doc.setFontSize(25);
        doc.text(kiss.tools.shortUid().toUpperCase(), 120, 56)

        //description
        doc.setFontSize(14);
        doc.setTextColor("#000055");

      
        // Date, Echéance, Client
        let today = new Date()
        totay = today.toLocaleDateString()

        doc.text("Date : " + totay, columnX1, 65);
        doc.text("Client : ", columnX1, 72);

        doc.setFont('Helvetica', "normal");
        doc.text(`${kiss.session.getUserName()}`, columnX1 + 18, 72);


        //Tableur
        doc.setFont('Helvetica', "normal");          
        doc.setFontSize(14);
        doc.setTextColor("#000000");

        doc.text("Référence", startX, lineYadd2);
        doc.text("Client", startX + 40, lineYadd2);
        doc.text("Date", startX + 80, lineYadd2);
        doc.text("Type", startX + 120, lineYadd2);
        doc.text("€HT/h", startX + 155, lineYadd2);

        doc.setFontSize(12);
        doc.setTextColor("#000055");


        let sum = 0;
        for (let i = 0; i < rowData.length; i++) {
            doc.text(rowData[i]["columns"][0], startX, lineY); //Référence
            doc.text(rowData[i]["columns"][1], startX + 40, lineY); //Client
            doc.text(rowData[i]["columns"][3], startX + 80, lineY); //Date
            doc.text(rowData[i]["columns"][9], startX + 120, lineY); //type du vol
            doc.text(rowData[i]["columns"][4], startX + 155, lineY); //HT/h
            
            lineY += lineYadd;

            // Gestion du total
            let totalHt = rowData[i]["columns"][4]
            totalHt = totalHt.replace(" €HT/h", "")
            totalHt = totalHt.replace(",", ".")
            sum += Number(totalHt)            
        }

        //Total
        doc.text("Total HT : " + sum + "€", startX, lineY + 20);
        doc.text("TVA 20% : " + sum*0.2 + "€", startX, lineY + 27);
        doc.text("Total TTC : " + sum*1.2 + "€", startX, lineY + 34);

        doc.setDrawColor('#000000');
        doc.setLineWidth(0.3);
        doc.setLineDash([3, 3], 0);
        doc.line(startX-4, 93, 192, 93)
        doc.line(startX-4, 102, 192, 102)

        //Reglement
        doc.setFont('Helvetica', "normal");
        doc.setFontSize(14);
        doc.setTextColor("#000055");
        doc.text("En votre aimable règlement à réception.", startX, 220);

        
        window.open(doc.output('bloburl'));


    };//fin image bg

}//fin vrai fonction