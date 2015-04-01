# passport-lds-io

[Passport](http://passportjs.org/) strategy for authenticating with
[ldsconnect.org](http://ldsconnect.org/) / [LDS.org](http://lds.org/) using the OAuth 2/ OAuth 3 LDS I/O API.

This module lets you authenticate using LDS.org in your Node.js applications.
By plugging into Passport, LDS.org authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

Questions? Comments?
Leave [an issue](https://github.com/LDSorg/passport-lds-io/issues/new)
or join the discussion on [Google Groups](https://groups.google.com/forum/#!forum/lds-connect)

## Install

```bash
npm install passport-lds-io --save
```

## Usage

See [Passport LDS Connect Example](https://github.com/LDSorg/passport-lds-connect-example)

#### Configure Strategy

The `lds.io` authentication strategy authenticates users using an LDS.org
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID, app secret, and callback URL.

```javascript
passport.use(new LdsConnectStrategy({
    // These are the working demo app id and app secret
    clientID: 'TEST_ID_56f6f3551bd4faa420a3dd6e',
    clientSecret: 'TEST_SK_jtgoHAMKdIgoWSYd8E1gBIrW',

    // local.ldsconnect.org points to 127.0.0.1 and is an authorized domain for demo apps
    callbackURL: "https://local.ldsconnect.org:8043/api/oauth3/callbacks/ldsconnect.org"
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

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'lds.io'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get(
  '/api/oauth3/authorization_redirect/ldsconnect.org'
, passport.authenticate('lds.io')
);

// On success this falls through to the second function
app.get(
  '/api/oauth3/callbacks/ldsconnect.org'
, passport.authenticate('lds.io', { failureRedirect: '/login' })
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

Copyright (c) 2014-2015 AJ ONeal <[https://coolaj86.com/](https://coolaj86.com/)>
