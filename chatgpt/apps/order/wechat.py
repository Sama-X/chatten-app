# flake8: noqa
# pylint: skip-file
import requests
import time
from chatgpt.settings import WECHAT
from order.utils import gen_code, rsa_sign, make_authorization_header
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import json
from Cryptodome.PublicKey import RSA

mch_id = WECHAT["MCH_ID"]                    # 商户号
app_id = WECHAT["APP_ID"]
pay_notify_url = WECHAT["PAY_NOTIFY_URL"]
mch_cert_serial_no = WECHAT["MCH_CERT_SERIAL_NO"]
mch_api_v3_key = WECHAT["MCH_API_V3_KEY"]


def js_api_prepay(openid, amount, out_trade_no, description, team):
    print('amount=', amount)

    description = description if description else "积分充值"

    body = {
        "mchid": mch_id,
        "out_trade_no": out_trade_no,
        "appid": app_id,
        "description": description,
        "notify_url": pay_notify_url,
        "amount": {
            "total": int(float(amount) * 100),  # 单位是分，所以乘以100
            "currency": "CNY"
        },
        "payer": {
            "openid": openid
        },
        "scene_info": {
            "payer_client_ip": "8.8.8.8",
            "device_id": team
        },
        "settle_info": {
            "profit_sharing": True
        }
    }

    print('total===', body)

    body = json.dumps(body).replace(' ', '')
    url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi'
    authorization = make_authorization_header("POST", '/v3/pay/transactions/jsapi', body)
    response = requests.post(
        url=url,
        data=body,
        headers={
            "Authorization": authorization,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    )
    print('js api sign=', response.text)

    sign_type = 'RSA'
    package = 'prepay_id=' + response.json()['prepay_id']
    timestamp = str(int(time.time()))
    nonce = gen_code()
    params = app_id + '\n' + timestamp + '\n' + nonce + '\n' + package + '\n'
    pay_sign = rsa_sign(params)

    data = {
            "timeStamp": timestamp,
            "nonceStr": nonce,
            "package": package,
            "signType": sign_type,
            "paySign": pay_sign,
    }

    return data


def decryWePayNotify(params):
    key_bytes = str.encode(mch_api_v3_key)
    nonce_bytes = str.encode(params['resource']['nonce'])
    ad_bytes = str.encode(params['resource']['associated_data'])
    data = base64.b64decode(params['resource']['ciphertext'])
    aesgcm = AESGCM(key_bytes)
    plaintext = aesgcm.decrypt(nonce_bytes, data, ad_bytes)
    plaintext_str = bytes.decode(plaintext)

    print('plaintext_str=', plaintext_str)

    return json.loads(plaintext_str)


def get_cert():
    url = 'https://api.mch.weixin.qq.com/v3/certificates'
    authorization = make_authorization_header("GET", '/v3/certificates', '')

    response = requests.get(url,
                             headers={
                                "Authorization": authorization,
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            }
                        )

    cert = response.json()

    key = mch_api_v3_key
    nonce = cert['data'][0]['encrypt_certificate']['nonce']
    associated_data = cert['data'][0]['encrypt_certificate']['associated_data']
    ciphertext = cert['data'][0]['encrypt_certificate']['ciphertext']
    key_bytes = str.encode(key)
    nonce_bytes = str.encode(nonce)
    ad_bytes = str.encode(associated_data)
    data = base64.b64decode(ciphertext)

    aesgcm = AESGCM(key_bytes)
    cert =  aesgcm.decrypt(nonce_bytes, data, ad_bytes)
    return cert


def native_prepay(amount, out_trade_no):
    body = {
	"mchid": mch_id,
	"out_trade_no": out_trade_no,
	"appid": app_id,
	"description": "积分充值",
	"notify_url": pay_notify_url,
	"amount": {
		"total": int(float(amount) * 100),
		"currency": "CNY"
	  }
    }
    print('native body=', body)

    body = json.dumps(body).replace(' ', '')
    url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native'
    authorization = make_authorization_header("POST", '/v3/pay/transactions/native', body)
    response = requests.post(
        url=url,
        data=body,
        headers={
            "Authorization": authorization,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    )
    print('native api response=', response.text)

    code_url = response.json()['code_url']
    return code_url