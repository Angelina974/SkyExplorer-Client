/**
 * 
 * The DataComponent derives from [Component](kiss.ui.Component.html).
 * 
 * This is an **abstract class**: don't use it directly.
 * It's the base class for all the components used to display a collection of records, like:
 * - Datatable
 * - Calendar
 * - Gallery
 * - Lists
 * - Kanban
 * - ...
 * 
 * Each **DataComponent** is associated with its own Collection.
 * 
 * The Collection can be provided directly in the config.
 * If not, a Model must be passed instead, and a new Collection will be created from this Model.
 * 
 * A **DataComponent** can manipulate its collection:
 * - selecting the fields to display
 * - filtering the data
 * - sorting the data
 * - grouping the data
 * 
 * These operations are achieved thanks to built-in windows that you can display using:
 * ```
 * // Display the window to select fields
 * myComponent.showFieldsWindow(x, y, color)
 * 
 * // Display the window to sort data
 * myComponent.showSortWindow(x, y, color)
 * 
 * // Display the window to filter data
 * myComponent.showFilterWindow(x, y, color)
 * ```
 * 
 * A **DataComponent** can persist its configuration inside its associated record, using updateConfig method.
 * 
 * 
 * @param {object} config
 * @param {object} [config.collection] - Optional collection. If not provied, creates a new collection from the model
 * @param {object} [config.model] - Optional model. If not provided, uses the collection's model
 * @returns {HTMLElement}
 */
kiss.ui.DataComponent = class DataComponent extends kiss.ui.Component {
    constructor() {
        super()
    }

    init(config = {}) {
        super.init(config)

        if (config.collection) {
            // Case a) a Collection is given in the config
            // In that case, the Model is taken from the Collection definition
            this.collection = config.collection
            this.model = config.model || this.collection.model
            this.modelId = this.model.id
        } else if (config.model) {
            // Case b) a Model is given in the config
            // In that case, create and register a new Collection from the Model
            this.model = config.model
            this.modelId = this.model.id
            this.collection = new kiss.data.Collection({
                model: this.model,
                sort: [{
                    [this.model.getPrimaryKeyField().id]: "asc" // Sort on the primary key field by default
                }]
            })
        }

        this._initParameters()
        return this
    }

    /**
     * Apply filter, sort, group, projection, groupUnwind.
     * If a record is binded to persist the view configuration, we take the view parameters from this record.
     * Priority is given to local config, then to the passed collection, then to default.
     * 
     * @private
     * @ignore
     * @returns this
     */
    _initParameters() {
        if (this.config.record) {
            this.record = this.config.record
            this.id = this.record.id
            this.name = this.record.name
            this.filter = this.record.filter || {}
            this.filterSyntax = this.record.filterSyntax || this.collection.filterSyntax || "normalized"
            this.sort = this.record.sort || this.collection.sort || []
            this.sortSyntax = this.record.sortyntax || this.collection.sortyntax || "normalized"
            this.group = this.record.group || this.collection.group || []
            this.projection = this.record.projection || this.collection.projection || {}
            this.groupUnwind = this.record.groupUnwind || this.collection.groupUnwind || false
            this.canCreateRecord = (this.record.canCreateRecord !== false)
        } else {
            this.id = this.config.id || kiss.tools.shortUid()
            this.name = this.config.name
            this.filter = this.config.filter || this.collection.filter || {}
            this.filterSyntax = this.config.filterSyntax || this.collection.filterSyntax || "normalized"
            this.sort = this.config.sort || this.collection.sort || []
            this.sortSyntax = this.config.sortyntax || this.collection.sortyntax || "normalized"
            this.group = this.config.group || this.collection.group || []
            this.projection = this.config.projection || this.collection.projection || {}
            this.groupUnwind = this.config.groupUnwind || this.collection.groupUnwind || false
            this.canCreateRecord = (this.config.canCreateRecord !== false)
        }

        // Apply local configuration, if any
        this.localConfig = this.getLocalConfig()
        if (this.localConfig) {
            if (this.localConfig.filter) this.filter = this.localConfig.filter
            if (this.localConfig.sort) this.sort = this.localConfig.sort
            if (this.localConfig.group) this.group = this.localConfig.group
        }

        return this
    }

    /**
     * show search bar immediately after being connected, if there is an active search
     * 
     * @private
     * @ignore
     */
    _afterConnected() {
        if (this.currentSearchTerm) {
            this.showSearchBar()
        } else {
            this.resetSearchBar()
        }
    }

    /**
     * Hide search bar immediately after being disconnected
     * 
     * @private
     * @ignore
     */
    _afterDisconnected() {
        if (this.currentSearchTerm) this.hideSearchBar()
    }

    /**
     * Initialize subscriptions to PubSub
     * 
     * @private
     * @ignore
     */
    _initSubscriptions() {
        this.subscriptions = [
            // Local events (not coming from websocket)
            subscribe("EVT_VIEW_SORTING:" + this.id, (msgData) => this._dataSort(msgData)),
            subscribe("EVT_VIEW_FILTERING:" + this.id, (msgData) => this._dataFilterBy(msgData)),
            subscribe("EVT_VIEW_GROUPING:" + this.id, (msgData) => this._dataGroupBy(msgData)),

            subscribe("EVT_VIEW_FIELD_TOGGLED_ONE:" + this.id, (fieldId) => this._columnsToggleOne(fieldId)),
            subscribe("EVT_VIEW_FIELD_TOGGLED_ALL:" + this.id, (newState) => this._columnsToggleAll(newState)),
            subscribe("EVT_VIEW_FIELD_MOVING:" + this.id, (msgData) => this._columnsMove(msgData.sourceFieldId, msgData.targetFieldId, msgData.position)),

            /*
             * View changes must be propagated to all **other** connected clients.
             * View changes come from various events, like:
             * 
             * I) Model updates
             * - field add
             * - field update
             * - field delete
             * 
             * II) View updates
             * - filter
             * - sort
             * - group
             * - projection (not implemented yet: all columns are loaded then hidden/shown)
             * - move column
             * - show/hide column
             * - show/hide record creation button
             */
            subscribe("EVT_DB_UPDATE:VIEW", (msgData) => {
                if (msgData.id != this.id) return

                // Update the component setup
                if (msgData.data.filter) this.filter = msgData.data.filter
                if (msgData.data.sort) this.sort = msgData.data.sort
                if (msgData.data.group) this.group = msgData.data.group
                if (msgData.data.projection) this.projection = msgData.data.projection
                
                // Update the component toolbar
                if (msgData.data.hasOwnProperty("canCreateRecord")) {
                    this.canCreateRecord = !!msgData.data.canCreateRecord
                    this._updateToolbar()
                }

                // Will force the collection to reload for the next find() request
                this.collection.hasChanged = true

                // Re-compute columns (a combination of existing views columns, model fields, and plugin fields)
                // Patch columns in the record or locally
                if (msgData.data.config && msgData.data.config.columns) {
                    if (this.record) {
                        this.record.config.columns = msgData.data.config.columns
                    } else {
                        this.config.columns = msgData.data.config.columns
                    }
                    this._initColumns()

                    // If we only changed the columns, it's not necessary to reload the collection
                    this.collection.hasChanged = false
                }

                // Update + display a message if the connected user is not the one who updated
                this._reloadWhenNeeded(msgData, 0)
            }),

            // TODO: Update the view => mostly used for ACL change, but redundant most of the time with EVT_DB_UPDATE:VIEW
            // TODO: Remove this and add an ACL change event (less generic than a model update)
            subscribe("EVT_DB_UPDATE:MODEL", (msgData) => {
                if (msgData.id == this.model.id) {
                    this.reload()
                }
            }),

            // When records are deleted, we need to remove them from the view selection
            subscribe("EVT_DB_DELETE:" + this.model.id.toUpperCase(), (msgData) => {
                kiss.selection.delete(this.id, msgData.id)
            }),

            subscribe("EVT_DB_DELETE_MANY:" + this.model.id.toUpperCase(), (msgData) => {
                const filter = msgData.data
                if (filter && filter._id && filter._id.$in) {
                    const ids = filter._id.$in
                    ids.forEach(id => kiss.selection.delete(this.id, id))
                }
            })
        ]
    }

    /**
     * Reload the view when needed.
     * 
     * It depends:
     * - if the view is connected to the DOM
     * - if the update has been done by the active user
     * 
     * @private
     * @ignore
     * @param {object} msgData - The original pubsub message
     * @param {number} [delay] - Delay to retard the reload, when the back-end update needs time
     */
    async _reloadWhenNeeded(msgData, delay) {

        log("++++++++++++++++++++++")
        log(msgData)

        // If the datatable exists but is not connected, it means it's in the cache.
        // We can't reload it, but we put a flag on it so it will be reloaded when displayed again
        if (!this.isConnected) {
            this.hasChanged = true
            return
        }

        // Reload the view only if the user is the author of the updates
        if (kiss.session.getUserId() == msgData.userId) {
            if (delay) await kiss.tools.wait(delay)
            await this.reload()
        }
    }

    /**
     * 
     * DATA SORT MANAGEMENT
     * 
     */

    /**
     * Sort by an array of fields
     * 
     * @async
     * @param {object[]} sortFields - Array where each object is a sort option, like: {firstName: "asc"}
     * 
     * @example
     * myDatatable.sortBy([
     *  {
     *      birthDate: "desc"
     *  },
     *  {
     *      lastName: "asc"
     *  }
     * ])
     */
    async sortBy(sortFields) {
        this.sort = sortFields
        await this._dataSortUpdate()
    }

    /**
     * Sort by a single field
     * 
     * @async
     * @param {string} fieldId 
     * @param {string} direction - "asc" | "desc"
     * 
     * @example
     * myDatatable.sortByField("birthDate", "desc")
     */
    async sortByField(fieldId, direction) {
        const currentSortFields = this.sort
        let isSortUpdated = false

        currentSortFields.forEach(sortField => {
            if (Object.keys(sortField)[0] == fieldId) {
                sortField[fieldId] = direction
                isSortUpdated = true
            }
        })

        if (!isSortUpdated) {
            currentSortFields.push({
                [fieldId]: direction
            })
        }

        await this.sortBy(currentSortFields)
    }

    /**
     * Update the sort according to the message received in the PubSub
     * 
     * @ignore
     * @param {object} msgData 
     */
    async _dataSort(msgData) {
        if (msgData.sortAction == "remove") {
            await this._dataSortRemove(msgData.sortIndex)
        } else {
            await this._dataSortBy(msgData.sortFieldName, msgData.sortDirection, msgData.sortIndex)
        }
    }

    /**
     * Sort the table by a specific field.
     * If the field hasn't been used yet to sort the datatable, then a new sort option is added.
     * If the field has already been used to sort the datatable, then the sort option is updated.
     * 
     * @private
     * @ignore
     * @param {string} fieldId - Field used to sort the datatable
     * @param {string} sortOrder - "asc" or "desc"
     * @param {number} sortIndex - position of the sort option to add/update
     */
    async _dataSortBy(fieldId, sortOrder, sortIndex) {
        let newSortOption = {}
        newSortOption[fieldId] = sortOrder

        if (this.sort.length == 0) {
            this.sort.push(newSortOption)
        } else {
            this.sort[sortIndex] = newSortOption
        }

        await this._dataSortUpdate()
    }

    /**
     * Remove one of the sort options
     * 
     * @private
     * @ignore
     * @param {number} sortIndex - Index of the sort option to remove
     */
    async _dataSortRemove(sortIndex) {
        this.sort.splice(sortIndex, 1)
        await this._dataSortUpdate()
    }

    /**
     * Update the sort options
     * 
     * @private
     * @ignore
     */
    async _dataSortUpdate() {
        // Sort view data with new sort params
        await this.collection.sortBy(this.sort)
        this._render()

        // Save new sort options
        await this.updateConfig({
            sort: this.sort
        })

        // Broadcast changes for local and offline, so that "dataSortWindow" can be updated (check dataSortWindow.js)
        kiss.pubsub.publish("EVT_VIEW_SORTED:" + this.id)
    }

    /**
     * 
     * DATA GROUPING MANAGEMENT
     * 
     */

    /**
     * Group by a list of fields
     * 
     * @param {string[]} groupFields - List of field names (not ids)
     * 
     * @example
     * myDatatable.groupBy(["Country", "City", "Age"])
     */
    groupBy(groupFieldIds) {
        $("grouping-field:" + this.id).setValue(groupFieldIds)
    }

    /**
     * Group data by a list of fields
     * 
     * @private
     * @ignore
     * @param {string[]} groupFields - Array of fields to group by.
     */
    async _dataGroupBy(groupFields) {
        // Generates the groups, then get the grouped records
        this.skip = 0
        await this.collection.groupBy(groupFields)
        this._render()

        // Show / hide:
        // - Expand and Collapse buttons
        // - Switch hierarchy button
        if (groupFields.length === 0) {
            this.buttonExpand.hide()
            this.buttonCollapse.hide()
        } else {
            this.buttonExpand.show()
            this.buttonCollapse.show()
        }

        // Save the new group config
        this.group = groupFields
        await this.updateConfig({
            group: this.group
        })
    }

    /**
     * Expand / Collapse a group
     * 
     * @private
     * @ignore
     * @param {string} groupId - Id of the group to expand/collapse. Example: 3.10.7
     * @param {number} rowIndex - Index of the group row into the datatable
     */
    _groupToggle(groupId, groupLevel, rowIndex) {
        if (this.collection.collapsedGroups.includes(groupId)) {
            this._groupExpand(groupId, rowIndex)
        } else {
            this._groupCollapse(groupId)
        }
    }

    /**
     * Expand a group
     * 
     * @private
     * @ignore
     * @param {string} groupId - Id of the group to expand/collapse. Example: 3.10.7
     * @param {number} rowIndex - Index of the group row into the datatable
     */
    _groupExpand(groupId, rowIndex) {
        this.collection.groupExpand(groupId, rowIndex)
        this._render()
        this._renderScroller()
    }

    /**
     * Collapse a group
     * 
     * @private
     * @ignore
     * @param {string} groupId - Id of the group to expand/collapse. Example: 3.10.7
     */
    _groupCollapse(groupId) {
        this.collection.groupCollapse(groupId)
        this._render()
    }

    /**
     * Expand all groups
     * 
     * @ignore
     */
    expandAll() {
        this.collection.groupExpandAll()
        this._render()
    }

    /**
     * Collapse all groups
     * 
     * @ignore
     */
    collapseAll() {
        this.skip = 0
        this.collection.groupCollapseAll()
        this._render()
    }    

    /**
     * Update the list of grouping fields that appear in the "Group by" field
     * 
     * @private
     * @ignore
     */
    _groupUpdateGroupingFields() {
        if (!this.isConnected) return

        const groupingField = $("grouping-field:" + this.id)
        const modelFields = this._groupGetModelFields()

        groupingField.value = this.group
        groupingField.updateOptions(modelFields)
    }

    /**
     * Get the list of grouping fields that appear in the "Group by" field
     * 
     * @private
     * @ignore
     * @param {object} config
     * @param {boolean} config.excludeSystemFields - Exclude system fields from the list
     * @param {boolean} config.excludePluginFields - Exclude plugin fields from the list
     */
    _groupGetModelFields(config = {}) {
        const isDynamicModel = kiss.tools.isUid(this.model.id)
        let modelFields = this.model.fields.filter(field => field.type != "link" && field.type != "attachment" && field.label && field.deleted != true)

        if (config.excludeSystemFields) modelFields = modelFields.filter(field => !field.isSystem)
        if (config.excludePluginFields) modelFields = modelFields.filter(field => !field.isFromPlugin)

        return modelFields
            .map(field => {
                return {
                    value: field.id,
                    label: (isDynamicModel && !field.isSystem) ? field.label.toTitleCase() : txtTitleCase(field.label)
                }
            })
    }

    /**
     * Update the filter
     * 
     * @private
     * @ignore
     * @param {object} filterConfig 
     */
    async _dataFilterBy(filterConfig) {
        // Reset ftsearch
        this.resetSearchBar()

        // Filter view data with new filter params
        this.skip = 0
        await this.collection.filterBy(filterConfig)
        this._render()

        // Save the new filter config
        this.filter = filterConfig
        await this.updateConfig({
            filter: this.filter
        })
    }

    /**
     * Update view configuration:
     * - while offline, just reload
     * - while online, check ACL prior to updating
     * - if ACL check is successful, save the new configuration into db
     * 
     * @async
     */
    async updateConfig(update) {
        try {
            // If the view is not persisted into a record,
            // we just reload the view locally and we don't save the updates permanently
            if (!this.record) {
                this.reload()
                return
            }

            // If the user has insufficient access to update the view configration,
            // we just reload the view locally and we don't save the updates permanently
            const canUpdate = await kiss.acl.check({
                action: "update",
                record: this.record
            })

            if (!canUpdate) {
                this.updateLocalConfig(update)
                this.reload()
                return
            }

            // The user has sufficient access: the view configuration is updated permanently
            const newConfig = this._buildConfig(this.record, update)
            await this.record.update(newConfig)

        } catch (err) {
            log("kiss.ui - dataComponent - Didn't save new view config", 4, err)
        }
    }

    /**
     * When the view configuration can't be persisted into db,
     * we tried to store its parameters in the local storage.
     * 
     * @param {object} update 
     */
    updateLocalConfig(update) {
        let currentConfig = this.getLocalConfig() || {}
        let newConfig = this._buildConfig(currentConfig, update)
        Object.assign(currentConfig, newConfig)
        const storageId = "config-view-" + this.id
        localStorage.setItem(storageId, JSON.stringify(currentConfig))
    }

    /**
     * Build a new configuration by keeping only what is updated.
     * 
     * A dataComponent has basically 4 properties: sort, filter, group, config.
     * Sort, filter and group are generic properties for every dataComponent, while config is specific to the view.
     * For this, we need to merge the new config with the current one, and keep only the updated properties.
     * 
     * @private
     * @ignore
     * @param {object} record 
     * @param {object} update 
     * @returns {object} The new configuration, with only the updated properties
     */
    _buildConfig(record, update) {
        let config = {}
        if (update.hasOwnProperty("sort")) config.sort = update.sort
        if (update.hasOwnProperty("filter")) config.filter = update.filter
        if (update.hasOwnProperty("group")) config.group = update.group
        if (update.hasOwnProperty("config")) {
            let currentConfig = record.config || {}
            Object.assign(currentConfig, update.config)
            config.config = currentConfig
        } 
        return config
    }
   
    /**
     * When a view configuration can't be persisted into db,
     * it can be stored and retrieved from the local storage
     * 
     * @returns {object} The view configuration stored locally
     */
    getLocalConfig() {
        const storageId = "config-view-" + this.id
        const localConfig = localStorage.getItem(storageId)
        if (!localConfig) return false

        let setup = JSON.parse(localConfig)

        // Clean local config columns according to the model's fields
        if (setup.config && setup.config.columns && Array.isArray(setup.config.columns)) {
            // For each model's field, update the corresponding column
            this.model.getFields().forEach(field => {
                let column = setup.config.columns.get(field.id)

                if (column) {
                    // The column exists: we udpate it
                    column.type = this.model.getFieldType(field)
                    column.title = field.label.toTitleCase()
                    column.deleted = !!field.deleted
                } else {
                    // The column doesn't exist: we add it
                    if (field.label && field.type && !field.deleted) {
                        setup.config.columns.push({
                            id: field.id,
                            type: this.model.getFieldType(field),
                            title: field.label.toTitleCase(),
                            hidden: (field.type == "link") ? true : false
                        })
                    }
                }
            })
        }

        // Filters out deleted fields from sorts
        if (setup.sort) {
            const sortableFields = this.model.getSortableFields().map(field => field.id)
            setup.sort = setup.sort.filter(sort => sortableFields.includes(Object.keys(sort)[0]))
        }

        // Filters out deleted fields from groups
        if (setup.group) {
            const groupableFields = this.model.getGroupableFields().map(field => field.id)
            setup.group = setup.group.filter(fieldId => groupableFields.includes(fieldId))
        }

        return setup
    }

    /**
     * Reset all local component parameters:
     * - collection configurations (sort, filter, group)
     * - columns configuration (visibility, width, colors, aggregation)
     * 
     * When the component's configuration is persisted into local storage,
     * it's useful to be able to reset it
     * 
     * @returns this
     */
    async resetLocalViewParameters() {
        // Reset local storage
        const storageId = "config-view-" + this.id
        localStorage.removeItem(storageId)

        // Get last version of the record that holds the config
        if (this.record) await this.record.read()

        // Reset the columns, if any
        if (this.columns) this.resetColumnsWidth()

        // Restore base component parameters (filter, sort, group...)
        this._initParameters()

        // Reload data and render
        this.collection.hasChanged = true
        await this.reload()
        return this
    }

    /**
     * Reload the component's data and re-render it
     */
    async reload() {
        if (this.columns) this._initColumns()
        await this.load()
        this._render()
    }

    /**
     * Reload the toolbar, if any
     * In the generic case, the toolbar is a set of buttons that can be hidden or shown according to its settings.
     * For now, we only manage the "create" button.
     */
    async _updateToolbar() {
        const createButton = this.querySelector("." + this.type + "-create-record")
        if (!createButton) return

        if (this.canCreateRecord === false) {
            createButton.hide()
        }
        else {
            createButton.show()
        }
    }

    /**
     * 
     * COLUMNS MANAGEMENT
     * 
     */

    /**
     * Initialize (or reset) the view columns.
     * If no config is provided, the columns are auto-generated according to the model.
     * 
     * @private
     * @ignore
     * @param {object[]} columns - Array of column configurations
     * @returns this
     */
    _initColumns(columns) {
        if (columns) {
            this.columns = columns
        } else {
            this.columns = (this.record) ? this.record.config.columns : this.config.columns
            const localConfig = this.getLocalConfig()
            if (localConfig && localConfig.config && localConfig.config.columns) this.columns = localConfig.config.columns
        }

        if (this.columns) {

            // A config is provided
            // Filters out the columns which field doesn't exist anymore in the model
            this.columns = this.columns.filter(column => {
                if (column.type == "button") return true

                const field = this.model.getField(column.id)
                if (field) {
                    return true
                }
                return false
            })

            this._appendMissingColumns()

        } else {
            // No config provided
            // Auto-configure the columns from the model
            this.columns = this.model.getFieldsAsColumns()
        }

        // Apply ACL and hide unwanted columns
        this.columns = this.columns.filter(column => {
            if (column.type == "button") return true
            if (column.type == "link" && this.config.showLinks === false) return false

            const field = this.model.getField(column.id)
            if (field && field.acl && field.acl.read === false) {
                return false
            }
            return true
        })

        return this
    }

    /**
     * Sync view columns with model fields and extra plugin fields.
     * 
     * Context: a view has a set of columns representing the model's fields.
     * Then, a plugin is enabled on the model, and this plugin adds some extra fields to the model.
     * The view columns must reflect these extra fields.
     * This function checks the missings fields and creates a new column for each missing field.
     * 
     * @private
     * @ignore
     */
    _appendMissingColumns() {
        // Adds the model fields which are not inside the saved list of columns
        const fieldIds = this.model.fields.filter(field => !field.deleted).map(field => field.id)
        const columnIds = this.columns.filter(column => !column.deleted).map(column => column.id)
        const missingIds = fieldIds.filter(item => !columnIds.includes(item))

        if (missingIds.length > 0) {
            missingIds.forEach(fieldId => {
                const field = this.model.getField(fieldId)
                if (!field.label) return

                let columnConfig = {
                    id: field.id,
                    type: this.model.getFieldType(field),
                    title: field.label
                }

                // Plugin columns
                if (field.isFromPlugin) {
                    columnConfig.isFromPlugin = true
                    columnConfig.pluginId = field.pluginId
                    columnConfig.title = txtTitleCase(field.label)
                    columnConfig.hidden = true
                }

                // System columns
                if (field.isSystem) {
                    columnConfig.isSystem = true
                    columnConfig.title = txtTitleCase(field.label)
                    columnConfig.hidden = (field.hidden === true)
                }

                this.columns.push(columnConfig)
            })
        }
    }

    /**
     * Get the view columns
     * 
     * @returns {object[]} Array of column definitions
     */
    getColumns() {
        return this.columns
    }

    /**
     * Get the view fields.
     * 
     * Note: in a some view (like datatables), fields are the same thing as columns.
     * 
     * @returns {object[]} Array of column definitions
     */
    getFields() {
        return this.columns
    }

    /**
     * Toggle one column on/off
     * 
     * @private
     * @ignore
     * @param {string} columnId - Id of the column to show/hide
     */
    _columnsToggleOne(columnId) {
        this._columnsToggle(columnId)
        this._render()
        this.updateConfig({
            config: {
                columns: this.columns
            }
        })
    }

    /**
     * Switch on / off all the columns at the same time
     * 
     * @private
     * @ignore
     * @param {string} newState - hide|show
     */
    _columnsToggleAll(newState) {
        let hidden = (newState == "hide")
        this.columns.forEach(column => this._columnsToggle(column.id, hidden))
        this._render()
        this.updateConfig({
            config: {
                columns: this.columns
            }
        })
    }

    /**
     * Toggle a column to be hidden/visible
     * 
     * @private
     * @ignore
     * @param {string} columnId - Id of the column to show/hide
     * @param {boolean} [hidden] - Force the column state to be hidden or visible
     * @returns this
     */
    _columnsToggle(columnId, hidden = null) {
        let columnIndex = this.columns.findIndex(column => column.id == columnId)
        let newState = (hidden != null) ? hidden : !this.columns[columnIndex].hidden
        this.columns[columnIndex].hidden = newState
        return this
    }

    /**
     * Check if there are hidden columns
     * 
     * @private
     * @ignore
     * @returns {boolean}
     */
    _columnsHasHiddenColumns() {
        let hasHiddenColumns = false
        this.columns.forEach(column => {
            if (column.hidden == true) hasHiddenColumns = true
        })
        return hasHiddenColumns
    }

    /**
     * Move a "source" column before /after a "target" column
     * 
     * @private
     * @ignore
     * @param {string} sourceColumnId - Source column id
     * @param {string} targetColumnId - Target column id
     * @param {string} position - "before" or "after"
     */
    async _columnsMove(sourceColumnId, targetColumnId, position) {
        let currentColumn = this.getColumn(sourceColumnId)
        let currentColumnIndex = this.columns.findIndex(column => column.id == sourceColumnId)

        let newColumns = this.columns.filter(column => column.id != currentColumn.id)
        let targetColumnIndex = newColumns.findIndex(column => column.id == targetColumnId)

        // Same position? => Exit!
        let adjustPositionIndex = (position == "before") ? 0 : 1
        if ((targetColumnIndex == -1) || (currentColumnIndex == (targetColumnIndex + adjustPositionIndex))) return

        // Update column config
        newColumns.splice(targetColumnIndex + adjustPositionIndex, 0, currentColumn)
        this.columns = newColumns

        this._render()

        await this.updateConfig({
            config: {
                columns: this.columns
            }
        })

        // Broadcast changes for local and offline, so that "dataFieldsWindow" can be updated (check dataFieldsWindow.js)
        kiss.pubsub.publish("EVT_VIEW_FIELD_MOVED:" + this.id)
    }

    /**
     * Get the column config used to display a field
     * 
     * @param {string} fieldId 
     * @returns {object} The column config
     */
    getColumn(fieldId) {
        return this.columns.find(column => column.id == fieldId)
    }

    /**
     * 
     * SELECT FIELDS, SORT, FILTER options
     * 
     */

    /**
     * Show a modal window to select / deselect fields
     * 
     * @param {number} [x] - x coordinate
     * @param {number} [Y] - y coordinate
     * @param {string} [color] - Window color, in hexa: "#00aaee"
     */
    showFieldsWindow(x, y, color = "#00aaee") {
        const selectionWindow = createDataFieldsWindow(this.id, color)
        this.selectFieldWindowId = selectionWindow.id

        if (!y || !x) {
            selectionWindow.top = () => kiss.screen.current.height / 3 - selectionWindow.offsetHeight / 2
            selectionWindow.left = () => kiss.screen.current.width / 2 - selectionWindow.offsetWidth / 2
            selectionWindow.render()
        } else {
            selectionWindow.showAt(x, y).render()
        }
    }

    /**
     * Show a modal window to sort data
     * 
     * @param {number} [x] - x coordinate
     * @param {number} [Y] - y coordinate
     * @param {string} [color] - Window color, in hexa: "#00aaee"
     */
    showSortWindow(x, y, color = "#00aaee") {
        const sortWindow = createDataSortWindow(this.id, color)
        this.sortWindowId = sortWindow.id

        if (!y || !x) {
            sortWindow.top = () => kiss.screen.current.height / 3 - sortWindow.offsetHeight / 2
            sortWindow.left = () => kiss.screen.current.width / 2 - sortWindow.offsetWidth / 2
            sortWindow.render()
        } else {
            sortWindow.render().showAt(x, y)
        }
    }

    /**
     * Show a modal window to filter data
     * 
     * @param {number} [x] - x coordinate
     * @param {number} [Y] - y coordinate
     * @param {string} [color] - Window color, in hexa: "#00aaee"
     */
    showFilterWindow(x, y, color = "#00aaee") {
        const filterWindow = createDataFilterWindow(this.id, color)
        this.filterWindowId = filterWindow.id

        if (!y || !x) {
            filterWindow.top = () => kiss.screen.current.height / 3 - filterWindow.offsetHeight / 2
            filterWindow.left = () => kiss.screen.current.width / 2 - filterWindow.offsetWidth / 2
            filterWindow.render()
        } else {
            filterWindow.render().showAt(x, y)
        }
    }

    /**
     * 
     * SEARCH MANAGEMENT
     * 
     */

    /**
     * Show the search bar
     */
    showSearchBar() {
        if (kiss.screen.isMobile) {
            return this.showMobileSearchBar()
        }

        if ($("search-bar-" + this.id)) return

        const id = this.id
        const searchButton = $("search:" + id)
        const searchButtonTop = searchButton.getBoundingClientRect().top

        this.searchBar = createPanel({
            id: "search-bar-" + id,
            title: txtTitleCase("#ftsearch title"),
            icon: "fas fa-search",
            headerBackgroundColor: this.color || "var(--background-blue)",
            draggable: true,
            closable: false,
            autoSize: true,
            opacity: 0.8,

            top: () => {
                if (!searchButton) return 0
                return searchButtonTop + 40
            },
            left: () => kiss.screen.current.width - 300,

            position: "absolute",
            width: 280,
            height: 100,
            layout: "horizontal",
            alignItems: "center",

            animation: {
                name: "zoomIn",
                speed: "faster"
            },

            items: [
                // Input field to enter search term
                {
                    id: "search-term-" + id,
                    type: "text",
                    fieldWidth: 220,
                    borderColor: "var(--body-1)",
                    autocomplete: "off",
                    events: {
                        keydown: function (event) {
                            let view = $(id)
                            if (!view) return

                            if (this.getValue() == view.currentSearchTerm) return

                            if (event.key == "Enter") {
                                view.currentSearchTerm = this.getValue()
                                view.ftsearch(view.currentSearchTerm)
                            }
                        }
                    }
                },
                // Button to close the search bar
                {
                    type: "button",
                    icon: "fas fa-times",
                    width: 30,
                    height: 30,
                    action: async () => {
                        if (this.currentSearchTerm !== undefined && this.currentSearchTerm !== "") {
                            this.skip = 0
                            await this.collection.filterBy(this.filter)
                            this.refresh()
                        }

                        this.resetSearchBar()
                    }
                }
            ],

            methods: {
                // Focus on the search term field
                _afterRender() {
                    setTimeout(() => {
                        if ($("search-term-" + id)) $("search-term-" + id).focus()
                        this.restoreSearchTerm()
                    }, 100)
                },
                restoreSearchTerm: () => {
                    if ($("search-term-" + id)) $("search-term-" + id).setValue(this.currentSearchTerm || "")
                }
            }
        }).render()
    }

    /**
     * Show the mobile search bar
     */
    showMobileSearchBar() {
        if ($("search-term-" + this.id)) return

        this.switchToSearchMode()
        const id = this.id

        this.searchBar = createBlock({
            target: "search-field:" + id,
            layout: "horizontal",
            alignItems: "center",

            animation: {
                name: "slideInLeft",
                speed: "faster"
            },

            items: [
                // Button to close the search bar
                {
                    type: "button",
                    icon: "fas fa-times",
                    width: 30,
                    height: 30,
                    action: async () => {
                        if (this.currentSearchTerm !== undefined && this.currentSearchTerm !== "") {
                            this.skip = 0
                            await this.collection.filterBy(this.filter)
                            this.refresh()
                        }

                        this.resetSearchBar()
                    }
                },
                // Input field to enter search term
                {
                    id: "search-term-" + id,
                    type: "text",
                    placeholder: txtTitleCase("search"),
                    borderColor: "var(--body-1)",
                    autocomplete: "off",
                    flex: 1,
                    fieldWidth: "100%",
                    events: {
                        keydown: function (event) {
                            let view = $(id)
                            if (!view) return

                            if (this.getValue() == view.currentSearchTerm) return

                            if (event.key == "Enter") {
                                view.currentSearchTerm = this.getValue()
                                view.ftsearch(view.currentSearchTerm)
                            }
                        }
                    },
                    methods: {
                        // Focus on the search term field
                        _afterRender() {
                            setTimeout(() => {
                                if ($("search-term-" + id)) $("search-term-" + id).focus()
                                this.restoreSearchTerm()
                            }, 100)
                        },
                        restoreSearchTerm: () => {
                            if ($("search-term-" + id)) $("search-term-" + id).setValue(this.currentSearchTerm || "")
                        }
                    }

                }
            ]
        }).render()
    }

    /**
     * Reset the search made from the search bar
     */
    hideSearchBar() {
        if (this.searchBar) {
            if (kiss.screen.isMobile)
                this.searchBar.remove()
            else
                this.searchBar.close()
        }
    }

    /**
     * Reset the search made from the search bar
     */
    resetSearchBar() {
        this.currentSearchTerm = ""
        this.hideSearchBar()
        if (this.resetSearchMode) this.resetSearchMode()
    }

    /**
     * Full-text search on all text fields
     * 
     * @param {string} value 
     */
    async ftsearch(value) {
        const model = this.model || this.collection.model
        const textFields = model.getFieldsByType(["text", "textarea", "aiTextarea", "select", "selectViewColumn", "selectViewColumns", "date", "lookup", "directory"])

        const textFilters = textFields.map(field => {
            return {
                type: "filter",
                fieldId: field.id,
                fieldLabel: field.label,
                operator: "contains",
                value
            }
        })

        const filterConfig = {
            type: "group",
            operator: "and",
            filters: [{
                    type: "group",
                    operator: "or",
                    filters: textFilters
                },
                this.filter
            ]
        }

        this.skip = 0
        await this.collection.filterBy(filterConfig)
        this.refresh()
    }

    /**
     * 
     * SELECTION MANAGEMENT
     * 
     */

    /**
     * Show a single record (passing its id)
     * 
     * @param {string} recordId - id of the record to show
     */
    async selectRecordById(recordId) {
        let record = await this.collection.findOne(recordId)
        await this.selectRecord(record)
    }

    /**
     * Show a single record
     * 
     * Important: this method must be overriden in the instanced component
     * 
     * @async
     * @param {object} record - Record to show
     */
    async selectRecord(record) {
        createNotification("kiss.ui.DataComponent - The method selectRecord(record) should be overriden when implementing a DataComponent")
    }

    /**
     * Open the form to create a new record
     * 
     * Important: this method must be overriden in the instanced component
     * 
     * @async
     * @param {object} model - Model to create the record
     */
    async createRecord(model) {
        createNotification("kiss.ui.DataComponent - The method createRecord(model) should be overriden when implementing a DataComponent")
    }

    /**
     * 
     * SELECTION MANAGEMENT
     * 
     */

    /**
     * Get the selected records
     * 
     * @returns {string[]} The list of selected record ids
     */
    getSelection() {
        this.selectedRecords = kiss.selection.get(this.id)
        return this.selectedRecords
    }

    /**
     * Get the list of selected records
     * 
     * @returns {array} Array of records
     */
    getSelectedRecords() {
        let records = []
        for (let id of this.getSelection()) records.push(this.collection.getRecord(id))
        return records
    }

    /**
     * Select / Deselect records
     */
    toggleSelection() {
        if (this._pageHasUnselectedRows()) {
            const ids = this._getVisibleIds()
            kiss.selection.insertMany(this.id, ids)
        } else {
            kiss.selection.reset(this.id)
        }
        this._renderSelectionRestore()
    }

    /**
     * Deselect records
     */
    deselectAll() {
        kiss.selection.reset(this.id)
        this._renderSelectionRestore()
    }

    /**
     * Export records as XLS or JSON
     */
    async export() {
        const exportSelection = {
            datatable: true,
            calendar: false,
            kanban: false,
            timeline: true
        }

        const canExportSelection = exportSelection[this.type]

        createPanel({
            id: "export-setup",
            title: txtTitleCase("#export view"),
            icon: "fas fa-cloud-download-alt",
            modal: true,
            closable: true,
            draggable: true,
            align: "center",
            verticalAlign: "center",
            width: 400,

            layout: "vertical",
            items: [
                // Export type
                {
                    id: "export-type",
                    label: txtTitleCase("format"),
                    labelPosition: "top",
                    type: "select",
                    value: "xls",
                    options: [{
                        label: "EXCEL",
                        color: "#55cc00",
                        value: "xls"
                    }, {
                        label: "JSON",
                        color: "#00aaee",
                        value: "json"
                    }]
                },
                // Export set (all or selection)
                {
                    hidden: !canExportSelection,
                    id: "export-set",
                    label: txtTitleCase("#export target"),
                    labelPosition: "top",
                    type: "select",
                    value: "selection",
                    options: [{
                        label: txtTitleCase("#all view records"),
                        value: "all"
                    }, {
                        label: txtTitleCase("#selected documents"),
                        value: "selection"
                    }]
                },
                // Button to export
                {
                    type: "button",
                    text: txtTitleCase("export"),
                    icon: "fas fa-bolt",
                    height: 40,
                    margin: "20px 0px 0px 0px",

                    action: async () => {
                        const exportType = $("export-type").getValue()
                        const exportSet = (canExportSelection) ? $("export-set").getValue() : "all"
                        let exportString
                        let records
                        let mimeType
                        let extension

                        // Define the set of target records (all, or a subset)
                        if (exportSet == "selection") {
                            records = await this.getSelectedRecords()
                            if (records.length == 0) return createNotification(txtTitleCase("#no selection"))
                        } else {
                            records = await this.collection.find({})
                            records = records.filter(record => record.$type != "group")
                        }

                        if (exportType == "xls") {
                            // XLS export
                            mimeType = "application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            extension = "xls"

                            const columns = this.columns.filter(column => !column.hidden && column.type != "link")
                            exportString = "<table border=1 borderColor=#cccccc><tr>"
                            exportString += columns.map(column => `<th style="background-color: #00aaee; color: #ffffff; font-size: 16px;">${column.title}</th>`).join("")
                            exportString += "<tr>"

                            for (let record of records) {
                                const data = await record.getData({
                                    convertNames: true
                                })
                                exportString += "<tr>"
                                exportString += columns.map(column => `<td>${data[column.id]}</td>`).join("")
                                exportString += "</tr>"
                            }
                            exportString += "</table>"

                        } else {
                            // JSON export
                            mimeType = "application/json"
                            extension = "json"

                            let exportRecords = []
                            for (let record of records) exportRecords.push(await record.getData({
                                useLabels: true,
                                convertNames: true,
                                includeLinks: true
                            }))
                            exportString = JSON.stringify(exportRecords)
                        }

                        // Encode data and create a download link
                        const encodedData = encodeURIComponent("\ufeff" + exportString)
                        const dataURI = `data:${mimeType};charset=utf-8,${encodedData}`
                        const sourceUrl = `<br><br><center><a href="${dataURI}" download="export.${extension}">${txtTitleCase("download file")}</a></center>`

                        createDialog({
                            type: "message",
                            title: txtTitleCase("#export view"),
                            message: txtTitleCase("#click to download") + sourceUrl,
                            noOK: true
                        })

                        $("export-setup").close()
                    }
                }
            ]
        }).render()
    }    

    /**
     * Check if the current page has unselected rows
     * 
     * @private
     * @ignore
     * @returns {boolean}
     */
    _pageHasUnselectedRows() {
        let hasUnselectedRows = false
        const rows = this.querySelectorAll("." + this.type + "-row")
        Array.from(rows).every(row => {
            if (row.classList.contains(this.type + "-row-selected")) {
                return true
            } else {
                hasUnselectedRows = true
                return false
            }
        })
        return hasUnselectedRows
    }

    /**
     * Get the list of ids of visible records
     * 
     * @private
     * @ignore
     * @returns {string[]}
     */
    _getVisibleIds() {
        const rows = this.querySelectorAll("." + this.type + "-row")
        return Array.from(rows).map(row => row.getAttribute("recordid"))
    }

    /**
     * Render the menu of actions
     * 
     * @private
     * @ignore
     */
    async _buildActionMenu() {
        let actions = []
        let buttonLeftPosition = $("actions:" + this.id).offsetLeft
        let buttonTopPosition = $("actions:" + this.id).offsetTop

        // Inject timeline specific actions
        if (this.actions.length) {
            actions = actions.concat(this.actions)
        }

        // Inject advanced actions, if any
        if (kiss.app.customActions && kiss.app.customActions.length > 0) {
            const userACL = kiss.session.getACL()

            let customActions = kiss.app.customActions.filter(action => {
                const isTargetView = action.type && action.type.includes("view") && action.viewIds && (action.viewIds.includes(this.id) || action.viewIds.includes("*"))
                const isTargetUser = kiss.tools.intersects(userACL, action.accessRead)
                return isTargetView && isTargetUser
            })

            customActions.forEach(action => {
                const menuAction = {
                    id: action.id,
                    text: action.name,
                    icon: action.icon,
                    iconColor: action.color,
                    action: () => eval(action.code)
                }
                actions.push(menuAction)
            })
        }

        createMenu({
            top: buttonTopPosition,
            left: buttonLeftPosition,
            items: actions
        }).render()
    }    
}

;