const { expect } = require('chai')
const { progressiveProfilingNeeded } = require('../index')

describe('redirect', () => {
    it('should evaluate that no redirect is needed if no attributes are required additionally', () => {
        const {fixture} = require('../fixtures/schemas/example-schema-with-no-redirect')
    
        const required = progressiveProfilingNeeded(fixture)
        expect(required).to.be.false;
    })
    
    it('should evaluate that a redirect is needed if a simple schema is requested', () => {
        const {fixture} = require('../fixtures/schemas/simple-example-schema')
    
        const required = progressiveProfilingNeeded(fixture)
        expect(required).to.be.true;
    })
    
    it('should evaluate that a redirect is needed if a complex schema is requested', () => {
        const {fixture} = require('../fixtures/schemas/complex-example-schema')
    
        const required = progressiveProfilingNeeded(fixture)
        expect(required).to.be.true;
    })
    
})
