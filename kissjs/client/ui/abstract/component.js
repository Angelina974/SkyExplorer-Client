/**
 * 
 * The **Component** is the base class for all KissJS UI components.
 * 
 * KissJS Component derives from HTMLElement, and therefore inherits all native DOM operations.
 * 
 * Most UI frameworks are encapsulating DOM elements with classes.
 * Instead of that, KissJS is directly attaching new properties and new methods to DOM elements.
 * 
 * Let's imagine a Panel component built with KissJS.
 * Because a KissJS Component is a pure DOM element, you can get your Panel using native DOM operations.
 * Then, once you have your panel, you can directly call its methods like this:
 * 
 * ```
 * const myPanel = document.getElementById("my-panel")
 * myPanel.expand()
 * myPanel.setAnimation("shakeX")
 * ```
 * 
 * This way, it avoids the overhead of encapsulation (= no additional layers to cross).
 * It's also easier to keep the memory clean: when you destroy your DOM element, everything attached to it (states, events...) is flushed and can be garbage collected.
 * 
 * KissJS components are partly using the Custom Web Components API.
 * They are "half" Custom Web Components in the sense they're not using shadow DOM.
 * 
 * They are recognizable and easy to lookup in the DOM because their tag name always starts with "a-", like:
 * "a-field", "a-button", "a-panel", "a-menu", and so on...
 * 
 * The Component base class also does a few things for us:
 * - id generation (all KissJS components must have ids)
 * - automatically inserted at a specific location in the DOM, using the optional "target" property
 * - keep the component config attached to the component, to be able to serialize it / save it / rebuild it later
 * - automatically adds a base class depending on the component type (example: "a-field", "a-button", ...)
 * - we can bind custom methods, using the "methods" config
 * - we can bind W3C events, using the "events" config
 * - we can "subscribe" the component to one ore more PubSub channels, using the "subscriptions" config
 * - a "render" method is automatically attached to manage the component rendering lifecycle
 * - a "load" method **can** be attached to manage the component's loading / re-loading (typically when the component generation relies on data)
 * - we can bind the component to one or more data collections, using the "collections" config: it will automatically reload the component when one of the binded collections changes
 * - a few helper methods are attached automatically (show, hide, toggle, animation, showLoading, hideLoading...)
 * - we can hook custom behavior in the lifecycle by using private methods like: _afterConnected, _afterRender, _afterShow, _afterHide, _afterDisconnected
 * 
 * _Schema overview of the instanciation and rendering_:
 * 
 * <img src="../../resources/doc/KissJS - Component.png">
 * 
 * @param {object} config
 * @param {string} [config.id] - id of the component. Will be auto-generated if not set
 * @param {boolean} [config.hidden] - true if the component is hidden when rendered for the 1st time
 * @param {string} [config.target] - DOM target insertion point
 * @param {object} [config.methods] - Custom methods of the component
 * @param {object} [config.events] - W3C events handled by the component
 * @param {object} [config.subscriptions] - Array of functions registered in the PubSub
 * @param {Collection[]} [config.collections] - List of collections bound to the compoent. Component will reload if a mutation occurs in one of its bound collections.
 * @param {string|object} [config.tip] - hover help message
 * @param {string|object} [config.animation] - Animation to perform when rendering for the 1st time
 * @param {boolean} [config.autoSize] - If true, the component will trigger its "updateLayout" method when its parent container is resized
 * @returns this
 */
kiss.ui.Component = class Component extends HTMLElement {
    constructor() {
        super()
    }

    /**
     * Generates a Component from a JSON config
     * 
     * @ignore
     * @param {object} config - JSON config
     * @returns {HTMLElement}
     */
    init(config) {
        if (!config) return null

        // Set a flag to define the HTMLElement as a KissJS component
        this.isComponent = true

        // Basic properties
        this.type = config.type || this.constructor.name.toLowerCase()
        this.id = config.id || "cmp-" + (kiss.global.componentCount++).toString()
        this.target = config.target || null // Insertion point in the DOM, or document.body otherwise
        this.config = config // Allows to trace back to the initial config, serialize it, save it, rebuild it

        // Short delay (in ms) while the component stays invisible while its size and position is calculated properly
        // It's not a perfect solution but it stabilizes the rendering behavior
        this.renderDelay = 25

        // Default CSS class is: a-{component-type}
        // Examples: a-field, a-checkbox, a-select, a-button, a-panel...
        this.classList.add("a-" + this.type.toLowerCase())
        if (kiss.screen.isMobile) this.classList.add("a-" + this.type.toLowerCase() + "-mobile")

        // Manage component visibility
        if (config.display) this.displayMode = config.display
        if (config.hidden == true) this.style.display = "none"

        // Setup the component tip/help text (message displayed when the component is hovered)
        if (config.tip) this.attachTip(config.tip)

        // Manage animations
        if (config.animation) this.setAnimation(config.animation)

        // Bind inline methods, defined by the "methods" property of the component
        const methods = config.methods
        if (methods) {
            for (let method in methods) {
                this[method] = methods[method]
            }
        }

        // Bind external methods, defined by calling kiss.views.addViewController(viewId, controllerObject)
        let viewControllers = kiss.views.viewControllers[this.id]

        // Handle the case where a mobile view doesn't have a mobile renderer but has a mobile controller
        if (kiss.screen.isMobile) {
            if (!this.id.includes("mobile")) {
                viewControllers = kiss.views.viewControllers["mobile-" + this.id] || kiss.views.viewControllers[this.id]
            }
        }

        if (viewControllers) {
            for (let method in viewControllers) {
                this[method] = viewControllers[method]
            }
        }

        // Bind custom events
        this._bindEvents(this.config.events)

        // Hold the component's subscriptions to the PubSub
        this.subscriptions = []

        if (this.config.subscriptions) {
            Object.keys(this.config.subscriptions).forEach(pubSubEventName => {
                this.subscriptions.push(
                    subscribe(pubSubEventName, this.config.subscriptions[pubSubEventName].bind(this))
                )
            })
        }

        // Observe when the parent container is resized in order to trigger an updateLayout
        if (config.autoSize) {
            this.resizeCount = 0
            this.subscriptions.push(
                subscribe("EVT_CONTAINERS_RESIZED", (containerIds) => {
                    if (this.parentNode == document.body || (this.parentNode && this.parentNode.id && containerIds.indexOf(this.parentNode.id) != -1)) {
                        // if (this.resizeCount != 0)
                        this.updateLayout("EVT_CONTAINER_RESIZED")
                        this.resizeCount++
                    }
                })
            )
        }

        //
        // Bind collections
        // It subscribes the component's *load* method to the database updates for the relative models
        //
        if (config.collections && config.collections.length > 0 && config.collections[0]) {
            this.collections = config.collections

            if (this.load) {
                // Get the events to observe
                const observedEvents = []

                this.collections.forEach(collection => {
                    let model = collection.model
                    let modelId = model.id
                    let events = ["EVT_DB_INSERT:", "EVT_DB_UPDATE:", "EVT_DB_DELETE:"]

                    events.forEach(EVT => {
                        let eventName = EVT + modelId.toUpperCase()
                        observedEvents.push(eventName)
                    })
                })

                // Subscribe the component to observe CUD mutations of its bound models
                observedEvents.forEach(eventName => {
                    //log(`kiss.ui.Component - Binding view <${this.id}> to event <${eventName}>`, 1)

                    this.subscriptions.push(
                        subscribe(eventName, (msgData) => {
                            // Will load or reload the component only if it's connected to the DOM
                            if (this.isConnected) {
                                log("kiss.ui - React to " + eventName + " - Component loading " + this.id, 2)
                                this.load(msgData)
                            }
                        })
                    )
                })

                // Subscribe the component to observe bulk updates too
                // (bulk updates can target multiple and different collections)
                const observedModels = this.collections.map(collection => collection.model.id)

                this.subscriptions.push(
                    subscribe("EVT_DB_UPDATE_BULK", (msgData) => {
                        // Will load or reload the component only if:
                        // - it's connected to the DOM
                        // - the bulk update contains an update related to the component's bound models
                        if (this.isConnected) {
                            let shouldLoad = false

                            // Check if one of the updates is related to a component's observed model
                            const bulkUpdates = msgData.data
                            bulkUpdates.forEach(update => {
                                if (observedModels.indexOf(update.modelId) != -1) shouldLoad = true
                            })

                            if (shouldLoad) {
                                log("EVT_DB_UPDATE_BULK - Component loading " + this.id, 2)
                                this.load(msgData)
                            }
                        }
                    })
                )
            }
        }

        return this
    }

    /**
     * Observe the connected-ness of the component and trigger the configured callback
     * 
     * @ignore
     */
    connectedCallback() {
        if (this._afterConnected) this._afterConnected()

        // TODO: before deploying on-the-fly translation: handle external values merged into the translated strings
        // this.translate()
    }

    disconnectedCallback() {
        if (this.loadingId) this.hideLoading() // Try to hide the loading mask (if any)

        if (this._afterDisconnected) this._afterDisconnected()
    }

    /**
     * Translate the localized elements of a Component on the fly
     * TODO: handle external values merged into the translated strings
     */
    translate() {
        Array.from(this.querySelectorAll(".translation")).forEach(element => {
            const textKey = kiss.language.hash[element.id]
            const newText = kiss.language.translate(textKey)
            element.innerHTML = newText
        })
    }

    /**
     * Render an Element at a specified DOM location
     * The rendering is optimized to render only the element that are detached from the DOM.
     * 
     * The render() method is chainable with other Component's methods.
     * For example:
     * ```
     * myElement.render().showAt(100, 100).setAnimation("shakeX")
     * ```
     * 
     * @param {*} [target] - optional DOM target insertion point
     * @param {boolean} load - true (default) to execute the component's load method after DOM insertion
     * @returns this
     */
    render(target, load = true) {
        // Hide the component while it's being rendered and sizes are computed
        this.style.visibility = "hidden"

        //log("Render: " + this.type + " - " + this.id + " on target " + target, 1)

        if (!this.isConnected) {
            // Add custom classes
            if (this.config && this.config.classes) this._dispatchClasses(this.config.classes)
            if (this.config && this.config.class) this.classList.add(this.config.class)

            // Add custom styles
            if (this.config && this.config.styles) this._dispatchStyles(this.config.styles)
            if (this.config && this.config.style) this.style.cssText += this.config.style
            if (this.config && this.config.hidden) this.style.display = "none"

            // Insert the component at a specfic DOM location
            this._insertIntoDOM(target, this.config && this.config.targetIndex)
        }

        // Render container's children, if any
        if ((this.items) && (this.items.length > 0)) this.items.forEach(item => item.render(item.target || target))

        // If the component has a load method, we call it
        if (load && (this.load)) {

            if (this.isComponent) {
                // KissJS components have a more complex loading process
                // because a component might rely on data that should be loaded before
                this._load()
            } else {
                // Standard HTMLElement
                this.load()
            }
        } else {
            // If the component has a sizing a method, we call it now
            if (this.updateLayout) this.updateLayout("Component.render")

            // If the component has an afterRender method, we execute it
            if (this._afterRender) this._afterRender()

            // Wait a short delay before displaying the component so that all sizes are already calculated
            setTimeout(() => this.style.visibility = "visible", this.renderDelay)
        }

        return this
    }

    /**
     * Update a component with a new config
     * 
     * - Internally, destroys the component and re-render it from its config.
     * - If the component was inside a parent container, it re-render it at the same position
     * - Attention: if the component received extra properties/methods/events outside it's default config, they will be lost
     * 
     * @param {object} [newConfig]
     * @returns {object} The new KissJS component
     */
    update(newConfig) {
        let component
        const config = this.config
        if (newConfig) Object.assign(config, newConfig)

        config.target = this.parentNode.id
        config.targetIndex = Array.from(this.parentNode.children).indexOf(this)

        // Remove the existing component
        this.deepDelete()

        // Build a new one and insert it in the DOM
        if (this.type) {
            if (["text", "textarea", "number", "date", "password", "lookup", "summary"].includes(this.type)) {
                // Input fields and textarea
                component = document.createElement("a-field").init(config)
            } else {
                // Other fields and elements
                component = document.createElement("a-" + this.type.toLowerCase()).init(config)
            }
        } else {
            // Block
            component = document.createElement("a-block").init(config)
        }

        return component.render()
    }

    /**
     * Insert the component at a specfic DOM location
     * 
     * @private
     * @ignore
     * @param {string} [target]
     */
    _insertIntoDOM(target, index) {
        // Define insertion point in the DOM
        let domTarget = target || this.target

        if (domTarget) {
            // If a dom target is specified, the component is appended here
            if (typeof domTarget == "string") {
                if (index) {
                    $(domTarget).insertBefore(this, $(domTarget).children[index])
                } else {
                    $(domTarget).appendChild(this)
                }
            } else {
                if (index) {
                    domTarget.insertBefore(this, domTarget.children[index])
                } else {
                    domTarget.appendChild(this)
                }
            }
        } else {
            // ... else it's rendered to the document body
            document.body.appendChild(this)
        }
    }

    /**
     * Load component's data
     * 
     * @private
     * @ignore
     */
    async _load() {
        try {
            // Load the records of the bound collections
            if (this.collections) {
                for (let collection of this.collections) {
                    await collection.find()
                }
            }

            // Call the "load" method of the component
            if (this.load) await this.load()

            // Once loaded, recompute the size and position if it has a "updateLayout" method
            if (this.updateLayout) this.updateLayout("Component._load")

            // If the component has an afterRender method, we execute it
            if (this._afterRender) this._afterRender()

            // Wait a short delay while all sizes are calculated
            setTimeout(() => this.style.visibility = "visible", this.renderDelay)

        } catch (err) {
            log("kiss.ui - Component - Loading error: " + this.id, 4)
            log(err)
        }
    }

    /**
     * Hide the component
     * 
     * @returns this
     */
    hide() {
        // Keep the current display mode in cache for future restore
        let currentDisplayMode = window.getComputedStyle(this, "")["display"]
        if (currentDisplayMode != "" && currentDisplayMode != "none") this.displayMode = currentDisplayMode

        this.style.display = "none"
        this.hidden = true

        if (this._afterHide) this._afterHide()

        return this
    }

    /**
     * Display the component
     * 
     * @param {string} [mode] - Force a display mode. Ex: block, flex, inline, inline-block, inline-flex
     * @returns this
     */
    show(mode) {
        if (this.style.display != "none") return this

        this.style.display = mode || this.displayMode || (this.config && this.config.display) || "block"
        this.hidden = false

        if (this._afterShow) this._afterShow()

        return this
    }

    /**
     * Show the component at a specified (x, y) position on the screen.
     * If the component leaks outside the viewport, it's re-centered to fit in.
     * 
     * @param {number} x - Coord x in pixels
     * @param {number} y - Coord y in pixels 
     * @param {number} [animationTimeInSeconds] - Optional parameter to animate the translation of the Element
     * @returns this
     * 
     * @example
     * // It wil take 2 seconds to translate to position 500,500:
     * myElement.showAt(500, 500, 2)
     */
    showAt(x, y, animationTimeInSeconds) {
        if (animationTimeInSeconds) this.style.transition = animationTimeInSeconds + "s"
        this.style.left = x + "px"
        this.style.top = y + "px"
        this.show().moveToViewport()
        return this
    }

    /**
     * Move the component inside the visible viewport.
     * This is useful for example to re-center a component so that it's entirely visible.
     * 
     * @returns this
     */
    moveToViewport() {
        kiss.tools.moveToViewport(this)
        return this
    }

    /**
     * Test if the component is hidden
     * 
     * @returns {boolean}
     */
    isHidden() {
        return (this.style.display == "none") || (this.hidden == true)
    }

    /**
     * Test if the component is visible
     * 
     * @returns {boolean}
     */
    isVisible() {
        return !this.isHidden()
    }

    /**
     * Show / hide alternatively the Component
     * 
     * @returns this
     */
    toggle() {
        if (this.isHidden()) {
            this.show()
        } else {
            this.hide()
        }
        return this
    }

    /**
     * Show a loading spinner over the Component.
     * By default, the overlay has the size of the element.
     * 
     * @param {object} config
     * @param {boolean} config.fullscreen - If true, the loading mask cover the full screen
     * @param {boolean} config.mask - Set to false to hide the background overlay
     * @param {number} config.spinnerSize - Size of the spinning symbol, in pixels
     * @returns this
     * 
     * @example
     * myPanel.showLoading({spinnerSize: 32})
     */
    showLoading(config = {}) {
        // Exit if the component is already in loading state
        if (this.isLoading) return

        const box = this.getBoundingClientRect()

        // Create an overlay
        const mask = document.createElement("div")
        mask.classList.add("component-loader-mask")
        mask.id = "mask-" + kiss.tools.shortUid()
        mask.style.top = (config.fullscreen == true) ? 0 : box.y + "px"
        mask.style.left = (config.fullscreen == true) ? 0 : box.x + "px"
        mask.style.width = (config.fullscreen == true) ? "100vw" : box.width + "px"
        mask.style.height = (config.fullscreen == true) ? "100vh" : box.height + "px"

        if (this.type == "panel") mask.style.borderRadius = "var(--panel-border-radius)"
        if (config.mask !== false) mask.style.background = "var(--background-overlay)"

        // Create the loading spinner
        const spinner = document.createElement("div")
        spinner.classList.add("component-loader")
        spinner.id = "spinner-" + this.id
        spinner.style.width = (config.spinnerSize || 32) + "px"
        spinner.style.height = (config.spinnerSize || 32) + "px"

        // Attach the spinner id to the element so that we can remove it later
        this.loadingId = mask.id

        // Attach overlay & spinner to the component
        const maskNode = document.body.appendChild(mask)
        maskNode.appendChild(spinner)

        this.isLoading = true
        return this
    }

    /**
     * Hide the loading spinner of the Component
     * 
     * @returns this
     */
    hideLoading() {
        try {
            $(this.loadingId).remove()
            delete this.loadingId
            this.isLoading = false
        } catch (err) {
            // log("<Component>.hideLoading() - Could not find element to hide:" + this.id)
        }
        return this
    }

    /**
     * Attach a tip text to the component
     * 
     * TODO: At the moment, attaching a tip prevents from having other "onmouseenter" events. Don't overwrite onmouseenter event
     * 
     * @param {object|text} tipConfig - Config object {text: ..., deltaX: ..., deltaY: ...}, or a simple string
     * @param {string} tipConfig.text - Tip text
     * @param {string} [tipConfig.textAlign] - Tip text alignment: "center", "right". Default "left"
     * @param {number} [tipConfig.x] - Optional static x
     * @param {number} [tipConfig.Y] - Optional static y
     * @param {number} [tipConfig.deltaX] - Shift the tip on X coordinate
     * @param {number} [tipConfig.deltaY] - Shift the tip on Y coordinate
     * @returns this
     * 
     * @example
     * // Using a configuration object
     * myField.attachTip({
     *  text: "Please enter your name",
     *  deltaX: 20,
     *  deltaY: 20
     * })
     * 
     * // Using a simple text
     * myField.attachTip("Please enter your name")
     */
    attachTip(tipConfig) {
        if (kiss.screen.isMobile) return
        if (kiss.screen.isTouch()) return
        if (this.tip) return

        if (typeof tipConfig === "object") {
            this.tip = createTip({
                target: this,
                text: tipConfig.text,
                textAlign: tipConfig.textAlign,
                x: tipConfig.x,
                y: tipConfig.y,
                deltaX: tipConfig.deltaX,
                deltaY: tipConfig.deltaY,
                minWidth: tipConfig.minWidth,
                maxWidth: tipConfig.maxWidth
            })
        } else {
            this.tip = createTip({
                target: this,
                text: tipConfig
            })
        }

        // Wait for the DOM before attaching the event
        setTimeout(() => {
            if (this.config && !this.isConnected) {
                // If the component is not initialized yet, we just modify its configuration
                if (!this.config.events) this.config.events = {}
                this.config.events.onmouseenter = () => this.tip.render()
            } else {
                // Otherwise, we override its onmouseenter event
                this.onmouseenter = () => this.tip.render()
            }
        }, 0)
        return this
    }

    /**
     * Detach the tip from the component (if any)
     * 
     * @returns this
     */
    detachTip() {
        if (!this.tip) return this
        this.tip.detach()
        delete this.tip
        return this
    }

    /**
     * Bind events to the Component
     * 
     * @private
     * @ignore
     * @param {object} events - Object containing the functions to bind to DOM events. Ex: {"click": event => {...}, "mouseover": event => {...} }
     * @param {HTMLElement} [target] - Optional DOM Element to which the event should be bound. Defaults to "this" (= the Component)
     * @returns this
     * 
     * @example
     * Event names can follow various conventions as they will be automatically normalized to the W3C event:
     * - change => OK
     * - onchange => OK
     * - onChange => OK
     */
    _bindEvents(events, target) {
        let targetElement = target || this

        if (events) {
            for (let event in events) {
                const eventName = (event.slice(0, 2).toLowerCase() == "on") ? event : "on" + event
                targetElement[eventName.toLowerCase()] = events[event]
            }
        }
        return this
    }

    /**
     * Apply multiple style properties on multiple targets.
     * 
     * The property array supports property aliases, in case the config object can't match the exact targeted property name.
     * See the example below with an aliased property (config.headerBackgroundColor will set panelHeader.style.backgroundColor)
     * 
     * @private
     * @ignore
     * @param {object} config - The configuration object passed to the Component init method
     * @param {array[][][]} rules - 3 dimensions array of rules that defines which properties should be applied to which targets.
     * @returns this
     * 
     * @example
     * // Here, the headerBackgroundColor config will set the backgroundColor property of the panel header style:
     * this._setProperties(config, [
     *      [["headerBackgroundColor=backgroundColor"], [panelHeader.style]],
     *      [["backgroundColor"], [panel.style]],
     *      [["padding"], [panelContent.style]],
     *      [["overflow", "overflowX", "overflowY"], [this.style, panel.style, panelContent.style]]
     * ])
     */
    _setProperties(config, rules) {
        rules.forEach(rule => {
            let properties = rule[0]
            let targets = rule[1]

            properties.forEach(property => {
                let [configProperty, targetProperty] = property.split("=")

                if (config[configProperty] != null) {

                    let value = config[configProperty]

                    // Every property involving a dimension goes through "_computeSize" process
                    if ([
                            "padding",
                            "margin",
                            "top",
                            "right",
                            "bottom",
                            "left",
                            "width",
                            "minWidth",
                            "maxWidth",
                            "height",
                            "minHeight",
                            "maxHeight",
                            "fontSize",
                            "iconSize",
                            "borderWidth",
                            "borderRadius",
                            "fieldWidth",
                            "fieldHeight",
                            "labelWidth"
                        ].includes(configProperty)) {
                        value = this._computeSize(configProperty)
                    }

                    targets.forEach(target => {
                        if (target) {
                            if (!targetProperty) {
                                target[configProperty] = value
                            } else {
                                target[targetProperty] = value
                            }
                        }
                    })
                }
            })
        })
        return this
    }

    /**
     * Compute the element size. It can handle various use cases:
     * - the size is a static string, like "300px" or "5vw" or "80em" => it's applied "as this"
     * - the size is static number, like 300 => it's converted to pixels: "300px"
     * - the size is a function => it's computed before being applied
     * 
     * @private
     * @ignore
     * @param {string} type - Example: "width", "labelWidth", "height", "top", "fontSize"
     * @returns {string} The computed size
     */
    _computeSize(type) {
        let newSize = this.config[type]

        // Size is a function
        if (typeof newSize == "function") {
            try {
                newSize = newSize()
            } catch (err) {
                //log("Couldn't compute the size of an element: " + this.id)
                newSize = 0
            }
        }

        // Size if a number => convert it to pixels
        if (typeof newSize == "number") newSize = newSize.toString() + "px"

        return newSize
    }

    /**
     * Set the component's size
     * 
     * @param {object} [config.width] - Any CSS valid size, or a number (will be converted to pixels)
     * @param {object} [config.height] - Any CSS valid size, or a number (will be converted to pixels)
     * @returns this
     * 
     * @example
     * myComponent.setSize({width: "10vw"})
     * myComponent.setSize({height: "100px"})
     * myComponent.setSize({width: 300, height: "20%"})
     */
    setSize(config) {
        if (config.width) {
            this.config.width = config.width
            this._setWidth()
        }
        if (config.height) {
            this.config.height = config.height
            this._setHeight()
        }
        return this
    }

    /**
     * Manage the component size & position
     * 
     * @private
     * @ignore
     */
    _setTop() {
        setTimeout(() => this.style.top = this._computeSize("top"), 0)
    }

    _setLeft() {
        setTimeout(() => this.style.left = this._computeSize("left"), 0)
    }

    _setBottom() {
        setTimeout(() => this.style.bottom = this._computeSize("bottom"), 0)
    }

    _setRight() {
        setTimeout(() => this.style.right = this._computeSize("right"), 0)
    }

    _setWidth() {
        setTimeout(() => this.style.width = this._computeSize("width"), 0)
    }

    _setMinWidth() {
        setTimeout(() => this.style.minWidth = this._computeSize("minWidth"), 0)
    }

    _setMaxWidth() {
        setTimeout(() => this.style.maxWidth = this._computeSize("maxWidth"), 0)
    }

    _setHeight() {
        setTimeout(() => this.style.height = this._computeSize("height"), 0)
    }

    _setMinHeight() {
        setTimeout(() => this.style.minHeight = this._computeSize("minHeight"), 0)
    }

    _setMaxHeight() {
        setTimeout(() => this.style.maxHeight = this._computeSize("maxHeight"), 0)
    }

    /**
     * Dispatch multiple CSS classes on a list of targeted classes elements
     * 
     * @private
     * @ignore
     * @param {object} cssClasses - Configuration should be passed as shown in the example below
     * @returns this
     * 
     * @example
     * this._dispatchClasses({
     *  "window-header": "myCSS1 myCSS2 myCSS3",
     *  "window-content": "myCSS4 myCSS5 myCSS6"
     * })
     */
    _dispatchClasses(cssClasses) {
        Object.keys(cssClasses).forEach(cssClass => {
            let arrayOfClasses = cssClasses[cssClass].split(/\s+/)

            try {
                // Add classes to the root element
                if (cssClass == "this") {
                    this.classList.add(...arrayOfClasses)
                }
                // Add classes to children nodes
                else {
                    let targetElement = this.querySelector("." + cssClass)
                    targetElement.classList.add(...arrayOfClasses)
                }
            } catch (err) {
                log(`Component._dispatchClasses: the class selector <${cssClass}> is not valid for the component <${this.id}>`, 2)
            }
        })
        return this
    }

    /**
     * Dispatch multiple styles on a list of targeted classes elements
     * 
     * @private
     * @ignore
     * @param {object} styles - Configuration should be passed as shown in the example below
     * @returns this
     * 
     * @example
     * this._dispatchStyles({
     *      "window-header": "background-color: #000000",
     *      "window-content": "background-color: #ffffff"
     * })
     */
    _dispatchStyles(styles) {
        if (styles) {
            Object.keys(styles).forEach(cssClass => {
                try {
                    // Add styles to the root element
                    if (cssClass == "this") {
                        let currentStyles = this.style.cssText
                        this.style = currentStyles + ";" + styles[cssClass]
                    }
                    // Add styles to children nodes
                    else {
                        let currentStyles = this.querySelector("." + cssClass).style.cssText
                        this.querySelector("." + cssClass).style = currentStyles + ";" + styles[cssClass]
                    }
                } catch (err) {
                    log(`Component._dispatchStyles: the class selector <${cssClass}> is not valid for the component <${this.id}>`, 2)
                }
            })
        }
        return this
    }

    /**
     * Toggle one or more CSS classes of a single HTMLElement
     * 
     * @private
     * @ignore
     * @param {string} cssClasses - String containing the names of the classes to toggle, separated with spaces. Ex: "panel panel-body"
     * @returns this
     */
    _toggleClass(cssClasses) {
        if (cssClasses) cssClasses.split(/\s+/).forEach(cssClass => this.classList.toggle(cssClass))
        return this
    }

    /**
     * Animate an HTMLElement.
     * 
     * - The animation must be set *before* rendering the component
     * - It's chainable, so it can be combined with render() and showAt()
     * 
     * Animation speed can be modified with the param "speed":
     * - slower
     * - slow
     * - fast
     * - faster
     * 
     * Animation repetition can be adjusted with the param "repeat":
     * - repeat-1
     * - repeat-2
     * - repeat-3
     * - infinite
     * 
     * Available animation names are:
     * - bounce
     * - flash
     * - pulse
     * - rubberBand
     * - shakeX
     * - shakeY
     * - headShake
     * - swing
     * - tada
     * - wobble
     * - jello
     * - heartBeat
     * - hinge
     * - jackInTheBox
     * - rollIn
     * - rollOut
     * - flipInX
     * - flipInY
     * - flipOutX
     * - flipOutY
     * - backInDown
     * - backInLeft
     * - backInRight
     * - backInUp
     * - backOutDown
     * - backOutLeft
     * - backOutRight
     * - backOutUp
     * - bounceIn
     * - bounceInDown
     * - bounceInLeft
     * - bounceInRight
     * - bounceInUp
     * - bounceOut
     * - bounceOutDown
     * - bounceOutLeft
     * - bounceOutRight
     * - bounceOutUp
     * - fadeIn
     * - fadeInDown
     * - fadeInDownBig
     * - fadeInLeft
     * - fadeInLeftBig
     * - fadeInRight
     * - fadeInRightBig
     * - fadeInUp
     * - fadeInUpBig
     * - fadeInTopLeft
     * - fadeInTopRight
     * - fadeInBottomLeft
     * - fadeInBottomRight
     * - fadeOut
     * - fadeOutDown
     * - fadeOutDownBig
     * - fadeOutLeft
     * - fadeOutLeftBig
     * - fadeOutRight
     * - fadeOutRightBig
     * - fadeOutUp
     * - fadeOutUpBig
     * - fadeOutTopLeft
     * - fadeOutTopRight
     * - fadeOutBottomLeft
     * - fadeOutBottomRight
     * - lightSpeedInRight
     * - lightSpeedInLeft
     * - lightSpeedOutRight
     * - lightSpeedOutLeft
     * - rotateIn
     * - rotateInDownLeft
     * - rotateInDownRight
     * - rotateInUpLeft
     * - rotateInUpRight
     * - rotateOut
     * - rotateOutDownLeft
     * - rotateOutDownRight
     * - rotateOutUpLeft
     * - rotateOutUpRight
     * - zoomIn
     * - zoomInDown
     * - zoomInLeft
     * - zoomInRight
     * - zoomInUp
     * - zoomOut
     * - zoomOutDown
     * - zoomOutLeft
     * - zoomOutRight
     * - zoomOutUp
     * - slideInDown
     * - slideInLeft
     * - slideInRight
     * - slideInUp
     * - slideOutDown
     * - slideOutLeft
     * - slideOutRight
     * - slideOutUp
     * 
     * @param {string|object} config - If the param is a string, it must be the animation name. Otherwise, it's a config like: {name: "zoomIn", speed: "fast", repeat: "repeat-3", callback: function() {...}}. Set the animation to false to remove the animation.
     * @param {string} config.name - Animation name
     * @param {string} [config.speed] - "slower" | "slow" | "fast" | "faster"
     * @param {string} [config.repeat] - "repeat-1" | "repeat-2" | "repeat-3" | "infinite"
     * @param {function} [config.callback] - Function to execute when the animation ends
     * @returns this - The component
     * 
     * @example
     * // Using only the animation name:
     * myComponent.setAnimation("fadeIn").render().showAt(100,100)
     * 
     * // Using a config object:
     * myComponent.setAnimation({
     *      name: "tada",
     *      speed: "fast",
     *      repeat: "repeat-1",
     *      callback: function() {
     *          this.hide()
     *      }
     * })
     * 
     * // Remove the animation
     * myComponent.setAnimation(false)
     */
    setAnimation(config) {
        // Remove all animation classes
        if (config === false) {
            Array.from(this.classList).forEach(className => {
                if (className.startsWith("animate__")) this.classList.remove(className)
            })
            return this
        }

        // Add animation classes
        let animationName, animationSpeed, animationRepeat

        if (typeof config === "string") {
            animationName = "animate__" + config
            animationSpeed = "animate__fast"
            animationRepeat = "animate__repeat-1"
        } else {
            animationName = (config.name) ? "animate__" + config.name : "animate__fadeIn"
            animationSpeed = (config.speed) ? "animate__" + config.speed : "animate__fast"
            animationRepeat = (config.repeat) ? "animate__" + config.repeat : "animate__repeat-1"
            this.animationCallback = config.callback
        }

        // Wait for the next frame before adding animation classes
        setTimeout(() => this.classList.add("animate__animated", animationName, animationSpeed, animationRepeat), 10)

        this.handleAnimationEnd = function (event) {
            event.stopPropagation()
            this.classList.remove("animate__animated", animationName, animationSpeed, animationRepeat)
            this.removeEventListener("animationend", this.handleAnimationEnd)

            if (typeof this.animationCallback === "function") this.animationCallback()
        }

        this.addEventListener("animationend", this.handleAnimationEnd, {
            once: true
        })

        return this
    }
};

/**
 * Find the Component encapsulating a DOM Element.
 * This is useful when you need to access the Component from an inner Element composing the Component.
 * 
 * @note
 * All the Components have their classname beginning with "a-", like "a-panel", "a-field", "a-button"...
 * So, we're simply looking for "a-" in the classname of the ancestors' hierarchy.
 * 
 * @param {HTMLElement} element - The element which we want to get the outer Component
 * @returns {HTMLElement} The DOM element found, or null
 */
HTMLElement.prototype.getComponent = function () {
    function getParent(node) {
        let parent = node.parentNode
        if (!parent) return null
        if (!parent.classList) return null
        if (parent.constructor.name == "HTMLDocument") return null
        return parent
    }

    let parentNode = this.parentNode
    while (getParent(parentNode)) {
        if (parentNode.classList.value != "") {
            if (parentNode.classList[0].slice(0, 2) == "a-") return parentNode
        }
        parentNode = parentNode.parentNode
    }

    return null
};

// Allow any HTMLElement to be processed in views like kiss Components
HTMLElement.prototype.render = kiss.ui.Component.prototype.render
HTMLElement.prototype._insertIntoDOM = kiss.ui.Component.prototype._insertIntoDOM
HTMLElement.prototype.show = kiss.ui.Component.prototype.show
HTMLElement.prototype.hide = kiss.ui.Component.prototype.hide
HTMLElement.prototype.showLoading = kiss.ui.Component.prototype.showLoading
HTMLElement.prototype.hideLoading = kiss.ui.Component.prototype.hideLoading
HTMLElement.prototype.attachTip = kiss.ui.Component.prototype.attachTip
HTMLElement.prototype.detachTip = kiss.ui.Component.prototype.detachTip
HTMLElement.prototype.setAnimation = kiss.ui.Component.prototype.setAnimation

;