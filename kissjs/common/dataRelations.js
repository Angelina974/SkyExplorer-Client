/**
 * 
 * kiss.relations
 * 
 * This module handles the relationships between models inside a NoSQL environment.
 * 
 * Context:
 * 
 * In modern applications, we are used to update the database as soon as a single field is modified.
 * It brings a better user experience than filling a bunch of fields then click on a "Save" button.
 * It also prevents too much data from being lost in case of a crash when a user is filling tons of data.
 * 
 * Problem:
 * 
 * In NoSQL, databases are denormalized: data is redundant accross records.
 * When the field's value of a record depends on foreign records, we need some logic to keep data in sync between records.
 * 
 * To keep things simple, we will say that some fields can be a "source" for other fields.
 * We simply call them: "source fields".
 * When a source field is updated, we need to update all the fields that depends on this source.
 * 
 * In business applications, we have identified 2 common scenarios:
 * - **lookup** fields:
 *   A lookup field takes its value inside another field of a foreign record.
 *   When the value of the foreign source field is updated, the lookup field must be updated too.
 * 
 * - **summary** fields:
 *   A summary field summarizes (aggregates) data of multiple foreign records.
 *   When the value of a single foreign source field is updated, the summary field must re-compute the whole aggregation
 * 
 * Solution:
 * 
 * When a field is updated, we track all the mutations that are triggered:
 * 1. inside the same record (because of computed fields)
 * 2. inside foreign records (because of the relationships between records, defined by special "link" records)
 * 
 * To fit all possible scenarios (1-1, 1-N, N-N), KissJS manage all relations as N-N.
 * The links are maintained in a single external table: the "link" table.
 * 
 * When a **lookup** field or a **summary** field needs to be computed, the process is:
 * - search for the foreign records (thanks to the **link** fields of the record)
 * - get data from foreign records
 * - compute the new field value, but **do not** update the field immediately
 * - instead, add the upcoming change to a transaction
 * 
 * Because a field change can trigger a chain reaction over other computed fields,
 * the process is called recursively until there is no more field to update.
 * 
 * At each cycle, the change is added to the transaction.
 * At the end, the transaction is processed, performing all required database mutations at once.
 * 
 * To boost performances, an architectural choice was to load every links into cache,
 * amd maintain this cache each time a link is added or removed.
 * For bigger applications with tens of thousands of records and links,
 * this choice might need some optimization process.
 * 
 */
kiss.data.relations = {
    /**
     * Connect 2 models together by adding a LINK field on each side.
     * 
     * @param {string} modelIdA 
     * @param {string} modelIdB 
     * @param {string} cardinality - "11" | "1N" | "N1" | "NN"
     */
    async connectModels(modelIdA, modelIdB, cardinality) {
        const modelA = kiss.app.models[modelIdA]
        const modelB = kiss.app.models[modelIdB]

        // Prepare link fields
        const linkIdA = kiss.tools.shortUid()
        const linkIdB = kiss.tools.shortUid()
        const cardinalityA = cardinality[0]
        const cardinalityB = cardinality[1]

        let linkFieldA = {
            id: linkIdA,
            type: "link",
            label: (cardinalityB == "N") ? modelB.namePlural : modelB.name,
            multiple: (cardinalityB == "N") ? true : false,
            link: {
                modelId: modelIdB,
                fieldId: linkIdB
            }
        }

        let linkFieldB = {
            id: linkIdB,
            type: "link",
            label: (cardinalityA == "N") ? modelA.namePlural : modelA.name,
            multiple: (cardinalityA == "N") ? true : false,
            link: {
                modelId: modelIdA,
                fieldId: linkIdA
            }
        }

        // Check if models already have connections together
        const modelAlinks = modelA.getFieldsByType("link")
        const modelBlinks = modelB.getFieldsByType("link")

        linkAtoB = []
        modelAlinks.forEach(field => {
            if (field.link.modelId == modelB.id) linkAtoB.push(field)
        })

        linkBtoA = []
        modelBlinks.forEach(field => {
            if (field.link.modelId == modelA.id) linkBtoA.push(field)
        })

        // Set operations to link the 2 models
        let AhasLinkToB = (linkAtoB.length > 0)
        let BhasLinkToA = (linkBtoA.length > 0)

        if (AhasLinkToB) {
            linkFieldA = linkAtoB[0]
            linkFieldA.label = (cardinalityB == "N") ? modelB.namePlural : modelB.name
            linkFieldA.multiple = (cardinalityB == "N") ? true : false
        }

        if (BhasLinkToA) {
            linkFieldB = linkBtoA[0]
            linkFieldB.label = (cardinalityA == "N") ? modelA.namePlural : modelA.name
            linkFieldB.multiple = (cardinalityA == "N") ? true : false
        }

        await Promise.all([
            (AhasLinkToB) ? modelA.updateField(linkFieldA.id, linkFieldA) : modelA.addField(linkFieldA),
            (BhasLinkToA) ? modelB.updateField(linkFieldB.id, linkFieldB) : modelB.addField(linkFieldB)
        ])
    },

    /**
     * Update relationships of a model
     * 
     * @param {string} modelId 
     */
    update(modelId) {
        const model = kiss.app.models[modelId]
        if (model) {
            model._defineRelationships()
            log("kiss.data.relations - Building relationships for model " + model.name)
        }
    },

    /**
     * Update a single field or all fields of a record, and propagate the changes:
     * - to the computed fields of the same records
     * - to the **lookup** and **summary** fields of foreign records
     * 
     * All the database mutations are processed inside a single transaction
     * 
     * @param {object} model 
     * @param {object} record 
     * @param {string} [update] - If not specified, update all fields
     * @param {string} userId - user who updated the record
     * @returns The transaction result
     */
    async updateOneDeep(model, record, update, userId) {
        // Prepare temp cache
        const cacheId = kiss.tools.uid()
        kiss.cache[cacheId] = {}
        kiss.cache[cacheId].deletedRecords = []

        try {
            const transaction = new kiss.data.Transaction({
                userId
            })

            await kiss.data.relations.computeTransactionToUpdate(model, record, update, transaction, cacheId)
            const operations = await transaction.process()

            // Clear cache
            delete kiss.cache[cacheId]

            return operations

        } catch (err) {
            log.err("kiss.dataRelations - updateOneDeep - Error:", err)
            return []
        }
    },

    /**
     * Re-compute computed fields on a selection of records of a collection.
     * 
     * Note: this is used when updating data from an XLS or a CSV file.
     * 
     * @param {string} modelId
     * @param {string[]} ids - ids of the records to update
     * @returns The transaction result
     */
    async updateManyDeep(modelId, ids) {
        try {
            const model = kiss.app.models[modelId]
            const transaction = new kiss.data.Transaction()
            const records = await kiss.db.findById(modelId, ids)

            const cacheId = "cache-" + kiss.tools.uid()
            await kiss.data.relations.buildCache(cacheId, modelId, records)

            for (const record of records) {
                await kiss.data.relations.computeTransactionToUpdate(model, record, null, transaction, cacheId)
            }

            const operations = await transaction.process()

            // Clear cache
            delete kiss.cache[cacheId]

            return operations

        } catch (err) {
            log.err("kiss.dataRelations - updateManyDeep - Error:", err)
            return []
        }
    },

    /**
     * Re-compute computed fields on all records of a collection.
     * 
     * Note: this is used when changing a computed field formula.
     * 
     * @param {string} modelId
     * @returns The transaction result
     */
    async updateAllDeep(modelId) {
        try {
            const model = kiss.app.models[modelId]
            const transaction = new kiss.data.Transaction()
            const records = await kiss.db.find(modelId, {})

            const cacheId = "cache-" + kiss.tools.uid()
            await kiss.data.relations.buildCache(cacheId, modelId, records)

            for (const record of records) {
                await kiss.data.relations.computeTransactionToUpdate(model, record, null, transaction, cacheId)
            }

            const operations = await transaction.process()

            // Clear cache
            delete kiss.cache[cacheId]

            return operations

        } catch (err) {
            log.err("kiss.dataRelations - updateAllDeep - Error:", err)
            return []
        }
    },

    /**
     * Build a cache of a set of records used for updateAllDeep and updateManyDeep operations.
     * Without pre-caching, these operations would trigger a HUGE number of database requests.
     * 
     * @param {string} cacheId 
     * @param {string} modelId 
     */
    async buildCache(cacheId, modelId) {
        kiss.cache[cacheId] = {}
        kiss.cache[cacheId].deletedRecords = []

        // Whatever happen, we need to clear this cache at some time
        setTimeout(() => {
            log.ack("kiss.data.relations - Cleaning cache " + cacheId)
            delete kiss.cache[cacheId]
        }, 60 * 1000)

        if (!cacheId.startsWith("cache")) return

        const model = kiss.app.models[modelId]
        console.log("kiss.data.relations - Building cache for relationships of model: " + model.name)

        const accountId = model.accountId
        const modelsToExplore = Object.values(kiss.app.models).filter(model => model.accountId == accountId)
        const connectedModelsToCache = kiss.data.relations.getConnectedModels(modelId, modelsToExplore, [model.id])
        const modelsToCache = [model].concat(connectedModelsToCache)

        let count = 0

        for (let modelToCache of modelsToCache) {
            kiss.cache[cacheId][modelToCache.id] = {}
            const records = await kiss.db.find(modelToCache.id, {})
            records.forEach(record => {
                count++
                kiss.cache[cacheId][modelToCache.id][record.id] = record
            })
        }

        console.log(`kiss.data.cache - ${count} records cached from ${modelsToCache.length} collections:`)
        modelsToCache.forEach(model => {
            console.log(`kiss.data.cache - ${model.name} - ${Object.keys(kiss.cache[cacheId][model.id]).length} records`)
        })
    },

    /**
     * Get all the models connected to a model
     */
    getConnectedModels(modelId, modelsToExplore, exploredModels) {
        let connectedModels = modelsToExplore.filter(model => !exploredModels.includes(model.id) && model.sourceFor && model.sourceFor.includes(modelId))
        if (connectedModels.length == 0) return []

        exploredModels = exploredModels.concat(connectedModels.map(model => model.id))

        for (let connectedModel of connectedModels) {
            let deeperModels = kiss.data.relations.getConnectedModels(connectedModel.id, modelsToExplore, exploredModels)
            connectedModels = connectedModels.concat(deeperModels)
        }

        return connectedModels
    },

    /**
     * !NOT USED AT THE MOMENT, TOO CPU INTENSIVE
     * Build a cache exploring the links between records
     */
    async buildSmartCache(cacheId, modelId, records) {
        kiss.cache[cacheId] = {}
        kiss.cache[cacheId].deletedRecords = []

        // Whatever happen, we need to clear this cache at some time
        setTimeout(() => {
            if (kiss.cache[cacheId]) {
                log("kiss.data.relations - Cleaning cache " + cacheId)
                delete kiss.cache[cacheId]
            }
        }, 60 * 1000)

        if (!cacheId.startsWith("cache")) return

        // Expore all links of all records
        let links = []
        let exploredNodes = []

        for (const record of records) {
            const recordLinks = kiss.data.relations.getRelationTree(modelId, record.id, exploredNodes)
            links = links.concat(recordLinks)
            exploredNodes = links.map(link => link.recordId).unique()
        }

        // Group links by model
        const linksByModel = links.reduce((map, link) => {
            map[link.modelId] = map[link.modelId] || {}
            map[link.modelId][link.recordId] = 0
            return map
        }, {})

        // Retrieve all the records we must cache from db
        for (modelId of Object.keys(linksByModel)) {
            if (kiss.app.models[modelId]) {
                const cachedRecords = await kiss.db.findById(modelId, Object.keys(linksByModel[modelId]))
                kiss.cache[cacheId][modelId] = {}
                cachedRecords.forEach(record => {
                    kiss.cache[cacheId][modelId][record.id] = record
                })
            }
        }

        console.log("kiss.data.relations - Explored links: " + links.length)
        console.log("kiss.data.relations - Unique links: " + links.map(link => link.recordId).unique().length)
    },

    /**
     * !NOT USED AT THE MOMENT, TOO CPU INTENSIVE
     * Get the tree of all relations of a record
     * 
     * @param {string} modelId 
     * @param {string} recordId 
     * @param {string[]} exploredNodes 
     * @param {number} depth 
     * @returns {object[]} Array of links
     */
    getRelationTree(modelId, recordId, exploredNodes = [], depth = 0) {
        const model = kiss.app.models[modelId]
        if (!model) return []

        exploredNodes.push(recordId)
        let nodeLinks = kiss.data.relations.getLinks(modelId, recordId)

        nodeLinks = nodeLinks.filter(link => {
            const foreignModel = kiss.app.models[link.modelId]
            if (!foreignModel) return false
            return !exploredNodes.includes(link.recordId) && foreignModel.sourceFor.includes(modelId)
        })

        let allLinks = []

        for (link of nodeLinks) {
            exploredNodes.push(link.recordId)
            const foreignLinks = kiss.data.relations.getRelationTree(link.modelId, link.recordId, exploredNodes, exploredLinks, depth)
            exploredNodes = exploredNodes.concat(foreignLinks.map(foreignLink => foreignLink.recordId))
            allLinks = allLinks.concat(foreignLinks)
        }

        allLinks = allLinks
            .concat(nodeLinks)
            .concat({
                modelId,
                recordId
            })
        return allLinks
    },

    /**
     * Re-compute computed fields on 2 records connected by a link.
     * 
     * Note: this is used when linking / unlinking records together.
     * 
     * @param {object} linkRecord
     * @param {string} userId - user who linked / unlinked the records
     * @returns The transaction result
     */
    async updateLink(linkRecord, userId) {
        let recordX
        let recordY

        const {
            id,
            mX,
            rX,
            fX,
            mY,
            rY,
            fY
        } = linkRecord

        const modelX = kiss.app.models[mX]
        const modelY = kiss.app.models[mY]

        if (kiss.isServer) {
            recordX = await kiss.db.findOne(mX, {
                _id: rX
            })
            recordY = await kiss.db.findOne(mY, {
                _id: rY
            })
        } else {
            recordX = await kiss.db.findOne(mX, rX)
            recordY = await kiss.db.findOne(mY, rY)
        }

        // Temp cache
        const cacheId = kiss.tools.uid()
        kiss.cache[cacheId] = {}
        kiss.cache[cacheId].deletedRecords = []

        const transaction = new kiss.data.Transaction({
            userId
        })
        await kiss.data.relations.computeTransactionToUpdate(modelX, recordX, null, transaction, cacheId)
        await kiss.data.relations.computeTransactionToUpdate(modelY, recordY, null, transaction, cacheId)
        const operations = await transaction.process()

        // Clear cache
        delete kiss.cache[cacheId]

        return operations
    },

    /**
     * Update all the foreign records of a given record
     * 
     * @param {string} modelId 
     * @param {string} recordId 
     * @returns The transaction result
     */
    async updateForeignRecords(modelId, recordId) {
        // Prepare temp cache
        const cacheId = kiss.tools.uid()
        kiss.cache[cacheId] = {}
        kiss.cache[cacheId].deletedRecords = []

        const transaction = new kiss.data.Transaction()
        await kiss.data.relations.computeTransactionToUpdateForeignRecords(modelId, recordId, transaction, cacheId)
        const operations = await transaction.process()

        // Clear cache
        delete kiss.cache[cacheId]

        return operations
    },

    /**
     * Update all the foreign records of multiple records.
     * Currently used by deleteMany operation, which can trigger multiple mutations on foreign records
     * 
     * @param {string} modelId 
     * @param {string[]} ids
     * @returns The transaction result
     */
    async updateForeignRecordsForMultipleRecords(modelId, ids) {
        // Prepare temp cache
        const cacheId = kiss.tools.uid()
        kiss.cache[cacheId] = {}
        kiss.cache[cacheId].deletedRecords = []

        const transaction = new kiss.data.Transaction()
        for (recordId of ids) {
            await kiss.data.relations.computeTransactionToUpdateForeignRecords(modelId, recordId, transaction, cacheId)
        }
        const operations = await transaction.process()

        // Clear cache
        delete kiss.cache[cacheId]

        return operations
    },

    /**
     * Compute the transaction to update all the foreign records linked to a specific record
     * 
     * @param {object} modelId
     * @param {object} recordId
     */
    async computeTransactionToUpdateForeignRecords(modelId, recordId, transaction, cacheId) {
        const model = kiss.app.models[modelId]
        const linkFields = model.fields.filter(field => field.type == "link")

        // For each "link" fields...
        for (const linkField of linkFields) {
            const foreignModel = kiss.app.models[linkField.link.modelId]

            // ... get the foreign records given by this "link" field
            const foreignRecords = await kiss.data.relations.getLinkedRecordsFrom(modelId, recordId, linkField.id, transaction, cacheId)

            for (const foreignRecord of foreignRecords) {
                await kiss.data.relations.computeTransactionToUpdate(foreignModel, foreignRecord, null, transaction, cacheId)
            }
        }
    },

    /**
     * Compute the transaction to update a record with its relationships
     * 
     * The method is recursive: for each update, it re-checks which computed fields is impacted by the new change.
     * This method does **not** update the fields, but only returns the changes to apply to the record.
     * All the field updates are performed later in a single transaction.
     * 
     * @param {object} model
     * @param {object} record 
     * @param {string} [update]
     * @param {object} transaction 
     */
    async computeTransactionToUpdate(model, record, update, transaction, cacheId) {
        let recordUpdates = {}

        // Update the record if it's specified
        if (update) {
            Object.assign(record, update)
            recordUpdates = update
        }

        // Recompute other fields of the same record, then cache all the updates to be done for this record
        recordUpdates = await kiss.data.relations._computeFields(model, record, update, recordUpdates, 0, transaction, cacheId)

        // Remove empty properties from the updates to perform
        Object.keys(recordUpdates).forEach(property => {
            if (recordUpdates[property] == undefined) delete recordUpdates[property]
        })

        // No updates to perform: exit
        if (Object.keys(recordUpdates).length == 0) return

        // Add operations to the global transaction
        transaction.addOperation({
            modelId: model.id,
            recordId: record.id,
            updates: recordUpdates
        })

        if (!kiss.global.ops) kiss.global.ops = 0
        kiss.global.ops++

        // Define all the foreign models impacted by this update.
        // For each of them, store the impacted fields too
        let foreignModelTargetFields = {}

        Object.keys(recordUpdates).forEach(updatedFieldId => {
            const field = model.getField(updatedFieldId)
            if (field && field.sourceFor) {
                field.sourceFor.forEach(source => {
                    foreignModelTargetFields[source.modelId] = foreignModelTargetFields[source.modelId] || []
                    foreignModelTargetFields[source.modelId].push(source.fieldId)
                })
            }
        })

        // Loop over foreign models
        for (const foreignModelId of Object.keys(foreignModelTargetFields)) {
            const foreignModel = kiss.app.models[foreignModelId]
            const fieldsToUpdateInForeignRecord = foreignModelTargetFields[foreignModelId]
            const linkField = model.getLinkField(foreignModelId)

            if (linkField) {
                const foreignRecordsToUpdate = await kiss.data.relations.getLinkedRecordsFrom(model.id, record.id, linkField.id, transaction, cacheId)

                // Loop over foreign records
                for (const foreignRecord of foreignRecordsToUpdate) {

                    // Loop over foreign fields
                    for (const foreignFieldId of fieldsToUpdateInForeignRecord) {
                        const foreignField = foreignModel.getField(foreignFieldId)
                        const newForeignRecordValue = await kiss.data.relations._computeField(foreignModel, foreignRecord, foreignField, transaction, cacheId)

                        // The new value might impact other fields, so, we recursively update the impacted fields
                        let foreignFieldUpdate = {}
                        foreignFieldUpdate[foreignFieldId] = newForeignRecordValue
                        await kiss.data.relations.computeTransactionToUpdate(foreignModel, foreignRecord, foreignFieldUpdate, transaction, cacheId)
                    }
                }
            }
        }
    },

    /**
     * Calculate the computed fields values based on their source fields
     * (source fields = other fields involved in their formula).
     * 
     * BEWARE:
     * Highly sensitive recursive algorithm.
     * Any mistake while updating this code can impact the NoSQL relational model deeply.
     * 
     * @ignore
     * @private
     * @async
     * @param {object} model
     * @param {object} record
     * @param {string} [update] - original update which triggered the re-compute. If not passed, recomputes all fields.
     * @param {object} changes
     * @param {number} depth - Max number of iterations in the recursive loop
     * @returns {object} Object containing all updates to perform on the record after all the computed fields have been recalculated
     */
    async _computeFields(model, record, update, changes = {}, depth = 0, transaction, cacheId) {
        // Limit the field dependency depth to 10 to avoid infinite loops
        if (depth > 10) {
            return changes
        }
        depth++

        const updatedFieldIds = (update) ? Object.keys(update) : []
        const recomputeAllFields = (updatedFieldIds.length == 0)

        for (let computedFieldId of model.computedFields) {
            let skip = false
            const computedField = model.getField(computedFieldId)

            // Check if the computed field's formula relies on the field that has changed.
            // If yes => re-compute the computed field value
            if (
                !updatedFieldIds.includes(computedFieldId) &&
                (
                    recomputeAllFields ||
                    kiss.tools.intersects(computedField.formulaSourceFieldIds, updatedFieldIds)
                )
            ) {
                let newComputedFieldValue = await kiss.data.relations._computeField(model, record, computedField, transaction, cacheId)

                if (
                    newComputedFieldValue === undefined ||
                    newComputedFieldValue === record[computedField.id] ||
                    (kiss.tools.isNumericField(computedField) && isNaN(newComputedFieldValue))
                ) skip = true

                if (!skip) {
                    record[computedField.id] = changes[computedField.id] = newComputedFieldValue
                    await kiss.data.relations._computeFields(model, record, changes, changes, depth, transaction, cacheId)
                }
            }
        }
        return changes
    },

    /**
     * Compute a single field
     * 
     * @ignore
     * @private
     * @async
     * @param {object} model 
     * @param {object} record 
     * @param {object} field 
     * @param {object} [transaction]
     * @returns The new value or undefined in case of error
     */
    async _computeField(model, record, field, transaction, cacheId) {
        try {
            let newValue

            switch (field.type) {
                case "lookup":
                    newValue = await kiss.data.relations._computeLookupField(model.id, record.id, field.id, transaction, cacheId)
                    break
                case "summary":
                    newValue = await kiss.data.relations._computeSummaryField(model.id, record.id, field.id, transaction, cacheId)
                    break
                default:
                    newValue = kiss.formula.execute(field.formula, record, model.getActiveFields())
            }

            // console.log(`... updating field: ${field.label} - New value: ${newValue}`)
            return newValue

        } catch (err) {
            // log.err("kiss.db - computeField - Error:", err)
        }
    },

    /**
     * Compute a **lookup** field
     * 
     * A lookup field is taking its value from another field inside a foreign record
     * 
     * @private
     * @ignore
     * @param {string} modelId
     * @param {string} recordId
     * @param {string} fieldId
     * @param {object} transaction
     * @returns {*} The value(s) found in the foreign record
     */
    async _computeLookupField(modelId, recordId, fieldId, transaction, cacheId) {
        const model = kiss.app.models[modelId]
        const field = model.getField(fieldId)

        // Get the foreign records associated to the <link> field
        const foreignRecords = await kiss.data.relations.getLinkedRecordsFrom(modelId, recordId, field.lookup.linkId, transaction, cacheId)

        // Retrieve the foreign value from the source field
        if (foreignRecords.length == 0) return ""
        if (foreignRecords.length == 1) return foreignRecords[0][field.lookup.fieldId]

        // If there are multiple values to lookup, we perform a summary "LIST" operation
        return kiss.data.relations._summarizeField(foreignRecords, field.lookup.fieldId, "LIST")
    },

    /**
     * Compute a **summary** field
     * 
     * A summary field get all the foreign records connected through a link field, then summarize the information of a foreign field.
     * For example, imagine a "Project" record connected to multiple "Tasks" records, where each task has a **workload**.
     * You could have a "Total workload" field in the Project, and this field is a **summary** field that gather the informations of all "Workload" fields.
     * 
     * Summary operations can be:
     * - SUM
     * - AVERAGE
     * - COUNT
     * - MIN
     * - MAX
     * - CONCATENATE
     * - LIST
     * - ... more to come?
     * 
     * @private
     * @ignore
     * @async
     * @param {string} modelId
     * @param {string} recordId
     * @param {string} fieldId
     * @param {object} transaction
     * @returns {*} The summary of all values found in the foreign records
     */
    async _computeSummaryField(modelId, recordId, fieldId, transaction, cacheId) {
        const model = kiss.app.models[modelId]
        let field = model.getField(fieldId)

        // Get the foreign records associated to the <link> field
        const foreignRecords = await kiss.data.relations.getLinkedRecordsFrom(modelId, recordId, field.summary.linkId, transaction, cacheId)

        // If there are no foreign records to "summup", return 0 or "" depending on the field type
        if (foreignRecords.length == 0) {
            if (field.summary.type == "number") return 0
            return ""
        }

        // Gather all foreign records and summarize their data
        return kiss.data.relations._summarizeField(foreignRecords, field.summary.fieldId, field.summary.operation, field.precision)
    },

    /**
     * Summarize the information of a given field for a given set of records
     * 
     * @private
     * @ignore
     * @param {object} collection - The collection which holds the records
     * @param {string[]} recordIds - List of records from which we want to collect information
     * @param {string} fieldId - The field from which we want to collect information
     * @param {string} operation - SUM, MIN, MAX, AVERAGE, CONCATENATE
     * @param {number} [precision] - Uses a fixed number of digits in case the operation returns a number
     * @returns {*} The summarized value
     */
    _summarizeField(records, fieldId, operation, precision) {
        let values = []

        records.forEach(record => {
            if (record) values.push(record[fieldId])
        })

        if (operation == "CONCATENATE" || operation == "LIST" || operation == "LIST_NAMES") {
            return kiss.formula[operation](...values)
        } else {
            if (precision) return Number((kiss.formula[operation](...values)).toFixed(precision))
            return Number(kiss.formula[operation](...values))
        }
    },

    /**
     * Get the foreign records associated to a specific link field
     * and use cache to optimize database access
     * 
     * @private
     * @ignore
     * @async
     * @param {string} modelId
     * @param {string} recordId
     * @param {string} linkFieldId
     * @param {object} [transaction]
     * @param {string} cacheId
     * @returns {object[]} Array of records
     */
    async getLinkedRecordsFrom(modelId, recordId, linkFieldId, transaction, cacheId) {

        if (!cacheId) {
            // Build temp cache
            cacheId = kiss.tools.uid()
            await kiss.data.relations.buildCache(cacheId)
        } else if (cacheId.startsWith("cache")) {
            // Check if records where already cached to limit the number of database access
            return await kiss.data.relations.getLinkedRecordsFromCache(modelId, recordId, linkFieldId, transaction, cacheId)
        }

        const links = kiss.data.relations.getLinksFromField(modelId, recordId, linkFieldId)
        if (links.length == 0) {
            return []
        }

        // Get links to foreign records and filters out links to deleted records
        const foreignModelId = links[0].modelId
        const ids = links
            .map(link => link.recordId)
            .filter(recordId => !kiss.cache[cacheId].deletedRecords.includes(recordId))

        let records = []
        let remainingIds = []

        // Get linked records from cache and stack missing ids for future retrieval
        ids.forEach(id => {
            if (kiss.cache[cacheId][id]) {
                records.push(kiss.cache[cacheId][id])
            } else {
                remainingIds.push(id)
            }
        })

        // Retrieve the records missing from cache
        let dbRecords = []

        if (remainingIds.length > 0) {
            dbRecords = await kiss.db.findById(foreignModelId, remainingIds)

            dbRecords.forEach(record => {
                kiss.cache[cacheId][record.id] = record
            })

            // If some records were not found, add them to the cache of deleted records, to not try anymore retrieving them
            if (links.length != dbRecords.length) {
                const foundRecordIds = dbRecords.map(record => record.id)
                links.forEach(link => {
                    if (!foundRecordIds.includes(link.recordId)) {
                        kiss.cache[cacheId].deletedRecords = (kiss.cache[cacheId].deletedRecords || []).concat(link.recordId)
                    }
                })
            }
        }

        records = records.concat(dbRecords)

        if (transaction) {
            records = kiss.data.relations._patchRecordsFromTransactionCache(foreignModelId, records, transaction)
        }

        // Prevent duplicates to be returned (should never happen, though)
        // records = records.uniqueObjectId()
        return records
    },

    /**
     * Get FROM CACHE the foreign records associated to a specific link field
     * 
     * @private
     * @ignore
     * @async
     * @param {string} modelId
     * @param {string} recordId
     * @param {string} linkFieldId
     * @param {object} transaction
     * @param {string} cacheId
     * @returns {object[]} Array of records
     */
    async getLinkedRecordsFromCache(modelId, recordId, linkFieldId, transaction, cacheId) {
        const links = kiss.data.relations.getLinksFromField(modelId, recordId, linkFieldId)

        if (links.length == 0) {
            return []
        }

        // Get links to foreign records and filters out links that points to deleted records
        const foreignModelId = links[0].modelId
        const ids = links.map(link => link.recordId)
        let records = []

        if (kiss.cache[cacheId][foreignModelId]) {
            let missingCount = 0
            ids.forEach(id => {
                const cachedRecord = kiss.cache[cacheId][foreignModelId][id]
                if (cachedRecord) {
                    records.push(cachedRecord)
                } else {
                    missingCount++
                }
            })
            // if (missingCount) console.log("kiss.data.relations - getLinkedRecordsFromCache - Record missing from cache or deleted: " + kiss.app.models[foreignModelId].name + " / " + missingCount + " records")
        } else {
            const foreignModel = kiss.app.models[foreignModelId]
            const foreignModelName = (foreignModel) ? foreignModel.name : "Unknown model name (maybe deleted?)"
            console.log("kiss.data.relations - getLinkedRecordsFromCache - Model records missing from cache: " + foreignModelId + " / " + foreignModelName)
        }

        if (transaction) {
            records = kiss.data.relations._patchRecordsFromTransactionCache(foreignModelId, records, transaction)
        }

        return records
    },

    /**
     * Get the foreign links associated to a specific link field.
     * Look for all the linked records where the current record id match rX (left) or rY (right).
     * 
     * @param {string} modelId
     * @param {string} recordId
     * @param {string} linkFieldId - Field that makes the link between models
     * @returns {object[]} Array of objects holding the links, or empty array
     */
    getLinksFromField(modelId, recordId, linkFieldId) {
        const model = kiss.app.models[modelId]
        const accountId = model.accountId
        const foreignLinkField = model.getField(linkFieldId)

        if (!foreignLinkField) return []

        const foreignModelId = foreignLinkField.link.modelId
        const foreignLinkFieldId = foreignLinkField.link.fieldId
        const linkModel = kiss.app.models.link

        // Get the dynamic links between records
        // They are kept in cache to improve lookup performances
        let links
        if (kiss.isClient) {
            links = linkModel.collection.records
        } else {
            links = kiss.global.links[accountId] || []
        }

        // Get the links where the id of the record is in the **left** column of the join table
        const left = links
            .filter(link => link.mX == modelId && link.rX == recordId && link.fX == linkFieldId)
            .map(link => {
                return {
                    linkId: link.id,
                    modelId: link.mY,
                    recordId: link.rY
                }
            })

        // Get the links where the id of the record is in the **right** column of the join table
        const right = (modelId == foreignModelId) ? [] : links
            .filter(link => link.mY == modelId && link.rY == recordId && link.fX == foreignLinkFieldId)
            .map(link => {
                return {
                    linkId: link.id,
                    modelId: link.mX,
                    recordId: link.rX
                }
            })

        // Lookup records from their ids
        const join = [].concat(left.concat(right))
        return join
    },

    /**
     * Delete all the links from multiple records
     * 
     * @param {object} params
     * @param {object} params.req - The original request
     * @param {object} params.records - The records from which we have to delete the links
     */
    async deleteLinksFromRecords({
        req,
        records
    }) {
        const linkIds = kiss.data.relations.getLinksFromRecords(records)
        if (linkIds.length == 0) return

        // Remove links from db
        await kiss.db.deleteMany("links" + req.targetCollectionSuffix, {
            _id: {
                $in: linkIds
            }
        })

        // Remove links from server cache
        const accountId = req.token.currentAccountId
        const countBeforeDeletion = kiss.global.links[accountId].length

        kiss.global.links[accountId] = kiss.global.links[accountId].filter(link => !linkIds.includes(link.id))

        const deleteLinks = countBeforeDeletion - kiss.global.links[accountId].length
        log.info(`kiss.data.relations - ${req.token.userId } deleted ${deleteLinks} link(s)`)
    },

    /**
     * Get all the links of multiple records
     * 
     * @param {object[]} records 
     * @returns {object[]} Array of links
     */
    getLinksFromRecords(records) {
        let linkIds = []
        records.forEach(record => {
            let links = kiss.data.relations.getLinks(record.sourceModelId, record.id)
            linkIds = linkIds.concat(links.map(link => link.linkId))
        })
        return linkIds
    },

    /**
     * Get the all foreign links of a record.
     * Look for all the linked records where the current record id match rX (left) or rY (right).
     * Each link is returned as:
     * 
     *  {
     *      linkId: "...",
     *      modelId: "...",
     *      recordId: "..."
     *  }
     * 
     * @param {string} modelId 
     * @param {string} recordId 
     * @returns {object[]} Array of link objects
     */
    getLinks(modelId, recordId) {
        const model = kiss.app.models[modelId]
        if (!model) return []

        // Get the dynamic links between records
        // They are kept in cache to improve lookup performances
        let links
        if (kiss.isClient) {
            const linkModel = kiss.app.models.link
            links = linkModel.collection.records
        } else {
            const accountId = model.accountId
            links = kiss.global.links[accountId] || []
        }

        // Get the links where the id of the record is in the **left** column of the join table
        const left = links
            .filter(link => link.mX == modelId && link.rX == recordId)
            .map(link => {
                return {
                    linkId: link.id,
                    modelId: link.mY,
                    recordId: link.rY
                }
            })

        // Get the links where the id of the record is in the **right** column of the join table
        const right = links
            .filter(link => link.mY == modelId && link.rY == recordId)
            .map(link => {
                return {
                    linkId: link.id,
                    modelId: link.mX,
                    recordId: link.rX
                }
            })

        // Lookup records from their ids
        const join = [].concat(left.concat(right))
        return join
    },

    /**
     * Get the foreign records informations associated to a specific link field:
     * - filters out links that point to deleted records
     * - default sort by creation date
     * 
     * @private
     * @ignore
     * @async
     * @param {string} modelId
     * @param {string} recordId
     * @param {string} fieldId - The link field id
     * @param {object[]|object} [sort] - Optional sort options
     * @param {object} [sortSyntax] - "normalized" | "mongo". Sort syntax. Default to "normalized"
     * @returns {object[]} Array of objects containing the links informations
     */
    async getLinksAndRecords(modelId, recordId, fieldId, sort, sortSyntax = "normalized") {
        try {
            const model = kiss.app.models[modelId]
            const field = model.getField(fieldId)
            const foreignModel = kiss.app.models[field.link.modelId]
            let links = kiss.data.relations.getLinksFromField(modelId, recordId, fieldId)
            const ids = links.map(link => link.recordId)
            const records = await kiss.db.findById(foreignModel.id, ids, sort, sortSyntax)

            return records.map(record => {
                const link = links.find(link => link.recordId == record.id)
                return Object.assign(link, {
                    record
                })
            })

        } catch (err) {
            console.log("kiss.data.relations - getLinksAndRecords - Could not retrieve links")
            console.log(err)
            return []
        }
    },

    /**
     * Patch the records with previous mutations which are already in the transaction's stack of operations
     * 
     * @private
     * @ignore
     * @param {string} modelId
     * @param {object} records - records to patch in memory
     * @param {object} transaction - transaction that holds the current state mutations
     * @returns {object} 
     */
    _patchRecordsFromTransactionCache(modelId, records, transaction) {
        records.forEach(record => {
            transaction.operations.every(operation => {
                if (operation.modelId == modelId && operation.recordId == record.id) {
                    Object.assign(record, operation.updates)
                    return false
                }
                return true
            })
        })
        return records
    }
}