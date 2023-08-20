/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const path = require('path');
const express = require('express');
const session = require('express-session');
const { WebAppAuthProvider } = require('msal-node-wrapper');
// var cors = require('cors')
const authConfig = require('./authConfig.js');
// const mainRouter = require('./routes/mainRoutes');
const cors = require('cors');
const passport = require('passport');
const passportAzureAd = require('passport-azure-ad');
const router = require('./routes/index');

async function main() {

    // initialize express
    const app = express();

//     app.use(cors())

//     /**
//      * Using express-session middleware. Be sure to familiarize yourself with available options
//      * and set them as desired. Visit: https://www.npmjs.com/package/express-session
//      */
//     app.use(session({
//         secret: 'ENTER_YOUR_SECRET_HERE',
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production", // set this to true on production
//         }
//     }));

    // app.use(express.urlencoded({ extended: false }));
    // app.use(express.json());

//     //enable CORS (for testing only -remove in production/deployment)
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

// app.set('views', path.join(__dirname, './views'));
//     app.set('view engine', 'ejs');

//     app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
//     app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

//     app.use(express.static(path.join(__dirname, './public')));
    
    try {
        // initialize the wrapper
        // const authProvider = await WebAppAuthProvider.initialize(authConfig);

        // // initialize the auth middleware before any route handlers
        // app.use(authProvider.authenticate({
        //     protectAllRoutes: true, // enforce login for all routes
        // }));

        // app.get(
        //     '/todolist',
        //     authProvider.guard({
        //         idTokenClaims: {
        //             groups: ["a8cec6a6-4fd1-46e8-87bb-b6c75e9b7be2", "8b1c9083-1179-4894-912b-16a66c23e112"], // require the user's ID token to have either of these group claims
        //         },
        //     })
        // );

        // app.get(
        //     '/dashboard',
        //     authProvider.guard({
        //         idTokenClaims: {
        //             groups: ["a8cec6a6-4fd1-46e8-87bb-b6c75e9b7be2"]  // require the user's ID token to have this group claim
        //         },
        //     })
        // );

        const bearerStrategy = new passportAzureAd.BearerStrategy({
            identityMetadata: `${authConfig.auth.authority}/${authConfig.auth.version}/${authConfig.auth.discovery}`,
            issuer: `${authConfig.auth.authority}/${authConfig.auth.version}`,
            clientID: authConfig.auth.clientId,
            audience: authConfig.auth.clientId, // audience is this application
            validateIssuer: true,
            passReqToCallback: true,
            loggingLevel: "info",
            loggingNoPII: true,
        }, (req, token, done) => {


            // console.log(bearerStrategy);
        
            /**
             * Below you can do extended token validation and check for additional claims, such as:
             * - check if the caller's tenant is in the allowed tenants list via the 'tid' claim (for multi-tenant applications)
             * - check if the caller's account is homed or guest via the 'acct' optional claim
             * - check if the caller belongs to right roles or groups via the 'roles' or 'groups' claim, respectively
             *
             * Bear in mind that you can do any of the above checks within the individual routes and/or controllers as well.
             * For more information, visit: https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validate-the-user-has-permission-to-access-this-data
             */
        
        
            /**
             * Lines below verifies if the caller's client ID is in the list of allowed clients.
             * This ensures only the applications with the right client ID can access this API.
             * To do so, we use "azp" claim in the access token. Uncomment the lines below to enable this check.
             */
        
            // const myAllowedClientsList = [
            //     /* add here the client IDs of the applications that are allowed to call this API */
            // ]
            
            // if (!myAllowedClientsList.includes(token.azp)) {
            //     return done(new Error('Unauthorized'), {}, "Client not allowed");
            // }
        
        
            /**
             * Access tokens that have neither the 'scp' (for delegated permissions) nor
             * 'roles' (for application permissions) claim are not to be honored.
             */
            if (!token.hasOwnProperty('scp') && !token.hasOwnProperty('roles')) {
                return done(new Error('Unauthorized'), null, "No delegated or app permission claims found");
            }
        
            /**
             * If needed, pass down additional user info to route using the second argument below.
             * This information will be available in the req.user object.
             */
            return done(null, {}, token);
        });
        
        app.use(passport.initialize());
        
        passport.use(bearerStrategy);
        
        app.options('*', cors()) // include before other routes

        app.use('/api', (req, res, next) => {
            passport.authenticate('oauth-bearer', {
                session: false,
        
                /**
                 * If you are building a multi-tenant application and you need supply the tenant ID or name dynamically,
                 * uncomment the line below and pass in the tenant information. For more information, see:
                 * https://github.com/AzureAD/passport-azure-ad#423-options-available-for-passportauthenticate
                 */
        
                // tenantIdOrName: <some-tenant-id-or-name>
        
            }, (err, user, info) => {
                if (err) {
                    /**
                     * An error occurred during authorization. Either pass the error to the next function
                     * for Express error handler to handle, or send a response with the appropriate status code.
                     */
                    return res.status(401).json({ error: err.message });
                }
        
                if (!user) {
                    // If no user object found, send a 401 response.
                    return res.status(401).json({ error: 'Unauthorized' });
                }
        
                if (info) {
                    // access token payload will be available in req.authInfo downstream
                    req.authInfo = info;
                    return next();
                }
            })(req, res, next);
            }, 
            router, // the router with all the routes
            (err, req, res, next) => {
                /**
                 * Add your custom error handling logic here. For more information, see:
                 * http://expressjs.com/en/guide/error-handling.html
                 */
        
                // set locals, only providing error in development
                res.locals.message = err.message;
                res.locals.error = req.app.get('env') === 'development' ? err : {};
            
                // send error response
                res.status(err.status || 500).send(err);
            }
        );
        

      //  console.log(bearerStrategy);
        // app.use(mainRouter);

        /**
         * This error handler is needed to catch interaction_required errors thrown by MSAL.
         * Make sure to add it to your middleware chain after all your routers, but before any other 
         * error handlers.
         */
        // app.use(authProvider.interactionErrorHandler());

        return app;
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = main;