'use strict';

/**
 * Module dependencies.
 */
var util = require('util')
  , path = require('path')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError
  , parse = require('./profile').parse
  , pConf = {
      protocol: 'https'
    , host: 'ldsconnect.org'
      // TODO v2.0.0 '/api/ldsconnect/me'
    , profileUrl: '/api/ldsorg/me'
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
    (pConf.protocol + '://' + pConf.host + '/dialog/authorize')
    ;
  options.tokenURL =
    options.tokenURL ||
    options.tokenUrl ||
    (pConf.protocol + '://' + pConf.host + '/oauth/token')
    ;
  me._profileUrl = 
    options.profileURL ||
    options.profileUrl || 
    pConf.profileUrl
    ;
  
  OAuth2Strategy.call(me, options, verify);

  // must be called after prototype is modified
  me.name = 'ldsconnect';

  if ('/api/ldsorg/me' === me._profileUrl) {
    console.warn("[WARN] [passport-lds-connect/strategy.js] You are using the default profile url '/api/ldsorg/me', which is deprecated. Update to '/api/ldsconnect/me'.");
    console.warn("Ex: new LdsConnectStrategy({ clientID: '55c7-test-bd03', clientSecret: '6b2fc4f5-test-8126-64e0-b9aa0ce9a50d', profileUrl: '/api/ldsconnect/me' }, fn)");
  } 
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

  me._oauth2.get(
    pConf.protocol + '://' + pConf.host + me._profileUrl
  , accessToken
  , function (err, body/*, res*/) {
      var json
        , profile
        ;

      if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

      if ('string' === typeof body) {
        try { json = JSON.parse(body); }
        catch(e) {
          console.error(e);
          console.error(body);
          done(e);
          return;
        }
      } else if ('object' === typeof body) {
        json = body;
      }

      profile = json;
      if ('/api/ldsorg/me' === me._profileUrl) {
        profile = parse(json);
        profile._raw = body;
        profile._json = json;
      }
      profile.provider = me.name;

      done(null, profile);
    }
  );
};

/**
 * Expose `Strategy`.
 */
module.exports.Strategy = Strategy.Strategy = Strategy;
