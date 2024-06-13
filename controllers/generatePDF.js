/**
 * Code of the button to generate a PDF
 */
async function generatePDF() {

    // Vérifie si l'utilisateur a le droit d'imprimer une facture globale
    const selectedRecords = await kiss.selection.getRecordsFromActiveView()
    const record = selectedRecords[0]
    const canPrintInvoice = await kiss.acl.check({
        action: "printInvoice",
        record
    })

    if (canPrintInvoice) {
        displayPdf(selectedRecords)
    } else {
        createNotification('Vous n\'avez pas les droits pour imprimer cette facture')
    }
}

/**
 * Display PDF document in the browser
 * 
 * @param {Array} selectedRecords - Invoices to display in the PDF
 */
async function displayPdf(selectedRecords) {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    const img = new Image()
    img.src = './resources/img/facture.png' // Fond de page

    img.onload = function () {
        const pdfWidth = 210
        const pdfHeight = 297
        const startX = 20
        const columnX1 = 120
        const lineYadd = 7
        const lineYadd2 = 100
        let lineY = lineYadd2 + 10

        doc.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // Numéro de facture
        doc.setFont('Helvetica', "bold")
        doc.setFontSize(30)
        doc.setTextColor("#000055")
        doc.text("Facture N° :", 120, 45)
        doc.setFont('Helvetica', "normal")
        doc.setFontSize(25)
        doc.text(kiss.tools.shortUid().toUpperCase(), 120, 56)

        // Description
        doc.setFontSize(14)
        doc.setTextColor("#000055")

        // Date, Emetteur de la facture
        let today = new Date()
        totay = today.toLocaleDateString()

        doc.text("Date : " + totay, columnX1, 65)
        doc.text("Emis par : ", columnX1, 72)

        doc.setFont('Helvetica', "normal")
        doc.text(`${kiss.session.getUserName()}`, columnX1 + 26, 72)

        // Entête du tableau
        doc.setFont('Helvetica', "normal")
        doc.setFontSize(14)
        doc.setTextColor("#000000")

        doc.text("Référence", startX, lineYadd2)
        doc.text("Client", startX + 40, lineYadd2)
        doc.text("Date", startX + 80, lineYadd2)
        doc.text("Type", startX + 120, lineYadd2)
        doc.text("€HT/h", startX + 155, lineYadd2)

        doc.setFontSize(12)
        doc.setTextColor("#000055")

        let sum = 0
        for (let i = 0; i < selectedRecords.length; i++) {
            const reference = selectedRecords[i].invoiceId
            const client = selectedRecords[i].client
            const clientName = kiss.directory.getEntryName(client)
            const date = selectedRecords[i].date
           
            // Si le type de vol n'est pas renseigné, on affiche une chaîne vide
            if (!selectedRecords[i].flightType){
                selectedRecords[i].flightType = "";
            }
            const type = selectedRecords[i].flightType
            
            const montant = selectedRecords[i].totalPrice

            doc.text(reference, startX, lineY)
            doc.text(clientName, startX + 40, lineY)
            doc.text(date, startX + 80, lineY)
            doc.text(type, startX + 120, lineY)
            doc.text(montant.toString(), startX + 155, lineY)

            lineY += lineYadd
            sum += montant
        }

        // Total
        doc.text("Total HT : " + sum + "€", startX, lineY + 20)
        doc.text("TVA 20% : " + (sum * 0.2).toFixed(2) + "€", startX, lineY + 27)
        doc.text("Total TTC : " + sum * 1.2 + "€", startX, lineY + 34)

        doc.setDrawColor('#000000')
        doc.setLineWidth(0.3)
        doc.setLineDash([3, 3], 0)
        doc.line(startX - 4, 93, 192, 93)
        doc.line(startX - 4, 102, 192, 102)

        // Reglement
        doc.setFont('Helvetica', "normal")
        doc.setFontSize(14)
        doc.setTextColor("#000055")
        doc.text("En votre aimable règlement à réception.", startX, 220)

        window.open(doc.output('bloburl'))
    }
}

;