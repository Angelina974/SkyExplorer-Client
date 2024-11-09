/**
 * Global application namespace
 */
const app = {
    api: {
        goToHome() {
            kiss.router.navigateTo({
                ui: "home-start"
            })
        }
    }
}

;