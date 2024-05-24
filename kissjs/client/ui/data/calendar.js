/** 
 * 
 * The **Calendar** derives from [DataComponent](kiss.ui.DataComponent.html).
 * 
 * @param {object} config
 * @param {string} [config.date] - The initial date to display in the timeline (default = today)
 * @param {string} [config.period] - "month" (default) | "3 weeks" | "2 weeks" | "1 week" | "1 week + details"
 * @param {boolean} [config.startOnMonday]
 * @param {boolean} [config.showWeekend]
 * @param {string} config.dateField - The field to use as reference for the calendar
 * @param {string} [config.timeField]
 * @param {Collection} config.collection - The data source collection
 * @param {object} [config.record] - Record to persist the view configuration into the db
 * @param {object[]} [config.columns] - Where each column is: {title: "abc", type: "text|number|integer|float|date|button", id: "fieldId", button: {config}, renderer: function() {}}
 * @param {string} [config.color] - Hexa color code. Ex: #00aaee
 * @param {boolean} [config.showToolbar] - false to hide the toolbar (default = true)
 * @param {boolean} [config.showActions] - false to hide the custom actions button (default = true)
 * @param {boolean} [config.showSetup] - false to hide the setup button (default = true)
 * @param {boolean} [config.canFilter] - false to hide the filter button (default = true)
 * @param {boolean} [config.canSelectFields] - false to hide the button to select fields (default = true)
 * @param {boolean} [config.canChangePeriod] - false to hide the possibility to change period (1 month, 2 weeks...) (default = true)
 * @param {boolean} [config.canCreateRecord] - Can we create new records from the calendar?
 * @param {object[]} [config.actions] - Array of menu actions, where each menu entry is: {text: "abc", icon: "fas fa-check", action: function() {}}
 * @param {number|string} [config.width]
 * @param {number|string} [config.height]
 * @returns this
 * 
 * ## Generated markup
 * ```
 * <a-calendar class="a-calendar">
 *      <div class="calendar-toolbar">
 *          <!-- Calendar toolbar items -->
 *      </div>
 *      <div class="calendar-body">
 *          <!-- Calendar entries here -->
 *      </div>
 * </a-calendar>
 * ```
 */
kiss.ui.Calendar = class Calendar extends kiss.ui.DataComponent {
    /**
     * Its a Custom Web Component. Do not use the constructor directly with the **new** keyword.
     * Instead, use one of the 3 following methods:
     * 
     * Create the Web Component and call its **init** method:
     * ```
     * const myCalendar = document.createElement("a-calendar").init(config)
     * ```
     * 
     * Or use the shorthand for it:
     * ```
     * const myCalendar = createCalendar({
     *   id: "my-calendar",
     *   color: "#00aaee",
     *   collection: kiss.app.collections["meetings"],
     *   
     *   // We can add custom methods, and also override default ones
     *   methods: {
     * 
     *      // Override the createRecord method
     *      createRecord(model) {
     *          // Create a record from this model
     *          console.log(model)
     *      },
     * 
     *      // Override the selectRecord method
     *      selectRecord(record) {
     *          // Show the clicked record
     *          console.log(record)
     *      },
     * 
     *      sayHello: () => console.log("Hello"),
     *   }
     * })
     * 
     * myCalendar.render()
     * ```
     */
    constructor() {
        super()
    }

    /**
     * Generates a Calendar from a JSON config
     * 
     * @ignore
     * @param {object} config - JSON config
     * @returns {HTMLElement}
     */
    init(config) {
        // This component must be resized with its parent container
        config.autoSize = true

        // Init the parent DataComponent
        super.init(config)

        // Options
        this.showToolbar = (config.showToolbar !== false)
        this.showActions = (config.showActions !== false)
        this.showSetup = (config.showSetup !== false)
        this.canSearch = (config.canSearch !== false)
        this.canFilter = (config.canFilter !== false)
        this.canSelectFields = (config.canSelectFields !== false)
        this.canChangePeriod = (config.canChangePeriod !== false)
        this.color = config.color || "#00aaee"
        this.actions = config.actions || []

        // Build calendar skeletton markup
        let id = this.id
        this.innerHTML =
            /*html*/
            `<div id="calendar-toolbar:${id}" class="calendar-toolbar">
                <div id="create:${id}"></div>
                <div id="actions:${id}"></div>
                <div id="setup:${id}"></div>
                <div id="select:${id}"></div>
                <div id="filter:${id}"></div>
                <div id="refresh:${id}"></div>
                <div class="spacer"></div>
                <div id="title:${id}" class="calendar-title"></div>
                <div class="spacer"></div>
                <div id="pager-index:${id}" class="calendar-toolbar-pager-index"></div>
                <div id="pager-mode:${id}"></div>
                <div id="pager-previous:${id}"></div>
                <div id="pager-next:${id}"></div>
                <div id="pager-today:${id}"></div>
                <div id="layout:${id}"></div>
            </div>
            <div id="calendar-body:${id}" class="calendar-body">`.removeExtraSpaces()

        // Set calendar components
        this.calendar = this.querySelector(".calendar")
        this.calendarToolbar = this.querySelector(".calendar-toolbar")
        this.calendarBody = this.querySelector(".calendar-body")

        this._initColumns(config.columns)
            ._initCalendarParams(config)
            ._initTexts()
            ._initElementsVisibility()
            ._initEvents()
            ._initSubscriptions()

        return this
    }

    /**
     * Load data into the calendar.
     * 
     * @private
     * @ignore
     */
    async load() {
        try {
            log(`kiss.ui - Calendar ${this.id} - Loading collection <${this.collection.id} (changed: ${this.collection.hasChanged})>`)

            this.collection.filter = this.filter
            this.collection.filterSyntax = this.filterSyntax
            await this.collection.find({}, true)

            this._renderToolbar()
            this.showCalendar(this.date)

        } catch (err) {
            log(err)
            log(`kiss.ui - Calendar ${this.id} - Couldn't load data properly`)
        }
    }

    /**
     * Reload the data and re-render
     */
    async reload() {
        await this.load()
        this._initColumns()
        this._render()
    }

    /**
     * Update the calendar layout
     */
    updateLayout() {
        if (this.isConnected) {
            this._render()
        }
    }

    /**
     * Update the calendar color (toolbar buttons + modal windows)
     * 
     * @param {string} newColor
     */
    async setColor(newColor) {
        this.color = newColor
        Array.from(this.calendarToolbar.children).forEach(item => {
            if (item && item.firstChild && item.firstChild.type == "button") item.firstChild.setIconColor(newColor)
        })
        this._render()
    }

    /**
     * Show the calendar at a given date
     * 
     * @param {date|string} date - Date given as a Date or an ISO date string like "2023-06-24"
     * @returns this
     */
    showCalendar(date) {
        if (typeof date == "string" && kiss.tools.isISODate(date, true)) date = new Date(date)
        const animation = (date.toISO() == this.date.toISO()) ? "fadeIn" : ((date.toISO() < this.date.toISO()) ? "slideInLeft" : "slideInRight")
        this.date = date
        this._render()

        this.calendarBody.setAnimation({
            name: animation,
            speed: "light"
        })
        return this
    }

    /**
     * Show the window to setup the calendar:
     * - source date field
     * - source time field
     * - prefered layout (1 month, 2 weeks, 1 week...)
     * - show week-ends
     * - week starts on monday
     */
    showSetupWindow() {
        let dateFields = this.model.getFieldsByType("date")
            .filter(field => !field.deleted)
            .map(field => {
                return {
                    value: field.id,
                    label: field.label.toTitleCase()
                }
            })

        let timeFields = this.model.getFieldsByType("select")
            .filter(field => !field.deleted && field.template == "time")
            .map(field => {
                return {
                    value: field.id,
                    label: field.label.toTitleCase()
                }
            })

        createPanel({
            icon: "fas fa-calendar",
            title: txtTitleCase("setup the calendar"),
            headerBackgroundColor: this.color,
            modal: true,
            draggable: true,
            closable: true,
            align: "center",
            verticalAlign: "center",
            width: 400,

            defaultConfig: {
                labelPosition: "top",
                optionsColor: this.color
            },

            items: [
                // Source date field
                {
                    type: "select",
                    id: "calendar-datefield:" + this.id,
                    label: txtTitleCase("date field used"),
                    options: dateFields,
                    maxHeight: () => kiss.screen.current.height - 200,
                    value: this.dateField,
                    events: {
                        change: async function () {
                            let dateField = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                dateField
                            })
                        }
                    }
                },
                // Source time field
                {
                    type: "select",
                    id: "calendar-timefield:" + this.id,
                    label: txtTitleCase("time field used"),
                    options: timeFields,
                    maxHeight: () => kiss.screen.current.height - 200,
                    value: this.timeField,
                    events: {
                        change: async function () {
                            let timeField = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                timeField
                            })
                        }
                    }
                },
                // Default period
                {
                    type: "select",
                    id: "calendar-period:" + this.id,
                    label: txtTitleCase("default period"),
                    options: [{
                            label: txtTitleCase("month"),
                            value: "month"
                        },
                        {
                            label: "3 " + txtTitleCase("weeks"),
                            value: "3 weeks"
                        },
                        {
                            label: "2 " + txtTitleCase("weeks"),
                            value: "2 weeks"
                        },
                        {
                            label: "1 " + txtTitleCase("week"),
                            value: "1 week"
                        },
                        {
                            label: "1 " + txtTitleCase("week") + " + " + txtTitleCase("details"),
                            value: "1 week + details"
                        }
                    ],
                    value: this.period || "month",
                    events: {
                        change: async function () {
                            let period = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                period
                            })
                        }
                    }
                },
                // Show week-end ?
                {
                    type: "checkbox",
                    id: "calendar-showWeekend:" + this.id,
                    label: txtTitleCase("show week-ends"),
                    labelPosition: "right",
                    shape: "switch",
                    iconColorOn: this.color,
                    value: this.showWeekend,
                    events: {
                        change: async function () {
                            let showWeekend = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                showWeekend
                            })

                            if (showWeekend == true) {
                                $("calendar-startOnMonday:" + viewId).show()
                            } else {
                                $("calendar-startOnMonday:" + viewId).hide()
                            }
                        }
                    }
                },
                // Weeks start on monday ?
                {
                    hidden: !this.showWeekend,
                    type: "checkbox",
                    id: "calendar-startOnMonday:" + this.id,
                    label: txtTitleCase("weeks start on monday"),
                    labelPosition: "right",
                    shape: "switch",
                    iconColorOn: this.color,
                    value: this.startOnMonday,
                    events: {
                        change: async function () {
                            let startOnMonday = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                startOnMonday
                            })
                        }
                    }
                }
            ]
        }).render()
    }

    /**
     * Show the window just under the fields selector button
     */
    showFieldsWindow() {
        let selectionButton = $("select:" + this.id)
        const box = selectionButton.getBoundingClientRect()
        super.showFieldsWindow(box.left, box.top + 40, this.color)
    }

    /**
     * Show the window just under the filter button
     */
    showFilterWindow() {
        super.showFilterWindow(null, null, this.color)
    }

    /**
     * Define the specific calendar params:
     * - the initial date
     * - date field used to filter and display records
     * - time field used
     * - displayed period (1 month, 2 months...)
     * - start on Monday
     * - show weekend
     * 
     * @private
     * @ignore
     * @param {object} config - {date, dateField, timeField, period, startOnMonday, showWeekend
     * @returns this
     */
    _initCalendarParams(config) {
        this.date = this.config.date || new Date()

        if (this.record) {
            this.dateField = config.dateField || this.record.config.dateField
            this.timeField = config.timeField || this.record.config.timeField
            this.period = config.period || this.record.config.period || "month"
            this.startOnMonday = (config.hasOwnProperty("startOnMonday")) ? !!config.startOnMonday : (this.record.config.startOnMonday !== false)
            this.showWeekend = (config.hasOwnProperty("showWeekend")) ? !!config.showWeekend : (this.record.config.showWeekend !== false)

        } else {
            this.dateField = config.dateField || this.config.dateField
            this.timeField = config.timeField || this.config.timeField
            this.period = config.period || this.config.period || "month"
            this.startOnMonday = (config.hasOwnProperty("startOnMonday")) ? !!config.startOnMonday : (this.config.startOnMonday !== false)
            this.showWeekend = (config.hasOwnProperty("showWeekend")) ? !!config.showWeekend : (this.config.showWeekend !== false)
        }

        // Defaults to the first date field, or the creation date if no date field was found
        if (!this.dateField) {
            let modelDateFields = this.model.getFieldsByType(["date"])
            if (modelDateFields.length != 0) {
                this.dateField = modelDateFields[0].id
            } else {
                this.dateField = "createdAt"
            }
        }

        // Defaults to the first time field
        if (!this.timeField && this.timeField !== "") {
            let modelTimeFields = this.model.getFieldsByType(["select"])
            modelTimeFields = modelTimeFields.filter(field => field.template == "time")

            if (modelTimeFields.length != 0) {
                this.timeField = modelTimeFields[0].id
            }
        }

        return this
    }

    /**
     * Set toolbar visibility
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initElementsVisibility() {
        if (this.showToolbar == false) this.calendarToolbar.style.display = "none"
        return this
    }    

    /**
     * Initialize subscriptions to PubSub
     * 
     * TODO: don't reload the view when records are inserted/deleted/updated outside of the current viewport
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initSubscriptions() {
        super._initSubscriptions()

        const viewModelId = this.modelId.toUpperCase()

        this.subscriptions = this.subscriptions.concat([
            // Local events (not coming from websocket)
            subscribe("EVT_VIEW_SETUP:" + this.id, (msgData) => this._updateConfig(msgData)),

            // React to database mutations
            subscribe("EVT_DB_INSERT:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData)),
            subscribe("EVT_DB_UPDATE:" + viewModelId, (msgData) => this._updateOneAndReload(msgData)),
            subscribe("EVT_DB_DELETE:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData)),
            subscribe("EVT_DB_INSERT_MANY:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData, 2000)),
            subscribe("EVT_DB_UPDATE_MANY:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData, 2000)),
            subscribe("EVT_DB_DELETE_MANY:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData, 2000)),
            subscribe("EVT_DB_UPDATE_BULK", (msgData) => this._reloadWhenNeeded(msgData, 2000))
        ])

        return this
    }

    /**
     * Initialize all calendar events
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initEvents() {
        this.onclick = async (event) => {
            const clickedElement = event.target
            const recordElement = clickedElement.closest(".calendar-record")
            if (!recordElement) return

            if (recordElement.classList.contains("calendar-record")) {
                const recordId = recordElement.getAttribute("recordid")
                const record = await this.collection.getRecord(recordId)
                await this.selectRecord(record)
                return event
            }
        }
        return this
    }

    /**
     * Render the calendar
     * 
     * @private
     * @ignore
     * @returns this
     */
    _render() {
        switch (this.period) {
            case "month":
                return this._renderAsWeeks(6)
            case "3 weeks":
                return this._renderAsWeeks(3)
            case "2 weeks":
                return this._renderAsWeeks(2)
            case "1 week":
                return this._renderAsWeeks(1)
            case "1 week + details":
                return this._renderAsWeeks(1, true)
            default:
                return this._renderAsWeeks(6)
        }
    }

    /**
     * Render the calendar for 2, 3 or 6 weeks
     * 
     * @private
     * @ignore
     * @param {number} numberOfWeeks - 1 to 6 (month)
     * @param {boolean} expanded - If true, display large items in the calendar
     * @returns this
     */
    _renderAsWeeks(numberOfWeeks, expanded) {
        let date = this.date
        let currentMonth = date.getMonth()
        let currentDate = (this.startOnMonday) ? this._getPreviousMonday(date) : this._getPreviousSunday(date)
        this.startDate = currentDate

        switch (this.period) {
            case "month":
                this.date.setDate(1)
                break
            default:
                this.date = this._getPreviousMonday(this.date)
        }

        let calendarHTML = /*html*/ `
            <div class="calendar-header">
                ${this.weekDays.map(day => `<div class="calendar-header-title">${day}</div>`).join("")}
            </div>`

        for (let weekIndex = 1; weekIndex <= numberOfWeeks; weekIndex++) {
            calendarHTML += `<div class="calendar-week">`
            for (let dayIndex = 1; dayIndex <= 7; dayIndex++) {
                let day = currentDate.getDate()
                let month = currentDate.getMonth()
                let year = currentDate.getFullYear()
                let dayId = this._getDayId(day, month + 1, year)
                let dayClass = ""

                // Week-end => Alternate background color
                if (currentDate.getDay() == 0 || currentDate.getDay() == 6) {
                    dayClass = (this.showWeekend) ? "calendar-weekend" : "calendar-no-weekend"
                }

                // Other months => Light font color
                if (month != currentMonth) day = `<span class="calendar-otherMonth">${day}</span>`

                calendarHTML += `<div class="calendar-day ${dayClass}"><div>${day}</div><div class="day-items" id="${dayId}"></div></div>`
                currentDate = new Date(kiss.formula.ADJUST_DATE(currentDate, 0, 0, 1, 0, 0, 0))
            }
            calendarHTML += `</div>`
        }

        this.endDate = currentDate
        this._renderToolbarTitle()
        this.calendarBody.innerHTML = calendarHTML

        this._renderRecords(expanded)
        this._renderToday()
        return this
    }

    /**
     * Render records inside the calendar
     * 
     * @private
     * @ignore
     * @param {boolean} expanded - If true, display items as cards in the calendar
     */
    _renderRecords(expanded) {
        let records = this.collection.records.filter(record => record[this.dateField] >= this.startDate.toISO() && record[this.dateField] <= this.endDate.toISO())
        if (this.timeField) records = records.sortBy(this.timeField)

        records.forEach(record => {
            const date = new Date(record[this.dateField]).toISO()
            const calendarCell = $(date)
            if (!calendarCell) return

            const recordHtml = document.createElement("div")
            recordHtml.innerHTML = (!expanded) ? this._renderRecord(record) : this._renderRecordAsCard(record)
            recordHtml.classList.add("calendar-record")
            recordHtml.style.borderColor = this.model.color
            recordHtml.setAttribute("recordid", record.id)
            calendarCell.appendChild(recordHtml)
        })
    }

    /**
     * Render a single record
     * 
     * @private
     * @ignore
     * @param {object} record
     * @returns {string} Html for a single record
     */
    _renderRecord(record) {
        let recordHtml = ((this.timeField) ? record[this.timeField] : "") || ""
        if (recordHtml) recordHtml = `<span style="color: ${this.model.color}">${recordHtml}</span>`

        this.columns
            .filter(column => column.hidden !== true)
            .forEach(column => {
                let field = this.model.getField(column.id)
                if (!field) return

                let value = record[column.id]
                if (!value && value !== false) return

                recordHtml += " · " + this._renderSingleValue(field, value, record)
            })
        return recordHtml
    }

    /**
     * Highlight today
     * 
     * @private
     * @ignore
     */
    _renderToday() {
        let today = new Date().toISO()
        let todayCell = $(today)
        if (!todayCell) return

        let day = todayCell.parentNode.children[0]
        day.classList.add("calendar-today")
        day.style.color = "#ffffff"
        day.style.backgroundColor = this.color
    }    

    /**
     * Render a single record as a Card for 1 week view
     * 
     * @private
     * @ignore
     * @param {object} record
     * @returns {string} Html for a single record
     */
    _renderRecordAsCard(record) {
        let recordHtml = ((this.timeField) ? record[this.timeField] : "") || ""
        if (recordHtml) recordHtml = `<span style="color: ${this.model.color}">${recordHtml}</span>`

        this.columns
            .filter(column => column.hidden !== true)
            .forEach(column => {
                let field = this.model.getField(column.id)
                if (!field) return
                if (["attachment", "password", "link"].includes(field.type)) return

                let value = record[column.id]
                if (!value && value !== false) return

                let valueHtml = this._renderSingleValue(field, value, record)
                recordHtml += /*html*/ `
                    <div class="calendar-record-field">
                        <div class="calendar-record-label">${field.label} ${(field.unit) ? `(${field.unit})` : ""}</div>
                        <div class="calendar-record-value">${valueHtml}</div>
                    </div>
                `.removeExtraSpaces()
            })

        return recordHtml
    }

    /**
     * Render a single value inside a card
     * 
     * @private
     * @ignore
     * @param {object} field - Field to render
     * @param {*} value - Field value
     * @param {object} value - The record, useful for custom renderers
     * @returns {string} Html for the value
     */
    _renderSingleValue(field, value, record) {

        // Convert summary & lookup fields to mimic the type of their source field
        let type = field.type
        if (type == "lookup") {
            type = field.lookup.type
        } else if (type == "summary") {
            if (field.summary.type == "directory" && field.summary.operation == "LIST_NAMES") type = "directory"
        }

        if (field.valueRenderer) return field.valueRenderer(value, record)

        switch (type) {
            case "date":
                return new Date(value).toLocaleDateString()
            case "directory":
                return this._rendererForDirectoryFields(value)
            case "select":
                return this._rendererForSelectFields(field, value)
            case "checkbox":
                return this._rendererForCheckboxFields(field, value)
            case "rating":
                return this._rendererForRatingFields(field, value)
            case "attachment":
            case "aiImage":
                return "..."
            case "password":
                return "***"
            default:
                return value
        }
    }

    /**
     * Renderer for "Checkbox" fields
     * 
     * @private
     * @ignore
     * @param {object} field
     * @param {boolean} value - Checkbox values
     * @returns {string} Html for the value
     */
    _rendererForCheckboxFields(field, value) {
        const shape = field.shape || "square"
        const iconColorOn = field.iconColorOn || "#000000"

        try {
            if (field.type == "lookup") {
                const linkId = field.lookup.linkId
                const linkField = this.model.getField(linkId)
                const foreignModelId = linkField.link.modelId
                const foreignModel = kiss.app.models[foreignModelId]
                const sourceField = foreignModel.getField(field.lookup.fieldId)
                shape = sourceField.shape
                iconColorOn = sourceField.iconColorOn
            }
        } catch (err) {
            log("kiss.ui - Calendar - Couldn't generate renderer for checkboxes", 4)
            return value
        }

        const iconClasses = kiss.ui.Checkbox.prototype.getIconClasses()
        const defaultIconOn = iconClasses[shape]["on"]
        const defaultIconOff = iconClasses[shape]["off"]
        return `<span ${(value === true) ? `style="color: ${iconColorOn}"` : ""} class=\"${(value === true) ? defaultIconOn + " datatable-type-checkbox-checked" : defaultIconOff + " datatable-type-checkbox-unchecked"}\"></span>`
    }

    /**
     * Renderer for "Rating" fields
     * 
     * @private
     * @ignore
     * @param {object} field
     * @param {string|string[]} values - Select field values.
     * @returns {string} Html for the value
     */
    _rendererForRatingFields(field, value) {
        const iconColorOn = field.iconColorOn || "#ffd139"
        const iconColorOff = field.iconColorOff || "#dddddd"
        const shape = field.shape || "star"
        const iconClasses = kiss.ui.Rating.prototype.getIconClasses()
        const icon = iconClasses[shape]
        const max = field.max || 5

        let html = ""
        for (let i = 0; i < max; i++) {
            const color = (i < value) ? iconColorOn : iconColorOff
            html += /*html*/ `<span class="rating ${icon}" style="color: ${color}" index=${i}></span>`
        }
        return html
    }

    /**
     * Renderer for "Select" fields
     * 
     * @private
     * @ignore
     * @param {object} field
     * @param {string|string[]} values - Select field values.
     * @returns {string} Html for the value
     */
    _rendererForSelectFields(field, values) {
        const options = (typeof field.options == "function") ? field.options() : field.options

        // If no options, returns default layout
        if (!options) {
            return [].concat(values).map(value => {
                if (!value) return ""
                return `<span class="field-select-value">${value}</span>`
            }).join("")
        }

        // If options, returns values with the right option colors
        return [].concat(values).map(value => {
            if (!value) return ""

            let option = options.find(option => option.value === value)

            if (!option) option = {
                value
            }

            if (!option.value || option.value == " ") return ""

            return `<span class="field-select-value" ${(option.color) ? `style="color: #ffffff; background-color: ${option.color}"` : ""}>${option.value}</span>`
        }).join("")
    }

    /**
     * Render for "Directory" fields
     * 
     * @private
     * @ignore
     * @param {boolean} values
     */
    _rendererForDirectoryFields(values) {
        let listOfNames = "-"
        if (values) {
            listOfNames = [].concat(values).map(value => {
                if (!value) return ""

                let name
                switch (value) {
                    case "*":
                        name = kiss.directory.roles.everyone.label
                        break
                    case "$authenticated":
                        name = kiss.directory.roles.authenticated.label
                        break
                    case "$creator":
                        name = kiss.directory.roles.creator.label
                        break
                    case "$nobody":
                        name = kiss.directory.roles.nobody.label
                        break
                    default:
                        name = kiss.directory.getEntryName(value)
                }

                return (name) ? name : ""
            }).join(", ")
        }

        return listOfNames
    }

    /**
     * Update a single record then reload the view if required.
     * 
     * @private
     * @ignore
     * @param {object} msgData - The original pubsub message
     */
    async _updateOneAndReload(msgData) {
        const filterFields = kiss.db.mongo.getFilterFields(this.filter)
        let filterHasChanged = false

        let updates = msgData.data
        for (let fieldId of Object.keys(updates)) {
            if (filterFields.indexOf(fieldId) != -1) filterHasChanged = true
        }

        this._updateRecord(msgData.id)

        if (filterHasChanged) {
            this._reloadWhenNeeded(msgData, 2000)
        }
    }

    /**
     * Update a single record of the calendar.
     * 
     * Does nothing if the record is not displayed on the active page.
     * 
     * @private
     * @ignore
     * @param {string} recordId 
     */
    _updateRecord(recordId) {
        const record = this.collection.getRecord(recordId)
        const recordNode = document.querySelector(`.calendar-record[recordid="${recordId}"]`)

        if (recordNode) {
            const replacementNode = document.createElement("div")
            replacementNode.classList.add("calendar-record")
            replacementNode.style.borderColor = this.model.color
            replacementNode.innerHTML = (this.period.includes("details")) ? this._renderRecordAsCard(record) : this._renderRecord(record)
            recordNode.parentNode.replaceChild(replacementNode, recordNode)
            replacementNode.setAttribute("recordid", recordId)
        }
    }

    /**
     * Update the calendar configuration
     * 
     * @private
     * @ignore
     * @param {object} newConfig 
     */
    async _updateConfig(newConfig) {
        if (newConfig.hasOwnProperty("dateField")) this.dateField = newConfig.dateField
        if (newConfig.hasOwnProperty("timeField")) this.timeField = newConfig.timeField
        if (newConfig.hasOwnProperty("period")) this.period = newConfig.period
        if (newConfig.hasOwnProperty("startOnMonday")) this.startOnMonday = newConfig.startOnMonday
        if (newConfig.hasOwnProperty("showWeekend")) this.showWeekend = newConfig.showWeekend

        this._initTexts()
        this._render()

        let currentConfig
        if (this.record) {
            currentConfig = this.record.config
        }
        else {
            currentConfig = {
                dateField: this.dateField,
                timeField: this.timeField,
                period: this.period,
                startOnMonday: this.startOnMonday,
                showWeekend: this.showWeekend,
                columns: this.columns
            }
        }

        let config = Object.assign(currentConfig, newConfig)
        await this.updateConfig({
            config
        })
    }

    /**
     * Render the toolbar
     * 
     * @private
     * @ignore
     */
    _renderToolbar() {
        if (this.isToolbarRendered) return
        this.isToolbarRendered = true

        // New record creation button
        createButton({
            hidden: !this.canCreateRecord,
            class: "calendar-create-record",
            target: "create:" + this.id,
            text: this.model.name.toTitleCase(),
            icon: "fas fa-plus",
            iconColor: this.color,
            borderWidth: "3px",
            borderRadius: "32px",
            action: async () => this.createRecord(this.model)
        }).render()

        // Setup date/time button
        createButton({
            hidden: !this.showSetup,
            target: "setup:" + this.id,
            tip: txtTitleCase("setup the calendar"),
            icon: "fas fa-cog",
            iconColor: this.color,
            width: 32,
            action: () => this.showSetupWindow()
        }).render()

        // Column selection button
        createButton({
            hidden: !this.canSelectFields,
            target: "select:" + this.id,
            tip: txtTitleCase("#display fields"),
            icon: "fas fa-bars fa-rotate-90",
            iconColor: this.color,
            width: 32,
            action: () => this.showFieldsWindow()
        }).render()

        // Filtering button
        createButton({
            hidden: !this.canFilter,
            target: "filter:" + this.id,
            tip: txtTitleCase("to filter"),
            icon: "fas fa-filter",
            iconColor: this.color,
            width: 32,
            action: () => this.showFilterWindow()
        }).render()

        // Pager display mode
        if (this.canChangePeriod) {
            let _this = this
            createSelect({
                target: "pager-mode:" + this.id,
                id: "pager-mode:" + this.id,
                options: [{
                        label: txtTitleCase("month"),
                        value: "month"
                    },
                    {
                        label: "3 " + txtTitleCase("weeks"),
                        value: "3 weeks"
                    },
                    {
                        label: "2 " + txtTitleCase("weeks"),
                        value: "2 weeks"
                    },
                    {
                        label: "1 " + txtTitleCase("week"),
                        value: "1 week"
                    },
                    {
                        label: "1 " + txtTitleCase("week") + " + " + txtTitleCase("details"),
                        value: "1 week + details"
                    }
                ],
                optionsColor: this.color,
                value: this.period || "month",
                fieldWidth: 150,
                styles: {
                    "this": "align-items: center;",
                    "field-label": "white-space: nowrap;",
                    "field-select": "white-space: nowrap;",
                },
                events: {
                    change: async function () {
                        _this.period = this.getValue()
                        _this._render()
                    }
                }
            }).render()
        }

        // Pager previous
        createButton({
            target: "pager-previous:" + this.id,
            icon: "fas fa-chevron-left",
            iconColor: this.color,
            width: 32,
            events: {
                click: () => {
                    let previousDate
                    switch (this.period) {
                        case "month":
                            previousDate = kiss.formula.ADJUST_DATE(this.date, 0, -1, 0, 0, 0, 0)
                            break
                        case "3 weeks":
                            previousDate = kiss.formula.ADJUST_DATE(this.startDate, 0, 0, -21, 0, 0, 0)
                            break
                        case "2 weeks":
                            previousDate = kiss.formula.ADJUST_DATE(this.startDate, 0, 0, -14, 0, 0, 0)
                            break
                        case "1 week":
                        case "1 week + details":
                            previousDate = kiss.formula.ADJUST_DATE(this.startDate, 0, 0, -7, 0, 0, 0)
                            break
                        default:
                    }
                    this.showCalendar(previousDate)
                }
            }
        }).render()

        // Pager next
        createButton({
            target: "pager-next:" + this.id,
            icon: "fas fa-chevron-right",
            iconColor: this.color,
            width: 32,
            events: {
                click: () => {
                    let nextDate
                    switch (this.period) {
                        case "month":
                            nextDate = kiss.formula.ADJUST_DATE(this.date, 0, 1, 0, 0, 0, 0)
                            break
                        default:
                            nextDate = kiss.formula.ADJUST_DATE(this.endDate, 0, 0, 1, 0, 0, 0)
                    }
                    this.showCalendar(nextDate)
                }
            }
        }).render()

        // Pager today
        const todayButton = {
            target: "pager-today:" + this.id,
            icon: "fas fa-stop",
            iconColor: this.color,
            events: {
                click: () => {
                    let currentDate = new Date()
                    let startDate = currentDate
                    switch (this.period) {
                        case "month":
                            startDate.setDate(1)
                            break
                        default:
                            startDate = this._getPreviousMonday(currentDate)
                    }
                    this.showCalendar(startDate)
                }
            }
        }
        if (!kiss.screen.isMobile) todayButton.text = txtTitleCase("today")
        createButton(todayButton).render()

        // View refresh button
        if (!kiss.screen.isMobile) {
            createButton({
                target: "refresh:" + this.id,
                tip: txtTitleCase("refresh"),
                icon: "fas fa-undo-alt",
                iconColor: this.color,
                width: 32,
                events: {
                    click: () => this.reload()
                }
            }).render()
        }
    }

    /**
     * Render the title inside the toolbar
     * 
     * @private
     * @ignore
     */
    _renderToolbarTitle() {
        let title
        this.startDay = this.startDate.getDate()
        this.startMonth = this.startDate.getMonth()
        this.startYear = this.startDate.getFullYear()
        this.endDay = new Date(kiss.formula.ADJUST_DATE(this.endDate, 0, 0, -1, 0, 0, 0))
        this.endMonth = this.endDay.getMonth()
        this.endYear = this.endDay.getFullYear()
        this.endDay = this.endDay.getDate()

        switch (this.period) {
            case "month":
                title = this.months[this.date.getMonth()].toUpperCase() + " " + this.date.getFullYear()
                break
            default:
                title =
                    String(this.startDay).padStart(2, "0") +
                    " " +
                    this.months[this.startMonth] +
                    " - " +
                    String(this.endDay).padStart(2, "0") +
                    " " +
                    this.months[this.endMonth] +
                    " " +
                    ((new Date().getFullYear() != this.endYear) ? this.endYear : "")
        }

        this.calendarTitle = title
        $("title:" + this.id).innerHTML = this.calendarTitle
    }

    /**
     * Get the previous monday
     * 
     * @private
     * @ignore
     */
    _getPreviousMonday(date) {
        let newDate = new Date(date)
        let dayOfWeek = date.getDay()
        if (dayOfWeek !== 1) newDate.setDate(date.getDate() - ((dayOfWeek === 0) ? 6 : dayOfWeek - 1))
        return newDate
    }

    /**
     * Get the previous sunday
     * 
     * @private
     * @ignore
     */
    _getPreviousSunday(date) {
        let newDate = new Date(date)
        let dayOfWeek = date.getDay()
        if (dayOfWeek !== 0) newDate.setDate(date.getDate() - dayOfWeek)
        return newDate
    }

    /**
     * Init the localized texts
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initTexts() {
        this.months = [
            txtTitleCase("january"),
            txtTitleCase("february"),
            txtTitleCase("march"),
            txtTitleCase("april"),
            txtTitleCase("may"),
            txtTitleCase("june"),
            txtTitleCase("july"),
            txtTitleCase("august"),
            txtTitleCase("september"),
            txtTitleCase("october"),
            txtTitleCase("november"),
            txtTitleCase("december")
        ]

        this.weekDays = [
            txtTitleCase("sunday"),
            txtTitleCase("monday"),
            txtTitleCase("tuesday"),
            txtTitleCase("wednesday"),
            txtTitleCase("thursday"),
            txtTitleCase("friday"),
            txtTitleCase("saturday")
        ]

        if (this.showWeekend === false) {
            this.weekDays.shift()
            this.weekDays.pop()
        }

        if (this.showWeekend && this.startOnMonday) {
            let lastElement = this.weekDays.shift()
            this.weekDays.push(lastElement)
        }

        if (kiss.screen.isMobile && kiss.screen.isVertical()) {
            this.months = this.months.map(month => month.substring(0, 4) + ".")
        }

        return this
    }

    /**
     * Generates a simple day id
     * 
     * @private
     * @ignore
     * @param {number} day
     * @param {number} month
     * @param {number} year
     * @returns {string} String like "2023-07-17"
     */
    _getDayId(day, month, year) {
        return year + "-" + (month + "").padStart(2, "0") + "-" + (day + "").padStart(2, "0")
    }
}

// Create a Custom Element and add a shortcut to create it
customElements.define("a-calendar", kiss.ui.Calendar)

/**
 * Shorthand to create a new Calendar. See [kiss.ui.Calendar](kiss.ui.Calendar.html)
 * 
 * @param {object} config
 * @returns HTMLElement
 */
const createCalendar = (config) => document.createElement("a-calendar").init(config)

;