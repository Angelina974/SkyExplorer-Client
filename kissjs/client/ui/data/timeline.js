/** 
 * 
 * The **Timeline** derives from [DataComponent](kiss.ui.DataComponent.html).
 * 
 * @param {object} config
 * @param {string} [config.date] - The initial date to display in the timeline (default = today)
 * @param {string} [config.titleField] - The field to use as the title for the first column (default = first text field found in the model, or the record id if no text field was found)
 * @param {boolean} [config.startDateField] - The field to use as the start date for the timeline (default = first date field found in the model, or the creation date if no date field was found)
 * @param {boolean} [config.endDateField] - The field to use as the end date for the timeline (default = second date field found in the model, or the modification date if no date field was found)
 * @param {string} [config.period] - "1 week" | "2 weeks" | "3 weeks" | "1 month" (default) | "2 months" | "3 months" | "4 months" | "6 months" | "1 year"
 * @param {boolean} [config.colorField] - The field to use as the color for the timeline (default = none)
 * @param {Collection} config.collection - The data source collection
 * @param {object} [config.record] - Record to persist the view configuration into the db
 * @param {object[]} [config.columns] - Where each column is: {title: "abc", type: "text|number|integer|float|date|button", id: "fieldId", button: {config}, renderer: function() {}}
 * @param {string} [config.color] - Hexa color code. Ex: #00aaee
 * @param {string} [config.rowHeight] - CSS row height in pixels. Ex: 40px
 * @param {boolean} [config.showColumnType] - true to display an icon in the header indicating the column type (default = false)
 * @param {boolean} [config.showToolbar] - false to hide the toolbar (default = true)
 * @param {boolean} [config.showPagerIndex] - false to hide the pager index (default = true)
 * @param {boolean} [config.showScroller] - false to hide the virtual scroller (default = true)
 * @param {boolean} [config.showActions] - false to hide the custom actions menu (default = true)
 * @param {boolean} [config.showLayoutButton] - false to hide the button to adjust the layout (default = true)
 * @param {boolean} [config.showGroupButtons] - false to hide the button to expand/collapse groups (default = true)
 * @param {boolean} [config.canSearch] - false to hide the search button (default = true)
 * @param {boolean} [config.canSelect] - false to hide the selection checkboxes (default = true)
 * @param {boolean} [config.canSort] - false to hide the sort button (default = true)
 * @param {boolean} [config.canFilter] - false to hide the filter button (default = true)
 * @param {boolean} [config.canGroup] - false to hide the group button (default = true)
 * @param {boolean} [config.canSelectFields] - Can we select the fields (= columns) to display in the table? (default = true)
 * @param {boolean} [config.canChangePeriod] - false to hide the possibility to change period (1 month, 2 weeks...) (default = true)
 * @param {boolean} [config.canCreateRecord] - Can we create new records from the timeline?
 * @param {boolean} [config.iconAction] - Font Awesome icon class to display the "open record" symbol. Defaults to "far fa-file-alt"
 * @param {object[]} [config.actions] - Array of menu actions, where each menu entry is: {text: "abc", icon: "fas fa-check", action: function() {}}
 * @param {number|string} [config.width]
 * @param {number|string} [config.height]
 * @returns this
 * 
 * ## Generated markup
 * ```
 * <a-timeline class="a-timeline">
 *      <div class="timeline-toolbar">
 *          <!-- Timeline toolbar items -->
 *      </div>
 *      <div class="timeline-header-container">
 *          <div class="timeline-header-1st-column">
 *              <!-- Header 1st column -->
 *          </div>
 *          <div class="timeline-header">
 *              <!-- Header other columns -->
 *          </div>
 *      </div>
 *      <div class="timeline-body-container">
 *          <div class="timeline-body-1st-column">
 *              <!-- Body 1st column -->
 *          </div>
 *          <div class="timeline-body">
 *              <!-- Body other columns -->
 *          </div>
 *      </div>
 *      <div class="timeline-virtual-scroller-container">
 *          <div class="timeline-virtual-scroller"></div>
 *      </div>
 * </a-timeline>
 * ```
 */
kiss.ui.Timeline = class Timeline extends kiss.ui.DataComponent {
    /**
     * Its a Custom Web Component. Do not use the constructor directly with the **new** keyword.
     * Instead, use one of the 3 following methods:
     * 
     * Create the Web Component and call its **init** method:
     * ```
     * const myTimeline = document.createElement("a-timeline").init(config)
     * ```
     * 
     * Or use the shorthand for it:
     * ```
     * const myTimeline = createTimeline({
     *   id: "my-table",
     *   color: "#00aaee",
     *   collection: kiss.app.collections["projects"],
     *   
     *   // Params that are specific to the timeline
     *   startDateField: "projectStartDate",
     *   endDateField: "projectEndDate",
     *   titleField: "projectName",
     *   period: "1 month",
     * 
     *   // Columns must match the Model's fields
     *   columns: [
     *       {
     *           id: "firstName", // Must match the model's field id
     *           type: "text",
     *           title: "First name",
     *       },
     *       {
     *           id: "lastName",
     *           type: "text",
     *           title: "Last name",
     *       },
     *       {
     *           id: "birthDate",
     *           type: "date",
     *           title: "Birth date"
     *       }
     *   ],
     * 
     *   // We can define a menu with custom actions
     *   actions: [
     *       {
     *           text: "Group by country and city",
     *           icon: "fas fa-sort",
     *           action: () => $("my-table").groupBy(["Country", "City"])
     *       }
     *   ],
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
     * myTimeline.render()
     * ```
     */
    constructor() {
        super()
    }

    /**
     * Generates a Timeline from a JSON config
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
        this.showColumnType = !!config.showColumnType
        this.showToolbar = (config.showToolbar !== false)
        this.showPagerIndex = (config.showPagerIndex !== false)
        this.showScroller = (config.showScroller !== false)
        this.showActions = (config.showActions !== false)
        this.showSetup = (config.showSetup !== false)
        this.showLayoutButton = (config.showLayoutButton !== false)
        this.showGroupButtons = (config.showGroupButtons !== false)
        this.canSearch = (config.canSearch !== false)
        this.canSort = (config.canSort !== false)
        this.canFilter = (config.canFilter !== false)
        this.canGroup = (config.canGroup !== false)
        this.color = config.color || "#00aaee"
        this.iconAction = config.iconAction || "far fa-file-alt"
        this.canSelect = (config.canSelect !== false)
        this.canSelectFields = (config.canSelectFields !== false)
        this.canChangePeriod = (config.canChangePeriod !== false)
        this.actions = config.actions || []
        this.defaultRowHeight = 40
        this.defaultDayWidth = 50
        this.firstColumnWidth = 100

        // Build timeline skeletton markup
        let id = this.id
        this.innerHTML =
            /*html*/
            `<div class="timeline">
                <div id="timeline-toolbar:${id}" class="timeline-toolbar">
                    <div id="search-field:${id}"></div>
                    <div id="create:${id}"></div>
                    <div id="actions:${id}"></div>
                    <div id="setup:${id}"></div>
                    <div id="select:${id}"></div>
                    <div id="sort:${id}"></div>
                    <div id="filter:${id}"></div>
                    <div id="group:${id}"></div>
                    <div id="collapse:${id}"></div>
                    <div id="expand:${id}"></div>
                    <div id="refresh:${id}"></div>
                    <div id="search:${id}"></div>
                    <div id="hierarchy:${id}"></div>
                    <div id="explode:${id}"></div>
                    <div class="spacer"></div>
                    <div id="pager-index:${id}" class="timeline-toolbar-pager-index"></div>
                    <div id="pager-mode:${id}"></div>
                    <div id="pager-previous:${id}"></div>
                    <div id="pager-next:${id}"></div>
                    <div id="pager-today:${id}"></div>
                    <div id="layout:${id}"></div>
                </div>

                <div class="timeline-header-container">
                    <div class="timeline-header-1st-column"></div>
                    <div id="timeline-header:${id}" class="timeline-header"></div>
                </div>

                <div class="timeline-body-container">
                    <div class="timeline-body-1st-column"></div>
                    <div id="timeline-body:${id}" class="timeline-body"></div>
                </div>

                <div class="timeline-virtual-scroller-container">
                    <div class="timeline-virtual-scroller"></div>
                </div>
            </div>`.removeExtraSpaces()

        // Set timeline components
        this.timeline = this.querySelector(".timeline")
        this.timelineToolbar = this.querySelector(".timeline-toolbar")
        this.timelineHeader = this.querySelector(".timeline-header")
        this.timelineBody = this.querySelector(".timeline-body")
        this.timelineBodyContainer = this.querySelector(".timeline-body-container")
        this.timelineHeader1stColumn = this.querySelector(".timeline-header-1st-column")
        this.timelineBody1stColumn = this.querySelector(".timeline-body-1st-column")
        this.timelineScrollerContainer = this.querySelector(".timeline-virtual-scroller-container")
        this.timelineScroller = this.querySelector(".timeline-virtual-scroller")
        this.timelinePagerIndex = this.querySelector(".timeline-toolbar-pager-index")

        this._initTexts()
            ._initColumns(config.columns)
            ._initTimelineParams(config)
            ._initElementsVisibility()
            ._prepareCellRenderers()
            ._initEvents()
            ._initSubscriptions()

        return this
    }

    /**
     * 
     * TIMELINE METHODS
     * 
     */

    /**
     * Load data into the timeline.
     * 
     * @ignore
     */
    async load() {
        try {
            log(`kiss.ui - Timeline ${this.id} - Loading collection <${this.collection.id} (changed: ${this.collection.hasChanged})>`)

            // Apply filter, sort, group, projection
            // Priority is given to local config, then to the passed collection, then to default
            this.collection.filter = this.filter
            this.collection.filterSyntax = this.filterSyntax
            this.collection.sort = this.sort
            this.collection.sortSyntax = this.sortSyntax
            this.collection.group = this.group
            this.collection.projection = this.projection
            this.collection.groupUnwind = this.groupUnwind

            // Load records
            await this.collection.find()

            // Hide the virtual scroller while the timeline is being built
            this._hideScroller()

            // Try to adjust columns width from local config
            this._columnsAdjustWidthFromLocalStorage()

            // Get the selected records
            this.getSelection()

            // Render the timeline toolbar
            this._renderToolbar()

            // Get paging params (skip & limit)
            this.skip = 0
            this._setLimit()

        } catch (err) {
            log(`kiss.ui - Timeline ${this.id} - Couldn't load data properly`)
        }
    }

    /**
     * Display the timeline one day before
     * 
     * @returns this
     */
    previous() {
        let shift = 1
        if (this.period == "1 year") shift = 2
        let previousDate = kiss.formula.ADJUST_DATE(this.startDate, 0, 0, -shift, 0, 0, 0)
        this.date = new Date(previousDate)
        return this._render()
    }

    /**
     * Display the timeline one day after
     * 
     * @returns this
     */
    next() {
        let shift = 1
        if (this.period == "1 year") shift = 2
        let nextDate = kiss.formula.ADJUST_DATE(this.startDate, 0, 0, 2, 0, 0, 0)
        this.date = new Date(nextDate)
        return this._render()
    }

    /**
     * Generic method to refresh / re-render the view
     * 
     * Note: used in dataComponent (parent class) showSearchBar method.
     * This method is invoked to refresh the view after a full-text search has been performed
     */
    refresh() {
        this._render()
    }

    /**
     * Update the timeline size (recomputes its width and height functions)
     */
    updateLayout() {
        if (this.isConnected) {
            this._setWidth()
            this._setHeight()
            this._setLimit()
            this._renderPagerIndex()
            this._render()
            this._renderSelectionRestore()
        }
    }
    
    /**
     * Update the timeline color (toolbar buttons + modal windows)
     * 
     * @param {string} newColor
     */
    async setColor(newColor) {
        this.color = newColor
        Array.from(this.timelineToolbar.children).forEach(item => {
            if (item && item.firstChild && item.firstChild.type == "button") item.firstChild.setIconColor(newColor)
        })
    }

    /**
     * Highlight a chosen record
     * 
     * @param {string} recordId 
     */
    highlightRecord(recordId) {
        let index = this.goToRecord(recordId)
        if (index != -1) this._rowHighlight(index)
    }

    /**
     * Scroll to a chosen record
     * 
     * @param {string} recordId
     * @returns {number} The index of the found record, or -1 if not found
     */
    goToRecord(recordId) {
        let index = this._rowFindIndex(recordId)
        if (index != -1) this.goToIndex(index)
        return index
    }

    /**
     * Scroll to a chosen index
     * 
     * @param {number} index
     */
    goToIndex(index) {
        this.skip = index
        this._render()
    }

    /**
     * Show the window to setup the timeline:
     * - source field for the first column
     * - source start date field
     * - source end date field
     * - prefered layout (1 month, 2 months, ...)
     */
    showSetupWindow() {
        const dateFields = this.model.getFieldsByType("date")
            .filter(field => !field.deleted)
            .map(field => {
                return {
                    value: field.id,
                    label: field.label.toTitleCase()
                }
            })

        const titleFields = this.model.fields
            .filter(field => !field.deleted)
            .map(field => {
                return {
                    value: field.id,
                    label: field.label.toTitleCase()
                }
            })

        const selectFields = this.model.getFieldsByType("select")
            .filter(field => !field.deleted)
            .map(field => {
                return {
                    value: field.id,
                    label: field.label.toTitleCase()
                }
            })          

        createPanel({
            icon: "fas fa-align-left",
            title: txtTitleCase("setup the timeline"),
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
                // Source start date field
                {
                    type: "select",
                    id: "timeline-startDatefield:" + this.id,
                    label: txtTitleCase("#timeline start date"),
                    options: dateFields,
                    maxHeight: () => kiss.screen.current.height - 200,
                    value: this.startDateField,
                    events: {
                        change: async function () {
                            let startDateField = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                startDateField
                            })
                        }
                    }
                },
                // Source end date field
                {
                    type: "select",
                    id: "timeline-endDateField:" + this.id,
                    label: txtTitleCase("#timeline end date"),
                    options: dateFields,
                    maxHeight: () => kiss.screen.current.height - 200,
                    value: this.endDateField,
                    events: {
                        change: async function () {
                            let endDateField = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                endDateField
                            })
                        }
                    }
                },
                // Source title field
                {
                    type: "select",
                    id: "timeline-titleField:" + this.id,
                    label: txtTitleCase("#timeline title field"),
                    options: titleFields,
                    maxHeight: () => kiss.screen.current.height - 200,
                    value: this.titleField,
                    events: {
                        change: async function () {
                            let titleField = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                titleField
                            })
                        }
                    }
                },
                // Source color field
                {
                    type: "select",
                    id: "timeline-colorField:" + this.id,
                    label: txtTitleCase("#timeline color field"),
                    options: selectFields,
                    maxHeight: () => kiss.screen.current.height - 200,
                    value: this.colorField,
                    events: {
                        change: async function () {
                            let colorField = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                colorField
                            })
                        }
                    }
                },
                // Default period
                {
                    type: "select",
                    id: "timeline-period:" + this.id,
                    label: txtTitleCase("#timeline period"),
                    options: [
                        {
                            label: "1 " + txtTitleCase("week"),
                            value: "1 week"
                        },
                        {
                            label: "2 " + txtTitleCase("weeks"),
                            value: "2 weeks"
                        },
                        {
                            label: "3 " + txtTitleCase("weeks"),
                            value: "3 weeks"
                        },
                        {
                            label: "1 " + txtTitleCase("month"),
                            value: "1 month"
                        },
                        {
                            label: "2 " + txtTitleCase("months"),
                            value: "2 months"
                        },                        
                        {
                            label: "3 " + txtTitleCase("months"),
                            value: "3 months"
                        },
                        {
                            label: "4 " + txtTitleCase("months"),
                            value: "4 months"
                        },
                        {
                            label: "6 " + txtTitleCase("months"),
                            value: "6 months"
                        },
                        {
                            label: "1 " + txtTitleCase("year"),
                            value: "1 year"
                        },
                    ],
                    value: this.period || "1 month",
                    events: {
                        change: async function () {
                            let period = this.getValue()
                            let viewId = this.id.split(":")[1]
                            publish("EVT_VIEW_SETUP:" + viewId, {
                                period
                            })
                        }
                    }
                }                
            ]
        }).render()
    }

    /**
     * Show the window just under the sorting button
     */
    showSortWindow() {
        let sortButton = $("sort:" + this.id)
        const box = sortButton.getBoundingClientRect()
        super.showSortWindow(box.left, box.top + 40, this.color)
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
     * Set the timeline row height
     * 
     * @param {number} height - The row height in pixels
     */
    setRowHeight(height) {
        this.rowHeight = height
        document.documentElement.style.setProperty("--timeline-cell-height", this.rowHeight + "px")
        document.documentElement.style.setProperty("--timeline-group-cell-height", this.rowHeight + "px")
        this._setThumbSize()

        // Save new row height locally
        const localStorageId = "config-timeline-" + this.id + "-row-height"
        localStorage.setItem(localStorageId, this.rowHeight)
        this.reload()
    }

    /**
     * Switch to search mode
     * 
     * Show/hide only the necessary buttons in this mode.
     */
    switchToSearchMode() {
        if (kiss.screen.isMobile) {
            $("create:" + this.id).hide()
            $("search:" + this.id).hide()
            $("expand:" + this.id).hide()
            $("collapse:" + this.id).hide()
        }
    }

    /**
     * Reset search mode
     */
    resetSearchMode() {
        if (kiss.screen.isMobile) {
            $("create:" + this.id).show()
            $("search:" + this.id).show()
            $("expand:" + this.id).show()
            $("collapse:" + this.id).show()
        }
    }

    /**
     * Re-render the virtual scrollbar when the timeline is re-connected to the DOM
     * 
     * @private
     * @ignore
     */
    _afterConnected() {
        super._afterConnected()
        this._hideScroller()
        this._renderScroller()
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

        if (kiss.screen.isMobile && kiss.screen.isVertical()) {
            this.months = this.months.map(month => month.substring(0, 4) + ".")
        }

        return this
    }

    /**
     * Initialize all timeline events
     * 
     * @private
     * @ignore
     */
    _initEvents() {
        // Drag the timeline left and right
        let startX
        let isDragging = false
        
        const handleMouseMove = (e) => {
            if (isDragging) {
                let currentX = e.clientX
                let diffX = currentX - startX
                const threshold = Math.max(this.dayWidth, 30)
        
                if (diffX > threshold) {
                    this.previous()
                    startX = currentX
                } else if (diffX < -threshold) {
                    this.next()
                    startX = currentX
                }
            }
        }
        
        function handleMouseUp(e) {
            isDragging = false
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
        
        this.timelineBody.addEventListener('mousedown', function(e) {
            e.preventDefault()
            startX = e.clientX
            isDragging = true
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        })

        // Clicked on the checkbox to deselect all records
        this.timelineHeader1stColumn.onclick = (event) => {
            if (event.target.classList.contains("timeline-header-checkbox")) {
                this.toggleSelection()
            }
        }

        // Clicked on the 1st column resizer
        this.timelineHeader1stColumn.onmousedown = (event) => {
            const clickedElement = event.target
            if (clickedElement.classList.contains("timeline-column-header-resizer")) {
                this._columnsResizeWithDragAndDrop(event, clickedElement)
            }
        }

        // Clicked somewhere in the timeline
        this.onclick = async (event) => {
            const clickedElement = event.target
            const clickedParent = clickedElement.parentNode

            // SELECT / DESELECT A ROW
            // = clicked on the checkbox to select a record
            if (clickedElement.classList.contains("timeline-row-checkbox")) {
                const rowIndex = clickedParent.getAttribute("row")
                this._rowToggleSelect(rowIndex)
                return event
            }

            // SELECT A RECORD (GENERALLY TO OPEN IT AS A FORM)
            // = clicked on the 1st column cell to expand a record and display it as a form
            if (Array.from(clickedParent.classList).concat(Array.from(clickedElement.classList)).indexOf("timeline-cell-1st") != -1) {
                const cell = clickedElement.closest("div")
                const recordId = cell.getAttribute("recordid")
                const record = await this.collection.getRecord(recordId)
                await this.selectRecord(record)
                return event
            }

            // EXPAND / COLLAPSE A GROUP
            // = clicked on a group section
            if (clickedParent.classList.contains("timeline-group-row")) {
                const rowIndex = clickedParent.getAttribute("row")
                const record = this.collection.records[Number(rowIndex)]
                const groupId = record.$groupId
                const groupLevel = record.$groupLevel

                this._groupToggle(groupId, groupLevel, rowIndex)
                return event
            }

            // = clicked on the group expand/collapse
            const clickedGroup = clickedElement.closest(".timeline-group")
            if (clickedGroup) {
                const rowIndex = clickedGroup.getAttribute("row")
                const record = this.collection.records[Number(rowIndex)]
                const groupId = record.$groupId
                const groupLevel = record.$groupLevel

                this._groupToggle(groupId, groupLevel, rowIndex)
                return event
            }

            // OPEN A RECORD
            if ((clickedElement.classList.contains("timeline-cell")) || clickedParent.classList.contains("timeline-cell")) {
                const row = clickedElement.closest(".timeline-row")
                const recordId = row.getAttribute("recordid")
                const record = await this.collection.getRecord(recordId)
                await this.selectRecord(record)
                return event
            }
        }

        // Sync horizontal scrolling between body and header
        this.timelineBody.onscroll = () => {
            this.timelineHeader.scrollLeft = this.timelineBody.scrollLeft
        }

        /*
         * VIRTUAL SCROLLING MANAGEMENT
         */

        //
        // Observe mousewheel event to scroll
        //
        this.onmousewheel = this.onwheel = (event) => {
            // Scroll must happen inside the timeline body
            if (!event.target.closest(".timeline-body-container")) return

            if (event.wheelDelta > 0) {
                this._virtualScrollUp()
            } else {
                this._virtualScrollDown()
            }

            // Sync the virtual scrollbar position
            this._renderScrollerPosition()

            // Update pager
            this._renderPagerIndex()
        }

        //
        // Enable onscroll event when clicking on the virtual scrollbar
        //
        this.timelineScrollerContainer.onmousedown = (event) => {
            this.preventScroll = false
        }

        //
        // Render the timeline at the correct row index when moving the virtual scrollbar
        //
        this.timelineScrollerContainer.onscroll = (event) => {
            if (this.preventScroll == true) return false

            // Clear our timeout throughout the scroll
            window.clearTimeout(this.isScrolling)

            // Set a timeout to run after scrolling ends, in order to smooth the rendering
            this.isScrolling = null

            this.isScrolling = setTimeout(() => {
                // Compute the scroll as a percentage of the total height
                let percent = event.target.scrollTop / (this.timelineScroller.offsetHeight - this.timelineBody.offsetHeight)

                // Deduce how many records to skip
                let recordIndex = Math.round((this.collection.count - this.limit) * percent)
                let newSkip = Math.min(recordIndex, this.collection.records.length - this.limit)

                // Re-render the timeline if the skip value has changed
                if (newSkip != this.skip) {
                    this.skip = newSkip
                    this._render()
                }
            }, 10)
        }

        return this
    }

    /**
     * Initialize subscriptions to PubSub
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
     * Define the specific timeline params:
     * - the initial date
     * - start date field used to display the timeline
     * - end date field used to display the timeline
     * - title field used to display in the first column
     * - displayed period (1 month, 2 months...)
     * 
     * @private
     * @ignore
     * @param {object} config - {date, startDateField, endDateField, titleField, period, colorField}
     * @eturns this
     */
    _initTimelineParams(config) {
        this.date = this.config.date || new Date()
        if (typeof this.date == "string") this.date = new Date(this.date)

        if (this.record) {
            this.startDateField = config.startDateField || this.record.config.startDateField
            this.endDateField = config.endDateField || this.record.config.endDateField
            this.titleField = config.titleField || this.record.config.titleField
            this.colorField = config.colorField || this.record.config.colorField
            this.period = config.period || this.record.config.period || "1 month"

        } else {
            this.startDateField = config.startDateField || this.config.startDateField
            this.endDateField = config.endDateField || this.config.endDateField
            this.titleField = config.titleField || this.config.titleField
            this.colorField = config.colorField || this.config.colorField
            this.period = config.period || this.config.period || "1 month"
        }

        // Defaults to the first date field, or the creation date if no date field was found
        if (!this.startDateField) {
            let modelDateFields = this.model.getFieldsByType(["date"])
            if (modelDateFields.length != 0) {
                this.startDateField = modelDateFields[0].id
            } else {
                this.startDateField = "createdAt"
            }
        }

        // Defaults to the second date field, or the modification date if no date field was found
        if (!this.endDateField) {
            let modelDateFields = this.model.getFieldsByType(["date"])
            if (modelDateFields.length > 1) {
                this.endDateField = modelDateFields[1].id
            } else {
                this.endDateField = "updatedAt"
            }
        }

        // Defaults to the first text field, or the record id if no text field was found
        if (!this.titleField) {
            let modelTextFields = this.model.getFieldsByType(["text"])
            if (modelTextFields.length != 0) {
                this.titleField = modelTextFields[0].id
            } else {
                this.titleField = "id"
            }
        }

        this.periods = {
            "1 week": 7,
            "2 weeks": 14,
            "3 weeks": 21,
            "1 month": 31,
            "2 months": 61,
            "3 months": 92,
            "4 months": 122,
            "6 months": 182,
            "1 year": 365
        }

        return this
    }

    /**
     * Set header, toolbar and scroller visibility
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initElementsVisibility() {
        if (this.showToolbar === false) this.timelineToolbar.style.display = "none"
        if (this.showScroller === false) this.timelineScrollerContainer.style.display = "none"
        if (this.showPagerIndex === false) this.timelinePagerIndex.style.display = "none"
        return this
    }

    /**
     * Initialize timeline sizes
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initSize(config) {
        this._initRowHeight(config)
        this._initDayWidth(config)

        if (config.width) {
            this._setWidth()
        } else {
            this.style.width = this.config.width = `calc(100%)`
        }

        if (config.height) {
            this._setHeight()
        } else {
            this.style.height = this.config.height = `calc(100% - 10px)`
        }
        return this
    }

    /**
     * Init the row height according to local settings and/or config
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initRowHeight(config = {}) {
        this.rowHeight = config.rowHeight || this._getRowHeightFromLocalStorage()
        document.documentElement.style.setProperty("--timeline-cell-height", this.rowHeight + "px")
        document.documentElement.style.setProperty("--timeline-group-cell-height", this.rowHeight + "px")
        return this
    }

    /**
     * Init the day width according to local settings and/or config
     * 
     * @private
     * @ignore
     * @param {object} config 
     * @returns this
     */
    _initDayWidth(config = {}) {
        this.dayWidth = config.dayWidth || this._computeDayWidth()
        document.documentElement.style.setProperty("--timeline-day-width", this.dayWidth + "px")
        return this
    }

    /**
     * Set the timeline day width
     * 
     * @private
     * @ignore
     * @param {number} height - The day width in pixels
     */
    _setDayWidth(width) {
        this.dayWidth = width
        this._render()
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

    /**
     * Compute the day width according to the current screen width and the number of days to display
     * 
     * @private
     * @ignore
     * @returns {number} The day width in pixels
     */
    _computeDayWidth() {
        const bodyWidth = kiss.screen.current.width - this.timelineBody.getBoundingClientRect().left
        return Math.max(bodyWidth / this.periods[this.period], 5)
    }

    /**
     * Get the current timeline body width, depending on the screen width and the position of the timeline
     * 
     * @private
     * @ignore
     * @returns {number} The body width in pixels
     */
    _getBodyWidth() {
        return kiss.screen.current.width - this.timelineBody.getBoundingClientRect().left
    }

    /**
     * Get the number of days to display in the timeline
     * 
     * @private
     * @ignore
     * @returns {number} The number of days
     */
    _getNumberOfDays() {
        return Math.floor(this._getBodyWidth() / this.dayWidth)
    }

    /**
     * Update a single record then reload the view if required
     * 
     * @private
     * @ignore
     * @param {object} msgData - The original pubsub message
     */
    async _updateOneAndReload(msgData) {
        const sortFields = this.sort.map(sort => Object.keys(sort)[0])
        const filterFields = kiss.db.mongo.getFilterFields(this.filter)

        let groupHasChanged = false
        let sortHasChanged = false
        let filterHasChanged = false

        let updates = msgData.data
        for (let fieldId of Object.keys(updates)) {
            if (this.group.indexOf(fieldId) != -1) groupHasChanged = true
            if (sortFields.indexOf(fieldId) != -1) sortHasChanged = true
            if (filterFields.indexOf(fieldId) != -1) filterHasChanged = true

            this._updateRecord(msgData.id)
        }

        if (sortHasChanged || filterHasChanged || groupHasChanged) {
            this._reloadWhenNeeded(msgData)
        }
    }

    /**
     * Update a single record of the timeline.
     * 
     * Does nothing if the record is not displayed on the active page.
     * 
     * @private
     * @ignore
     * @param {string} recordId
     */
    _updateRecord(recordId) {
        const record = this.collection.getRecord(recordId)
        const recordNode = document.querySelector(`.timeline-row[recordid="${recordId}"]`)
        if (recordNode) recordNode.innerHTML = this._renderRowContent(record)
    }

    /**
     * Update the timeline configuration in the database
     * 
     * @private
     * @ignore
     * @param {object} newConfig 
     */
    async _updateConfig(newConfig) {
        if (newConfig.hasOwnProperty("startDateField")) this.startDateField = newConfig.startDateField
        if (newConfig.hasOwnProperty("endDateField")) this.endDateField = newConfig.endDateField
        if (newConfig.hasOwnProperty("titleField")) this.titleField = newConfig.titleField
        if (newConfig.hasOwnProperty("colorField")) this.colorField = newConfig.colorField
        if (newConfig.hasOwnProperty("period")) this.period = newConfig.period

        this._initTexts()
        this._render()

        let currentConfig
        if (this.record) {
            currentConfig = this.record.config
        }
        else {
            currentConfig = {
                startDateField: this.startDateField,
                endDateField: this.endDateField,
                titleField: this.titleField,
                colorField: this.colorField,
                period: this.period,
                columns: this.columns
            }
        }

        let config = Object.assign(currentConfig, newConfig)
        await this.updateConfig({
            config
        })
    }    

    /**
     * Scroll up by one line with the virtual scroller
     * Remove the last row and insert a new one at the beginning
     * 
     * @private
     * @ignore
     */
    _virtualScrollUp() {
        if (this.skip == 0) return
        this.skip -= 1
        this.lastIndex = Math.min(this.skip + this.limit - 1, this.collection.records.length)
        this.timelineBody.lastChild.remove()
        this.timelineBody.insertBefore(this._renderRowDiv(this.skip), this.timelineBody.children[0])
        this.timelineBody1stColumn.lastChild.remove()
        this.timelineBody1stColumn.insertBefore(this._renderRowDiv1stColumn(this.skip), this.timelineBody1stColumn.children[0])
    }

    /**
     * Scroll up by one line with the virtual scroller
     * Remove the last row and insert a new one at the beginning
     * 
     * @private
     * @ignore
     */
    _virtualScrollDown() {
        if ((this.lastIndex + 1) >= this.collection.records.length) return
        this.skip += 1
        this.lastIndex = Math.min(this.skip + this.limit - 1, this.collection.records.length)
        this.timelineBody.children[0].remove()
        this.timelineBody.appendChild(this._renderRowDiv(this.lastIndex))
        this.timelineBody1stColumn.children[0].remove()
        this.timelineBody1stColumn.appendChild(this._renderRowDiv1stColumn(this.lastIndex))
    }

    /**
     * 
     * SIZE MANAGEMENT
     * 
     */

    /**
     * Adjust the component width
     * 
     * @ignore
     * @param {(number|string|function)} [width] - The width to set
     */
    _setWidth() {
        let newWidth = this._computeSize("width")

        setTimeout(() => {
            this.style.width = newWidth
            this.timeline.style.width = this.clientWidth.toString() + "px"
        }, 50)
    }

    /**
     * Adjust the components height
     * 
     * @private
     * @ignore
     * @param {(number|string|function)} [height] - The height to set
     */
    _setHeight() {
        let newHeight = this._computeSize("height")
        this.style.height = this.timeline.style.height = newHeight
    }

    /**
     * Compute the maximum number of rows that can fit in the timeline, then set the "limit" param.
     * The limit depends on the global timeline height minus:
     * - the timeline toolbar
     * - the timeline header
     * 
     * @private
     * @ignore
     */
    _setLimit() {
        if (!this.isConnected) return

        let tableHeight = this.offsetHeight
        let headerHeight = $("timeline-header:" + this.id).offsetHeight
        let toolbarHeight = $("timeline-toolbar:" + this.id).offsetHeight
        let bodyHeight = tableHeight - toolbarHeight - headerHeight
        this.limit = Math.floor(bodyHeight / (this.rowHeight + 1))
        if (kiss.screen.isMobile) this.limit = this.limit - 1 // Keep a margin for Mobile UI
    }

    /**
     * 
     * RENDERING THE TABLE
     * 
     */

    /**
     * Render the pagination index.
     * Display, for example: 0 - 50 / 1000
     * 
     * @private
     * @ignore
     */
    _renderPagerIndex() {
        if (!this.isConnected) return

        if (kiss.screen.isMobile && kiss.screen.isVertical()) {
            // Compact version for mobile phones
            $("pager-index:" + this.id).innerHTML = Math.min(this.collection.count, (this.skip + this.limit)) + " / " + this.collection.count
        } else {
            $("pager-index:" + this.id).innerHTML = (this.skip + 1) + " - " + Math.min(this.collection.count, (this.skip + this.limit)) + " / " + this.collection.count
        }
    }

    /**
     * Render the timeline
     * 
     * @private
     * @ignore
     * @returns this
     */
    _render() {
        // kiss.tools.timer.start()

        // Reset 1st column
        this.timelineHeader1stColumn.innerHTML = ""
        this.timelineBody1stColumn.innerHTML = ""

        // Filters out hidden and deleted columns
        this.visibleColumns = this.columns.filter(column => column.hidden != true && column.deleted != true)

        this._initSize(this.config)
            ._columnsSetFirstColumnWidth(this.firstColumnWidth)
            ._renderHeader()
            ._renderHeaderToday()
            ._renderBody()

        // kiss.tools.timer.show("Timeline rendered!")
        return this
    }

    /**
     * Render the timeline header
     * 
     * @private
     * @ignore
     * @returns this
     */
    _renderHeader() {
        // 1st column header
        let firstCell = document.createElement("div")
        firstCell.setAttribute("id", "header-1stColumn")
        firstCell.setAttribute("col", "-1")
        firstCell.classList.add("timeline-column-header", "timeline-column-header-1st")
        firstCell.style.width = firstCell.style.minWidth = this.firstColumnWidth + "px"
        firstCell.innerHTML =
            `<span id='toggle-selection' class='timeline-header-checkbox ${(this.canSelect) ? "timeline-header-checkbox-off" : ""}'></span>` + // Selection checkbox
            `<span id='header-resizer-1st-column' class='fas fa-arrows-alt-h timeline-column-header-resizer'></span>` // Column resizer

        this.timelineHeader1stColumn.appendChild(firstCell)

        // Other columns headers
        const numberOfDays = this._getNumberOfDays()
        const htmlForDays = this._renderHeaderDays(numberOfDays)
        const htmlForMonths = this._renderHeaderMonths()

        this.timelineHeader.innerHTML = /*html*/ `
            <div>
                <span class="timeline-header-months">
                    ${htmlForMonths}
                </span>
                <span class="timeline-header-days">
                    ${htmlForDays}
                </span>
            </div>`

        return this
    }

    /**
     * Render the days of the timeline header
     * 
     * @private
     * @ignore
     * @returns {string} Html source for the days
     */
    _renderHeaderDays(max) {
        this.numberOfDays = 0
        let html = ""
        this.startDate = new Date(this.date)
        this.startDate.setHours(0, 0, 0, 0)
        let currentDate = this.startDate

        for (let i = 1; i <= max; i++) {
            this.numberOfDays++
            const day = currentDate.getDate()
            const month = currentDate.getMonth()
            const year = currentDate.getFullYear()
            const dayId = this._getDayId(day, month + 1, year)
            const currentDay = currentDate.getDay()
            const dayLetter = this.weekDays[currentDay][0]

            // Week-end => Alternate background color
            let dayClass = ""
            if (currentDay == 0 || currentDay == 6) dayClass = "timeline-header-weekend"

            // Adjust the cell content according to the day width
            if (this.dayWidth > 20) {
                // Large cells
                html += `<div id="${dayId}" style="min-width: ${this.dayWidth}px" class="timeline-header-day ${dayClass}">
                    <div>${dayLetter}</div><div>${day}</div>    
                </div>`
            }
            else if (this.dayWidth > 10) {
                // Medium cells
                html += `<div id="${dayId}" style="min-width: ${this.dayWidth}px" class="timeline-header-day ${dayClass}">
                    <div style="font-size: 8px">${day}</div>
                </div>`
            }
            else {
                // Small cells
                html += `<div id="${dayId}" style="min-width: ${this.dayWidth}px" class="timeline-header-day ${dayClass}">
                </div>`
            }

            currentDate = new Date(kiss.formula.ADJUST_DATE(currentDate, 0, 0, 1, 0, 0, 0))
        }

        this.endDate = currentDate
        return html
    }

    /**
     * Render the months of the timeline header
     * 
     * @private
     * @ignore
     * @returns {string} Html source for the months
     */
    _renderHeaderMonths() {
        let html = ""
        let currentDate = this.startDate
        let currentMonth = currentDate.getMonth()
        let currentYear = currentDate.getFullYear()
        
        while (currentDate <= this.endDate) {
            let lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
            if (lastDayOfMonth > this.endDate) lastDayOfMonth = this.endDate
    
            let daysInMonthDisplayed = (lastDayOfMonth - currentDate) / (1000 * 60 * 60 * 24) + 1
            let monthWidth = daysInMonthDisplayed * this.dayWidth
            if (monthWidth > 120) {
                // Full month, like "January 2023"
                html += `<div style="width: ${monthWidth}px; color: ${this.color}" class="timeline-header-month">${this.months[currentMonth]} ${currentYear}</div>`
            }
            else if (monthWidth > 50) {
                // Short month, like "01 / 2023"
                html += `<div style="width: ${monthWidth}px; color: ${this.color}" class="timeline-header-month">${currentMonth.toString().padStart(2, "0")} / ${currentYear}</div>`
            }
            else {
                // Very short month, like "01"
                html += `<div style="width: ${monthWidth}px; color: ${this.color}" class="timeline-header-month">${currentMonth.toString().padStart(2, "0")}</div>`
            }
    
            currentDate = new Date(currentYear, currentMonth + 1, 1)
            currentMonth = currentDate.getMonth()
            currentYear = currentDate.getFullYear()
        }
    
        return html
    }

    /**
     * Highlight today
     * 
     * @private
     * @ignore
     * @returns this
     */
    _renderHeaderToday() {
        let today = new Date().toISO()
        let todayCell = $(today)
        if (!todayCell) return this

        todayCell.style.color = "#ffffff"
        todayCell.style.backgroundColor = this.color
        return this
    }       

    /**
     * Render the content of a single row of the timeline.
     * 
     * @private
     * @ignore
     * @param {number} record - The record to render in this row
     * @returns {string} Html source for a row
     */
    _renderRowContent(record) {
        let startDate = record[this.startDateField]
        let endDate = record[this.endDateField]
        if (!startDate || !endDate) return ""

        startDate = new Date(record[this.startDateField]).toISO()
        endDate = new Date(record[this.endDateField]).toISO()

        let recordHtml = ""
        const blockWidth = this._computeBlockWidth(startDate, endDate)

        if (blockWidth.middle != 0) {
            const blockColor = this._computeBlockColor(record)
            recordHtml = /*html*/
                `<div class="timeline-cell-data" style="background-color: ${blockColor}">
                    ${this._renderRecord(record).join(" ● ")}
                </div>`
        }

        return `<div class="timeline-cell" style="width: ${blockWidth.start}px;"></div>
                <div class="timeline-cell" style="width: ${blockWidth.middle}px;">${recordHtml}</div>
                <div class="timeline-cell" style="width: ${blockWidth.end}px;"></div>`
    }

    /**
     * Render a single record as a Card for 1 week view
     * 
     * @private
     * @ignore
     * @param {object} record
     * @returns {string} Html for a single record
     */
    _renderRecord(record) {
        return this.columns
            .filter(column => column.hidden !== true)
            .map(column => {
                let field = this.model.getField(column.id)
                if (!field) return
                if (["attachment", "password", "link"].includes(field.type)) return

                let value = record[column.id]
                if (!value && value !== false) return

                let valueHtml = this._renderSingleValue(field, value, record)
                // let valueHtml = record[field.id]
                return valueHtml
            })
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
            case "checkbox":
                return this._rendererForCheckboxFields(value)
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
     * Render for "Directory" fields
     * 
     * @private
     * @ignore
     * @param {string|string[]} values - Select field values.
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
     * Renderer for "Checkbox" fields
     * 
     * @private
     * @ignore
     * @param {boolean} value
     * @returns {string} Html for the value
     */
    _rendererForCheckboxFields(value) {
        if (value === true) return "✔"
        return "✘"
    }    

    /**
     * Render the timeline body
     * 
     * Tech note: we don't use string litterals to build the HTML because it's slower than native String concatenation
     * 
     * @private
     * @ignore
     * @returns this
     */
    _renderBody() {
        let table = ""
        let firstColumn = ""
        this.startIndex = Math.max(0, this.skip)
        this.lastIndex = Math.min(this.skip + this.limit - 1, this.collection.records.length)

        if (this.collection.group.length === 0) {
            // Rendering without grouping
            for (let rowIndex = this.startIndex; rowIndex < this.lastIndex; rowIndex++) {
                let record = this.collection.records[rowIndex]

                firstColumn += "<div col=\"-1\" row=\"" + rowIndex + "\" recordId=\"" + record.id + "\" class=\"timeline-cell-1st\" style=\"width: " + this.firstColumnWidth + "px; min-width: " + this.firstColumnWidth + "px\">"
                firstColumn += this._renderRowContent1stColumn(record, rowIndex)
                firstColumn += "</div>"

                table += "<div row=\"" + rowIndex + "\" recordId=\"" + record.id + "\" class=\"timeline-row\">"
                table += this._renderRowContent(record)
                table += "</div>"
            }
        } else {
            // Rendering with grouping
            let nbOfRows = 0

            for (let rowIndex = this.skip;
                (nbOfRows < this.limit) && (rowIndex < this.collection.records.length); rowIndex++) {
                let record = this.collection.records[rowIndex]

                if (record.$type == "group") {
                    firstColumn += "<div col=\"-1\" row=\"" + rowIndex + "\" class=\"timeline-group timeline-group-level-" + record.$groupLevel + "\" style=\"width: " + this.firstColumnWidth + "px; min-width: " + this.firstColumnWidth + "px\">"
                    firstColumn += this._renderRowGroupContent1stColumn(record)
                    firstColumn += "</div>"

                    table += "<div row=\"" + rowIndex + "\" groupLevel=\"" + record.$groupLevel + "\" class=\"timeline-group-row\">"
                    table += this._renderRowGroupContent(record)
                    table += "</div>"
                } else {
                    firstColumn += "<div col=\"-1\" row=\"" + rowIndex + "\" recordId=\"" + record.id + "\" class=\"timeline-cell-1st\" style=\"width: " + this.firstColumnWidth + "px; min-width: " + this.firstColumnWidth + "px\">"
                    firstColumn += this._renderRowContent1stColumn(record, rowIndex)
                    firstColumn += "</div>"

                    table += "<div row=\"" + rowIndex + "\" recordId=\"" + record.id + "\" class=\"timeline-row\">"
                    table += this._renderRowContent(record)
                    table += "</div>"
                }
                nbOfRows++
            }
        }

        // Inject the table into the DOM
        this.timelineBody.innerHTML = table

        // Inject the table 1st column into the DOM
        this.timelineBody1stColumn.innerHTML = firstColumn

        // Update the pager index
        this._renderPagerIndex()

        // Highlight the selected rows
        this._renderSelection()

        // Add the virtual scroller
        this._renderScroller()

        // Show / hide empty icon
        this._renderEmptyIcon()

        return this
    }

    /**
     * Show an "empty" icon if there are no records to render
     * 
     * @private
     * @ignore
     */
    _renderEmptyIcon() {
        if (this.collection.records.length == "0") {
            this.timelineBodyContainer.classList.add("timeline-body-container-empty")
        } else {
            this.timelineBodyContainer.classList.remove("timeline-body-container-empty")
        }
    }

    /**
     * Render a single row of the timeline
     * 
     * @private
     * @ignore
     * @param {number} rowIndex
     * @returns {HTMLDivElement} The div containing the row
     */
    _renderRowDiv(rowIndex) {
        let record = this.collection.records[rowIndex]

        // Fork if it's a grouping row
        if (record.$type == "group") return this._renderRowGroupDiv(record, rowIndex)

        // Build the div
        let newRow = document.createElement("div")
        newRow.setAttribute("row", rowIndex)
        newRow.setAttribute("recordid", record.id)
        newRow.classList.add("timeline-row")

        // Apply the style "selected" if the row has been selected
        // TODO: optimization => apply the "selected" style for all selected rows *after* the timeline has been fully rendered
        let isSelected = !(this.selectedRecords.indexOf(record.id) == -1)
        if (isSelected) newRow.classList.add("timeline-row-selected")

        // Inject row content (= cells) into the div
        newRow.innerHTML = this._renderRowContent(record)
        return newRow
    }

    /**
     * Render the 1st cell of a single row of the timeline
     * 
     * @private
     * @ignore
     * @param {number} rowIndex
     * @returns {HTMLDivElement} The div containing the cell
     */
    _renderRowDiv1stColumn(rowIndex) {
        let record = this.collection.records[rowIndex]

        // Fork if it's a grouping row
        if (record.$type == "group") return this._renderRowGroupDiv1stColumn(record, rowIndex)

        let firstCell = document.createElement("div")
        firstCell.setAttribute("col", "-1")
        firstCell.setAttribute("row", rowIndex)
        firstCell.setAttribute("recordid", record.id)
        firstCell.classList.add("timeline-cell-1st")
        firstCell.style.width = firstCell.style.minWidth = this.firstColumnWidth + "px"

        // Apply the style "selected" if the row has been selected
        let isSelected = !(this.selectedRecords.indexOf(record.id) == -1)

        firstCell.innerHTML = this._renderRowContent1stColumn(record, rowIndex, isSelected)
        return firstCell
    }

    /**
     * Render the content of the 1st cell of a single row of the timeline.
     * 
     * The 1st cell of the row includes:
     * - a selection checkbox
     * - the row number
     * - a button to expand the record and see it in a form
     * 
     * @private
     * @ignore
     * @param {number} record - The record to render in this row
     * @param {number} rowIndex
     * @param {boolean} [isSelected] - If true, render the row with its "selected" appearence
     * @returns {string} Html source for a row
     */
    _renderRowContent1stColumn(record, rowIndex, isSelected) {
        return ((this.canSelect) ? "<span class=\"timeline-row-checkbox timeline-row-checkbox-" + ((isSelected) ? "on" : "off") + "\"></span>" : "") + // Selection checkbox
            "<span class=\"timeline-row-number\">" + ((record.$index + 1) || Number(rowIndex + 1)) + " ● </span>" + // Row number
            "<span class=\"timeline-row-title\">" + record[this.titleField] + "</span>" // Row data
    }

    /**
     * Render a single *group* row of the timeline.
     * 
     * @private
     * @ignore
     * @param {object} record
     * @param {number} rowIndex 
     */
    _renderRowGroupDiv(record, rowIndex) {
        let newRow = document.createElement("div")
        newRow.setAttribute("row", rowIndex)
        newRow.classList.add("timeline-group-row")
        newRow.innerHTML = this._renderRowGroupContent(record)
        return newRow
    }

    /**
     * Render the first cell of a single *group* row of the timeline.
     * 
     * @private
     * @ignore
     * @param {object} record
     * @param {number} rowIndex 
     */
    _renderRowGroupDiv1stColumn(record, rowIndex) {
        let firstCell = document.createElement("div")
        firstCell.setAttribute("col", "-1")
        firstCell.setAttribute("row", rowIndex)
        firstCell.classList.add("timeline-group", "timeline-group-level-" + record.$groupLevel)
        firstCell.style.width = firstCell.style.minWidth = this.firstColumnWidth + "px"
        firstCell.innerHTML = this._renderRowGroupContent1stColumn(record)
        return firstCell
    }

    /**
     * Render the content of a single *group* row of the timeline.
     * 
     * @private
     * @ignore
     * @param {object} record 
     * @returns {string} Html source for a *group* row
     */
    _renderRowGroupContent(record) {
        return "<div class=\"timeline-group-id\">" + record.$groupId + ". " + record.$name + "</div>"
    }

    /**
     * Render the content of the 1st cell of a single *group* row of the timeline.
     * 
     * @private
     * @ignore
     * @param {object} record 
     * @returns {string} Html source for a *group* row
     */
    _renderRowGroupContent1stColumn(record) {
        // Get group field
        let groupFieldId = this.collection.group[record.$groupLevel]
        let groupColumn = this.getColumn(groupFieldId)

        // Check if it's a collapsed group
        let groupClass = (this.collection.collapsedGroups.includes(record.$groupId)) ? "timeline-group-collapsed" : "timeline-group-expanded"

        // The 1st cell of the row includes:
        // - an icon to expand/collapse the group
        // - the group name
        let groupRawValue = record.$name
        let groupCellValue = (groupColumn) ? groupColumn.renderer(groupRawValue, record) : "..."

        return "<span class='" + groupClass + "'></span>" + // Icon to expand/collapse the group
            groupCellValue + "&nbsp;&nbsp;(" + record.$size + ")" // Group name and count
    }

    /**
     * Compute the color of a block according to the colorField
     * 
     * @private
     * @ignore
     * @param {object} record 
     * @returns {string} The color in hexadecimal format, like "#ff0000"
     */
    _computeBlockColor(record) {
        let colorValue = this.model.color
        const colorField = (this.colorField) ? this.model.getField(this.colorField) : null
        if (colorField) {
            colorValue = record[this.colorField]
            if (colorField.type == "select") {
                colorValue = colorField.options.find(option => option.value == colorValue)
                colorValue = (colorValue) ? colorValue.color : this.model.color
            }
        }
        return colorValue
    }

    /**
     * Compute the size of a timeline "block" according to the start and end dates.
     * 
     * A block has 3 parts:
     * - the start part
     * - the middle part (the main content of the block, like a card or a record)
     * - the end part
     * 
     * @private
     * @ignore
     * @param {date} startDate 
     * @param {date} endDate 
     * @returns {object} An object with 3 properties defining each part width: start, middle, end
     */
    _computeBlockWidth(startDate, endDate) {
        const bodyWidth = this.numberOfDays * this.dayWidth
        const unit = bodyWidth / this.numberOfDays

        const startDifference = kiss.formula.DAYS_DIFFERENCE(this.startDate, startDate)
        const endDifference = kiss.formula.DAYS_DIFFERENCE(endDate, this.endDate) - 1

        let startX = startDifference * unit
        if (startX < 0) startX = 0
        else if (startX > bodyWidth) startX = bodyWidth

        let endX = bodyWidth - endDifference * unit
        if (endX < 0) endX = 0
        else if (endX > bodyWidth) endX = bodyWidth

        const startBlockWidth = Math.max(Math.floor(startX), 0)
        const middleBlockWidth = Math.max(Math.floor(endX - startX), 0)
        const endBlockWidth = Math.max(Math.floor(bodyWidth - endX), 0)

        return {
            start: startBlockWidth,
            middle: middleBlockWidth,
            end: endBlockWidth
        }
    }

    /**
     * Prepare renderers for special column types:
     * - number
     * - date
     * - select
     * - checkbox
     * - link
     * - button
     * - ...
     * 
     * @private
     * @ignore
     * @returns this
     */
    _prepareCellRenderers() {

        // Cache all the <Select> fields options into a Map for a faster access when rendering
        this._prepareColumnValuesForSelectFields()

        // Attach renderers to columns
        this.columns.forEach(column => {

            if (column.renderer && !["checkbox", "select", "rating"].includes(column.type)) return

            // Otherwise, the renderer depends on the field type
            switch (column.type) {
                case "number":
                    column.renderer = this._prepareCellRendererForNumbers(column)
                    break
                case "date":
                    column.renderer = this._prepareCellRendererForDates(column)
                    break
                case "checkbox":
                    column.renderer = this._prepareCellRendererForCheckboxes(column)
                    break
                case "select":
                    column.renderer = this._prepareCellRendererForSelectFields(column)
                    break
                case "selectViewColumn":
                    column.renderer = this._prepareCellRendererForSelectViewColumnFields(column)
                    break
                case "directory":
                    column.renderer = this._prepareCellRendererForDirectory(column)
                    break
                case "color":
                    column.renderer = this._prepareCellRendererForColors(column)
                    break
                case "icon":
                    column.renderer = this._prepareCellRendererForIcons(column)
                    break
                case "rating":
                    column.renderer = this._prepareCellRendererForRatings(column)
                    break
                case "slider":
                    column.renderer = this._prepareCellRendererForSliders(column)
                    break
                default:
                    column.renderer = this._prepareDefaultCellRenderer(column)
            }
        })

        return this
    }

    /**
     * Define the default column renderer
     * 
     * @private
     * @ignore
     */
    _prepareDefaultCellRenderer() {
        return function (value) {
            return ((value || "") + "").escapeHtml()
        }
    }

    /**
     * Define the column renderer for fields which type is "number"
     * 
     * @private
     * @ignore
     */
    _prepareCellRendererForNumbers(column) {
        const field = this.model.getField(column.id)
        const precision = (field) ? field.precision : 2 // Default precision = 2
        const unit = (field.unit) ? " " + field.unit : ""

        return function (value) {
            if (value === undefined) return ""
            return Number(value).format(precision) + unit
        }
    }

    /**
     * Define the column renderer for fields which type is "date"
     * 
     * @private
     * @ignore
     */
    _prepareCellRendererForDates(column) {
        // const field = this.model.getField(column.id)
        // const dateFormat = (field) ? field.dateFormat : "YYYY-MM-AA"

        return function (value) {
            if (!value) return ""
            return new Date(value).toLocaleDateString()
        }
    }

    /**
     * Define the column renderer for fields which type is "checkbox"
     * 
     * @private
     * @ignore
     */
    _prepareCellRendererForCheckboxes(column) {
        const field = this.model.getField(column.id)
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
            log("kiss.ui - Timeline - Couldn't generate renderer for checkboxes", 4)
            return function (value) {
                return value
            }
        }

        const iconClasses = kiss.ui.Checkbox.prototype.getIconClasses()
        const defaultIconOn = iconClasses[shape]["on"]
        const defaultIconOff = iconClasses[shape]["off"]

        return function (value) {
            return `<span ${(value === true) ? `style="color: ${iconColorOn}"` : ""} class=\"${(value === true) ? defaultIconOn + " timeline-type-checkbox-checked" : defaultIconOff + " timeline-type-checkbox-unchecked"}\"/>`
        }
    }

    /**
     * Define the column renderer for fields which type is "rating"
     * 
     * @private
     * @ignore
     * @returns {function} column renderer
     */
    _prepareCellRendererForRatings(column) {
        const field = this.model.getField(column.id)
        const iconColorOn = field.iconColorOn || "#ffd139"
        const iconColorOff = field.iconColorOff || "#dddddd"
        const shape = field.shape || "star"
        const iconClasses = kiss.ui.Rating.prototype.getIconClasses()
        const icon = iconClasses[shape]
        const max = field.max || 5

        return function (value) {
            let html = ""
            for (let i = 0; i < max; i++) {
                const color = (i < value) ? iconColorOn : iconColorOff
                html += /*html*/ `<span class="rating ${icon}" style="color: ${color}" index=${i}></span>`
            }
            return html
        }
    }

    /**
     * Define the column renderer for fields which type is "slider"
     * 
     * @private
     * @ignore
     * @returns {function} column renderer
     */
    _prepareCellRendererForSliders(column) {
        const field = this.model.getField(column.id)
        const min = field.min || 0
        const max = field.max || 100
        const step = field.interval || 5
        const unit = field.unit || ""

        return function (value) {
            return /*html*/ `<span class="field-slider-container">
                <input class="field-slider" type="range" value="${value || 0}" min="${min}" max="${max}" step="${step}" style="pointer-events: none;">
                <span class="field-slider-value">${value || 0} ${unit}</span>
            </span>`
        }
    }

    /**
     * Define the column renderer for fields which type is "color"
     *
     * @private 
     * @ignore
     */
    _prepareCellRendererForColors() {
        return function (value) {
            if (!value) return ""
            return `<span class="timeline-type-color" style="background: ${value}"></span>`
        }
    }

    /**
     * Define the column renderer for fields which type is "icon"
     * 
     * @private
     * @ignore
     */
    _prepareCellRendererForIcons() {
        return function (value) {
            if (!value) return ""
            return `<span class="${value}"/>`
        }
    }

    /**
     * Define the column renderer for fields which type is "directory"
     * 
     * @private
     * @ignore
     * @param {object} column
     * @returns {function} column renderer
     */
    _prepareCellRendererForDirectory(column) {
        return function (values) {
            return [].concat(values).map(value => {
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

                return (name) ? `<span class="field-select-value">${name}</span>` : ""
            }).join("")
        }
    }

    /**
     * Define the column renderer for fields which type is "select"
     * 
     * @private
     * @ignore
     * @param {object} column
     * @returns {function} column renderer
     */
    _prepareCellRendererForSelectFields(column) {
        // If the <Select> field has its own specific renderer, we use it
        const field = this.model.getField(column.id)
        if (field.valueRenderer) return field.valueRenderer

        const options = this.cachedSelectFields.get(column.id)

        // If no options, returns default layout
        if (!options) {
            return function (values) {
                return [].concat(values).map(value => {
                    if (!value) return ""
                    return `<span class="field-select-value">${value}</span>`
                }).join("")
            }
        }

        // If options, returns values with the right option colors
        return function (values) {
            return [].concat(values).map(value => {
                if (!value) return ""

                let option = options.get(("" + value).toLowerCase())

                if (!option) option = {
                    value: value
                }

                if (!option.value || option.value == " ") return ""

                return `<span class="field-select-value" ${(option.color) ? `style="color: #ffffff; background-color: ${option.color}"` : ""}>${option.value}</span>`
            }).join("")
        }
    }

    /**
     * Define the column renderer for fields which type is "selectViewColumn"
     * 
     * @private
     * @ignore
     * @returns {function} column renderer
     */
    _prepareCellRendererForSelectViewColumnFields() {
        return function (values) {
            return [].concat(values).map(value => {
                if (!value) return ""
                return `<span class="field-select-value">${value}</span>`
            }).join("")
        }
    }

    /**
     * Cache all the <Select> fields options into a Map for a faster access when rendering
     * 
     * @private
     * @ignore
     */
    _prepareColumnValuesForSelectFields() {
        this.cachedSelectFields = new Map()

        for (const field of this.model.fields) {
            if (field.type == "select") {
                const options = (typeof field.options == "function") ? field.options() : (field.options || [])
                let mapOptions = new Map(options.map(option => [option.value.toLowerCase(), {
                    value: option.label || option.value,
                    color: option.color
                }]))
                this.cachedSelectFields.set(field.id, mapOptions)
            }
        }
    }

    /**
     * Render the virtual scrollbar
     * 
     * @private
     * @ignore
     */
    _renderScroller() {
        // getBoundingClientRect is a bit behind the dom rendering
        setTimeout(() => {
            this.timelineScrollerContainer.style.top = this.timelineBody.getBoundingClientRect().top + "px"
            this.timelineScrollerContainer.style.left = this.getBoundingClientRect().right - this.timelineScrollerContainer.offsetWidth + "px"
            this._showScroller()
        }, 50)

        // Set the virtual scrollbar height within the container.
        // Setting it bigger than the container forces the browser to generate a real scrollbar.
        this.timelineScrollerContainer.style.height = this.timelineBody.offsetHeight - 10 + "px"
        this.timelineScroller.style.height = Math.min(this.collection.count * (this.rowHeight), 10000) + "px"
    }

    /**
     * Show the virtual scroller
     * 
     * @private
     * @ignore
     */
    _showScroller() {
        if (this.showScroller !== false) {
            setTimeout(() => {
                this.timelineScrollerContainer.style.visibility = "visible"
            }, 0)
        }
    }

    /**
     * Hide the virtual scroller
     * 
     * @private
     * @ignore
     */
    _hideScroller() {
        this.timelineScrollerContainer.style.visibility = "hidden"
    }

    /**
     * Sync the virtual scrollbar position with the current timeline "skip" value
     * 
     * @private
     * @ignore
     */
    _renderScrollerPosition() {
        let percent = this.skip / (this.collection.records.length - this.limit)
        let topPosition = Math.round((this.timelineScroller.offsetHeight - this.timelineBody.offsetHeight) * percent)
        this.preventScroll = true // Disable onscroll event to avoid echo
        this.timelineScrollerContainer.scrollTop = topPosition
    }

    /**
     * Highlight the records that are selected in the rendered page
     * 
     * @private
     * @ignore
     */
    _renderSelection() {
        if (!this.selectedRecords) return

        this.selectedRecords.forEach(recordId => {
            let rowIndexes = this._rowGetAllIndexes(recordId)
            rowIndexes.forEach(rowIndex => this._rowSelect(rowIndex))
        })
    }

    /**
     * Restore the selection of the rendered page.
     * First clean the existing selection that might be obsolete,
     * then add the active selection.
     * 
     * @private
     * @ignore
     */
    _renderSelectionRestore() {
        this.getSelection()
        this._renderBody()
    }

    /**
     * 
     * Render the toolbar
     * 
     * The toolbar includes multiple components:
     * - button to create a new record
     * - button to select columns
     * - button to sort
     * - button to filter
     * - field to group
     * - button to expand groups
     * - button to collapse groups
     * - buttons to paginate (previous, next) and actual page number
     * 
     * @private
     * @ignore
     */
    _renderToolbar() {

        // If the toolbar is already rendered, we just update it
        if (this.isToolbarRendered) {
            this._groupUpdateGroupingFields()
            return
        }

        // New record creation button
        createButton({
            hidden: !this.canCreateRecord,
            class: "timeline-create-record",
            target: "create:" + this.id,
            text: this.model.name.toTitleCase(),
            icon: "fas fa-plus",
            iconColor: this.color,
            borderWidth: "3px",
            borderRadius: "32px",
            maxWidth: (kiss.screen.isMobile && kiss.screen.isVertical()) ? 160 : null,
            action: async () => this.createRecord(this.model)
        }).render()

        // Actions button
        createButton({
            hidden: this.showActions === false,
            target: "actions:" + this.id,
            tip: txtTitleCase("actions"),
            icon: "fas fa-bolt",
            iconColor: this.color,
            width: 32,
            action: () => this._buildActionMenu()
        }).render()

        // Setup the timeline
        createButton({
            hidden: !this.showSetup,
            target: "setup:" + this.id,
            tip: txtTitleCase("setup the timeline"),
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

        // Sorting button
        createButton({
            hidden: !this.canSort,
            target: "sort:" + this.id,
            tip: txtTitleCase("to sort"),
            icon: "fas fa-sort",
            iconColor: this.color,
            width: 32,
            action: () => this.showSortWindow()
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

        // Layout button
        createButton({
            hidden: !this.showLayoutButton,
            target: "layout:" + this.id,
            tip: {
                text: txtTitleCase("layout"),
                minWidth: 100
            },
            icon: "fas fa-ellipsis-v",
            iconColor: this.color,
            width: 32,
            action: () => this._buildLayoutMenu()
        }).render()

        // Grouping
        let groupingFields = this._groupGetModelFields()
        let groupingFieldValues = []

        this.collection.group.forEach(fieldId => {
            let groupingField = groupingFields.find(field => field.value == fieldId)
            if (groupingField) groupingFieldValues.push(groupingField.value)
        })

        createSelect({
            hidden: !this.canGroup,
            target: "group:" + this.id,
            id: "grouping-field:" + this.id,
            label: txtTitleCase("group by"),
            multiple: true,
            allowClickToDelete: true,
            options: groupingFields,
            minWidth: 200,
            maxHeight: () => kiss.screen.current.height - 200,
            optionsColor: this.color,
            value: groupingFieldValues,
            styles: {
                "this": "align-items: center;",
                "field-label": "white-space: nowrap;",
                "field-select": "white-space: nowrap;",
            },
            events: {
                change: async function (event) {
                    let groupFields = this.getValue()

                    // Restrict to 6 grouping fields
                    if (groupFields.length > 6) {
                        let fieldGroupSelect = $(this.id)
                        fieldGroupSelect.value = fieldGroupSelect.getValue().slice(0, 6)
                        fieldGroupSelect._renderValues()

                        createDialog({
                            type: "message",
                            title: txtTitleCase("seriously"),
                            icon: "fas fa-exclamation-triangle",
                            message: txtTitleCase("#too many groups"),
                            buttonOKText: txtTitleCase("#understood")
                        })
                        return
                    }

                    // Publish the "grouping" event
                    let viewId = this.id.split(":")[1]
                    publish("EVT_VIEW_GROUPING:" + viewId, groupFields)
                }
            }
        }).render()

        // Expand button
        this.buttonExpand = createButton({
            hidden: (!this.showGroupButtons || this.collection.group.length === 0),

            target: "expand:" + this.id,
            tip: txtTitleCase("expand all"),
            icon: "far fa-plus-square",
            iconColor: this.color,
            width: 32,
            action: () => this.expandAll()
        }).render()

        // Collapse button
        this.buttonCollapse = createButton({
            hidden: (!this.showGroupButtons || this.collection.group.length === 0),

            target: "collapse:" + this.id,
            tip: txtTitleCase("collapse all"),
            icon: "far fa-minus-square",
            iconColor: this.color,
            width: 32,
            action: () => this.collapseAll()
        }).render()

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

        // Search button
        createButton({
            hidden: !this.canSearch,
            target: "search:" + this.id,
            icon: "fas fa-search",
            iconColor: this.color,
            width: 32,
            events: {
                click: () => this.showSearchBar()
            }
        }).render()

        // Pager display mode
        if (this.canChangePeriod) {
            let _this = this
            createSelect({
                target: "pager-mode:" + this.id,
                id: "pager-mode:" + this.id,
                options: [{
                        label: "1 " + txt("year"),
                        value: "1 year"
                    }, {
                        label: "6 " + txt("months"),
                        value: "6 months"
                    }, {
                        label: "4 " + txt("months"),
                        value: "4 months"
                    }, {
                        label: "3 " + txt("months"),
                        value: "3 months"
                    }, {
                        label: "2 " + txt("months"),
                        value: "2 months"
                    }, {
                        label: "1 " + txt("month"),
                        value: "1 month"
                    },
                    {
                        label: "3 " + txt("weeks"),
                        value: "3 weeks"
                    },
                    {
                        label: "2 " + txt("weeks"),
                        value: "2 weeks"
                    },
                    {
                        label: "1 " + txt("week"),
                        value: "1 week"
                    }
                ],
                optionsColor: this.color,
                value: this.period || "1 month",
                fieldWidth: 150,
                styles: {
                    "this": "align-items: center;",
                    "field-label": "white-space: nowrap;",
                    "field-select": "white-space: nowrap;",
                },
                events: {
                    change: async function () {
                        _this.period = this.getValue()
                        const numberOfDays = _this.periods[_this.period]
                        const bodyWidth = _this._getBodyWidth()
                        const newDayWidth = Math.floor(bodyWidth / numberOfDays)
                        _this._setDayWidth(newDayWidth)
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
                    this.date = new Date(kiss.formula.ADJUST_DATE(this.startDate, 0, 0, -this.numberOfDays, 0, 0, 0))
                    this._render()
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
                    this.date = new Date(kiss.formula.ADJUST_DATE(this.startDate, 0, 0, this.numberOfDays, 0, 0, 0))
                    this._render()
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
                    this.date = new Date()
                    this._render()
                }
            }
        }
        if (!kiss.screen.isMobile) todayButton.text = txtTitleCase("today")
        createButton(todayButton).render()

        // Flag the toolbar as "rendered", so that the method _renderToolbar() is idempotent
        this.isToolbarRendered = true
    }

    /**
     * 
     * ROWS API
     * 
     */

    /**
     * Check / Uncheck a row with the row checkbox.
     * 
     * @private
     * @ignore
     * @param {integer} rowIndex - The row number in the view
     */
    _rowToggleSelect(rowIndex) {
        let checkbox = this._rowGetCheckbox(rowIndex)
        let recordId = checkbox.parentNode.getAttribute("recordId")

        let rowIndexes = this._rowGetAllIndexes(recordId)
        let isSelected = (this.selectedRecords.indexOf(recordId) != -1)

        if (isSelected) {
            rowIndexes.forEach(rowIndex => this._rowDeselect(rowIndex))
            kiss.selection.delete(this.id, recordId)
        } else {
            rowIndexes.forEach(rowIndex => this._rowSelect(rowIndex))
            kiss.selection.insertOne(this.id, recordId)
        }

        // Update the timeline
        this.selectedRecords = kiss.selection.get(this.id)
        return recordId
    }

    /**
     * Select a row, and add it to the collection selection.
     * The index is relative to the page (the row 0 can be the nth record in the collection).
     * 
     * @private
     * @ignore
     * @param {number} rowIndex - The row number in the current page
     */
    _rowSelect(rowIndex) {
        // Update the checkbox
        let checkbox = this._rowGetCheckbox(rowIndex)
        checkbox.classList.add("timeline-row-checkbox-on")
        checkbox.classList.remove("timeline-row-checkbox-off")

        // Highlight the selected row
        let row = this.timelineBody.querySelector("[row=\"" + rowIndex + "\"]")
        row.classList.add("timeline-row-selected")
    }

    /**
     * Deselect a row, and remove it from the collection selection.
     * The index is relative to the page (the row 0 can be the nth record in the collection).
     * 
     * @private
     * @ignore
     * @param {number} rowIndex - The row number in the current page
     */
    _rowDeselect(rowIndex) {
        // Update the checkbox
        let checkbox = this._rowGetCheckbox(rowIndex)
        checkbox.classList.add("timeline-row-checkbox-off")
        checkbox.classList.remove("timeline-row-checkbox-on")

        // Remove the highlight on the selected row
        let row = this.timelineBody.querySelector("[row=\"" + rowIndex + "\"]")
        row.classList.remove("timeline-row-selected")
    }

    /**
     * Highlight a row
     * 
     * @private
     * @ignore
     * @param {number} rowIndex - The row index to highlight
     */
    _rowHighlight(rowIndex) {
        let row = this.querySelector("[row=\"" + rowIndex + "\"]")
        row.classList.add("timeline-row-selected")
    }

    /**
     * Get the checkbox used to select/deselect a row.
     * The index is relative to the page (the row 0 can be the nth record in the collection).
     * 
     * @private
     * @ignore
     * @param {integer} rowIndex
     * @returns {HTMLElement} The checkbox input element
     */
    _rowGetCheckbox(rowIndex) {
        return this.timelineBody1stColumn.querySelector("[row=\"" + rowIndex + "\"]").querySelector(".timeline-row-checkbox")
    }

    /**
     * Find the index of a record in the timeline (including hidden rows)
     * 
     * @private
     * @ignore
     * @param {string} recordId
     * @returns {number} The index of the record in the timeline, or -1 if not found
     */
    _rowFindIndex(recordId) {
        return this.collection.records.findIndex(record => record.id == recordId)
    }

    /**
     * Find all the indexes of a record in the active page.
     * 
     * @private
     * @ignore
     * @param {string} recordId
     * @returns {integer} The row index, or null if it wasn't found in the page
     */
    _rowGetAllIndexes(recordId) {
        let rows = this.timelineBody.querySelectorAll("div[recordId='" + recordId + "']")
        if (rows) return Array.from(rows).map(row => row.getAttribute("row"))
        else return null
    }

    /**
     * Get the row height config stored locally
     * 
     * @private
     * @ignore
     */
    _getRowHeightFromLocalStorage() {
        const localStorageId = "config-timeline-" + this.id + "-row-height"
        const rowHeight = localStorage.getItem(localStorageId)
        if (!rowHeight) return this.defaultRowHeight
        return Number(rowHeight)
    }

    /**
     * 
     * COLUMNS MANAGEMENT
     * 
     */

    /**
     * Save the width of the 1st column in the localStorage
     * 
     * @private
     * @ignore
     * @param {number} newWidth - New column width
     */
    _columnsSetWidth(newWidth) {
        localStorage.setItem("config-timeline-" + this.id + "-1st-column", newWidth)
    }

    /**
     * Resize the 1st column
     * 
     * @private
     * @ignore
     */
    _columnsResizeWithDragAndDrop(event, element) {
        let columnMinSize = 90

        // Get column cells
        let columnId = element.parentNode.id.split("header-")[1] // headers id are built like: header-columnId
        let colIndex = element.parentNode.getAttribute("col")
        let columnCells = Array.from(this.querySelectorAll("div[col='" + colIndex + "']"))

        // Get column header elements
        let columnHeader = element.parentNode
        let columnHeaderTitle = columnHeader.children[0]
        columnHeader.mouseStartX = event.x
        let currentWidth = columnHeader.clientWidth
        let newWidth

        // !!!
        // TODO: memory leak to solve here => listeners seem to not be garbage collected properly
        // !!!
        document.onmousemove = (event) => {
            let _event = event

            setTimeout(() => {
                newWidth = (currentWidth + _event.x - columnHeader.mouseStartX)
                if (newWidth > columnMinSize) {
                    columnHeader.style.minWidth = columnHeader.style.width = newWidth + "px"
                    columnHeaderTitle.style.minWidth = columnHeaderTitle.style.width = newWidth - 16 + "px"
                    columnCells.forEach(cell => cell.style.width = cell.style.minWidth = newWidth + "px")
                    this._columnsSetFirstColumnWidth(newWidth)
                }
            }, 1)
        }

        // Remove listeners & re-render
        document.onmouseup = () => {
            this._columnsSetWidth(Math.max(columnMinSize, newWidth))
            document.onmousemove = null
            document.onmouseup = null
            this._render()
        }
    }

    /**
     * Resize the timeline first column, used to display:
     * - selection checkboxes
     * - group names, when the view is grouped by a field
     * 
     * @private
     * @ignore
     * @param {number} newWidth
     * @returns this
     */
    _columnsSetFirstColumnWidth(newWidth) {
        this.firstColumnWidth = newWidth
        this.timelineHeader1stColumn.style.minWidth = newWidth + "px"
        this.timelineBody1stColumn.style.minWidth = newWidth + "px"
        return this
    }

    /**
     * Adjust 1st column width from a local configuration stored in the localStorage.
     * If a configuration is found for a specific column, then it is applied.
     * Otherwise, a DEFAULT_WIDTH width is applied.
     * 
     * @private
     * @ignore
     * @returns this
     */
    _columnsAdjustWidthFromLocalStorage() {
        let localStorageId = "config-timeline-" + this.id + "-1st-column"
        let firstColumnWidth = localStorage.getItem(localStorageId)
        this.firstColumnWidth = (firstColumnWidth || this.firstColumnWidth)
        return this
    }

    /**
     * 
     * OTHER MISC METHODS
     * 
     */

    /**
     * Render the menu to change timeline layout
     * 
     * @private
     * @ignore
     */
    async _buildLayoutMenu() {
        let buttonLeftPosition = $("layout:" + this.id).offsetLeft
        let buttonTopPosition = $("layout:" + this.id).offsetTop

        createMenu({
            top: buttonTopPosition,
            left: buttonLeftPosition,
            items: [
                // Title
                txtTitleCase("cell size"),
                "-",
                // Change row height to  COMPACT
                {
                    icon: "fas fa-circle",
                    iconSize: "2px",
                    text: txtTitleCase("compact"),
                    action: () => {
                        this.rowHeight = 30
                        this.setRowHeight(this.rowHeight)
                    }
                },
                // Change row height to NORMAL
                {
                    icon: "fas fa-circle",
                    iconSize: "6px",
                    text: txtTitleCase("normal"),
                    action: () => {
                        this.rowHeight = this.defaultRowHeight
                        this.setRowHeight(this.rowHeight)
                    }
                },
                // Change row height to MEDIUM
                {
                    icon: "fas fa-circle",
                    iconSize: "10px",
                    text: txtTitleCase("medium"),
                    action: () => {
                        this.rowHeight = 80
                        this.setRowHeight(this.rowHeight)
                    }
                },
                // Change row height to TALL
                {
                    icon: "fas fa-circle",
                    iconSize: "14px",
                    text: txtTitleCase("tall"),
                    action: () => {
                        this.rowHeight = 120
                        this.setRowHeight(this.rowHeight)
                    }
                },
                // Change row height to VERY TALL
                {
                    icon: "fas fa-circle",
                    iconSize: "18px",
                    text: txtTitleCase("very tall"),
                    action: () => {
                        this.rowHeight = 160
                        this.setRowHeight(this.rowHeight)
                    }
                },
                "-",
                // Reset columns width
                {
                    icon: "fas fa-undo-alt",
                    text: txtTitleCase("#reset view params"),
                    action: () => this.resetLocalViewParameters()
                }
            ]
        }).render()
    }
}

// Create a Custom Element and add a shortcut to create it
customElements.define("a-timeline", kiss.ui.Timeline)

/**
 * Shorthand to create a new Timeline. See [kiss.ui.Timeline](kiss.ui.Timeline.html)
 * 
 * @param {object} config
 * @returns HTMLElement
 */
const createTimeline = (config) => document.createElement("a-timeline").init(config)

;