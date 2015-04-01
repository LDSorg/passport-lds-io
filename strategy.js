'use strict';

/**
 * Module dependencies.
 */
var util = require('util')
  , path = require('path')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError
  , pConf = {
      protocol: 'https'
    , host: 'lds.io'
      // TODO v2.0.0 '/api/ldsconnect/me'
    , profileUrl: '/api/ldsio/accounts'
    , realProfileUrl: '/api/ldsio/{{\s*account_id\s*}}/me'
    }
  ;

require('ssl-root-cas/latest')
  .inject()
  .addFile(path.join(__dirname, 'certs', 'ca', 'root.crt.pem'))
  .addFile(path.join(__dirname, 'certs', 'ca', 'intermediate.crt.pem'))
  //.addFile(path.join(__dirname, 'certs', 'server', 'ldsconnect.crt.pem'))
  ;

/**
 * `Strategy` constructor.
 *
 * The example-oauth2orize authentication strategy authenticates requests by delegating to
 * example-oauth2orize using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your example-oauth2orize application's client id
 *   - `clientSecret`  your example-oauth2orize application's client secret
 *   - `callbackURL`   URL to which example-oauth2orize will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new ExampleStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/example-oauth2orize/callback'
 *       },
 *       function (accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  var me = this
    ;

  options = options || {};
  options.authorizationURL = 
    options.authorizationURL || 
    options.authorizationUrl ||
    (pConf.protocol + '://' + pConf.host + '/api/oauth3/authorization_dialog')
    ;
  options.tokenURL =
    options.tokenURL ||
    options.tokenUrl ||
    (pConf.protocol + '://' + pConf.host + '/api/oauth3/access_token')
    ;
  me._profileUrl = 
    options.profileURL ||
    options.profileUrl || 
    pConf.profileUrl
    ;
  me._realProfileUrl = 
    options.realProfileURL ||
    options.realProfileUrl || 
    pConf.realProfileUrl
    ;
  
  OAuth2Strategy.call(me, options, verify);

  // must be called after prototype is modified
  me.name = 'lds.io';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from example-oauth2orize.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `example-oauth2orize`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  var me = this
    ;

  function conditionalParse(body) {
    var json;

    if ('string' === typeof body) {
      try {
        json = JSON.parse(body);
      }
      catch(e) {
        var err = new Error('[LDS.io Passport Strategy] Error parsing json');
        err.body = body;
        done(err);
        return;
      }
    } else if ('object' === typeof body) {
      json = body;
    }

    return json;
  }

  function fetchRealProfile(accounts, done) {
    accounts = accounts.accounts || accounts.result || accounts.results || accounts;

    if (accounts.length > 1) {
      done(new Error("handling multiple user accounts is not yet implemented"));
      return;
    }

    if (1 !== accounts.length) {
      done(new Error("[SANITY CHECK FAIL] no accounts"));
      return;
    }

    var id = accounts[0].app_scoped_id || accounts[0].id;
    me._oauth2.get(
      pConf.protocol + '://' + pConf.host + me._realProfileUrl
        .replace(/{{account_id}}/, id)
    , accessToken
    , function (err, body/*, res*/) {
        if (err) { return done(new InternalOAuthError('failed to fetch user account', err)); }

        var profile = conditionalParse(body);
        profile.provider = me.name;

        done(null, profile);
      }
    );
  }

  me._oauth2.get(
    pConf.protocol + '://' + pConf.host + me._profileUrl
  , accessToken
  , function (err, body/*, res*/) {
      if (err) { return done(new InternalOAuthError('failed to fetch user account list', err)); }

      fetchRealProfile(conditionalParse(body), done);
    }
  );
};

/**
 * Expose `Strategy`.
 */
module.exports.Strategy = Strategy.Strategy = Strategy;
