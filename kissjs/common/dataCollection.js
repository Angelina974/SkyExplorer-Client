/**
 * 
 * Represents a **Collection** of records.
 * 
 * A **Collection** is an interface to manipulate and cache a collection of records.
 * To see how a **Collection** relates to models, fields and records, please refer to the [Model documentation](kiss.data.Model.html).
 * 
 * Each **Model** has an associated default Collection to hold its records:
 * - this default Collection is instantiated (but not loaded) at the same time as the Model.
 * - it means that you can always access the records of a Model, even if you didn't explicity created a Collection for it.
 * - this default collection is accessible with: **kiss.app.collections[modelId]**, or simply **app.collections.modelId**
 * 
 * ```
 * let myCarCollection = kiss.app.collections["car"]
 * ```
 * 
 * Below is a table that shows the global flow between KissJS client and KissJS server, and the chain of methods used.
 * 
 * Here is the flow:
 * - **kiss.data.Collection** or [**kiss.data.Record**](kiss.data.RecordFactory-Record.html) calls [**kiss.db**](kiss.db.html)
 * - kiss.db points to the right db api: [**kiss.db.memory**](kiss.db.memory.html) or [**kiss.db.offline**](kiss.db.offline.html) or [**kiss.db.online**](kiss.db.online.html)
 * - if online, kiss.db perform an HTTP request using [**kiss.ajax.request**](kiss.ajax.html)
 * - the KissJS server receives the request
 * - the request is processed by the server Controller
 * - the Controller calls MongoDb api with the native MongoDb driver
 * - the Controller pass the response back to kiss.ajax.request
 * - if a database mutation has occured (CUD operations), the server Controller sends a WebSocket message to the connected clients
 * - each Collection intercepts the WebSocket message and update its records accordingly
 * - each data Component (field, datatable...) intercepts the message and updates its UI accordingly
 * 
 * Currently, database mutations must be performed at the Record level.
 * 
 * kiss.data.Collection | kiss.db | HTTP | KissJS server - Node.controller | MongoDb database
 * --- | --- | --- | --- | ---
 * find() | find | GET /modelId | find | find({})
 * find(query) | find(modelId, query) | POST /modelId :body=query | findAndSort(query) | find(query.filter).sort(query.sort)
 * findOne(recordId) | findOne(modelId, recordId) | GET /modelId/recordId | findOne | collection.findOne
 * <none> | insertOne(modelId, record) | POST /modelId :body=record | insertOne | insertOne
 * <none> | insertMany(modelId, records) | POST /modelId :body=records | insertMany | insertMany
 * <none> | updateOne(modelId, recordId, update) | PATCH /modelId/recordId :body=update | updateOne | updateOne
 * <none> | updateMany(modelId, query, updates) | PATCH /modelId/ :body=query+updates | updateMany | updateMany
 * <none> | updateBulk(modelId, updates) | PATCH /modelId/ :body=updates | updateBulk | updateBulk
 * <none> | deleteOne(modelId, recordId) | DELETE /modelId/recordId | delete | delete (performs a soft delete)
 * 
 * Technical notes about performances:
 * - KissJS collections don't contain raw data, but actual record's instances
 * - this allows to use virtual (computed) fields as normal fields, and even perform aggregations on those fields
 * - the process of instanciating a record takes a linear time which is about 0.0004ms per field for an Intel core i7-4790K
 * - for example: it take 24ms to load 5000 records with 12 fields, or 480ms to load 50000 records with 24 fields
 * 
 * @param {object} config - Collection configuration
 * @param {string} [config.mode] - "memory" | "offline" | "online"
 * @param {string} [config.id]
 * @param {object} config.model - The Model used to build the collection
 * @param {object[]} [config.records] - Records to init the collection: [{...}, {...}, ...]
 * @param {object} [config.sort] - default sort
 * @param {object} [config.filter] - default filter
 * @param {object} [config.projection] - default projection
 * @param {object} [config.group] - default grouping
 * @param {boolean} [config.groupUnwind] - Unwind allow records belonging to multiple groups to appear as multiple entries
 * @param {boolean} [config.showLoadingSpinner] - if false, doesn't show the loading spinner while retrieving data (default = true)
 * 
 * @example
 * // Register a new collection
 * let userCollection = new kiss.data.Collection({model: modelUser})
 * 
 * // Get collection records
 * let users = await userCollection.find()
 * 
 * // Create a new model and use its auto-generated collection
 * let taskModel = new kiss.data.Model({
 *  id: "YOUR_MODEL_ID",
 *  name: "task",
 *  namePlural: "tasks",
 *  items: [
 *      {id: "name", label: "Name", type: "text"},
 *      {id: "duedate", label: "Due date", type: "date"},
 *      {id: "done", label: "Done?", type: "checkbox"} // = Checkbox implicit type is "boolean"
 *  ]
 * })
 * 
 * // Create a new Record
 * let newTask = taskModel.create({name: "Task 1", duedate: "2021-03-30", done: false})
 * await newTask.save()
 * 
 * // Get the default collection for this model, then get the records
 * let tasksCollection = kiss.app.collections["YOUR_MODEL_ID"]
 * let tasks = await tasksCollection.find()
 * console.log(tasks)
 */
kiss.data.Collection = class {

    constructor(config) {
        this.id = config.id || uid()

        // Define collection's database (memory, offline, online)
        this.mode = config.mode || kiss.db.mode
        this.db = kiss.db[this.mode]

        // Define collection's model
        this.model = config.model
        this.modelId = this.model.id
        this.modelName = this.model.name

        log(`kiss.data.Collection - Defining collection ${this.id} for <${this.modelName}> in mode <${this.mode}>`)

        // The model's master collection is the default model's collection and is a proxy to access *all* its records (no filter)
        // TODO: for the "in-memory" strategy, we can cache the master collection in db.memory then use it as a local proxy source for all data components
        this.isMaster = config.isMaster || false

        // Keep a pointer to the master collection in any case
        this.masterCollection = (this.isMaster) ? this : kiss.app.collections[this.modelId]

        // Init records
        this.records = config.records || []

        // By default, records are not loaded automatically into the collection
        this.isLoaded = false
        this.showLoadingSpinner = (config.showLoadingSpinner === false) ? false : true

        // Filter sort, project, group, group unwind
        this.filter = config.filter || {}
        this.filterSyntax = config.filterSyntax || "normalized"
        this.sort = config.sort || []
        this.sortSyntax = config.sortSyntax || "normalized"
        this.projection = {}
        this.group = config.group || []
        this.groupUnwind = config.groupUnwind || false

        // 1 - Listen to database mutations (broadcasted via PubSub)
        // 2 - Update collection's records accordingly
        this.subscriptions = [
            subscribe("EVT_DB_INSERT:" + this.modelId.toUpperCase(), (msgData) => {
                if (msgData.dbMode != this.mode) return
                this._insertOne(msgData.data)
            }),

            subscribe("EVT_DB_UPDATE:" + this.modelId.toUpperCase(), (msgData) => {
                if (msgData.dbMode != this.mode) return
                this._updateOne(msgData.id, msgData.data)
            }),

            subscribe("EVT_DB_DELETE:" + this.modelId.toUpperCase(), (msgData) => {
                if (msgData.dbMode != this.mode) return
                this._deleteOne(msgData.id)
            }),

            subscribe("EVT_DB_UPDATE_BULK", (msgData) => {
                if (msgData.dbMode != this.mode) return
                msgData.data.forEach(operation => {
                    if (operation.modelId == this.modelId) {
                        this._updateOne(operation.recordId, operation.updates)
                    }
                })
            }),

            subscribe("EVT_DB_INSERT_MANY:" + this.modelId.toUpperCase(), (msgData) => {
                if (msgData.dbMode != this.mode) return
                this.find({}, true)
            }, `Collection.insertMany / Model: ${this.model.name}`),

            subscribe("EVT_DB_DELETE_MANY:" + this.modelId.toUpperCase(), (msgData) => {
                if (msgData.dbMode != this.mode) return
                this.find({}, true)
            }, `Collection.deleteMany / Model: ${this.model.name}`)
        ]

        // Hooks
        this.hooks = {
            beforeInsert: [],
            afterInsert: [],
            beforeUpdate: [],
            afterUpdate: [],
            beforeDelete: [],
            afterDelete: []
        }

        // Self-register in the kiss.app object
        kiss.app.collections[this.id] = this

        return this
    }

    /**
     * Destroy the collection.
     * 
     * It deletes the collection and also unsubscribes all its events from kiss.pubsub
     * 
     * @param {boolean} deleteInMemoryDb - If true, force to destroy the in-memory database
     * 
     */
    destroy(deleteInMemoryDb) {
        // Unsubscribe all the collection events from the PubSub
        this.subscriptions.forEach(subscriptionId => kiss.pubsub.unsubscribe(subscriptionId))

        // Delete NeDb collection if we're working with a temporary in-memory collection,
        // except if the general application mode is in-memory (it would destroy the master collection)
        if (this.mode == "memory" && kiss.db.mode != "memory" || deleteInMemoryDb) {
            this.db.deleteCollection(this.modelId)
        }

        // Unregister the collection from kiss.app
        delete kiss.app.collections[this.id]

        // Delete the Collection object
        delete this
    }

    /**
     * Set the database mode
     * 
     * @param {string} mode - memory | offline | online
     */
    setMode(mode) {
        this.mode = mode
        this.db = kiss.db[mode]
    }

    /**
     * Add a hook to perform an action before or after a mutation occurs (insert, update, delete)
     * 
     * @param {string} hookType - "beforeInsert" | "beforeUpdate" | "beforeDelete" | "afterInsert" | "afterUpdate" | "afterDelete"
     * @param {function} callback - Function to execute. It receives the following parameters: *insert(record), *update(recordId, update), *delete(recordId)
     * @returns this
     * 
     * @example
     * 
     * // It's possible to add a hook to observe a mutation
     * tasksCollection.addHook("beforeInsert", function(record) {
     *  console.log("The following record will be inserted:")
     *  console.log(record)
     * })
     * 
     * // It's possible to add multiple hooks to the same mutation
     * tasksCollection.addHook("beforeInsert", function(record) {
     *  console.log("Another function executed for the same mutation!")
     * })
     * 
     * // Input parameters of the callback depend on the mutation type
     * tasksCollection.addHook("afterUpdate", function(recordId, update) {
     *  console.log("The record has been udpated: " + recordId)
     *  console.log(update)
     * })
     * 
     * tasksCollection.addHook("afterDelete", function(recordId) {
     *  console.log("The following record has been udpated: " + recordId)
     * })
     */
    addHook(hookType, callback) {
        if (["beforeInsert", "beforeUpdate", "beforeDelete", "afterInsert", "afterUpdate", "afterDelete"].includes(hookType)) this.hooks[hookType].push(callback)
        return this
    }

    /**
     * Hooks
     * 
     * @private
     * @ignore
     */
    _hookInsert(type, record) {
        let event = type + "Insert"
        if (this.hooks[event].length != 0) {
            this.hooks[event].forEach(hook => {
                hook(record)
            })
        }
    }

    _hookUpdate(type, recordId, update) {
        let event = type + "Update"
        if (this.hooks[event].length != 0) {
            this.hooks[event].forEach(hook => {
                hook(recordId, update)
            })
        }
    }

    _hookDelete(type, recordId) {
        let event = type + "Delete"
        if (this.hooks[event].length != 0) {
            this.hooks[event].forEach(hook => {
                hook(recordId)
            })
        }
    }

    /**
     * Insert one record into the collection.
     * 
     * @private
     * @ignore
     * @param {object} record 
     */
    _insertOne(record) {
        log("kiss.data.Collection - _insertOne in collection " + this.id, 0, record)

        const existingRecord = this.records.get(record.id)
        if (existingRecord) {
            log("kiss.data.Collection - _insertOne rejected because it violates the unique constraint", 4)
            return
        }

        // Hook before
        this._hookInsert("before", record)

        const newRecord = this.model.create(record)
        this.records.push(newRecord)
        this.hasChanged = true

        // Hook after
        this._hookInsert("after", record)
    }

    /**
     * Update all the records that have a given id.
     * 
     * @private
     * @ignore
     * @param {string} recordId
     * @param {object} update - The update to apply to a record. Example: {firstName: "Bob"}
     */
    _updateOne(recordId, update) {
        // log(`kiss.data.Collection - _updateOne in collection ${this.id} / Record: ${recordId}`, 0, update)


        // Hook before
        this._hookUpdate("before", recordId, update)

        // There are 2 scenarios:
        // 1. the collection is not grouped and unwound: there is only one occurence of each record
        // 2. the collection is grouped and unwound: the same records can appear multiple times in different groups

        // Case 1: ungrouped, or grouped but not unwound
        let groupId
        if (this.groupUnwind !== true) {

            // Update the visible records
            let record = this.records.get(recordId)
            if (record) {
                Object.assign(record, update)
                groupId = record.$groupId
            }
            
            // Update the collapsed records (they are not visible and stored in cache)
            if (this.group.length > 0) {
                Object.values(this.cachedRecords).forEach(collapsedGroupRecords => {
                    let record = collapsedGroupRecords.get(recordId)
                    if (record) {
                        Object.assign(record, update)
                        groupId = record.$groupId
                    }
                })
            }
        }
        // Case 2: grouped and unwound
        else {

            // Update the visible records
            this.records.forEach(record => {
                if (record.id == recordId) Object.assign(record, update)
            })

            // Update the collapsed records (they are not visible and stored in cache)
            if (this.group.length > 0) {
                Object.values(this.cachedRecords).forEach(collapsedGroupRecords => {
                    collapsedGroupRecords.forEach(record => {
                        if (record.id == recordId) Object.assign(record, update)
                    })
                })
            }
        }

        // Update aggregation, if needed
        if (groupId) {
            this._groupUpdateAggregations(groupId)
        }

        this.hasChanged = true

        // Hook after
        this._hookUpdate("after", recordId, update)
    }

    /**
     * Delete all the records that have a specific id.
     * There can be multiple records with the same id if the view is grouped and unwound.
     * TODO: optimize process for ungrouped collections, like for _updateOne
     * 
     * @private
     * @ignore
     * @param {string} recordId
     */
    _deleteOne(recordId) {
        log("kiss.data.Collection - _deleteOne in collection " + this.id, 2)

        // Hook before
        this._hookDelete("before", recordId)

        // Delete the visible records
        this.records = this.records.filter(record => record.id != recordId)

        // Delete the collapsed records (they are not visible and stored in cache)
        if (this.group.length > 0) {
            Object.values(this.cachedRecords).forEach(collapsedGroupRecords => {
                collapsedGroupRecords = collapsedGroupRecords.filter(record => record.id != recordId)
            })
        }

        this.hasChanged = true

        // Hook after
        this._hookDelete("after", recordId)
    }

    /**
     * Insert many records in the collection
     * 
     * @async
     * @param {object[]} records - An array of records [{...}, {...}] for bulk insert
     * @returns {object[]} The array of inserted records data
     */
    async insertMany(records) {
        return await this.db.insertMany(this.modelId, records)
    }

    /**
     * Insert one record in the collection
     * 
     * @async
     * @param {object} record - A single record
     * @returns {object} The inserted record data
     */
    async insertOne(record) {
        return await this.db.insertOne(this.modelId, record)
    }

    /**
     * Update a single record in the collection
     * 
     * @async
     * @param {string} recordId
     * @param {object} update
     * @returns {object} The request's result
     */
    async updateOne(recordId, update) {
        return await this.db.updateOne(this.modelId, recordId, update)
    }

    /**
     * Delete a record from the collection
     * 
     * @async
     * @param {string} recordId
     * @param {boolean} [sendToTrash] - If true, keeps the original record in a "trash" collection
     * @returns The request's result
     */
    async deleteOne(recordId, sendToTrash) {
        return await this.db.deleteOne(this.modelId, recordId, sendToTrash)
    }

    /**
     * Update many records in a single collection
     * 
     * @async
     * @param {object} query
     * @param {object} update
     * @returns The request's result
     */
    async updateMany(query, update) {
        return await this.db.updateMany(this.modelId, query, update)
    }

    /**
     * Delete many records from a collection
     * 
     * @async
     * @param {object} query
     * @param {boolean} [sendToTrash] - If true, keeps the original record in a "trash" collection
     * @returns The request's result
     */
    async deleteMany(query, sendToTrash) {
        await this.db.deleteMany(this.modelId, query, sendToTrash)
    }

    /**
     * Insert some fake records in the collection, for testing purpose.
     * 
     * It automatically uses the model's fields to generate fake data.
     * 
     * @async
     * @param {integer} numberOfRecords - Number of fake records to insert
     * @returns {object[]} The array of inserted records data
     * 
     * @example
     * await myCollection.insertFakeRecords(100)
     */
    async insertFakeRecords(numberOfRecords) {
        return await kiss.db.insertFakeRecords(this.modelId, this.model.getFields(), numberOfRecords)
    }

    /**
     * Delete the all fake records created with the method *createFakeRecords*
     * 
     * @async
     * 
     * @example
     * await myCollection.deleteFakeRecords()
     */
    async deleteFakeRecords() {
        await kiss.db.deleteFakeRecords(this.modelId)
    }

    /**
     * Get the records matching a query.
     * 
     * Remember:
     * - without a query parameter, it returns all the records of the collection.
     * - the filter can be given as a normalized object which is easy to serialize / deserialize, or as a MongoDb query
     * - the sort can be given as a normalized object, or as a MongoDb sort
     * - in future releases of kissjs, the query syntax could be extended to "sql"
     * 
     * For more details about the query object, check the example in the [db.find()](kiss.db.html#.find) api.
     * 
     * Tech note:
     * This method is the one generating the most http traffic, because it returns a collection of records.
     * Due to the extremely loose coupling system of KissJS components, it can happen that many components
     * are requesting the same collection at the same time, without knowing it.
     * 
     * To solve this, the method is optimized to request the database only once using a combination of pubsub and Promise:
     * - the 1st call is changing the collection state "isLoading" to true
     * - because isLoading is now true, subsequent calls wait for the response of the 1st call inside a promise, which is waiting for the pubsub event "EVT_COLLECTION_LOADED"
     * - when the 1st call has a result, it broadcasts the result in the "EVT_COLLECTION_LOADED" channel, then turns the collection state "isLoading" to false
     * - when the subsequent calls receive the result in the pubsub, the promise resolves
     * 
     * @async
     * @param {object} [query] - Query object
     * @param {*} [query.filter] - The query
     * @param {string} [query.filterSyntax] - The query syntax. By default, passed as a normalized object
     * @param {*} [query.sort] - Sort fields
     * @param {string} [query.sortSyntax] - The sort syntax. By default, passed as a normalized array
     * @param {string[]} [query.group] - Array of fields to group by: ["country", "city"]
     * @param {boolean} [query.groupUnwind] - true to unwind the fields for records that belongs to multiple groups
     * @param {object} [query.projection] - {firstName: 1, lastName: 1, password: 0}
     * @param {object} [query.skip] - Number of records to skip
     * @param {object} [query.limit] - Number of records to return
     * @param {boolean} [nocache] - Force the collection to request the database instead of returning the cache
     * @param {boolean} [nospinner] - Hide the loading spinner if true
     * @returns {array} Array of records
     * 
     * @example
     * // Retrieves the records using the default or last used query parameters
     * let myRecords = await myCollection.find()
     * 
     * // Retrieves the records matching a MongoDb query
     * let myRecords = await myCollection.find({
     *  filterSyntax: "mongo", // Means we use a standard MongoDb query syntax
     *  filter: {
     *      $and: [
     *          {yearOfBirth: 1980},
     *          {country: "USA"}
     *      ]
     *  },
     *  sortSyntax: "mongo",
     *  sort: {
     *      birthDate: 1,
     *      lastName: -1
     *  },
     *  group: ["state", "city"]
     *  skip: 200,
     *  limit: 100,
     * )
     * 
     * // Retrieves the records using a normalized query
     * let myRecords = await myCollection.find({
     *  filterSyntax: "normalized",
     *  filter: {
     *      type: "group",
     *      operator: "and",
     *      filters: [
     *          {
     *              type: "filter",
     *              fieldId: "firstName",
     *              operator: "contains",
     *              value: "wilson"
     *          },
     *          {
     *              type: "filter",
     *              fieldId: "birthDate",
     *              operator: ">",
     *              value: "2020-01-01"
     *           }
     *      ]
     *  },
     *  sortSyntax: "normalized",
     *  sort: [
     *      {birthDate: "desc"},
     *      {lastName: "asc"}
     *  ],
     *  group: ["state", "city"],
     *  skip: 200,
     *  limit: 100,
     * })
     */
    async find(query = {}, nocache, nospinner) {
        let loadingId

        try {
            // If the collection records haven't changed and cache is allowed, we return its current records
            // TODO: test if the query is the same
            if (this.isLoaded && this.hasChanged == false && nocache != true) {
                log("kiss.data.Collection - find - " + this.id + " - Got data from CACHE", 2)
                return this.records
            }

            // If the collection is already loading, we wait for the loading process to finish so that we can capture its result
            // TODO: test if the query is the same
            if (this.isLoading && !this.hasChanged) {
                this.records = await new Promise((resolve, reject) => {
                    const subscriptionId = subscribe("EVT_COLLECTION_LOADED:" + this.id, (msgData) => {
                        kiss.pubsub.unsubscribe(subscriptionId)
                        resolve(msgData)
                    })
                })

                log("kiss.data.Collection - find - " + this.id + " - Got data from PUBSUB", 2)
                return this.records
            }

            log("kiss.data.Collection - find - " + this.id)
            if (this.showLoadingSpinner && nospinner != true) loadingId = kiss.loadingSpinner.show()

            this.isLoading = true
            this.isLoaded = false
            this.hasChanged = false
            this.cachedRecords = []

            // Update filter, projection, sort, group, skip, limit, normalization
            if (query.filter) this.filter = query.filter
            if (query.filterSyntax) this.filterSyntax = query.filterSyntax
            if (query.sort) this.sort = query.sort
            if (query.sortSyntax) this.sortSyntax = query.sortSyntax
            if (query.group) this.group = query.group
            if (query.groupUnwind) this.groupUnwind = query.groupUnwind
            if (query.projection) this.projection = query.projection
            if (query.skip) this.skip = query.skip
            if (query.limit) this.limit = query.limit

            let search = {
                operation: "search",
                filter: this.filter,
                filterSyntax: this.filterSyntax || "normalized",
                sort: this.sort,
                sortSyntax: this.sortSyntax || "normalized",
                group: this.group,
                groupUnwind: this.groupUnwind,
                projection: this.projection,
                skip: this.skip,
                limit: this.limit
            }

            if (this.group.length != 0) {

                // Case 1. Records are grouped by a field
                this.collapsedGroups = []
                this.groupedRecords = await this.db.find(this.modelId, search, this.mode)
                this.groupedRecords = this.groupedRecords.map(record => this.model.create(record))
                this.groupedRecords = this._groupBy(this.groupedRecords, this.group, this.groupUnwind)

                // Convert the hierarchical structure of this.groupedRecords (a Map of Maps of Maps...)
                // into a flat array where each group / sub-group is represented by a "group" row in the datatable
                this._groupBuildHierarchy()

            } else {

                // Case 2. Records are not grouped
                this.records = await this.db.find(this.modelId, search, this.mode)
                this.records = this.records.map(record => this.model.create(record))
                this.count = this.records.length
            }

            this.hasChanged = false
            this.isLoading = false
            this.isLoaded = true

            // Broadcast result to parallel queries
            publish("EVT_COLLECTION_LOADED:" + this.id, this.records)

            log("kiss.data.Collection - find - " + this.id + " - Got data from DATABASE", 2)

            if (this.showLoadingSpinner && nospinner != true) kiss.loadingSpinner.hide(loadingId)
            return this.records

        } catch (err) {
            //if (!this.records) this.records = []
            this.isLoaded = false
            this.isLoading = false
            this.hasChanged = false

            if (this.showLoadingSpinner && nospinner != true) kiss.loadingSpinner.hide(loadingId)
            return this.records
        }
    }

    /**
     * Get a single record of the collection ASYNCHRONOUSLY
     * 
     * @async
     * @param {string} recordId
     * @param {boolean} nocache - If true, doesn't use cache
     * @returns {object} The record, or false is not found
     * 
     * @example
     * const myRecord = await myCollection.findOne("Xzyww90sqxnllM38")
     */
    async findOne(recordId, nocache) {
        log(`kiss.data.Collection - findOne ${this.model.name} - ${this.id} - Record: ${recordId}`)

        let record

        if (this.isLoaded && !this.hasChanged && !nocache) {
            log(`kiss.data.Collection - returning cached record`)
            record = this.records.get(recordId)
        }

        if (!record) {
            log(`kiss.data.Collection - retrieving record from db`)

            let recordData = await this.db.findOne(this.modelId, recordId)
            if (!recordData) return false
            record = this.model.create(recordData)
        }

        return record
    }

    /**
     * Get multiple records of the collection, found by id
     * 
     * @async
     * @param {string} recordIds - ids of the records to retrieve
     * @param {object[]|object} [sort] - Sort options, as a normalized array or a Mongo object. Normalized example: [{fieldA: "asc"}, {fieldB: "desc"}]. Mongo example: {fieldA: 1, fieldB: -1}
     * @param {string} [sortSyntax] - Sort syntax: "nomalized" | "mongo". Default is normalized
     * @param {boolean} [nocache] - If true, doesn't use cache. Default is false
     * @returns {object[]} The list of records, or false is not found
     * 
     * @example
     * const myRecord = await myCollection.findOne("Xzyww90sqxnllM38")
     */
    async findById(recordIds, sort = [], sortSyntax = "normalized", nocache) {
        log(`kiss.data.Collection - findById ${this.model.name} - ${this.id} - Records: ${recordIds}`)

        let records = []
        let missingRecordIds = [...recordIds]

        if (this.isLoaded && !this.hasChanged && !nocache) {
            log(`kiss.data.Collection - returning cached records`)

            while (recordIds.length > 0) {
                let recordId = recordIds.pop()
                let record = this.records.get(recordId)

                if (record) {
                    records.push(record)
                    missingRecordIds.pop()
                }
            }

            if (missingRecordIds.length == 0) return records
        }

        if (missingRecordIds.length > 0) {
            log(`kiss.data.Collection - retrieving missing records from db`)

            let missingRecords = await this.db.findById(this.modelId, missingRecordIds, sort, sortSyntax)
            if (!missingRecords) return false

            records = records.concat(missingRecords)
            records = records.map(record => this.model.create(record))
            return records
        }
    }

    /**
     * Get a single record of the collection SYNCHRONOUSLY
     * 
     * Important: because it's a synchronous method, the collection must be loaded before using it, or it will return undefined
     * 
     * @param {string} recordId 
     * @returns {object} The record
     * 
     * @example
     * const myRecord = myCollection.getRecord("Xzyww90sqxnllM38")
     */
    getRecord(recordId) {
        return this.records.get(recordId)
    }

    /**
     * Filter the collection
     * 
     * @async
     * @param {object} filterConfig - Use MongoDb syntax
     * @returns {object[]} Array of records
     * 
     * @example
     * await myCollection.filterBy({
     *  $and: [
     *      {yearOfBirth: 1980},
     *      {country: "USA"}
     *  ]
     * })
     */
    async filterBy(filterConfig) {
        this.filter = filterConfig
        this.hasChanged = true
        await this.find()
        return this.records
    }

    /**
     * Sort the collection
     * 
     * @async
     * @param {object[]} sortConfig - Array of fields to sort by.
     * 
     * @example
     * await myCollection.sortBy(
     *  [
     *      {firstName: "asc"},
     *      {birthDate: "desc"}
     *  ]
     * )
     */
    async sortBy(sortConfig) {
        this.sort = sortConfig
        this.hasChanged = true
        await this.find()
    }

    /**
     * Set a groupBy field and reload the records
     * 
     * @async
     * @param {string[]} groupFields - Array of fields to group by.
     * 
     * @example
     * await myCollection.groupBy(["country", "city", "age"])
     */
    async groupBy(groupFields) {
        this.group = (groupFields.length != 0) ? groupFields : []
        this.hasChanged = true
        await this.find()
    }

    /**
     * Expand all groups
     */
    groupExpandAll() {
        this.collapsedGroups = []
        this.cachedRecords = {}
        this._groupBuildHierarchy()
    }

    /**
     * Collapse all groups
     */
    groupCollapseAll() {
        this.collapsedGroups = []
        this.cachedRecords = {}
        this._groupBuildHierarchy(true)
    }

    /**
     * Group the records by 1 or multiple fields
     * 
     * @private
     * @ignore
     * @param {object[]} records - Records to group
     * @param {string[]} fieldIds - Array of field ids by which records should be grouped
     * @param {boolean} groupUnwind - true to unwind fields with multiple values over multiple groups
     * @returns {Map} - Where the Map key is the field value (= group) and the Map values are the records belonging to this group
     * 
     * @note
     * We've built different functions for performance reasons.
     * Having a single function would have required to perform a test within huge loops, which costs extra processing
     */
    _groupBy(records, fieldIds, groupUnwind) {
        switch (fieldIds.length) {
            case 1:
                return this._groupBy1Field(records, fieldIds, groupUnwind)
                break
            case 2:
                return this._groupBy2Fields(records, fieldIds, groupUnwind)
                break
            case 3:
                return this._groupBy3Fields(records, fieldIds, groupUnwind)
                break
            case 4:
                return this._groupBy4Fields(records, fieldIds, groupUnwind)
                break
            case 5:
                return this._groupBy5Fields(records, fieldIds, groupUnwind)
                break
            case 6:
                return this._groupBy6Fields(records, fieldIds, groupUnwind)
                break
        }
    }

    /**
     * Group the records by 1 field.
     * TODO: USE DIFFERENT GROUPERS DEPENDING ON FIELD TYPE TO AVOID TESTING INSIDE LOOPS!!!
     * 
     * @private
     * @ignore
     * @param {object[]} records - Records to group
     * @param {string[]} fieldIds - Array of field ids by which records should be grouped
     * @param {boolean} groupUnwind - true to unwind fields with multiple values over multiple groups
     * @returns {Map} Where the Map key is the field value (= group) and the Map values are the records belonging to this group
     */
    _groupBy1Field(records, fieldIds, groupUnwind) {
        const fieldId = fieldIds[0]

        // Unwind group if the field is a multi-valued field:
        // - select field with multiple = true
        // - collaborator field with multiple = true
        // if (groupUnwind) return this._groupBy1UnwoundField(records, fieldIds)
        const groupField = this.model.getField(fieldId)
        if (groupField.multiple) {
            return this._groupBy1UnwoundField(records, fieldIds)
        }

        return records.reduce((map, record) => {
            let value = record[fieldId]

            if (Array.isArray(value)) value = value[0]
            return map.set(value, [...map.get(value) || [], record])
        }, new Map())
    }

    /**
     * Virtualize a record to be able to assign it multiple $groupId values.
     * This is used only for the purpose of aggregations on multi-values fields
     * 
     * @private
     * @ignore
     * @param {object} record 
     * @returns The proxified record
     */
    _proxifier(record) {
        let groupId = null
        return new Proxy(record, {
            set(target, prop, value) {
                if (prop == "$groupId") {
                    groupId = value
                    return true
                }
                target[prop] = value
                return true
            },
            get(target, prop) {
                if (prop == "$groupId") return groupId
                else return target[prop]
            }
        })
    }

    /**
     * Group the records by 1 field
     * + unwind fields with multiple values
     * 
     * @private
     * @ignore
     * @param {object[]} records - Records to group
     * @param {string[]} fieldIds - Array of field ids by which records should be grouped
     */
    _groupBy1UnwoundField(records, fieldIds) {
        const fieldId = fieldIds[0]

        return records.reduce((map, record) => {
            [].concat(record[fieldId])
                .forEach(value => {
                    map.set(value, [...map.get(value) || [], this._proxifier(record)]) // Build & feed a new category per unwound value
                })
            return map
        }, new Map())
    }

    /**
     * Group the records by 2 fields.
     * 
     * @private
     * @ignore
     * @param {*} records - Records to group
     * @param {string[]} fieldIds - Array of field ids by which records should be grouped
     * @returns {Map} Where the Map key is the field value (= group) and the Map values are the records belonging to this group
     */
    _groupBy2Fields(records, fieldIds) {
        let map = new Map()

        records.forEach(record => {
            let groupLevel1 = record[fieldIds[0]]
            if (Array.isArray(groupLevel1)) groupLevel1 = groupLevel1[0]

            let groupLevel2 = record[fieldIds[1]]
            if (Array.isArray(groupLevel2)) groupLevel2 = groupLevel2[0]

            if (!map.get(groupLevel1)) map.set(groupLevel1, new Map())
            map.get(groupLevel1).set(groupLevel2, [...map.get(groupLevel1).get(groupLevel2) || [], record])
        })
        return map
    }

    /**
     * Group the records by 3 fields.
     * 
     * @private
     * @ignore
     * @param {*} records - Records to group
     * @param {string[]} fieldIds - Array of field ids by which records should be grouped
     * @returns {Map} Where the Map key is the field value (= group) and the Map values are the records belonging to this group
     */
    _groupBy3Fields(records, fieldIds) {
        let map = new Map()

        records.forEach(record => {
            let groupLevel1 = record[fieldIds[0]]
            if (Array.isArray(groupLevel1)) groupLevel1 = groupLevel1[0]

            let groupLevel2 = record[fieldIds[1]]
            if (Array.isArray(groupLevel2)) groupLevel2 = groupLevel2[0]

            let groupLevel3 = record[fieldIds[2]]
            if (Array.isArray(groupLevel3)) groupLevel3 = groupLevel3[0]

            if (!map.get(groupLevel1)) map.set(groupLevel1, new Map())
            if (!map.get(groupLevel1).get(groupLevel2)) map.get(groupLevel1).set(groupLevel2, new Map())
            map.get(groupLevel1).get(groupLevel2).set(groupLevel3, [...map.get(groupLevel1).get(groupLevel2).get(groupLevel3) || [], record])
        })
        return map
    }

    /**
     * Group the records by 4 fields.
     * 
     * @private
     * @ignore
     * @param {*} records - Records to group
     * @param {string[]} fieldIds - Array of field ids by which records should be grouped
     * @returns {Map} Where the Map key is the field value (= group) and the Map values are the records belonging to this group
     */
    _groupBy4Fields(records, fieldIds) {
        let map = new Map()

        records.forEach(record => {
            let groupLevel1 = record[fieldIds[0]]
            if (Array.isArray(groupLevel1)) groupLevel1 = groupLevel1[0]

            let groupLevel2 = record[fieldIds[1]]
            if (Array.isArray(groupLevel2)) groupLevel2 = groupLevel2[0]

            let groupLevel3 = record[fieldIds[2]]
            if (Array.isArray(groupLevel3)) groupLevel3 = groupLevel3[0]

            let groupLevel4 = record[fieldIds[3]]
            if (Array.isArray(groupLevel4)) groupLevel4 = groupLevel4[0]

            if (!map.get(groupLevel1)) map.set(groupLevel1, new Map())
            if (!map.get(groupLevel1).get(groupLevel2)) map.get(groupLevel1).set(groupLevel2, new Map())
            if (!map.get(groupLevel1).get(groupLevel2).get(groupLevel3)) map.get(groupLevel1).get(groupLevel2).set(groupLevel3, new Map())
            map.get(groupLevel1).get(groupLevel2).get(groupLevel3).set(groupLevel4, [...map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4) || [], record])
        })
        return map
    }

    /**
     * Group the records by 5 fields.
     * 
     * @private
     * @ignore
     * @param {*} records - Records to group
     * @param {string[]} fieldIds - Array of field ids by which records should be grouped
     * @returns {Map} Where the Map key is the field value (= group) and the Map values are the records belonging to this group
     */
    _groupBy5Fields(records, fieldIds) {
        let map = new Map()

        records.forEach(record => {
            let groupLevel1 = record[fieldIds[0]]
            if (Array.isArray(groupLevel1)) groupLevel1 = groupLevel1[0]

            let groupLevel2 = record[fieldIds[1]]
            if (Array.isArray(groupLevel2)) groupLevel2 = groupLevel2[0]

            let groupLevel3 = record[fieldIds[2]]
            if (Array.isArray(groupLevel3)) groupLevel3 = groupLevel3[0]

            let groupLevel4 = record[fieldIds[3]]
            if (Array.isArray(groupLevel4)) groupLevel4 = groupLevel4[0]

            let groupLevel5 = record[fieldIds[4]]
            if (Array.isArray(groupLevel5)) groupLevel5 = groupLevel5[0]

            if (!map.get(groupLevel1)) map.set(groupLevel1, new Map())
            if (!map.get(groupLevel1).get(groupLevel2)) map.get(groupLevel1).set(groupLevel2, new Map())
            if (!map.get(groupLevel1).get(groupLevel2).get(groupLevel3)) map.get(groupLevel1).get(groupLevel2).set(groupLevel3, new Map())
            if (!map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4)) map.get(groupLevel1).get(groupLevel2).get(groupLevel3).set(groupLevel4, new Map())
            map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4).set(groupLevel5, [...map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4).get(groupLevel5) || [], record])
        })
        return map
    }

    /**
     * Group the records by 6 fields.
     * 
     * @private
     * @ignore
     * @param {*} records - Records to group
     * @param {string[]} fieldIds - Array of field ids by which records should be grouped
     * @returns {Map} Where the Map key is the field value (= group) and the Map values are the records belonging to this group
     */
    _groupBy6Fields(records, fieldIds) {
        let map = new Map()

        records.forEach(record => {
            let groupLevel1 = record[fieldIds[0]]
            if (Array.isArray(groupLevel1)) groupLevel1 = groupLevel1[0]

            let groupLevel2 = record[fieldIds[1]]
            if (Array.isArray(groupLevel2)) groupLevel2 = groupLevel2[0]

            let groupLevel3 = record[fieldIds[2]]
            if (Array.isArray(groupLevel3)) groupLevel3 = groupLevel3[0]

            let groupLevel4 = record[fieldIds[3]]
            if (Array.isArray(groupLevel4)) groupLevel4 = groupLevel4[0]

            let groupLevel5 = record[fieldIds[4]]
            if (Array.isArray(groupLevel5)) groupLevel5 = groupLevel5[0]

            let groupLevel6 = record[fieldIds[5]]
            if (Array.isArray(groupLevel6)) groupLevel6 = groupLevel6[0]

            if (!map.get(groupLevel1)) map.set(groupLevel1, new Map())
            if (!map.get(groupLevel1).get(groupLevel2)) map.get(groupLevel1).set(groupLevel2, new Map())
            if (!map.get(groupLevel1).get(groupLevel2).get(groupLevel3)) map.get(groupLevel1).get(groupLevel2).set(groupLevel3, new Map())
            if (!map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4)) map.get(groupLevel1).get(groupLevel2).get(groupLevel3).set(groupLevel4, new Map())
            if (!map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4).get(groupLevel5)) map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4).set(groupLevel5, new Map())
            map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4).get(groupLevel5).set(groupLevel6, [...map.get(groupLevel1).get(groupLevel2).get(groupLevel3).get(groupLevel4).get(groupLevel5).get(groupLevel6) || [], record])
        })
        return map
    }

    /**
     * Organize records grouped by a list of fields.
     * Each group is reduced to a single Map object which <key> is the value of the grouped field, and <values> are the records of the group.
     * For multi-level nested group, the values of intermediate levels are arrays of Maps, and only the last level holds the records.
     * 
     * @private
     * @ignore
     * @param {boolean} collapsed - Indicates wether the hierarchy of groups should be collapsed or expanded
     */
    _groupBuildHierarchy(collapsed) {
        this.records = []
        this.recordIndex = 0

        // Get the list of <number> fields
        // Those fields will be aggregated automatically
        this.numberFields = this.model.getFields().filter(field => kiss.tools.isNumericField(field))

        // Initiate the group level index
        // It's a n dimension array where each position corresponds to a depth into the hierarchy of groups
        // Example: [2,4] represents the fourth group within the second group.
        this.levelIndex = []

        // Start the analysis
        this._groupParse(this.groupedRecords, {}, 0, collapsed)
        this.count = this.records.length
    }

    /**
     * TODO: Work in progress for real-time update of aggregations
     * Recompute aggregations (sum, average...) for a group and its parent
     * @private
     * @ignore
     * @param {string} groupId 
     */
    _groupUpdateAggregations(groupId) {
        // log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! --> " + groupId)
        
        const numberFieldIds = this.numberFields.map(field => field.id)
        const groups = this.records.filter(record => record.$type == "group")
        const visibleRecords = this.records.filter(record => record.$groupId == groupId)
        // log(this.cachedRecords)
        // const hiddenRecords = this.cachedRecords[groupId].filter(record => record.$groupId == groupId)

        // log(visibleRecords)
        // log(hiddenRecords)

        // log(this.groupedRecords)
        // log(groupId)

        groups.forEach(group => {

            // log(group)
            // const groupRecords = this.groupedRecords.get(groupId)


            numberFieldIds.forEach(fieldId => {
                // log(">>>>>>>" + fieldId)
                // log(group[fieldId])
            })
        })
    }

    /**
     * Analyzes a data group and does a few things:
     * - injects a "group" record into the dataset (this will allow the view to render it differently compared to normal records)
     * - generates a groupId (example: 2.1.3) to keep track of the group into the source dataset (this.groupedRecords)
     * - computes the number of records within the group
     * - performs aggregations for number fields
     * - calls itself recursively to manage nested groups
     * 
     * @private
     * @ignore
     * @param {Map} group - Map where each key represents a group of records
     * @param {object} parentGroupData - Data representing the group, and injected as a "fake" record into the dataset
     * @param {number} groupLevel - 0-based group depth
     * @param {boolean} collapsed - If true, the records of the group are not injected into the dataset, but rather hold in a cache used when expanding the group
     */
    _groupParse(group, parentGroupData, groupLevel, collapsed) {
        this.levelIndex[groupLevel] = 0

        group.forEach((subgroup, key, map) => {

            // Compute the groupId, which is simply its level in the hierarchy. Examples: 7, or 6.5, or 4.3.2.1
            this.levelIndex[groupLevel] += 1
            const groupId = this.levelIndex.slice(0, groupLevel + 1).join(".")

            // Populate the groupId into the source dataset
            group.get(key).groupId = groupId

            // Add a "group" record into the dataset
            const subGroupData = {
                $type: "group",
                $groupLevel: groupLevel,
                $groupId: groupId,
                $size: subgroup.length,
                $name: key
            }

            if (!collapsed || groupLevel == 0) {
                this.records.push(subGroupData)
            } else {
                // If the group is collapsed (and not level 0), we put its data in cache instead of inserting it into the datatable
                this.cachedRecords[parentGroupData.$groupId] = (this.cachedRecords[parentGroupData.$groupId] || []).concat(subGroupData)
            }

            if (collapsed) this.collapsedGroups.push(groupId)

            if (subgroup instanceof Map) {
                // If the group is a Map,
                // it means it's a sub-group in the aggregation.

                // We parse this subgroup recursively
                const deeperSubGroup = this._groupParse(subgroup, subGroupData, groupLevel + 1, collapsed)

                // Compute the number of records for this group
                parentGroupData.$size = (parentGroupData.$size || 0) + deeperSubGroup.$size

                // Perform aggregations for number fields
                this.numberFields.forEach(field => {
                    const parentSum = (parentGroupData[field.id]) ? (parentGroupData[field.id].sum || 0) + deeperSubGroup[field.id].sum : deeperSubGroup[field.id].sum
                    parentGroupData[field.id] = {
                        sum: parentSum,
                        avg: parentSum / parentGroupData.$size
                    }
                })

            } else {
                // ...else, the group is an Array,
                // which means we've reach the last level in the hierarchy, and group items are records.

                // Compute the number of records for this group
                parentGroupData.$size = (parentGroupData.$size || 0) + subgroup.length

                // Perform aggregations for number fields
                this.numberFields.forEach(field => {
                    const sum = subgroup.reduce((sum, record) => {
                        return sum + (Number(record[field.id]) || 0)
                    }, 0)

                    subGroupData[field.id] = {
                        sum,
                        avg: sum / subgroup.length
                    }

                    const parentSum = (parentGroupData[field.id]) ? (parentGroupData[field.id].sum || 0) + sum : sum
                    parentGroupData[field.id] = {
                        sum: parentSum,
                        avg: parentSum / parentGroupData.$size
                    }
                })

                // Assign the groupId to all records belonging to this group
                subgroup.forEach(record => {
                    record.$groupId = groupId + "."
                    record.$index = this.recordIndex++

                    // subGroupData.$index = (subGroupData.$index || []).concat(record)
                })

                if (!collapsed) {
                    this.records.push(...subgroup)
                } else {
                    // If the group is collapsed, we put its data in cache instead of inserting it into the datatable
                    this.cachedRecords[groupId] = subgroup
                }
            }
        })
        return parentGroupData
    }

    /**
     * Expand a group.
     * 
     * Internally, it retrieves all the hidden records which are hold in cache, and reinjects them in the list of records.
     * 
     * @param {string} groupId - Id of the group to expand/collapse. Example: 3.10.7
     * @param {number} rowIndex - Index of the group row into the datatable
     */
    groupExpand(groupId, rowIndex) {
        this.collapsedGroups.remove(groupId)

        // Re-insert the records of the group, at the right row index
        let recordsToInsert = this.cachedRecords[groupId]
        this.records.splice(Number(rowIndex) + 1, 0, ...recordsToInsert)

        // Re-compute record indexes
        let index = 0
        this.records.forEach(record => {
            if (record.$type != "group") record.$index = index++
        })

        this.count = this.records.length
    }

    /**
     * Collapse a group.
     * 
     * Internally, it does 2 things:
     * - builds a new dataset without the collapsed records
     * - stores in cache the records that are excluded from the dataset, to use them when expanding the group again
     * 
     * @param {string} groupId - Id of the group to expand/collapse. Example: 3.10.7
     */
    groupCollapse(groupId) {
        let recordsKept = []
        let recordsCached = []
        let groupIdToSearch = groupId + "."

        this.records.forEach(record => {
            if (!(record.$groupId.startsWith(groupIdToSearch))) {
                // Records to keep
                recordsKept.push(record)
            } else {
                // Records to exclude and cache
                recordsCached.push(record)
            }
        })
        this.records = recordsKept
        this.cachedRecords[groupId] = recordsCached

        // Re-compute the visible records indexes
        let index = 0
        this.records.forEach(record => {
            if (record.$type != "group") record.$index = index++
        })
        this.count = this.records.length

        // Keep track of the collapsed group
        this.collapsedGroups.push(groupId)
    }
}

;