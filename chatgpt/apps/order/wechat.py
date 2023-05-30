# flake8: noqa
# pylint: skip-file
import logging
import requests
import time
from chatgpt.settings import WECHAT
from order.utils import gen_code, rsa_sign, make_authorization_header
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import json
from Cryptodome.PublicKey import RSA

logger = logging.getLogger(__name__)

mch_id = WECHAT["MCH_ID"]                    # 商户号
app_id = WECHAT["APP_ID"]
pay_notify_url = WECHAT["PAY_NOTIFY_URL"]
mch_cert_serial_no = WECHAT["MCH_CERT_SERIAL_NO"]
mch_api_v3_key = WECHAT["MCH_API_V3_KEY"]


def js_api_prepay(openid, amount, out_trade_no):
    logger.info('[wechat jsapi prepay] amount = %s', amount)

    description = "积分充值"

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
        }
    }

    logger.info('[wechat jsapi prepay] paload: %s', body)

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
    logger.info('[wechat jsapi prepay] sign = %s', response.text)

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
        "appid": app_id,
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

    logger.info('[wechat decry notify] plaintext_str = %s', plaintext_str)

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
    logger.info('[wechat native prepay] body = %s', body)

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
    logger.info('[wechat native prepay] response = %s', response.text)

    code_url = response.json()['code_url']
    return code_url

def h5_prepay(amount, out_trade_no, ip=None):
    body = {
        "mchid": mch_id,
        "out_trade_no": out_trade_no,
        "appid": app_id,
        "description": "积分充值",
        "notify_url": pay_notify_url,
        "amount": {
            "total": int(float(amount) * 100),
            "currency": "CNY"
        },
        "scene_info": {
            "payer_client_ip": ip,
            "h5_info": {
                "type": "Wap"
            }
        }
    }
    logger.info('[wechat h5 prepay] body = %s', body)

    body = json.dumps(body).replace(' ', '')
    url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/h5'
    authorization = make_authorization_header("POST", '/v3/pay/transactions/h5', body)
    response = requests.post(
        url=url,
        data=body,
        headers={
            "Authorization": authorization,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    )
    logger.info('[wechat h5 prepay] response = %s', response.text)

    h5_url = response.json()['h5_url']
    return h5_url

def transfer(openid, amount):
    body = {
        "appid": app_id,
        "out_batch_no": gen_code(),
        "batch_name": '提现',
        "batch_remark": '提现',
        "total_amount": int(float(amount) * 100),
        "total_num": 1,
        "transfer_detail_list": [
            {
                'out_detail_no': gen_code(),
                'transfer_amount': int(float(amount) * 100),
                'transfer_remark': 'ChatTEN提现',
                'openid': openid
            }
        ],
    }
    logger.info('[wechat h5 prepay] body = %s', body)

    body = json.dumps(body).replace(' ', '')
    url = 'https://api.mch.weixin.qq.com/v3/transfer/batches'
    authorization = make_authorization_header("POST", '/v3/pay/transactions/h5', body)
    response = requests.post(
        url=url,
        data=body,
        headers={
            "Authorization": authorization,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Wechatpay-Serial": get_cert()['data'][0]['serial_no']
        }
    )
    logger.info('[wechat h5 prepay] response = %s', response.text)

    data = response.json()

    if response.status_code == '200':
        return data
    else:
        return data
