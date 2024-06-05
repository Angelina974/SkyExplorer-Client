/** 
 * 
 * The **Datatable** derives from [DataComponent](kiss.ui.DataComponent.html).
 * 
 * It's a [powerful datatable](../../client/site/index.html#ui=start&section=datatables&anchor=Introduction%20about%20KissJS%20datatables) with the following features:
 * - display / hide columns
 * - move columns with drag&drop
 * - resize columns
 * - multi-column sorting
 * - complex filtering with combination of AND/OR filters
 * - multi-column grouping
 * - virtual scrolling which also works with grouped data
 * - customizable behavior when opening a record: overriding the selectRecord method
 * - customizable action menu: using actions property
 * - inline cell editing
 * - pre-built cell renderers like text, number, date, select, buttons...
 * - custom cell renderers
 * 
 * Tech note:
 * - rendering time is proportional to the number of cells (= rows x columns) that are visible in the viewport (other cells are not rendered at all)
 * - rendering takes an average of 0.05 to 0.07 millisecond (depending on the cell type) per visible cell on an Intel i7-4790K
 * 
 * @param {object} config
 * @param {Collection} config.collection - The data source collection
 * @param {object} [config.record] - Record to persist the view configuration into the db
 * @param {object[]} [config.columns] - Where each column is: {title: "abc", type: "text|number|integer|float|date|button", id: "fieldId", button: {config}, renderer: function() {}}
 * @param {string} [config.color] - Hexa color code. Ex: #00aaee
 * @param {string} [config.rowHeight] - CSS row height in pixels. Ex: 40px
 * @param {boolean} [config.showHeader] - false to hide the header (default = true)
 * @param {boolean} [config.showColumnType] - true to display an icon in the header indicating the column type (default = false)
 * @param {boolean} [config.showToolbar] - false to hide the toolbar (default = true)
 * @param {boolean} [config.showPagerIndex] - false to hide the pager index (default = true)
 * @param {boolean} [config.showScroller] - false to hide the virtual scroller (default = true)
 * @param {boolean} [config.showActions] - false to hide the custom actions menu (default = true)
 * @param {boolean} [config.showLayoutButton] - false to hide the button to adjust the layout (default = true)
 * @param {boolean} [config.showGroupButtons] - false to hide the button to expand/collapse groups (default = true)
 * @param {boolean} [config.showGroupHierarchyButton] - false to hide the button to show group hierarchy (default = true)
 * @param {boolean} [config.showLinks] - false to hide the columns which field type is "link"
 * @param {boolean} [config.canSearch] - false to hide the search button (default = true)
 * @param {boolean} [config.canSelect] - false to hide the selection checkboxes (default = true)
 * @param {boolean} [config.canSort] - false to hide the sort button (default = true)
 * @param {boolean} [config.canFilter] - false to hide the filter button (default = true)
 * @param {boolean} [config.canGroup] - false to hide the group button (default = true)
 * @param {boolean} [config.canEdit] - Can we edit the cells?
 * @param {boolean} [config.canSelectFields] - Can we select the fields (= columns) to display in the table? (default = true)
 * @param {boolean} [config.canAddField] - Can we add a field (= column) to the table?
 * @param {boolean} [config.canEditField] - Can we edit an existing field (= column)?
 * @param {boolean} [config.canCreateRecord] - Can we create new records from the datatable?
 * @param {boolean} [config.createRecordText] - Optional text to insert in the button to create a new record, instead of the default model's name
 * @param {boolean} [config.iconAction] - Font Awesome icon class to display the "open record" symbol. Defaults to "far fa-file-alt"
 * @param {object[]} [config.actions] - Array of menu actions, where each menu entry is: {text: "abc", icon: "fas fa-check", action: function() {}}
 * @param {object[]} [config.buttons] - Array of custom buttons, where each button is: {position: 3, text: "button 3", icon: "fas fa-check", action: function() {}}
 * @param {number|string} [config.width]
 * @param {number|string} [config.height]
 * @returns this
 * 
 * ## Generated markup
 * ```
 * <a-datatable class="a-datatable">
 *      <div class="datatable-toolbar">
 *          <!-- Datatable toolbar items -->
 *      </div>
 *      <div class="datatable-header-container">
 *          <div class="datatable-header-1st-column">
 *              <!-- Header 1st column -->
 *          </div>
 *          <div class="datatable-header">
 *              <!-- Header other columns -->
 *          </div>
 *      </div>
 *      <div class="datatable-body-container">
 *          <div class="datatable-body-1st-column">
 *              <!-- Body 1st column -->
 *          </div>
 *          <div class="datatable-body">
 *              <!-- Body other columns -->
 *          </div>
 *      </div>
 *      <div class="datatable-virtual-scroller-container">
 *          <div class="datatable-virtual-scroller"></div>
 *      </div>
 * </a-datatable>
 * ```
 */
kiss.ui.Datatable = class Datatable extends kiss.ui.DataComponent {
    /**
     * Its a Custom Web Component. Do not use the constructor directly with the **new** keyword.
     * Instead, use one of the 3 following methods:
     * 
     * Create the Web Component and call its **init** method:
     * ```
     * const myDatatable = document.createElement("a-datatable").init(config)
     * ```
     * 
     * Or use the shorthand for it:
     * ```
     * const myDatatable = createDatatable({
     *   id: "my-table",
     *   color: "#00aaee",
     *   collection: kiss.app.collections["contact"],
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
     * myDatatable.render()
     * ```
     */
    constructor() {
        super()
    }

    /**
     * Generates a Datatable from a JSON config
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

        // Display options
        this.showHeader = (config.showHeader !== false)
        this.showColumnType = !!config.showColumnType
        this.showToolbar = (config.showToolbar !== false)
        this.showPagerIndex = (config.showPagerIndex !== false)
        this.showScroller = (config.showScroller !== false)
        this.showActions = (config.showActions !== false)
        this.showLayoutButton = (config.showLayoutButton !== false)
        this.showGroupButtons = (config.showGroupButtons !== false)
        this.showGroupHierarchy = !!config.showGroupHierarchy
        this.showGroupHierarchyButton = (config.showGroupHierarchyButton !== false)
        this.canSearch = (config.canSearch !== false)
        this.canSort = (config.canSort !== false)
        this.canFilter = (config.canFilter !== false)
        this.canGroup = (config.canGroup !== false)
        this.color = config.color || "#00aaee"
        this.iconAction = config.iconAction || "far fa-file-alt"
        this.defaultRowHeight = 40

        // Behaviour options
        this.canSelect = (config.canSelect !== false)
        this.canEdit = !!config.canEdit
        this.canAddField = !!config.canAddField
        this.canEditField = !!config.canEditField
        this.canSelectFields = (config.canSelectFields !== false)
        this.actions = config.actions || []
        this.buttons = config.buttons || []

        // Build datatable skeletton markup
        let id = this.id
        this.innerHTML =
            /*html*/
            `<div class="datatable">
                <div id="datatable-toolbar:${id}" class="datatable-toolbar">
                    <div id="search-field:${id}"></div>
                    <div id="create:${id}"></div>
                    <div id="actions:${id}"></div>
                    <div id="select:${id}"></div>
                    <div id="sort:${id}"></div>
                    <div id="filter:${id}"></div>
                    <div id="group:${id}"></div>
                    <div id="collapse:${id}"></div>
                    <div id="expand:${id}"></div>
                    <div id="refresh:${id}"></div>
                    <div id="search:${id}"></div>
                    <div id="hierarchy:${id}"></div>
                    <div id="add:${id}"></div>
                    <div id="explode:${id}"></div>
                    <div class="spacer"></div>
                    <div id="pager-index:${id}" class="datatable-toolbar-pager-index"></div>
                    <div id="pager-first:${id}"></div>
                    <div id="pager-previous:${id}"></div>
                    <div id="pager-next:${id}"></div>
                    <div id="pager-last:${id}"></div>
                    <div id="layout:${id}"></div>
                </div>

                <div class="datatable-header-container">
                    <div class="datatable-header-1st-column"></div>
                    <div id="datatable-header:${id}" class="datatable-header"></div>
                </div>

                <div class="datatable-body-container">
                    <div class="datatable-body-1st-column"></div>
                    <div id="datatable-body:${id}" class="datatable-body"></div>
                </div>

                <div class="datatable-virtual-scroller-container">
                    <div class="datatable-virtual-scroller"></div>
                </div>
            </div>`.removeExtraSpaces()

        // Set datatable components
        this.datatable = this.querySelector(".datatable")
        this.datatableToolbar = this.querySelector(".datatable-toolbar")
        this.datatableHeader = this.querySelector(".datatable-header")
        this.datatableBody = this.querySelector(".datatable-body")
        this.datatableBodyContainer = this.querySelector(".datatable-body-container")
        this.datatableHeader1stColumn = this.querySelector(".datatable-header-1st-column")
        this.datatableBody1stColumn = this.querySelector(".datatable-body-1st-column")
        this.datatableScrollerContainer = this.querySelector(".datatable-virtual-scroller-container")
        this.datatableScroller = this.querySelector(".datatable-virtual-scroller")
        this.datatablePagerIndex = this.querySelector(".datatable-toolbar-pager-index")

        // Set header, toolbar and scroller visibility
        if (this.showHeader === false) this.datatableHeader.style.display = "none"
        if (this.showToolbar === false) this.datatableToolbar.style.display = "none"
        if (this.showScroller === false) this.datatableScrollerContainer.style.display = "none"
        if (this.showPagerIndex === false) this.datatablePagerIndex.style.display = "none"

        this._initColumnsDefaultWidth()
            ._initColumns()
            ._initSize(config)
            ._initEvents()
            ._initSubscriptions()

        return this
    }

    /**
     * 
     * DATATABLE METHODS
     * 
     */

    /**
     * Load data into the datatable.
     * 
     * Remark:
     * - rendering time is proportional to the number of visible cells (= rows x columns)
     * - rendering takes an average of 0.06 millisecond per cell on an Intel i7-4790K
     * 
     * @ignore
     */
    async load() {
        try {
            log(`kiss.ui - Datatable ${this.id} - Loading collection <${this.collection.id} (changed: ${this.collection.hasChanged})>`)

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

            // Hide the virtual scroller while the datatable is being built
            this._hideScroller()

            // Try to adjust columns width from local config
            this._columnsAdjustWidthFromLocalStorage()

            // Get the selected records
            this.getSelection()

            // Render the datatable toolbar
            this._renderToolbar()

            // Get paging params (skip & limit)
            this.skip = 0
            this._setLimit()

            // Show onboarding tutorial if needed
            if (kiss.context.onboard == true) {
                this.showTutorial()
            }

        } catch (err) {
            log(`kiss.ui - Datatable ${this.id} - Couldn't load data properly`)
        }
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
     * Update the datatable color (toolbar buttons + modal windows)
     * 
     * @param {string} newColor
     */
    async setColor(newColor) {
        this.color = newColor
        Array.from(this.datatableToolbar.children).forEach(item => {
            if (item && item.firstChild && item.firstChild.type == "button") item.firstChild.setIconColor(newColor)
        })
    }

    /**
     * Set the datatable row height
     * 
     * @param {number} height - The row height in pixels
     */
    setRowHeight(height) {
        this.rowHeight = height
        document.documentElement.style.setProperty("--datatable-cell-height", this.rowHeight + "px")
        document.documentElement.style.setProperty("--datatable-group-cell-height", this.rowHeight + "px")
        this._setThumbSize()

        // Save new row height locally
        const localStorageId = "config-datatable-" + this.id + "-row-height"
        localStorage.setItem(localStorageId, this.rowHeight)
        this.reload()
    }

    /**
     * Reset all the columns to their default width
     */
    async resetColumnsWidth() {
        this.columns.forEach(column => {
            let width = this.defaultColumnWidth[column.type]
            if (!width) width = this.defaultColumnWidth.default
            this._columnsSetWidth(column.id, width)
        })
    }

    /**
     * Update the datatable size (recomputes its width and height functions)
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
     * Show the first page
     */
    showFirstPage() {
        this.skip = 0
        this._renderPage(0)
    }

    /**
     * Show the previous page
     */
    showPreviousPage() {
        this._renderPage(-this.limit)
    }

    /**
     * Show the next page
     */
    showNextPage() {
        this._renderPage(this.limit)
    }

    /**
     * Show the last page
     */
    showLastPage() {
        this.skip = this.collection.count - this.limit - 1
        this._renderPage(this.limit)
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
     * Show the window to adjust the color of a column
     */
    showColorWindow(column) {
        const picker = createPanel({
            modal: true,
            header: false,
            width: 670,
            align: "center",
            verticalAlign: "center",
            items: [{
                id: "column-color",
                type: "colorPicker",
                value: column.color,
                palette: kiss.global.palette.slice(0, 20),
                selectorBorderRadius: "32px",
                height: 100,
                events: {
                    change: () => {
                        let color = $("column-color").getValue()
                        column.color = color

                        this._render()
                        this.updateConfig({
                            config: {
                                columns: this.columns
                            }
                        })
                        picker.close()
                    }
                }
            }]
        }).render()
    }    

    /**
     * Initialize datatable sizes
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initSize(config) {
        this._initRowHeight(config)

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
     */
    _initRowHeight(config = {}) {
        this.rowHeight = config.rowHeight || this._getRowHeightFromLocalStorage()
        document.documentElement.style.setProperty("--datatable-cell-height", this.rowHeight + "px")
        document.documentElement.style.setProperty("--datatable-group-cell-height", this.rowHeight + "px")
        this._setThumbSize()
    }

    /**
     * Initialize all datatable events
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initEvents() {

        // Clicked on the checkbox to deselect all records
        this.datatableHeader1stColumn.onclick = (event) => {
            if (event.target.classList.contains("datatable-header-checkbox")) {
                this.toggleSelection()
            }
        }

        this.datatableHeader.onclick = (event) => {
            const clickedElement = event.target

            // Clicked on a column menu
            if (clickedElement.classList.contains("datatable-column-header-properties")) {
                const columnId = clickedElement.id.split(":")[1]
                this._showColumnMenu(columnId, clickedElement, event)

            }

            // Clicked on the last header to create a new column
            if (clickedElement.classList.contains("datatable-header-last-column") || clickedElement.parentNode.classList.contains("datatable-header-last-column")) {
                if (this.canAddField) {
                    this._showColumnSetup()
                    return event
                }
            }
        }

        // Clicked on the 1st column resizer
        this.datatableHeader1stColumn.onmousedown = (event) => {
            const clickedElement = event.target
            if (clickedElement.classList.contains("datatable-column-header-resizer")) {
                this._columnsResizeWithDragAndDrop(event, clickedElement)
            }
        }

        // Clicked on a column resizer
        this.datatableHeader.onmousedown = (event) => {
            const clickedElement = event.target
            if (clickedElement.classList.contains("datatable-column-header-resizer")) {
                this._columnsResizeWithDragAndDrop(event, clickedElement)
            }
        }

        // Clicked somewhere in the datatable
        this.onclick = async (event) => {
            const clickedElement = event.target
            const clickedParent = clickedElement.parentNode

            // CLICKED INSIDE A BLANK CELL (last column)
            if (clickedElement.classList.contains("datatable-cell-blank")) {
                return event
            }

            // CLICKED INSIDE A CELL WHICH IS ALREADY IN EDIT MODE
            if (clickedElement.tagName.toLowerCase() == "input") {
                return event
            }

            // CLICKED ON A COMPUTED CELL CONTAINING AN URL
            if (clickedElement.classList.contains("datatable-cell-selected-locked")) {
                const cellValue = clickedElement.innerText
                if (cellValue && cellValue.match(kiss.tools.regex.url)) {
                    window.open(cellValue)
                    return
                }
            }

            // CLICKED A LINKED FIELD
            if (clickedElement.classList.contains("field-link-value-cell") || clickedParent.classList.contains("field-link-value-cell")) {
                const cell = clickedElement.closest("div")
                const fieldId = this._cellGetFieldId(cell)
                const recordId = clickedElement.closest(".datatable-row").getAttribute("recordId")
                this._cellOpenLinkedRecord(fieldId, recordId)
                return event
            }

            // SELECT / DESELECT A ROW
            // = clicked on the checkbox to select a record
            if (clickedElement.classList.contains("datatable-row-checkbox")) {
                const rowIndex = clickedParent.getAttribute("row")
                this._rowToggleSelect(rowIndex)
                return event
            }

            // SELECT A RECORD (GENERALLY TO OPEN IT AS A FORM)
            // = clicked on the 1st column cell to expand a record and display it as a form
            if (Array.from(clickedParent.classList).concat(Array.from(clickedElement.classList)).indexOf("datatable-cell-1st") != -1) {
                const cell = clickedElement.closest("div")
                const recordId = cell.getAttribute("recordid")
                const record = await this.collection.getRecord(recordId)
                await this.selectRecord(record)
                return event
            }

            // EXPAND / COLLAPSE A GROUP
            // = clicked on a group section
            if (clickedElement.classList.contains("datatable-group-summary") || clickedParent.classList.contains("datatable-group-summary")) {
                const colIndex = clickedElement.closest("div").getAttribute("col")
                const visibleColumn = this.visibleColumns[colIndex]
                const columnId = visibleColumn.id
                const column = this.columns.get(columnId)

                await this._columnsSetAggregationType(column, event.pageX - 32, event.pageY - 32)
                return event
            }

            if (clickedParent.classList[0] && clickedParent.classList[0].indexOf("datatable-group") != -1) {
                const rowIndex = this._cellGetRowIndex(clickedElement)
                const record = this.collection.records[Number(rowIndex)]
                const groupId = record.$groupId
                const groupLevel = record.$groupLevel

                this._groupToggle(groupId, groupLevel, rowIndex)
                return event
            }

            if (clickedElement.classList.contains("datatable-group")) {
                const rowIndex = clickedElement.getAttribute("row")
                const record = this.collection.records[Number(rowIndex)]
                const groupId = record.$groupId
                const groupLevel = record.$groupLevel

                this._groupToggle(groupId, groupLevel, rowIndex)
                return event
            }

            // OPEN A RECORD
            // (when "canEdit" property == false)
            if (!this.canEdit) {
                if ((clickedElement.classList.contains("datatable-cell")) || clickedParent.classList.contains("datatable-cell")) {
                    const row = clickedElement.closest(".datatable-row")
                    const recordId = row.getAttribute("recordid")
                    const record = await this.collection.getRecord(recordId)
                    await this.selectRecord(record)
                }
                return event
            }

            // EDIT A CELL (or exit if the datatable is not editable)
            if (clickedParent.classList.contains("datatable-cell-selected") && !clickedParent.classList.contains("datatable-cell-selected-locked")) {
                this._cellSwitchToEditMode(clickedParent, event)
                return event
            }

            if (clickedElement.classList.contains("datatable-cell-selected") && !clickedElement.classList.contains("datatable-cell-selected-locked")) {
                this._cellSwitchToEditMode(clickedElement, event)
                return event
            }

            // SELECT A CELL (prior to edition)
            let selectedCell
            if (clickedParent.classList.contains("datatable-cell")) {
                selectedCell = clickedParent
            } else if (clickedElement.classList.contains("datatable-cell")) {
                selectedCell = clickedElement
            }

            if (selectedCell) {
                // Exclude attachment cells from being selected
                const classes = selectedCell.classList
                if (classes.contains("datatable-type-attachment") || classes.contains("datatable-type-link")) {
                    return event
                }

                selectedCell.setAttribute("tabindex", "0")
                selectedCell.focus()
                selectedCell.classList.add("datatable-cell-selected")
                
                // Check is the record is locked and if it's an editable cell
                const recordId = clickedElement.closest(".datatable-row").getAttribute("recordId")
                const record = await this.collection.getRecord(recordId)
                const isEditable = (record.isLocked) ? false : this._cellIsEditable(selectedCell)

                if (!isEditable) {
                    selectedCell.classList.add("datatable-cell-selected-locked")
                } else {
                    // Manage keyboard
                    selectedCell.onkeydown = (event) => {
                        if (!["Escape"].includes(event.key)) this._cellSwitchToEditMode(selectedCell)
                        selectedCell.classList.remove("datatable-cell-selected")
                        selectedCell.classList.remove("datatable-cell-selected-locked")
                        selectedCell.blur()
                        selectedCell.removeAttribute("tabindex")
                        selectedCell.onkeydown = null
                    }
                }

                // Clean on exit
                selectedCell.onmouseleave = () => {
                    selectedCell.classList.remove("datatable-cell-selected")
                    selectedCell.classList.remove("datatable-cell-selected-locked")
                    selectedCell.blur()
                    selectedCell.removeAttribute("tabindex")
                    selectedCell.onmouseleave = null
                }
            }
        }

        // Sync horizontal scrolling between body and header
        this.datatableBody.onscroll = () => {
            this.datatableHeader.scrollLeft = this.datatableBody.scrollLeft
        }

        /*
         * VIRTUAL SCROLLING MANAGEMENT
         */

        //
        // Observe mousewheel event to scroll
        //
        this.onmousewheel = this.onwheel = (event) => {
            // Scroll must happen inside the datatable body
            if (!event.target.closest(".datatable-body-container")) return

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
        // Observe touchmove event to scroll
        // TODO: prevent pull-to-refresh
        // TODO: allow smooth vertical & horizontal scroll
        //
        // this.ontouchstart = (e) => {
        //     this.startTouchY = e.touches[0].clientY
        // }

        // this.ontouchmove = (e) => {
        //     let currentY = e.changedTouches[0].clientY
        //     let deltaY = currentY - this.startTouchY

        //     if (deltaY > 0) {
        //         if (deltaY % 5 == 0) {
        //             e.preventDefault()
        //             this._virtualScrollUp()
        //         }
        //     } else if (deltaY < 0) {
        //         if (deltaY % 5 == 0) {
        //             e.preventDefault()
        //             this._virtualScrollDown()
        //         }
        //     }
        // }

        //
        // Enable onscroll event when clicking on the virtual scrollbar
        //
        this.datatableScrollerContainer.onmousedown = (event) => {
            this.preventScroll = false
        }

        //
        // Render the datatable at the correct row index when moving the virtual scrollbar
        //
        this.datatableScrollerContainer.onscroll = (event) => {
            if (this.preventScroll == true) return false

            // Clear our timeout throughout the scroll
            window.clearTimeout(this.isScrolling)

            // Set a timeout to run after scrolling ends, in order to smooth the rendering
            this.isScrolling = null

            this.isScrolling = setTimeout(() => {
                // Compute the scroll as a percentage of the total height
                let percent = event.target.scrollTop / (this.datatableScroller.offsetHeight - this.datatableBody.offsetHeight)

                // Deduce how many records to skip
                let recordIndex = Math.round((this.collection.count - this.limit) * percent)
                let newSkip = Math.min(recordIndex, this.collection.records.length - this.limit)

                // Re-render the datatable if the skip value has changed
                if (newSkip != this.skip) {
                    this.skip = Math.max(newSkip, 0)
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

        // React to database mutations
        this.subscriptions = this.subscriptions.concat([
            subscribe("EVT_DB_INSERT:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData)),
            subscribe("EVT_DB_UPDATE:" + viewModelId, (msgData) => this._updateOneAndReload(msgData)),
            subscribe("EVT_DB_DELETE:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData)),
            subscribe("EVT_DB_INSERT_MANY:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData, 2000)),
            subscribe("EVT_DB_UPDATE_MANY:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData, 2000)),
            subscribe("EVT_DB_DELETE_MANY:" + viewModelId, (msgData) => this._reloadWhenNeeded(msgData, 2000)),
            subscribe("EVT_DB_UPDATE_BULK", (msgData) => this._updateManyAndReload(msgData))
        ])

        return this
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

            let newValue = updates[fieldId]
            this._cellSetValue(msgData.id, fieldId, newValue)
        }

        if (sortHasChanged || filterHasChanged || groupHasChanged) {
            this._reloadWhenNeeded(msgData)
        }
    }

    /**
     * Update multiple records then reload the view
     * 
     * @private
     * @ignore
     * @param {object} msgData - The original pubsub message
     */
    async _updateManyAndReload(msgData) {
        const sortFields = this.sort.map(sort => Object.keys(sort)[0])
        const filterFields = kiss.db.mongo.getFilterFields(this.filter)

        let groupHasChanged = false
        let sortHasChanged = false
        let filterHasChanged = false

        let operations = msgData.data
        operations.forEach(operation => {
            if (operation.modelId == this.modelId) {
                for (let fieldId of Object.keys(operation.updates)) {
                    if (this.group.indexOf(fieldId) != -1) groupHasChanged = true
                    if (sortFields.indexOf(fieldId) != -1) sortHasChanged = true
                    if (filterFields.indexOf(fieldId) != -1) filterHasChanged = true

                    let newValue = operation.updates[fieldId]
                    this._cellSetValue(operation.recordId, fieldId, newValue)
                }
            }
        })

        if (sortHasChanged || filterHasChanged || groupHasChanged) {
            this._reloadWhenNeeded(msgData)
        }
    }

    /**
     * Re-render the virtual scrollbar when the datatable is re-connected to the DOM
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
     * Initialize the default width, which depend on the field type
     * 
     * @private
     * @ignore
     * @eturns this
     */
    _initColumnsDefaultWidth() {
        this.defaultColumnWidth = {
            text: 180,
            number: 180,
            date: 180,
            select: 180,
            textarea: 350,
            checkbox: 100,
            color: 100,
            icon: 100,
            attachment: 150,
            directory: 200,
            firstColumn: (kiss.screen.isMobile) ? 50 : 90, // First column used for selection
            default: 180 // Any other type
        }
        return this
    }

    /**
     * Scroll up by one line with the virtual scroller
     * Remove the last row and insert a new one at the beginning
     * 
     * @private
     * @ignore
     */
    _virtualScrollUp() {
        if ((this.skip - 1) < 0) return
        this.skip -= 1
        this.lastIndex = Math.min(this.skip + this.limit - 1, this.collection.records.length)

        this.datatableBody.lastChild.remove()
        this.datatableBody.insertBefore(this._renderRowDiv(this.skip), this.datatableBody.children[0])

        this.datatableBody1stColumn.lastChild.remove()
        this.datatableBody1stColumn.insertBefore(this._renderRowDiv1stColumn(this.skip), this.datatableBody1stColumn.children[0])
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

        this.datatableBody.children[0].remove()
        this.datatableBody.appendChild(this._renderRowDiv(this.lastIndex))

        this.datatableBody1stColumn.children[0].remove()
        this.datatableBody1stColumn.appendChild(this._renderRowDiv1stColumn(this.lastIndex))
    }

    /**
     * Open the column menu to:
     * - sort asc | desc
     * - edit field properties
     * 
     * @private
     * @ignore
     * @param {string} fieldId
     * @param {object} columnMenu - The menu HTMLElement
     * @param {object} event - The original event that opened the column menu
     */
    _showColumnMenu(fieldId, columnMenu, event) {
        const field = this.model.getField(fieldId)
        const column = this.columns.find(column => column.id == fieldId)
        const isGrouped = this.group.length > 0
        const colorableFields = ["text", "textarea", "number", "date"]
        const isColorable = colorableFields.includes(field.type) || (field.type == "lookup" && colorableFields.includes(field.lookup.type)) || (field.type == "summary" && colorableFields.includes(field.summary.type))
        const isNumeric = kiss.tools.isNumericField(field)
        const canBeAggregated = isNumeric && isGrouped

        // Action
        let columnActions = [
            // Sort ASC
            {
                icon: "fas fa-arrow-up",
                text: txtTitleCase("sort ascending"),
                action: async () => {
                    await this.sortByField(fieldId, "asc")
                    this.showSortWindow()
                }
            },
            // Sort DESC
            {
                icon: "fas fa-arrow-down",
                text: txtTitleCase("sort descending"),
                action: async () => {
                    await this.sortByField(fieldId, "desc")
                    this.showSortWindow()
                }
            },
            (this.canEditField && isColorable) ? "-" : "",
            // Column color
            {
                hidden: !isColorable,
                icon: "fas fa-palette",
                text: txtTitleCase("column color"),
                action: async () => {
                    this.showColorWindow(column)
                }
            },
            // Remove column color
            {
                hidden: !this.canEditField || !isColorable,
                icon: "fas fa-times",
                text: txtTitleCase("remove color"),
                action: async () => {
                    if (!column.color) return
                    delete column.color
                    this._render()
                    this.updateConfig({
                        config: {
                            columns: this.columns
                        }
                    })
                }
            }
        ]

        // Actions for the field: edit / delete
        if (this.canEditField && !field.isFromPlugin && !field.isSystem) {

            // Separator
            columnActions.splice(0, 0, "-")

            // Delete the field
            if (!field.primary) {
                columnActions.splice(0, 0, {
                    icon: "fas fa-trash",
                    iconColor: "var(--red)",
                    text: txtTitleCase("delete this field"),
                    action: () => {
                        // Open a confirmation window to delete the field
                        const deleteDialog = createDialog({
                            type: "danger",
                            title: txtTitleCase("delete a field"),
                            message: txtTitleCase("#delete field warning"),
                            buttonOKPosition: "left",
                            action: async () => {
                                this.model.deleteField(fieldId)
                                deleteDialog.close()
                                this.reload()
                            }
                        })
                    }
                })
            }

            // Edit the field properties
            columnActions.splice(0, 0, {
                icon: "fas fa-edit",
                text: txtTitleCase("edit this field"),
                action: async () => this._showColumnSetup(fieldId)
            })
        }

        // Aggregation options
        if (canBeAggregated) {

            // Separator
            columnActions.push("-")

            // Sum
            columnActions.push({
                text: txtTitleCase("#summary sum"),
                icon: "fas fa-chart-bar",
                action: async () => {
                    column.summary = "sum"
                    this._render()
                    this.updateConfig({
                        config: {
                            columns: this.columns
                        }
                    })
                }
            })

            // Average
            columnActions.push({
                text: txtTitleCase("#summary avg"),
                icon: "fas fa-tachometer-alt",
                action: async () => {
                    column.summary = "avg"
                    this._render()
                    this.updateConfig({
                        config: {
                            columns: this.columns
                        }
                    })
                }
            })

            // No aggregation
            columnActions.push({
                text: txtTitleCase("#no summary"),
                icon: "fas fa-ban",
                action: async () => {
                    delete column.summary
                    this._render()
                    this.updateConfig({
                        config: {
                            columns: this.columns
                        }
                    })
                }
            })
        }

        createMenu({
            top: columnMenu.getBoundingClientRect().y - 10 + "px",
            left: columnMenu.getBoundingClientRect().x - 10 + "px",
            items: columnActions
        }).render()
    }

    /**
     * Set up a column (= opens the field property window)
     * 
     * @ignore
     * @param {string} [fieldId] - Field id to set up. Creates a new field if no param.
     */
    _showColumnSetup(fieldId) {
        kiss.context.dockFieldProperties = false

        kiss.router.updateUrlHash({
            fieldId: (fieldId) ? fieldId : ""
        })

        kiss.views.show("model-field")
    }

    /**
     * Adjust image thumbnail size according to the row height
     * 
     * @private
     * @ignore
     */
    _setThumbSize() {
        if (this.rowHeight <= this.defaultRowHeight) {
            this.thumbSize = "s"
        } else {
            this.thumbSize = "m"
        }
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
            this.datatable.style.width = this.clientWidth.toString() + "px"
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
        this.style.height = this.datatable.style.height = newHeight
    }

    /**
     * Compute the maximum number of rows that can fit in the datatable, then set the "limit" param.
     * The limit depends on the global datatable height minus:
     * - the datatable toolbar
     * - the datatable header
     * 
     * @private
     * @ignore
     */
    _setLimit() {
        if (!this.isConnected) return

        let tableHeight = this.offsetHeight
        let headerHeight = $("datatable-header:" + this.id).offsetHeight
        let toolbarHeight = $("datatable-toolbar:" + this.id).offsetHeight
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
     * Show N records, starting from the current position (given by the "skip" property)
     *
     * @private
     * @ignore
     * @param {number} size - Positive number for next page, and negative for previous page
     * 
     * @example
     * this._renderPage(-50)
     */
    _renderPage(size) {
        // If we've reach the beginning or the end of the recordset => exit!
        if ((size < 0 && this.skip == 0) || (size > 0) && ((this.skip + size) >= this.collection.count)) return

        // Update the number of records to skip
        this.skip = ((this.skip + 2 * size) >= this.collection.count) ? (this.skip = this.collection.count - size) : this.skip + size
        this.skip = Math.max(this.skip, 0)

        // Render
        this._render()

        // Adjust the virtual scroller position according to the new "skip" value
        this._renderScrollerPosition()
    }

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
     * Render the datatable
     * 
     * @private
     * @ignore
     * @returns this
     */
    _render() {
        // kiss.tools.timer.start()

        // Reset 1st column
        this.datatableHeader1stColumn.innerHTML = ""
        this.datatableBody1stColumn.innerHTML = ""

        // Filters out hidden and deleted columns
        this.visibleColumns = this.columns.filter(column => column.hidden != true && column.deleted != true)

        this._prepareCellRenderers()
            ._renderHeader()
            ._renderBody()

        // kiss.tools.timer.show("Datatable rendered!")
        return this
    }

    /**
     * Render the datatable header.
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
        firstCell.classList.add("datatable-column-header", "datatable-column-header-1st")
        firstCell.style.width = firstCell.style.minWidth = this.defaultColumnWidth.firstColumn + "px"
        firstCell.innerHTML =
            `<span id='toggle-selection' class='datatable-header-checkbox ${(this.canSelect) ? "datatable-header-checkbox-off" : ""}'></span>` + // Selection checkbox
            "<span id='header-resizer-1st-column' class='datatable-column-header-resizer'>&nbsp</span>" // Column resizer

        this.datatableHeader1stColumn.appendChild(firstCell)

        // Other columns headers
        this._columnsAdjustWidthFromLocalStorage()
        this.datatableHeader.innerHTML = this.visibleColumns.map(this._renderColumnHeader.bind(this)).join("") +
            `<span class="datatable-column-header datatable-header-last-column">${(this.canAddField) ? `<span class="fas fa-plus"></span>` : ""}</span>` // Button to create a new column

        return this
    }

    /**
     * Render the datatable body
     * 
     * Tech note: we don't use string litterals to build the HTML because it's slower than native String concatenation
     * 
     * @private
     * @ignore
     * @returns this
     */
    _renderBody() {
        // Adjust sizes
        this._initRowHeight()
        this._columnsSetFirstColumnWidth(this.defaultColumnWidth.firstColumn)

        // Build table BODY
        let table = ""
        let firstColumn = ""
        this.startIndex = Math.max(0, this.skip)
        this.lastIndex = Math.min(this.skip + this.limit - 1, this.collection.records.length)

        if (this.collection.group.length === 0) {
            // Rendering without grouping
            for (let rowIndex = this.startIndex; rowIndex < this.lastIndex; rowIndex++) {
                let record = this.collection.records[rowIndex]

                firstColumn += "<div col=\"-1\" row=\"" + rowIndex + "\" recordId=\"" + record.id + "\" class=\"datatable-cell-1st\" style=\"width: " + this.defaultColumnWidth.firstColumn + "px; min-width: " + this.defaultColumnWidth.firstColumn + "px\">"
                firstColumn += this._renderRowContent1stColumn(record, rowIndex)
                firstColumn += "</div>"

                table += "<div row=\"" + rowIndex + "\" recordId=\"" + record.id + "\" class=\"datatable-row\">"
                table += this._renderRowContent(record, rowIndex)
                table += "</div>"
            }
        } else {
            // Rendering with grouping
            let nbOfRows = 0

            for (let rowIndex = this.skip; (nbOfRows < this.limit) && (rowIndex < this.collection.records.length); rowIndex++) {
                let record = this.collection.records[rowIndex]

                if (record.$type == "group") {
                    firstColumn += "<div col=\"-1\" row=\"" + rowIndex + "\" class=\"datatable-group datatable-group-level-" + record.$groupLevel + "\" style=\"width: " + this.defaultColumnWidth.firstColumn + "px; min-width: " + this.defaultColumnWidth.firstColumn + "px\">"
                    firstColumn += this._renderRowGroupContent1stColumn(record)
                    firstColumn += "</div>"

                    table += "<div row=\"" + rowIndex + "\" groupLevel=\"" + record.$groupLevel + "\" class=\"datatable-group-row\">"
                    table += this._renderRowGroupContent(record)
                    table += "</div>"
                } else {
                    firstColumn += "<div col=\"-1\" row=\"" + rowIndex + "\" recordId=\"" + record.id + "\" class=\"datatable-cell-1st\" style=\"width: " + this.defaultColumnWidth.firstColumn + "px; min-width: " + this.defaultColumnWidth.firstColumn + "px\">"
                    firstColumn += this._renderRowContent1stColumn(record, rowIndex)
                    firstColumn += "</div>"

                    table += "<div row=\"" + rowIndex + "\" recordId=\"" + record.id + "\" class=\"datatable-row\">"
                    table += this._renderRowContent(record, rowIndex)
                    table += "</div>"
                }
                nbOfRows++
            }
        }

        // Inject the table into the DOM
        this.datatableBody.innerHTML = table

        // Inject the table 1st column into the DOM
        this.datatableBody1stColumn.innerHTML = firstColumn

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
            this.datatableBodyContainer.classList.add("datatable-body-container-empty")
        } else {
            this.datatableBodyContainer.classList.remove("datatable-body-container-empty")
        }
    }

    /**
     * Render a single row of the datatable
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
        newRow.classList.add("datatable-row")

        // Apply the style "selected" if the row has been selected
        // TODO: optimization => apply the "selected" style for all selected rows *after* the datatable has been fully rendered
        let isSelected = !(this.selectedRecords.indexOf(record.id) == -1)
        if (isSelected) newRow.classList.add("datatable-row-selected")

        // Inject row content (= cells) into the div
        newRow.innerHTML = this._renderRowContent(record, rowIndex)
        return newRow
    }

    /**
     * Render the 1st cell of a single row of the datatable
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
        firstCell.classList.add("datatable-cell-1st")
        firstCell.style.width = firstCell.style.minWidth = this.defaultColumnWidth.firstColumn + "px"

        // Apply the style "selected" if the row has been selected
        // TODO: possible optimization => apply the "selected" style for all selected rows *after* the datatable has been fully rendered
        let isSelected = !(this.selectedRecords.indexOf(record.id) == -1)

        firstCell.innerHTML = this._renderRowContent1stColumn(record, rowIndex, isSelected)
        return firstCell
    }

    /**
     * Render the content of a single row of the datatable.
     * 
     * @private
     * @ignore
     * @param {number} record - The record to render in this row
     * @param {number} rowIndex
     * @returns {string} Html source for a row
     */
    _renderRowContent(record, rowIndex) {
        let row = ""
        for (let colIndex = 0, length = this.visibleColumns.length; colIndex < length; colIndex++) {
            let column = this.visibleColumns[colIndex]
            let value = column.renderer(record[column.id], record, rowIndex, colIndex)
            row += `<div col=${colIndex} class="datatable-cell datatable-type-${column.type}" style="${this._columnsConvertWidthToStyle(column.width)}; ${(column.color) ? `color: ${column.color}` : ""}">` + value + "</div>"
        }

        row += "<div class='datatable-cell datatable-cell-blank'></div>"
        return row
    }

    /**
     * Render the content of the 1st cell of a single row of the datatable.
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
        return ((this.canSelect) ? "<span class=\"datatable-row-checkbox datatable-row-checkbox-" + ((isSelected) ? "on" : "off") + "\"></span>" : "") + // Selection checkbox
            "<span class=\"datatable-row-number\">" + ((record.$index + 1) || Number(rowIndex + 1)) + "</span>" + // Row number
            // "<span class=\"datatable-row-data\">BOB WILSON - 20221224 - 20221231</span>" + // Row data
            "<span class=\"datatable-row-action " + this.iconAction + "\"></span>" // Row action button
    }

    /**
     * Render a single *group* row of the datatable.
     * 
     * @private
     * @ignore
     * @param {object} record
     * @param {number} rowIndex 
     */
    _renderRowGroupDiv(record, rowIndex) {
        let newRow = document.createElement("div")
        newRow.setAttribute("row", rowIndex)
        newRow.classList.add("datatable-group-row")
        newRow.innerHTML = this._renderRowGroupContent(record)
        return newRow
    }

    /**
     * Render the first cell of a single *group* row of the datatable.
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
        firstCell.classList.add("datatable-group", "datatable-group-level-" + record.$groupLevel)
        firstCell.style.width = firstCell.style.minWidth = this.defaultColumnWidth.firstColumn + "px"
        firstCell.innerHTML = this._renderRowGroupContent1stColumn(record)
        return firstCell
    }

    /**
     * Render the content of a single *group* row of the datatable.
     * 
     * @private
     * @ignore
     * @param {object} record 
     * @returns {string} Html source for a *group* row
     */
    _renderRowGroupContent(record) {
        let row = ""
        for (let colIndex = 0, length = this.visibleColumns.length; colIndex < length; colIndex++) {
            const column = this.visibleColumns[colIndex]
            const field = this.model.getField(column.id)
            const precision = (field && field.precision) || 0
            const unit = (field && field.unit) || ""

            let cellRawValue = record[column.id]

            if (cellRawValue !== undefined) {
                const aggregationType = column.summary || "summary"
                const aggregationSettings = `<span class='fas fa-caret-down datatable-group-summary'><span>${txtTitleCase("#" + aggregationType)}</span></span>`
                cellRawValue = (aggregationType != "summary") ? cellRawValue[aggregationType].format(precision) + " " + unit : " "
                row += "<div col=\"" + colIndex + "\" class=\"datatable-group-cell\" style=\"" + this._columnsConvertWidthToStyle(column.width) + "\">" + aggregationSettings + cellRawValue + "</div>"
            } else {
                row += "<div col=\"" + colIndex + "\" class=\"datatable-group-cell\" style=\"" + this._columnsConvertWidthToStyle(column.width) + "\"></div>"
            }
        }

        row += "<div class='datatable-cell datatable-cell-blank'></div>"
        return row
    }

    /**
     * Render the content of the 1st cell of a single *group* row of the datatable.
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
        let groupClass = (this.collection.collapsedGroups.includes(record.$groupId)) ? "datatable-group-collapsed" : "datatable-group-expanded"

        // The 1st cell of the row includes:
        // - an icon to expand/collapse the group
        // - the group hierarchy (ex: 1.3.7)
        // - the group name
        let groupRawValue = record.$name
        let groupCellValue = (groupColumn) ? groupColumn.renderer(groupRawValue, record) : "..."

        return "<span class='" + groupClass + "'></span>" + // Icon to expand/collapse the group
            ((this.showGroupHierarchy) ? "<span class='datatable-group-hierarchy'>" + record.$groupId + "</span>" : "") + // Group hierarchy
            groupCellValue + "&nbsp;&nbsp;(" + record.$size + ")" // Group name
    }

    /**
     * Render a single column header.
     * 
     * @private
     * @ignore
     * @param {object} column - The column config
     * @param {number} index - The column index
     * @returns {string} Html source for a column header
     */
    _renderColumnHeader(column, index) {
        // Try to get local column config from localStorage, in case it exists
        let localColumnWidthStyle = this._columnsConvertWidthToStyle(column.width)
        let localColumnTitleWidthStyle = this._columnsConvertWidthToStyle(column.width - 16)

        // Try to get column type icon
        let columnTitle = column.title
        if (this.showColumnType) {
            const fieldType = kiss.global.fieldTypes.find(fieldType => fieldType.value == column.type)
            const icon = (fieldType) ? fieldType.icon : ""
            if (icon) columnTitle = `<i class="${icon} datatable-column-header-icon"></i>${column.title}`
        }

        // Build the final template for the column header
        return /*html*/ `<div id="header-${column.id}" col="${index}" class="datatable-column-header" style="${localColumnWidthStyle}">
                    <span
                        id="header-title-${column.id}"
                        class="datatable-column-header-title"
                        draggable="true"
                        ondragstart="this.closest('a-datatable')._columnsMoveWithdragAndDrop('dragstart', event, this)"
                        ondragover="this.closest('a-datatable')._columnsMoveWithdragAndDrop('dragover', event, this)"
                        ondragleave="this.closest('a-datatable')._columnsMoveWithdragAndDrop('dragleave', event, this)"
                        ondrop="this.closest('a-datatable')._columnsMoveWithdragAndDrop('drop', event, this)"
                        style="${localColumnTitleWidthStyle}"
                    >
                    ${columnTitle}
                    </span>
                    <span id="header-properties-for:${column.id}" class="datatable-column-header-properties fas fa-chevron-down">&nbsp</span>
                    <span id="header-resizer-for:${column.id}" class="datatable-column-header-resizer">&nbsp</span>
                </div>`.removeExtraSpaces()
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
                case "link":
                    column.renderer = this._prepareCellRendererForLinkFields(column)
                    break
                case "color":
                    column.renderer = this._prepareCellRendererForColors(column)
                    break
                case "icon":
                    column.renderer = this._prepareCellRendererForIcons(column)
                    break
                case "password":
                    column.renderer = this._prepareCellRendererForPasswords(column)
                    break
                case "attachment":
                case "aiImage":
                    column.renderer = this._prepareCellRendererForAttachments(column)
                    break
                case "button":
                    column.renderer = this._prepareCellRendererForButtons(column)
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
     * Define the default column renderer
     * 
     * @private
     * @ignore
     */
    _prepareCellRendererForPasswords() {
        return function () {
            return "***"
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
            log("kiss.ui - Datatable - Couldn't generate renderer for checkboxes", 4)
            return function (value) {
                return value
            }
        }

        const iconClasses = kiss.ui.Checkbox.prototype.getIconClasses()
        const defaultIconOn = iconClasses[shape]["on"]
        const defaultIconOff = iconClasses[shape]["off"]

        return function (value) {
            return `<span ${(value === true) ? `style="color: ${iconColorOn}"` : ""} class=\"${(value === true) ? defaultIconOn + " datatable-type-checkbox-checked" : defaultIconOff + " datatable-type-checkbox-unchecked"}\"/>`
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
        const step = field.step || 5
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
            return `<span class="datatable-type-color" style="background: ${value}"></span>`
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
     * Define the column renderer for fields which type is "link"
     * 
     * @private
     * @ignore
     * @param {object} column
     * @returns {function} column renderer
     */
    _prepareCellRendererForLinkFields(column) {
        const field = this.model.getField(column.id)
        if (!field || !field.link) return ""

        const linkModelId = field.link.modelId
        if (!linkModelId) return ""

        const linkModel = kiss.app.models[linkModelId]
        if (!linkModel) return ""

        return function () {
            return `<span class="field-link-value-cell" modelId="${linkModelId}">
                        ${(field.multiple)
                            ? linkModel.namePlural + "&nbsp; <span class='fas fa-sitemap'></span>"
                            : linkModel.name + "&nbsp; <span class='fas fa-link'></span>"}
                    </span>`.removeExtraSpaces()
        }
    }

    /**
     * Define the column renderer for fields which type is "button"
     * 
     * @private
     * @ignore
     */
    _prepareCellRendererForButtons(column) {
        // Normalize column ids
        let colIndex = "column_" + kiss.tools.shortUid()
        if (!column.id) column.id = colIndex

        // Normalize column titles to a string
        column.title = column.text || txtTitleCase("action")

        return function (value, record, rowIndex, colIndex) {
            return `
                <center>
                    <span id="column-button-${rowIndex}-${colIndex}" class="a-button datatable-cell-button" ${(column.button.tip) ? `onmouseover="this.attachTip('${column.button.tip}')"` : ""} onclick="this.getComponent()._rowTriggerButtonAction('${rowIndex}', '${column.id}', '${record.id}')">
                        ${ (column.button.icon) ? `<span class="button-icon ${column.button.icon}"></span>` : "" }
                        ${ (column.button.text) ? `<span class="button-text">${column.button.text}</span>` : "" }
                    </span>
                </center>`.removeExtraSpaces()
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
     * Define the column renderer for fields which type is "attachment"
     * 
     * @private
     * @ignore
     */
    _prepareCellRendererForAttachments(column) {
        const _this = this

        return function (value) {
            if ((!value) || (value == " ") || !Array.isArray(value)) return ""

            let attachmentItems = value.map((file, i) => {
                if (!file.path) return ""

                let preview
                let filePath = kiss.tools.createFileURL(file, _this.thumbSize || "s")
                const fileExtension = file.path.split(".").pop().toLowerCase()

                if (["jpg", "jpeg", "png", "gif", "webp"].indexOf(fileExtension) != -1) {
                    // Image
                    // preview = `<img id="${file.id}" class="datatable-type-attachment-image" src="${filePath}" onmouseenter="$('${_this.id}')._cellShowAttachmentName(event, '${this.id}')"></img>`
                    preview = `<img id="${file.id}" class="datatable-type-attachment-image" src="${filePath}" loading="lazy"></img>`
                } else {
                    // Other
                    const {
                        icon,
                        color
                    } = kiss.tools.fileToIcon(fileExtension)
                    // preview = `<span id="${file.id}" style="color: ${color}" class="fas ${icon} datatable-type-attachment-icon" onmouseenter="$('${_this.id}')._cellShowAttachmentName(event, '${this.id}')"></span>`
                    preview = `<span id="${file.id}" style="color: ${color}" class="fas ${icon} datatable-type-attachment-icon"></span>`
                }

                return /*html*/ `<span id="${file.id}" class="datatable-type-attachment">${preview}</span>`
            }).join("")

            return `<span class="datatable-type-attachments-container" onclick="$('${_this.id}')._cellPreviewAttachment(event, '${this.id}')">${attachmentItems}</span>`
        }
    }

    /**
     * Preview an attachment
     * 
     * @private
     * @ignore
     * @param {object} event 
     * @param {string} fieldId 
     */
    _cellPreviewAttachment(event, fieldId) {
        const attachmentId = event.target.id
        const cell = event.target.closest(".datatable-cell")
        const record = this._cellGetRecord(cell)
        const cellAttachments = record[fieldId]
        createPreviewWindow(cellAttachments, attachmentId)
    }

    /**
     * Display a tooltip over a file attachment
     * 
     * @private
     * @ignore
     */
    _cellShowAttachmentName(event, fieldId) {
        const attachmentId = event.target.id
        const cell = event.target.closest(".datatable-cell")
        const record = this._cellGetRecord(cell)
        const cellAttachments = record[fieldId]
        const attachment = cellAttachments.get(attachmentId)
        let tipId = uid()

        createHtml({
            id: tipId,
            position: "absolute",
            display: "block",
            zIndex: 1000,
            html: attachment.filename,
            class: "a-tip",

            methods: {
                load: function () {
                    document.onmousemove = (event) => {
                        if ($(tipId)) $(tipId).showAt(event.pageX, event.pageY + 20)
                    }

                    $(event.target.parentNode.id).onmouseleave = () => {
                        document.onmousemove = null
                        this.destroy()
                    }

                    // Ensure the tip is destroyed in case the mouseleave event is not triggered (which unfortunately happens)
                    setTimeout(() => this.destroy(), 5000)
                },

                destroy: function () {
                    try {
                        this.deepDelete()
                    } catch (err) {}
                }
            }
        }).render()
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
            this.datatableScrollerContainer.style.top = this.datatableBody.getBoundingClientRect().top + "px"
            this.datatableScrollerContainer.style.left = this.getBoundingClientRect().right - this.datatableScrollerContainer.offsetWidth + "px"
            this._showScroller()
        }, 50)

        // Set the virtual scrollbar height within the container.
        // Setting it bigger than the container forces the browser to generate a real scrollbar.
        this.datatableScrollerContainer.style.height = this.datatableBody.offsetHeight - 10 + "px"
        this.datatableScroller.style.height = Math.min(this.collection.count * (this.rowHeight), 10000) + "px"
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
                this.datatableScrollerContainer.style.visibility = "visible"
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
        this.datatableScrollerContainer.style.visibility = "hidden"
    }

    /**
     * Sync the virtual scrollbar position with the current datatable "skip" value
     * 
     * @private
     * @ignore
     */
    _renderScrollerPosition() {
        let percent = this.skip / (this.collection.records.length - this.limit)
        let topPosition = Math.round((this.datatableScroller.offsetHeight - this.datatableBody.offsetHeight) * percent)
        this.preventScroll = true // Disable onscroll event to avoid echo
        this.datatableScrollerContainer.scrollTop = topPosition
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
     * - button to show/hide group hierarchy
     * - buttons to paginate (start, previous, next, end) and actual page number
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
            class: "datatable-create-record",
            target: "create:" + this.id,
            text: this.config.createRecordText || this.model.name.toTitleCase(),
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

        // Column creation button
        createButton({
            hidden: !this.canAddField,
            target: "add:" + this.id,
            tip: txtTitleCase("add a column"),
            icon: "fas fa-plus",
            iconColor: this.color,
            width: 32,
            action: () => this._showColumnSetup()
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

        // Button to switch the hierarchy numbers
        // TODO: disabled at the moment: move the button to the setup menu
        this.buttonShowHierarchy = createCheckbox({
            hidden: true,
            // hidden: (this.collection.group.length === 0) || (this.showGroupHierarchy === false),

            target: "hierarchy:" + this.id,
            tip: txtTitleCase("show group hierarchy"),
            iconOff: "fas fa-list-ol",
            iconOn: "fas fa-list-ol",
            iconColorOn: this.color,
            checked: this.showGroupHierarchy,
            events: {
                change: (event) => {
                    this.showGroupHierarchy = event.target.getValue()
                    this._render()
                }
            }
        }).render()

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

        // Pager first
        createButton({
            hidden: kiss.screen.isMobile && kiss.screen.isVertical(),
            target: "pager-first:" + this.id,
            icon: "fas fa-step-backward",
            iconColor: this.color,
            width: 32,
            events: {
                click: () => this.showFirstPage()
            }
        }).render()

        // Pager previous
        createButton({
            target: "pager-previous:" + this.id,
            icon: "fas fa-chevron-left",
            iconColor: this.color,
            width: 32,
            events: {
                click: () => this.showPreviousPage()
            }
        }).render()

        // Pager next
        createButton({
            target: "pager-next:" + this.id,
            icon: "fas fa-chevron-right",
            iconColor: this.color,
            width: 32,
            events: {
                click: () => this.showNextPage()
            }
        }).render()

        // Pager last
        createButton({
            hidden: kiss.screen.isMobile && kiss.screen.isVertical(),
            target: "pager-last:" + this.id,
            icon: "fas fa-step-forward",
            iconColor: this.color,
            width: 32,
            events: {
                click: () => this.showLastPage()
            }
        }).render()

        this._buildCustomButtons()

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

        // Update the datatable
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
        if (!checkbox) return

        checkbox.classList.add("datatable-row-checkbox-on")
        checkbox.classList.remove("datatable-row-checkbox-off")

        // Highlight the selected row
        let row = this.datatableBody.querySelector("[row=\"" + rowIndex + "\"]")
        row.classList.add("datatable-row-selected")
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
        if (!checkbox) return

        checkbox.classList.add("datatable-row-checkbox-off")
        checkbox.classList.remove("datatable-row-checkbox-on")

        // Remove the highlight on the selected row
        let row = this.datatableBody.querySelector("[row=\"" + rowIndex + "\"]")
        row.classList.remove("datatable-row-selected")
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
        if (!row) return
        
        row.classList.add("datatable-row-selected")
    }

    /**
     * Trigger the action defined in a column which type is "button"
     * 
     * @private
     * @ignore
     * @param {number} rowIndex 
     * @param {number} colId 
     * @param {string} recordId 
     */
    async _rowTriggerButtonAction(rowIndex, colId, recordId) {
        const column = this.columns.get(colId)
        let record = this.collection.records[rowIndex]
        if (column.button.action) await column.button.action(rowIndex, colId, recordId, record)
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
        return this.datatableBody1stColumn.querySelector("[row=\"" + rowIndex + "\"]").querySelector(".datatable-row-checkbox")
    }

    /**
     * Get the index of a record in the active page.
     * 
     * @private
     * @ignore
     * @param {string} recordId
     * @returns {integer} The row index, or null if it wasn't found in the page
     */
    _rowGetIndex(recordId) {
        let row = this.datatableBody.querySelector("div[recordId='" + recordId + "']")
        if (row) return row.getAttribute("row")
        else return null
    }

    /**
     * Find the index of a record in the datatable (including hidden rows)
     * 
     * @private
     * @ignore
     * @param {string} recordId
     * @returns {number} The index of the record in the datatable, or -1 if not found
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
        let rows = this.datatableBody.querySelectorAll("div[recordId='" + recordId + "']")
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
        const localStorageId = "config-datatable-" + this.id + "-row-height"
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
     * Save the width of a column in the localStorage
     * 
     * @private
     * @ignore
     * @param {string} columnId - Id of the column to resize
     * @param {number} newWidth - New column width
     */
    _columnsSetWidth(columnId, newWidth) {
        let localStorageId

        // 1st column
        if (columnId == "1stColumn") {
            localStorage.setItem("config-datatable-" + this.id + "-1st-column", newWidth)
            return
        }

        // Other columns: get the column config and update it
        let columnIndex = this.columns.findIndex(column => column.id == columnId)
        if (newWidth <= 10) newWidth = 10
        this.columns[columnIndex].width = newWidth

        // Save new column size locally
        localStorageId = "config-datatable-" + this.id + "-columns"
        localStorage.setItem(localStorageId, JSON.stringify(this.columns))
    }

    /**
     * Drag and drop a column
     * 
     * @private
     * @ignore
     * @param {string} phase - dragstart | dragover | dragleave | drop
     * @param {object} event - The drag Event: dragStart | dragOver | dragLeave | drop
     * @param {object} element - The DOM element which is dragged
     */
    _columnsMoveWithdragAndDrop(phase, event, element) {
        let target = event.target
        let targetCenterX = null
        let colIndex = target.closest("div").getAttribute("col")
        let columnCells = Array.from(this.querySelectorAll("div[col='" + colIndex + "']"))

        switch (phase) {
            case "dragstart":
                // Store the column to be moved
                this.sourceColumnId = target.id.split("title-")[1]
                break

            case "dragover":
                // Adjust target column style to show where to drop the column
                targetCenterX = target.offsetLeft + target.clientWidth / 2

                if (event.x < targetCenterX) {
                    columnCells.forEach(cell => {
                        cell.classList.remove("datatable-column-dragover-right")
                        cell.classList.add("datatable-column-dragover-left")
                    })
                } else {
                    columnCells.forEach(cell => {
                        cell.classList.remove("datatable-column-dragover-left")
                        cell.classList.add("datatable-column-dragover-right")
                    })
                }
                event.preventDefault()
                return false

            case "dragleave":
                // Restore style of header and column
                columnCells.forEach(cell => {
                    cell.classList.remove("datatable-column-dragover-left")
                    cell.classList.remove("datatable-column-dragover-right")
                })
                break

            case "drop":
                event.stopPropagation()

                // Restore style of header and column
                columnCells.forEach(cell => {
                    cell.classList.remove("datatable-column-dragover-left")
                    cell.classList.remove("datatable-column-dragover-right")
                })

                // Perform the drop action
                targetCenterX = target.offsetLeft + target.clientWidth / 2
                let position = (event.x < targetCenterX) ? "before" : "after"
                this._columnsMove(this.sourceColumnId, target.id.split("title-")[1], position)
                break
        }
    }

    /**
     * Resize a column
     * 
     * @private
     * @ignore
     */
    _columnsResizeWithDragAndDrop(event, element) {
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

        //  Set minimum column size
        let columnMinSize = (columnId == "1stColumn") ? 90 : 20

        // !!!
        // TODO: memory leak to solve here => listeners seem to not be garbage collected properly
        // !!!
        document.onmousemove = (event) => {
            let _event = event

            setTimeout(() => {
                newWidth = (currentWidth + _event.x - columnHeader.mouseStartX)
                if (newWidth > columnMinSize) {
                    // Resize the header
                    columnHeader.style.minWidth = columnHeader.style.width = newWidth + "px"
                    columnHeaderTitle.style.minWidth = columnHeaderTitle.style.width = newWidth - 16 + "px"

                    // Resize the column
                    columnCells.forEach(cell => cell.style.width = cell.style.minWidth = newWidth + "px")

                    if (columnId == "1stColumn") this._columnsSetFirstColumnWidth(newWidth)
                }
            }, 1)
        }

        // Remove listeners
        document.onmouseup = () => {
            this._columnsSetWidth(columnId, Math.max(columnMinSize, newWidth))
            document.onmousemove = null
            document.onmouseup = null
        }
    }

    /**
     * Convert a numeric width into a style
     * 
     * @private
     * @ignore
     * @param {number} width 
     * @returns {string} The style - Example: style="width: 215px; min-width: 215px"
     */
    _columnsConvertWidthToStyle(width) {
        return "width: " + width + "px; min-width: " + width + "px;"
    }

    /**
     * Convert a numeric width into a style, for the first column
     * 
     * @private
     * @ignore
     * @param {number} width 
     * @returns {string} The style - Example: style="width: 215px; min-width: 215px"
     */
    _columnsConvertFirstColumnWidthToStyle(width) {
        return "width: " + width + "px; min-width: " + width + "px;"
    }

    /**
     * Resize the datatable first column, used to display:
     * - selection checkboxes
     * - group names, when the view is grouped by a field
     * 
     * @private
     * @ignore
     * @param {number} newWidth 
     */
    _columnsSetFirstColumnWidth(newWidth) {
        this.defaultColumnWidth.firstColumn = newWidth
        this.datatableHeader1stColumn.style.minWidth = newWidth + "px"
        this.datatableBody1stColumn.style.minWidth = newWidth + "px"
    }

    /**
     * Adjust columns according to a local configuration stored in the localStorage.
     * If a configuration is found for a specific column, then it is applied.
     * Otherwise, a DEFAULT_WIDTH width is applied.
     * 
     * @private
     * @ignore
     */
    _columnsAdjustWidthFromLocalStorage() {
        // Adjust 1st column width
        let localStorageId = "config-datatable-" + this.id + "-1st-column"
        let firstColumnWidth = localStorage.getItem(localStorageId)
        this.defaultColumnWidth.firstColumn = (firstColumnWidth || this.defaultColumnWidth.firstColumn)

        // Adjust other columns width
        localStorageId = "config-datatable-" + this.id + "-columns"
        let localColumns = JSON.parse(localStorage.getItem(localStorageId))

        this.columns = this.columns.map(column => {
            const defaultColumnWidth = this.defaultColumnWidth[column.type] || this.defaultColumnWidth.default
            column.width = column.width || defaultColumnWidth

            if (localColumns) {
                // Check if there is a matching column in the local config
                let localColumn = localColumns.find(localColumn => localColumn.id == column.id)

                // If the local column has a width, then adjust the datatable column accordingly
                if (localColumn && localColumn.width) column.width = localColumn.width
            }
            return column
        })
    }

    /**
     * Set the column aggregation type for grouped views
     * 
     * @private
     * @ignore
     * @param {number} colIndex
     * @param {number} x - x position to display the menu
     * @param {number} Y - y position to display the menu
     */
    _columnsSetAggregationType(column, x, y) {
        createMenu({
                items: [{
                        text: txtTitleCase("sum"),
                        icon: "fas fa-chart-bar",
                        action: async () => {
                            column.summary = "sum"
                            this._render()
                            this.updateConfig({
                                config: {
                                    columns: this.columns
                                }
                            })
                        }
                    },
                    {
                        text: txtTitleCase("average"),
                        icon: "fas fa-tachometer-alt",
                        action: async () => {
                            column.summary = "avg"
                            this._render()
                            this.updateConfig({
                                config: {
                                    columns: this.columns
                                }
                            })
                        }
                    },
                    {
                        text: txtTitleCase("#no summary"),
                        icon: "fas fa-ban",
                        action: async () => {
                            delete column.summary
                            this._render()
                            this.updateConfig({
                                config: {
                                    columns: this.columns
                                }
                            })
                        }
                    },
                ]
            })
            .render()
            .showAt(x, y)
    }

    /**
     * 
     * ACCESS TO CELLS
     * 
     */

    /**
     * Set new data into a cell.
     * Apply the existing cell renderer, if any.
     * This method is always triggered asynchronously in the background by a collection change.
     * 
     * @private
     * @ignore
     * @param {string} recordId - Target record id
     * @param {string} fieldId - Target field id
     * @param {*} value - Value to set
     */
    _cellSetValue(recordId, fieldId, value) {
        try {
            // Get the column config
            const colIndex = this.visibleColumns.findIndex(column => (column.id == fieldId))
            if (colIndex == -1) return
            const column = this.visibleColumns[colIndex]

            // Get the record (for specific renderers that needs more than the field value to be computed)
            const record = this.collection.getRecord(recordId)

            // Find all the rows that match this record
            const rowIndexes = this._rowGetAllIndexes(recordId)

            // For each of these rows, we update the right cell value
            rowIndexes.forEach(rowIndex => {
                const row = this.datatableBody.querySelector("div[row='" + rowIndex + "']")
                const cell = row.querySelector("div[col='" + colIndex + "']")
                cell.innerHTML = column.renderer(value, record, rowIndex, colIndex)
            })
        } catch (err) {
            log("kiss.ui - datatable - Couldn't set the cell value", 4, err)
        }
    }

    /**
     * Set the value of a checkbox cell
     * 
     * @private
     * @ignore
     * @param {string} recordId - Target record id
     * @param {string} fieldId - Target field id
     */
    async _cellSetCheckboxValue(recordId, fieldId) {
        let record = this.collection.getRecord(recordId)
        let currentCellValue = record[fieldId] || false
        await record.updateFieldDeep(fieldId, !currentCellValue)
    }

    /**
     * Set the value of a rating cell
     * 
     * @private
     * @ignore
     * @param {string} recordId - Target record id
     * @param {string} fieldId - Target field id
     * @param {event} event
     */
    async _cellSetRatingValue(recordId, fieldId, event) {
        if (!event.target.classList.contains("rating")) return

        let record = this.collection.getRecord(recordId)
        let currentCellValue = record[fieldId]
        const index = event.target.getAttribute("index")
        const newValue = Number(index) + 1

        if (newValue != currentCellValue) await record.updateFieldDeep(fieldId, newValue)
    }

    /**
     * Get the next cell up, down, left or right, starting from the current position
     * If the next cell found is *not* editable, then return null
     * 
     * @private
     * @ignore
     * @param {HTMLDivElement} cell - the current cell
     * @param {string} direction - up|down|left|right
     * @returns {HTMLDivElement|null}
     */
    _cellGetNext(cell, direction) {
        let shift = {
            up: {
                x: 0,
                y: -1
            },
            down: {
                x: 0,
                y: 1
            },
            left: {
                x: -1,
                y: 0
            },
            right: {
                x: 1,
                y: 0
            }
        }

        // Compute the next coordinates according to the direction
        let rowIndex = this._cellGetRowIndex(cell) + shift[direction].y
        let colIndex = this._cellGetColIndex(cell) + shift[direction].x

        let row = this.datatableBody.querySelector("div[row='" + rowIndex + "']")
        if (!row) return null
        if (row.className == "datatable-group-row") return null

        let nextCell = row.querySelector("div[col='" + colIndex + "']")
        if (!nextCell) return null

        // TODO: check cell security => if no access, then return null as well
        if (this._cellIsEditable(nextCell)) {
            return null
        } else {
            return nextCell
        }
    }

    /**
     * 
     * Simple helpers to get cell properties
     * 
     * @private
     * @ignore
     */
    _cellGetRowIndex(cell) {
        return Number(cell.parentNode.getAttribute("row"))
    }

    _cellGetColIndex(cell) {
        return Number(cell.getAttribute("col"))
    }

    _cellGetRecordId(cell) {
        let rowIndex = this._cellGetRowIndex(cell)
        return this.collection.records[rowIndex].id
    }

    _cellGetRecordData(cell) {
        let rowIndex = this._cellGetRowIndex(cell)
        return this.collection.records[rowIndex]
    }

    _cellGetRecord(cell) {
        let recordId = this._cellGetRecordId(cell)
        return this.collection.getRecord(recordId)
    }

    _cellGetFieldId(cell) {
        let col = cell.getAttribute("col")
        let colHeader = this.datatableHeader.querySelector("div[col='" + col + "']")
        return colHeader.id.split("header-")[1]
    }

    _cellGetColumn(cell) {
        let colId = this._cellGetFieldId(cell)
        return this.columns.get(colId)
    }

    _cellIsEditable(cell) {
        const fieldId = this._cellGetFieldId(cell)
        const field = this.model.getField(fieldId)

        if (field.computed) return false
        if (field.readOnly) return false
        if (field.type == "lookup" || field.type == "summary") return false
        if (field.acl) {
            const acl = field.acl.update
            return (acl !== false)
        }
        return true
    }

    /**
     * Open a linked record from a cell
     * 
     * @private
     * @ignore
     * @param {string} fieldId
     * @param {string} recordId 
     */
    async _cellOpenLinkedRecord(fieldId, recordId) {
        const record = this.collection.getRecord(recordId)
        if (!record) return

        const links = await kiss.data.relations.getLinksAndRecords(record.model.id, record.id, fieldId)
        const foreignRecords = links.map(link => link.record)

        // No linked records
        if (links.length == 0) {
            const field = record.model.getField(fieldId)
            const foreignModelId = field.link.modelId
            const foreignModel = kiss.app.models[foreignModelId]
            const foreignModelName = foreignModel.namePlural
            return createNotification(txtTitleCase("#no links", null, {
                table: foreignModelName
            }))
        }

        const field = this.model.getField(fieldId)
        const foreignModel = kiss.app.models[field.link.modelId]

        if (links.length == 1) {
            // Single record, we open the form
            const foreignRecord = foreignModel.create(foreignRecords[0])
            this.selectRecord(foreignRecord)
        } else {
            // Multiple records, we open the window to select a record
            kiss.context.records = foreignRecords
            createRecordSelectorWindow(foreignModel, fieldId, foreignRecords, null, {
                canSelect: false
            })
        }
    }

    /**
     * 
     * CELL IN-PLACE EDITING
     * 
     */

    /**
     * Switch a cell to EDIT MODE
     * 
     * @private
     * @ignore
     * @param {HTMLDivElement} cell - The cell to edit
     */
    async _cellSwitchToEditMode(cell, event) {
        const _this = this
        let updateOnBlur = true

        cell.onkeydown = null

        // Exit immediately if its a special cell
        const cellType = cell.classList[1].split("-")[2]
        if (["attachment", "button", "custom"].indexOf(cellType) != -1) return

        // Get main cell infos
        const record = this._cellGetRecord(cell)
        const recordId = record.id
        const fieldId = this._cellGetFieldId(cell)
        const field = this.model.getField(fieldId)
        const fieldType = field.type
        const column = this.getColumn(fieldId)

        // Fields generated by plugins are static
        if (column.isFromPlugin) return

        // Cache the initial value, html, and style, to be able to roll back to it, in case we cancel the cell edition
        const fieldInitialValue = record[fieldId] || ""
        const cellInitialStyle = cell.getAttribute("style")

        // Exit if it's a computed or readOnly cell
        if (field.computed || field.readOnly) return

        // Open the record for some specific field types
        if (fieldType == "link") return await this.selectRecordById(recordId)

        // It's a checkbox: directly switch the state
        if (fieldType == "checkbox") return this._cellSetCheckboxValue(recordId, fieldId)

        // It's a checkbox: directly switch the state
        if (fieldType == "rating") return this._cellSetRatingValue(recordId, fieldId, event)

        // Open a dialog to edit <textarea>
        if (fieldType == "textarea" || fieldType == "aiTextarea") return this._cellEditTextarea(cell, field, fieldInitialValue)

        // Open a dialog to edit <select> and <select view column>
        if (fieldType == "select" || fieldType == "selectViewColumn") return this._cellEditSelect(cell, field)

        // Open a dialog to edit <select view columns>
        if (fieldType == "selectViewColumns") return this._cellEditSelectViewColumns(cell, field)

        // Open a dialog to edit <directory>
        if (fieldType == "directory") return this._cellEditSelect(cell, field)

        // Open a palette to edit <color>
        if (fieldType == "color") return this._cellEditColor(cell, field)

        // Open a palette to edit <icon>
        if (fieldType == "icon") return this._cellEditIcon(cell, field)

        let cellWidth = cell.clientWidth + "px"
        let cellHeight = cell.clientHeight + "px"

        // Create a new input field inside the cell
        let inputId = "input-" + recordId + "-" + fieldId
        const dataType = (["number", "rating", "slider"].includes(field.type)) ? "number" : field.type
        const cellValue = (typeof fieldInitialValue == "string") ? fieldInitialValue.escapeHtml() : fieldInitialValue
        cell.innerHTML = `<input class="datatable-cell-edited" id="${inputId}" type="${dataType}" value="${cellValue}">`
        let fieldInput = $(inputId)

        // Adjust the cell and field styles so that the field occupies the whole space inside the cell
        cell.style.width = fieldInput.style.width = cellWidth
        cell.style.height = fieldInput.style.height = cellHeight

        // Adjust field style
        fieldInput.style.border = "none"
        fieldInput.style.padding = "var(--datatable-cell-padding)"
        fieldInput.style.color = "var(--datatable-cell)"
        fieldInput.style.background = "var(--datatable-input-background)"

        // Set focus and auto-edit content
        fieldInput.focus()
        fieldInput.select()

        /**
         * Observe key events for in-cell edition
         */
        fieldInput.onkeydown = await async function (event) {
            updateOnBlur = true // By default, we update a cell if we loose focus, like in Excel
            let editNextCell = false

            // SHIFT+TAB
            if (event.shiftKey && event.key == "Tab") {
                editNextCell = "left"
            }
            // TAB
            else if (event.key == "Tab") {
                editNextCell = "right"
            }
            // ENTER
            else if (event.key == "Enter") {
                editNextCell = "down"
            }
            // ESCAPE (= reset modifications)
            else if (event.key == "Escape") {
                updateOnBlur = false
                this.reset()
            }

            // Edit the next cell
            if (editNextCell) {
                updateOnBlur = false
                event.stop()

                const result = this.updateCell()
                if (!result) return false

                const nextCell = _this._cellGetNext(cell, editNextCell)
                if (nextCell) _this._cellSwitchToEditMode(nextCell)
            }
        }

        // Update on cell exiting
        fieldInput.updateCell = async function () {

            // Entry validation
            let success = kiss.tools.validateValue(fieldType, field, this.value)
            if (!success) {
                createNotification(txtTitleCase("#fields incorrect value"))
                this.reset()
                return false
            }

            const newValue = (fieldType == "number") ? Number(this.value) : this.value

            if (newValue != fieldInitialValue) {
                // cell.showLoading({
                //     size: 16
                // })

                // Update the record in the database using the db. This will:
                // - overwrite the same cell with the same value, if the request was OK
                // - rollback to another value, if the request was not OK (for example if the user didn't have enough rights)
                success = await record.updateFieldDeep(fieldId, newValue)

                // Rollback the value in case the operation is forbidden
                if (!success) {
                    this.value = fieldInitialValue
                    this.reset()
                }

                // cell.hideLoading()
            } else {
                this.reset()
            }
        }

        // Remove input field on exiting & restore cell style
        fieldInput.reset = function () {
            try {
                cell.removeAttribute("style")
                cell.setAttribute("style", cellInitialStyle)
                cell.innerHTML = column.renderer(fieldInitialValue)
            } catch (err) {
                log("kiss.ui - datatable - Couldn't restore the cell value", 4, err)
            }
        }

        // Save or discard the changes when exiting the field
        fieldInput.onblur = async function () {
            if (updateOnBlur) this.updateCell()
        }
    }


    /**
     * Edit a textarea cell
     * 
     * @private
     * @ignore
     * @param {object} cell
     * @param {object} field
     * @param {string} initialValue 
     */
    _cellEditTextarea(cell, field, initialValue) {
        const column = this._cellGetColumn(cell)

        createPanel({
            id: "panel-edit-textarea",
            title: column.title,
            headerBackgroundColor: this.color,
            closable: true,
            modal: true,
            draggable: true,
            width: 660,
            height: 660,
            align: "center",
            verticalAlign: "center",

            layout: "vertical",
            items: [
                // Textarea
                {
                    id: "datatable-edit-textarea",
                    type: "textarea",
                    value: initialValue,
                    required: field.required,
                    minLength: field.minLength,
                    maxLength: field.maxLength,
                    fieldWidth: "100%",
                    flex: 1
                },
                // Buttons
                {
                    layout: "horizontal",

                    defaultConfig: {
                        type: "button",
                        flex: 1,
                        margin: "0px 5px 0px 5px"
                    },

                    items: [
                        // Cancel
                        {
                            text: txtUpperCase("cancel"),
                            icon: "fas fa-times",
                            action: () => {
                                $("panel-edit-textarea").doNotModifyValue = true
                                $("panel-edit-textarea").close()
                            }
                        },
                        // OK
                        {
                            text: txtUpperCase("ok"),
                            icon: "fas fa-check",
                            color: "var(--green)",
                            iconColor: "var(--green)",
                            action: () => $("panel-edit-textarea").close()
                        }
                    ]
                }
            ],
            events: {
                // Update value on exit
                onclose: () => {
                    if ($("panel-edit-textarea").doNotModifyValue) return

                    // Exit if the value didn't change
                    const textarea = $("datatable-edit-textarea")
                    let newTextareaValue = textarea.getValue()
                    if (newTextareaValue == initialValue) return

                    // Validate new value
                    const success = textarea.validate()
                    if (!success) {
                        createNotification(txtTitleCase("#fields incorrect value"))
                        return
                    }

                    // Otherwise update the record
                    let record = this._cellGetRecord(cell)
                    record.updateFieldDeep(field.id, newTextareaValue)
                },
                // Restore value on escape
                onkeydown: function (event) {
                    if (event.key != "Escape") return

                    $("datatable-edit-textarea").setValue(initialValue)
                    $("panel-edit-textarea").doNotModifyValue = true
                    this.close()
                }
            },
            methods: {
                load: () => setTimeout(() => $("datatable-edit-textarea").focus(), 100)
            }
        }).render()
    }

    /**
     * Edit a color cell
     * 
     * @private
     * @ignore
     * @param {string} cell
     * @param {object} field
     */
    _cellEditColor(cell, field) {
        let record = this._cellGetRecord(cell)
        let initialValue = record[field.id]

        const picker = createPanel({
            modal: true,
            header: false,
            width: 705,
            align: "center",
            verticalAlign: "center",
            items: [{
                type: "colorPicker",
                value: initialValue,
                selectorBorderRadius: "32px",
                events: {
                    change: function () {
                        let color = this.getValue()
                        record.updateFieldDeep(field.id, color)
                        picker.close()
                    }
                }
            }]
        }).render()
    }

    /**
     * Edit an icon cell
     * 
     * @private
     * @ignore
     * @param {string} cell
     * @param {object} field
     */
    _cellEditIcon(cell, field) {
        let record = this._cellGetRecord(cell)
        let initialValue = record[field.id]

        const picker = createPanel({
            modal: true,
            header: false,
            width: 675,
            align: "center",
            verticalAlign: "center",
            items: [{
                type: "iconPicker",
                value: initialValue,
                autoFocus: true,
                icons: kiss.webfonts.all,
                selectorBorderRadius: "32px",
                height: 660,
                events: {
                    change: function () {
                        let icon = this.getValue()
                        record.updateFieldDeep(field.id, icon)
                        picker.close()
                    }
                }
            }]
        }).render()
    }

    /**
     * Edit a select cell
     * 
     * @private
     * @ignore
     * @param {object} cell
     * @param {object} field
     */
    _cellEditSelect(cell, field) {
        const record = this._cellGetRecord(cell)
        const column = this._cellGetColumn(cell)
        let initialValue = record[field.id]

        createPanel({
            id: "panel-edit-select",
            title: column.title,
            headerBackgroundColor: this.color,
            modal: true,
            draggable: true,
            width: 660,
            align: "center",
            verticalAlign: "center",

            layout: "vertical",
            items: [
                // Select
                {
                    id: field.id,
                    type: field.type,
                    value: initialValue,
                    required: field.required,

                    fieldWidth: "100%",
                    maxHeight: 410,
                    flex: 1,

                    options: field.options,
                    roles: field.roles,
                    multiple: field.multiple,
                    template: field.template,
                    min: field.min,
                    max: field.max,
                    interval: field.interval,
                    allowClickToDelete: field.multiple,
                    allowSwitchOnOff: field.multiple,
                    allowValuesNotInList: field.allowValuesNotInList,

                    // Options for <Select View Column> field
                    viewId: field.viewId,
                    fieldId: field.fieldId
                },

                // Buttons
                {
                    layout: "horizontal",

                    defaultConfig: {
                        type: "button",
                        flex: 1,
                        margin: "0px 5px 0px 5px"
                    },

                    items: [
                        // Cancel
                        {
                            text: txtUpperCase("cancel"),
                            icon: "fas fa-times",
                            action: () => {
                                $("panel-edit-select").doNotModifyValue = true
                                $("panel-edit-select").close()
                            }
                        },
                        // OK
                        {
                            text: txtUpperCase("ok"),
                            icon: "fas fa-check",
                            color: "var(--green)",
                            iconColor: "var(--green)",
                            action: () => $("panel-edit-select").close()
                        }
                    ]
                }
            ],
            events: {
                // Update value on exit
                onclose: () => {
                    if ($("panel-edit-select").doNotModifyValue) return
                    const selectField = $(field.id)

                    // Exit if the value didn't change
                    let newValue = selectField.getValue()
                    if (newValue == initialValue) return

                    // Validate new value
                    const success = selectField.validate()
                    if (!success) {
                        createNotification(txtTitleCase("this field is required"))
                        return
                    }

                    // Update the record
                    record.updateFieldDeep(field.id, newValue)
                },
                // Abort with 'Escape' key
                onkeydown: function (event) {
                    if (event.key != "Escape") return

                    $(field.id).setValue(initialValue)
                    $("panel-edit-select").doNotModifyValue = true
                    this.close()
                }
            }
        }).render()
    }

    /**
     * Edit a <select view columns> cell
     * 
     * @private
     * @ignore
     * @param {object} cell
     * @param {object} field
     */
    async _cellEditSelectViewColumns(cell, field) {
        const selectedRecord = this._cellGetRecord(cell)
        const viewRecord = await kiss.app.collections.view.findOne(field.viewId)
        const viewModel = kiss.app.models[viewRecord.modelId]

        // Build the datatable
        const datatable = createDatatable({
            collection: viewModel.collection,
            sort: viewRecord.sort,
            filter: viewRecord.filter,
            group: viewRecord.group,

            canEdit: false,
            canAddField: false,
            canEditField: false,
            canCreateRecord: false,
            showActions: false,
            columns: viewRecord.config.columns,
            color: viewModel.color,
            height: () => kiss.screen.current.height - 250,

            methods: {
                selectRecord: async function (record) {
                    const fieldId = field.fieldId[0]
                    const otherFieldIds = field.fieldId.slice(1)

                    let mapping = otherFieldIds.map(viewFieldId => {
                        let label = viewModel.getField(viewFieldId).label
                        let localField = selectedRecord.model.getFieldByLabel(label) || {}
                        return {
                            label,
                            id: localField.id,
                            viewFieldId
                        }
                    }).filter(map => map.id)

                    let update = {}
                    update[field.id] = record[fieldId]
                    mapping.forEach(map => update[map.id] = record[map.viewFieldId])

                    await selectedRecord.updateDeep(update)
                    this.closest("a-panel").close()
                }
            }
        })

        // Build the panel to embed the datatable
        createPanel({
            modal: true,
            closable: true,

            // Header
            title: "<b>" + viewModel.namePlural + "</b>",
            icon: viewModel.icon,
            headerBackgroundColor: viewModel.color,

            // Size and layout
            display: "flex",
            layout: "vertical",
            width: () => kiss.screen.current.width - 200,
            height: () => kiss.screen.current.height - 200,
            align: "center",
            verticalAlign: "center",
            autoSize: true,

            items: [datatable]
        }).render()
    }

    /**
     * 
     * OTHER MISC METHODS
     * 
     */

    /**
     * Render the menu to change datatable layout
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

    /**
     * Add custom buttons to the toolbar.
     * Buttons can be inserted at a custom position.
     * 
     * @private
     * @ignore
     * 
     * @example
     * const customButtons = [{
     *  position: 1,
     *  text: "Button 1",
     *  action: () => {console.log("Hello")}
     * }, {
     *  position: 5,
     *  text: "Button 5",
     *  action: () => {console.log("World")}
     * }]
     * 
     * createDatatable({
     *  //... your datatable config here
     *  buttons: customButtons
     * })
     */
    async _buildCustomButtons() {
        if (!this.buttons) return
        this.buttons.forEach(button => {
            const newButton = createButton(button)
            const position = button.position || 1
            const target = this.datatableToolbar.children[position]
            this.datatableToolbar.insertBefore(newButton, target)
        })
    }

    /**
     * Show quick tips to onboard the user and explaind the basics
     */
    showTutorial() {
        setTimeout(() => {
            kiss.tools.highlightElements([{
                    element: document.body.querySelector(".datatable-header-last-column"),
                    text: txtTitleCase("#add field help")
                },
                {
                    element: document.body.querySelector(".datatable-create-record"),
                    text: txtTitleCase("#create record help")
                },
                {
                    element: document.body.querySelector(".datatable-row-action"),
                    text: txtTitleCase("#open form help")
                }
            ], () => {
                createDialog({
                    message: txtTitleCase("#replay tips"),
                    buttonCancelText: txtTitleCase("no"),
                    action: () => this.showTutorial()
                })
            })
        }, 200)

        delete kiss.context.onboard
    }
}

// Create a Custom Element and add a shortcut to create it
customElements.define("a-datatable", kiss.ui.Datatable)

/**
 * Shorthand to create a new Datatable. See [kiss.ui.Datatable](kiss.ui.Datatable.html)
 * 
 * @param {object} config
 * @returns HTMLElement
 */
const createDatatable = (config) => document.createElement("a-datatable").init(config)

;