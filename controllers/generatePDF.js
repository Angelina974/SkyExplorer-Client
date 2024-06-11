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