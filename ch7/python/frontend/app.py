from flask import Flask, g
app = Flask(__name__)
app.secret_key = 'change_me'
app.config['OIDC_CLIENT_SECRETS'] = 'oidc-config.json'
app.config['OIDC_COOKIE_SECURE'] = False
from flask_oidc import OpenIDConnect
oidc = OpenIDConnect(app)

@app.route('/')
@oidc.require_login
def index():
    if oidc.user_loggedin:
        return 'Welcome %s' % oidc.user_getfield('preferred_username')
    else:
        return 'Not logged in'
