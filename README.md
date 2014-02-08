# passport-ldsauth
================

[Passport](http://passportjs.org/) strategy for authenticating with
[LDSAuth.org](http://ldsauth.org/) / [LDS.org](http://lds.org/) using the OAuth 2.0 API.

This module lets you authenticate using LDS.org in your Node.js applications.
By plugging into Passport, LDS.org authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
npm install passport-ldsauth --save
```

## Usage

#### Configure Strategy

The LDSAuth authentication strategy authenticates users using an LDS.org
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID, app secret, and callback URL.

    passport.use(new LdsAuthStrategy({
        clientID: LDSAUTH_APP_ID,
        clientSecret: LDSAUTH_APP_SECRET,
        callbackURL: "http://localhost:3000/oauth2/ldsauth/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ ldsOrgId: profile.currentUserId }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'ldsauth'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get(
  '/oauth2/ldsauth'
, passport.authenticate('ldsauth')
);

// On success this falls through to the second route
app.get(
  '/oauth2/ldsauth/callback'
, passport.authenticate('ldsauth', { failureRedirect: '/login' })
);
app.get(
  '/oauth2/ldsauth/callback'
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
