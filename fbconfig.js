var fbconfig = { };

// should end in /
fbconfig.rootUrl  = process.env.ROOT_URL                  || 'http://comuet.com/';

fbconfig.facebook = {
    appId:          process.env.FACEBOOK_APPID          || '1588806761410067',
    appSecret:      process.env.FACEBOOK_APPSECRET      || '8e9e641f8bfa8518cb44c2931bef7d77',
    appNamespace:   process.env.FACEBOOK_APPNAMESPACE   || 'Comuet',
    redirectUri:    process.env.FACEBOOK_REDIRECTURI    ||  fbconfig.rootUrl + 'login/callback/'
};

module.exports = fbconfig;