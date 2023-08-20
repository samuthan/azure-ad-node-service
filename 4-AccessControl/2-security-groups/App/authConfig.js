/**
 * For enhanced security, consider using client certificates instead of secrets.
 * See README-use-certificate.md for more.
 */
const authConfig = {
    auth: {
        authority: "https://login.microsoftonline.com/cdf5f84a-b4cf-4e96-a6b8-fd7a0114b952",
        clientId: "8bc2d28b-fe3b-44fb-ae0b-609bb18776f4",
        clientSecret: "pVM8Q~mnb3jxTOmF_wMN77sl9OfEq_auWSIWhaO4",
        // clientCertificate: {
        //     thumbprint: "YOUR_CERT_THUMBPRINT",
        //     privateKey: fs.readFileSync('PATH_TO_YOUR_PRIVATE_KEY_FILE'),
        // }
        redirectUri: "http://localhost:4000/redirect",
        discovery: ".well-known/openid-configuration",
        version: "v2.0"
    },

    metadata: {
        authority: "login.microsoftonline.com",
        discovery: ".well-known/openid-configuration",
        version: "v2.0"
    },
    system: {
        loggerOptions: {
            loggerCallback: (logLevel, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: 3,
        },
    }
    ,
    protectedRoutes: {
        todolist: {
            endpoint: "/api/todolist",
            delegatedPermissions: {
                read: ["Todolist.Read", "Todolist.ReadWrite","access_via_group_assignments"],
                write: ["Todolist.ReadWrite","access_via_group_assignments"]
            },
            applicationPermissions: {
                read: ["Todolist.Read.All", "Todolist.ReadWrite.All"],
                write: ["Todolist.ReadWrite.All"]
            }
        }
    }
};

module.exports = authConfig;