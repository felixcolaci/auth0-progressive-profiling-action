# auth0-progressive-profiling-action

This helper Library included the business logic to request additional attributes from your users through the [Auth0 Progressive profiling Demo App](https://github.com/felixcolaci/auth0-progressive-profiling)

## Usage

This app can be included in your `auth0-action` by installing the module from npm: `@felixcolaci/auth0-progressive-profiling-action`

## Public API

```js

/**
 * Determine if the action should perform a redirect or not
 * Returns false if the user profile already included all attributes
 * requested in the schema.
 */
progressiveProfilingNeeded(schema, user_metadata) => boolean


/**
 * Determine which attributes from the configured schema shall be requested.
 *
 * If the profile needs more attributes that the configured limit (max_attributes_per_page) the remaining fields are ommited.
 * If Multipage is set to false additional attributes are ignored. Even if the attribute limit would allow for addidiotnal attribtues.
 */
calculateSchemaToRequest(schema, user_metadata, multipage = true, max_attributes_per_page = 10) => schema


/**
 * Works like Object.assign() but performs a deep merge instead.
 */
mergeAttributesToProfile(target, source)

```

## Configuration

There are various example usages possible with this action. Follow this step by step guide.

### Basic Example Usage

```js
/**
 * configure progressive profiling
 *
 *
 */

// First configure wether you want your users to experience a multi page form workflow or not.
// e.g. request basic information first and request the shipping address on the second page
const multiPage = false;
// Since it is all about progressive profiling this page allows you to specify how many
// attributes shall be requested from your users at once.
const maxRequestedAttributes = 2;
// Lastly the schema defines which attributes should be present in the user profile
// it also defines the theme of the profiling app.
const schema = {
  // ... covered later
};

// import necessary business logic
const {
  progressiveProfilingNeeded,
  calculateSchemaToRequest,
  mergeAttributesToProfile,
} = require("@felixcolaci/auth0-progressive-profiling-action");

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  // calculate the schema to request based upon provided settings + current user profile
  const schemaForRedirect = calculateSchemaToRequest(
    schema, // as configured above
    event.user.user_metadata, // current state of the user profile
    multiPage, // config value from above
    maxRequestedAttributes // config value from above
  );
  // only perform redirect if necessary (if there are required attributes missing in the user profile)
  if (progressiveProfilingNeeded(schemaForRedirect)) {
    // if progressive profiling is necessary for the current user we encode the required data into
    // the session token and pass it of to the profiling app
    const token = api.redirect.encodeToken({
      secret: event.secrets.TOKEN_SIGNING,
      expiresInSeconds: 3600,
      payload: {
        requiredData: schemaForRedirect,
      },
    });
    // The redirect URL must not change in order for this app to work.
    api.redirect.sendUserTo("https://auth0-progressive-profiling.netlify.app", {
      query: {
        session_token: token,
      },
    });
  }
};

/**
 * Handler that will be invoked when this action is resuming after an external redirect. If your
 * onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onContinuePostLogin = async (event, api) => {
  // decode the callback
  const payload = api.redirect.validateToken({
    secret: event.secrets.TOKEN_SIGNING,
    tokenParameterName: "continueToken",
  });
  // ... and update the user profile if necessary
  const userData = payload.requiredData;
  if (userData) {
    const customProfile = event.user.user_metadata["customProfile"] || {};
    // it is important to deep merge the profile since other approaches would overwrite existing data
    mergeAttributesToProfile(customProfile, userData);
    // at last we update the user profile through the management api
    api.user.setUserMetadata("customProfile", customProfile);
  }
};
```

### Configure Required Fields

```js
const schema = {
        "title": "Animal Store", // headline of the page
        "subheading": "Tell us something about your pet.", // subheading of the page (optional)
        "theme": {
            "logoUrl": "https://cdn.auth0.com/website/bob/press/shield-dark.png" // logo url (optional)
            "backgroundColor": "#f1f1f1" // (optional)
            "backgroundImage": "https://my-awesome-image.com" // (optional)
            "accentColor": "#fff"  // (optional)
        },
        "properties": {
            "nameOfYourPet": {
                "label": "The Name of your Pet",
                "type": "text",
            },
        }
    };

```

### Different Input Types

```js
const schema = {
       ...
        "properties": {
            "nameOfYourPet": {
                "label": "What is your pets name?",
                "type": "text",
            },
            "ageOfYourPet": {
                "label": "How old is your Pet?",
                "type": "number",
            },
            "vaccinated": {
                "label": "Has your pet received all necessary vaccinations?"
                "type": "checkbox"
            },
            "typeOfPet": {
                "label": "What pet to you own?",
                "type": "select",
                "options": [
                    {
                        "label": "Cat",
                        "value": "cat"
                    },
                    {
                        "label": "Dog",
                        "value": "dog"
                    }
                ]
            },
        }
    };

```

### Multi Page Form

By default nested object are converted into additional pages. The `type=object` is the keyword for this.

```js
const schema = {
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
```

## Examples

See the [fixtures](https://github.com/felixcolaci/auth0-progressive-profiling-action/tree/main/fixtures/schemas) directory for some examples.

## Deployment

Since the session token needs to be encoded with the same secret as the token in the callback (signed by the profiling app) you will need to configure the same secret. Kindly ask @felixcolaci for the correct value ;)

Make sure to include `@felixcolaci/auth0-progressive-profiling-action@latest` in your action configuration in order to make the import work.
