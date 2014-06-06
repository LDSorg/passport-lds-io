# passport-lds-connect

[Passport](http://passportjs.org/) strategy for authenticating with
[ldsconnect.org](http://ldsconnect.org/) / [LDS.org](http://lds.org/) using the OAuth 2.0 API.

This module lets you authenticate using LDS.org in your Node.js applications.
By plugging into Passport, LDS.org authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

Questions? Comments?
Leave [an issue](https://github.com/LDSorg/passport-lds-connect/issues/new)
or join the discussion on [Google Groups](https://groups.google.com/forum/#!forum/lds-connect)

## Install

```bash
npm install passport-lds-connect --save
npm install lds-connect-proxy --save
```

## Usage

#### Configure Strategy

The `ldsconnect` authentication strategy authenticates users using an LDS.org
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID, app secret, and callback URL.

```javascript
passport.use(new LdsConnectStrategy({
    // These are the working demo app id and app secret
    clientID: '55c7-test-bd03',
    clientSecret: '6b2fc4f5-test-8126-64e0-b9aa0ce9a50d',

    // defaults to '/api/ldsorg/me', which is not as easy to use
    profileUrl: '/api/ldsconnect/me',

    // local.ldsconnect.org points to 127.0.0.1 and is an authorized domain for demo apps
    callbackURL: "http://local.ldsconnect.org:3000/oauth2/ldsconnect/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    if (profile.guest) {
      // this is the built-in dummy user 'dumbledore', not an actual user
      // be aware that anyone can log into ldsconnect.org with this test user.
      // The intent is that they can experiment with your app if they don't yet
      // have an lds.org account and see if it it's worth the hassle of
      // finding their MRN to sign up
    }
    User.findOrCreate({ ldsOrgId: profile.currentUserId }, function (err, user) {
      return done(err, user);
    });
  }
));
```

If you're making any requests in the browser you'll also want to use 
[lds-connect-proxy](https://github.com/LDSorg/lds-connect-proxy-node)
until ldsconnect.org supports CORS.

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'ldsconnect'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get(
  '/oauth2/ldsconnect'
, passport.authenticate('ldsconnect')
);

// On success this falls through to the second route
app.get(
  '/oauth2/ldsconnect/callback'
, passport.authenticate('ldsconnect', { failureRedirect: '/login' })
);
app.get(
  '/oauth2/ldsconnect/callback'
, function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);
```

## Credits

  - [AJ ONeal](http://github.com/coolaj86)

## License

[The MIT License](http://opensource.org/licenses/Apache-2.0)

Copyright (c) 2014 AJ ONeal <[http://coolaj86.com/](http://coolaj86.com/)>
