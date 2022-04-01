const { calculateSchemaToRequest } = require('../index');

const {fixture} = require('../fixtures/schemas/simple-example-schema');
const { expect } = require('chai');

describe('simple schema', () => {
    it('should return all attribues if no attributes are present in the profile', () => {

        const schemaToRequest = calculateSchemaToRequest(fixture, {})
    
        expect(schemaToRequest).to.eql(fixture)
    
    })
    
    
    it('should return some attribues if no attributes are present in the profile', () => {
        const profileFixture = require('../fixtures/profiles/example-user-metadata').profileFixture();
        
        const schemaToRequest = calculateSchemaToRequest(fixture, profileFixture)
    
        expect(schemaToRequest.properties).not.to.be.undefined;
        expect(schemaToRequest.properties.age).not.to.be.undefined;
    })
    
    it('should return no attribues if all attributes are present in the profile', () => {
        const profileFixture = require('../fixtures/profiles/example-user-metadata').profileFixture();
        profileFixture.customProfile.age = 27;

        const schemaToRequest = calculateSchemaToRequest(fixture, profileFixture)
        
        // age should no more be part of required properties
        expect(schemaToRequest.properties).not.to.be.undefined;
        expect(schemaToRequest.properties.age).to.be.undefined;
    })

    it('should only return a limited number of fields if a limit was set', () => {
      
        const schemaToRequest = calculateSchemaToRequest(fixture, {}, false, 1)
        
        // age should no more be part of required properties
        expect(schemaToRequest.properties).not.to.be.undefined;
        expect(schemaToRequest.properties.firstName).not.to.be.undefined;
        expect(schemaToRequest.properties.lastName).to.be.undefined;
        expect(schemaToRequest.properties.age).to.be.undefined;
    })
})

