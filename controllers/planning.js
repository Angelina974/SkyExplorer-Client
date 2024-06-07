/**
 * Méthode pour vérifier si un avion est disponible au jour et à l'heure demandée
 * 
 * @async
 * @returns {boolean} true si l'avion est disponible, false sinon
 */
async function checkAvailability() {
    const planeId = $("planeId").getValue()
    if (!planeId) {
        createNotification("Merci de choisir un avion pour pouvoir vérifier sa disponibilité à cette date & heure")
        return false
    }

    const hour = $("time").getValue()
    const date = $("date").getValue()

    const flights = kiss.app.collections.flight.records
    const planeFlights = flights.filter(flight => flight.planeId === planeId)
    const reservationsAtTheSameDateAndTime = planeFlights.filter(flight => flight.date === date && flight.time === hour)

    if (reservationsAtTheSameDateAndTime.length > 0) {
        createNotification("Désolé, l'avion est déjà réservé à cette date & heure !")
        return false
    }

    return true
}