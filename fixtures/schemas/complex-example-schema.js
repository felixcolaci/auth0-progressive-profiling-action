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
    favoriteHoliday: {
      label: "Favorite Holiday",
      type: "select",
      options: [
        {
          label: "Beach holiday",
          value: "beach",
        },
        {
          label: "Holiday Resort",
          value: "resort",
        },
        {
          label: "Wild Animal Safari",
          value: "safari",
        },
      ],
    },
    residentialAddress: {
      type: "object",
      label: "Residential Address",
      properties: {
        street: {
          label: "Street",
          type: "text",
        },
        postalCode: {
          label: "Postal Code",
          type: "number",
        },
        city: {
          label: "City",
          type: "text",
        },
      },
    },
  },
};
