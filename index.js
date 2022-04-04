exports.calculateSchemaToRequest = (schema, user_metadata, multipage = true, max_attributes_per_page = 10) => {

    const workingCopy = JSON.parse(JSON.stringify(schema));

    const getTopLevelAttributesFromProfile = (profile) => Object.keys(profile).filter(itemKey => typeof profile[itemKey] !== 'object')
    const getTopLevelAttributesFromSchema = (raw_schema) => Object.entries(raw_schema.properties).filter(([_, value]) => !value.properties).map(([key, _]) => key)
    const getNestedAttributesFromSchema = (raw_schema) => Object.entries(raw_schema.properties).filter(([_, value]) => value.properties).map(([key, _]) => key)
    const determineUnnecessaryAttributes = (presentAttributes, requiredAttributes) => presentAttributes.filter(attr => requiredAttributes.includes(attr))

    const limitFieldsInSchema = (schema, numberOfItems) => {
        const topLevel = getTopLevelAttributesFromSchema(schema)

        const itemsToRemove = topLevel.slice(numberOfItems, topLevel.length);
        for(const item of itemsToRemove) {
            delete schema.properties[item]
        }

        const nested = getNestedAttributesFromSchema(schema)
        for(const item of nested) {
            schema.properties[item] = limitFieldsInSchema(schema.properties[item], numberOfItems)
        }
        return schema
    } 


    // handle top level attributes
    const alreadyPresentTopLevelAttributes = user_metadata.customProfile ? getTopLevelAttributesFromProfile(user_metadata.customProfile) : []
    const requiredTopLevelAttributes = getTopLevelAttributesFromSchema(workingCopy)
    const topLevelAttributesToRemove = determineUnnecessaryAttributes(alreadyPresentTopLevelAttributes, requiredTopLevelAttributes)
    for(const attr of topLevelAttributesToRemove) {
        delete workingCopy.properties[attr]
    }

    // handle nested attributes
    const requiredNestedAttributes = getNestedAttributesFromSchema(workingCopy)
    for(const attr of requiredNestedAttributes) {
        const present = (user_metadata?.customProfile && user_metadata?.customProfile[attr]) ? getTopLevelAttributesFromProfile(user_metadata.customProfile[attr]) : [];
        const required = getTopLevelAttributesFromSchema(workingCopy.properties[attr]);
        const unnecessaryAttribues = determineUnnecessaryAttributes(present, required)
        for(const toRemove of unnecessaryAttribues) {
            delete workingCopy.properties[attr].properties[toRemove]
        }
        if(!getTopLevelAttributesFromSchema(workingCopy.properties[attr]).length) {
            delete workingCopy.properties[attr]
        }
    }

    const limitedSchema = limitFieldsInSchema(workingCopy, max_attributes_per_page)
    // limit pages
    if(!multipage) {
        if (getTopLevelAttributesFromSchema(limitedSchema).length) {
            for(const nestedProperty of getNestedAttributesFromSchema(limitedSchema)) {
                delete limitedSchema.properties[nestedProperty];
            }
        } else {
            // only allow one page out of any nested pages if multipage is false
            const nestedAttributes = getNestedAttributesFromSchema(limitedSchema)
            const nestedPropertiesToRemove = nestedAttributes.slice(1, nestedAttributes.length);
            for(const nestedProperty of nestedPropertiesToRemove) {
                delete limitedSchema.properties[nestedProperty];
            }
        }
        
    }
    
    return limitedSchema
}

exports.progressiveProfilingNeeded = (schema) => schema?.properties && Object.keys(schema?.properties).length > 0;

/**
 * Performs a deep merge of `source` into `target`.
 * Mutates `target` only but not its objects and arrays.
 *
 * @author inspired by [jhildenbiddle](https://stackoverflow.com/a/48218209).
 */
 exports.mergeAttributesToProfile = (target, source) => {
    const isObject = (obj) => obj && typeof obj === 'object';
  
    if (!isObject(target) || !isObject(source)) {
      return source;
    }
  
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];
  
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
  
    return target;
  }