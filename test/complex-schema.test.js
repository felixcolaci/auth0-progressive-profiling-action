const { calculateSchemaToRequest } = require("../index");

const { fixture } = require("../fixtures/schemas/complex-example-schema");
const { expect } = require("chai");

describe("complex schema", () => {
  it("should return all attribues if no attributes are present in the profile", () => {
    const schemaToRequest = calculateSchemaToRequest(fixture, {});

    expect(schemaToRequest).to.eql(fixture);
  });

  it("should return some attribues if no attributes are present in the profile", () => {
    const profileFixture = require("../fixtures/profiles/example-user-metadata").profileFixture();
    const schemaToRequest = calculateSchemaToRequest(fixture, profileFixture);
    expect(schemaToRequest.properties).not.to.be.undefined;
    expect(schemaToRequest.properties.age).not.to.be.undefined;
    // should not include attributes present in profile
    for (const attr of Object.keys(profileFixture.customProfile)) {
      expect(schemaToRequest.properties[attr]).to.be.undefined;
    }
  });

  it("should return no attribues if all attributes are present in the profile", () => {
    const profileFixture = require("../fixtures/profiles/example-user-metadata").profileFixture();
    profileFixture.customProfile.age = 27;
    const schemaToRequest = calculateSchemaToRequest(fixture, profileFixture);

    // age should no more be part of required properties
    expect(schemaToRequest.properties).not.to.be.undefined;
    expect(schemaToRequest.properties.age).to.be.undefined;
  });

  it("should hide second page if multipage is false", () => {
    const schemaToRequest = calculateSchemaToRequest(fixture, {}, false);

    expect(schemaToRequest).not.to.eql(fixture);
    expect(schemaToRequest.properties.residentialAddress).to.be.undefined;
  });
});
