import json

from flask import Flask, g
app = Flask(__name__)
app.secret_key = 'change_me'
app.config['OIDC_CLIENT_SECRETS'] = 'oidc-config.json'
app.config['OIDC_RESOURCE_SERVER_ONLY'] = 'true'
app.config['OIDC_COOKIE_SECURE'] = False
from flask_oidc import OpenIDConnect
oidc = OpenIDConnect(app)

@app.route('/', methods=['POST'])
@oidc.accept_token(True)
def api():
    return json.dumps({'hello': 'Welcome %s' % g.oidc_token_info['preferred_username']})
