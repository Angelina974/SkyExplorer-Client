/**
 * Get the user type
 * 
 * @returns {string} The user type: "Administrateur", "Instructeur", "Elève pilote" or "Pilote"
 * 
 * @example
 * getUserType() // "Administrateur"
 */
function getUserType() {
    const user = kiss.directory.users.find(user => user.email == kiss.session.userId)
    return user.type
}

/**
 * Test if the user belongs to certain types
 * 
 * @param {string|string[]} types
 * @returns {boolean}
 * 
 * @example
 * isUser("Administrateur") // true if the user is an administrator
 * isUser(["Administrateur", "Instructeur"]) // true if the user is an administrator or an instructor
 */
function isUser(type) {
    if (Array.isArray(type)) {
        return type.includes(getUserType())
    }
    else {
        return getUserType() === type
    }
}