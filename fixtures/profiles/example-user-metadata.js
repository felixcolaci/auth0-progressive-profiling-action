const data = {
    customProfile: {
        firstName: "Node",
        lastName: "Jayess",
    }
}

exports.profileFixture = () => JSON.parse(JSON.stringify(data))

