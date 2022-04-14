exports.fixture = {
  title: "My Attributes",
  subheading: "We need additional information before you start using our service.",
  theme: {
    logoUrl: "https://cdn.auth0.com/website/bob/press/shield-dark.png",
  },
  properties: {
    firstName: {
      label: "First Name",
      type: "text",
      required: true,
    },
    lastName: {
      label: "Last Name",
      type: "text",
    },
    age: {
      label: "Age",
      type: "number",
    },
  },
};
