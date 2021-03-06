from io import BytesIO

import requests
from flask import Blueprint, jsonify, current_app, request
from qiniu import Auth, put_data, BucketManager

from UHE.utils import make_token

upload = Blueprint('upload', __name__)


@upload.route('/token')
def get_token():
    key = request.args.get('key', '')
    q = Auth(current_app.config["QINIU_ACCESS_KEY"],
             current_app.config["QINIU_SECRET_KEY"])
    return jsonify(uptoken=q.upload_token('shuhelper3'))


@upload.route('/avatar/<card_id>')
def get_avatar(card_id):
    r = requests.get(
        'http://www.tinygraphs.com/squares/{}?theme=frogideas&numcolors=4&fmt=jpg'.format(card_id))
    # i = Image.open(BytesIO(r.content))
    key = 'avatar_tinygraph_{}_{}.jpg'.format(card_id, make_token())
    q = Auth(current_app.config["QINIU_ACCESS_KEY"],
             current_app.config["QINIU_SECRET_KEY"])
    bucket = BucketManager(q)
    token = q.upload_token('shuhelper3', key, 3600)
    # ret, info = bucket.delete('shuhelper3', key)
    ret, info = put_data(token, key, BytesIO(r.content))
    print(info)
    return key
