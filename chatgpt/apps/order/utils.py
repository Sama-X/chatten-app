# flake8: noqa
# pylint: skip-file
import datetime
from io import BytesIO
import random
import time
import json
import string
import base64
import requests
import qrcode as qrcode_lib
# from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Cryptodome.Signature import pkcs1_15
# from Crypto.Hash import SHA256
from base64 import b64encode, b64decode
from Cryptodome.Hash import SHA256
from Cryptodome.PublicKey import RSA

from Cryptodome.Signature import pkcs1_15

from chatgpt.settings import WECHAT


def gen_code():
    now = 'chat' + datetime.datetime.now().strftime("%Y%m%d%H%M%S") + "".join(random.sample(string.digits, 8))
    return now


def gen_access_token():
    now = "".join(random.sample(string.digits + string.ascii_letters + string.punctuation, 32))
    return now


def rsa_sign(data):

    print("sign data = ", data)
    with open(WECHAT['API_CLIENT_KEY_PATH'], 'r') as f:
        private_key = f.read()
        rsa_key = RSA.importKey(private_key)
        signer = pkcs1_15.new(rsa_key)
        digest = SHA256.new(data.encode('utf8'))
        sign = b64encode(signer.sign(digest)).decode('utf-8')
        print('ssss=', sign)
        return sign

    
def make_authorization_header(method, url, body):
    mch_id = WECHAT["MCH_ID"]
    mch_cert_serial_no = WECHAT["MCH_CERT_SERIAL_NO"]
    timestamp = str(int(time.time()))
    nonce = gen_code()
    params = method + '\n' + url + '\n' + timestamp + '\n' + nonce + '\n' + body + '\n'

    pay_sign = rsa_sign(params)

    authorization = '''WECHATPAY2-SHA256-RSA2048 mchid="%s",nonce_str="%s",signature="%s",timestamp="%s",serial_no="%s"''' % (mch_id, nonce, pay_sign, timestamp, mch_cert_serial_no)
    return authorization


def check_notify_sign(timestamp, nonce, body, certificate, signature):
    # body = body.decode("utf-8")
    sign_str = timestamp + '\n' + nonce + '\n' + body + '\n'
    print('sign_str===', sign_str)
    print('certification', certificate)
    print('signature', signature)

    publicKey = RSA.importKey(certificate)
    h = SHA256.new(sign_str.encode('utf-8'))  # 对响应体进行RSA加密
    verifier = pkcs1_15.new(publicKey)  # 创建验证对象
    try:
        # https://www.it1352.com/2045706.html
        verifier.verify(h, b64decode(signature))  # 验签
        return True
    except:
        return False


def make_qrcode(data):
    print('qrcode = ', data)
    img = qrcode_lib.make(data)
    # img.show()
    buf = BytesIO()
    img.save(buf)
    img_stream = buf.getvalue()
    return img_stream


if __name__ == '__main__':
    signature = 'JFOy94pnyskPVAesCpYsGu2zhglkgtHh4LtEs1/gx+6NUF0S3SgTNI9yLYvZE/JyGtgC9UYXX94yIl7f1tQLr6VOl6oVZ4tfQlAaaLG53BM8bAeuCRrFhX9TV/bWcHCl8IMFwme90Nc44knXWzSytZwVAj5khF/i0mvF84oElndioGmjUvHxlebpJ4E06yd/lLYIzHVuL82h4FWMZJuYCvWRWmpNdOaPSxGdjKTZ/6lcOXU72DeLWlCaY/ancSmGZZRSXUdJ/ayWs+r3NsqmGB1vt27CZk+u7cj5+hreKjrYv8x6b/X1GZCLXdwGM5d+B1utRSuplBcpzHW7TsqFkw=='

    timestamp = '1684221067'
    nonce = 'EOdZbfsDjTaerZ1HOHEO8b9bGJSHJoXv'
    body = '''{"id":"0763dadf-8b2f-5e3b-9356-a5e3ae15ab76","create_time":"2023-05-16T15:11:07+08:00","resource_type":"encrypt-resource","event_type":"TRANSACTION.SUCCESS","summary":"支付成功","resource":{"original_type":"transaction","algorithm":"AEAD_AES_256_GCM","ciphertext":"cqGqLw+0VBpB211X3NyZyxfNyNyKJMYSVrCVSH+wDpF7xfUWibKJmlxVfap/EdBe35DEIxKKaKISjPPi1xH6SgbNGcDFMy1qD79oG7SYa/1RlM07JrVmlXSMIJtcgyqb3LTLh0SLROWjH10mD9O4elXc2zpPogzZpVB8HjPQIPsmhVjL/Mur0OLvs8ZDUBeu69xd635chaOJ4q+KhVO+21X/OgMjzqOV0cQVmBNBFsxa4swaLTC4nbvWohHxykX5tcmuTvIhROzBQ4NyVu2+Nuw71zm/mGXh9ESiKnKF/XRqQq1vBApnIGYlu8FU14qaho5vrHIacmMRe1744E32S/S78n/y/v2I6jfEDFNqQPufS+ZI0WMV4zMjcswAtR8xFp5AF+BxctWI0QNBYv+olmKNfKw0+3OGMOTQ7m2cYUrXZz/JJSIZ+lAkYILAeRUWnZ34BMVHxmyLNKoFJsm+buRYYYxkZE7V4PmbjY4aI5pOpiShOTsZSJl6qf9zE8p1p7qPlGIMcupu7c/NYSMo7eRt3uXDCgOWDUMyDXDPw+59ZcRGzK7I+OOK99UOHOMF2s+ddYTNiRyAz9PZUQ==","associated_data":"transaction","nonce":"uy0Cm1U2NQTh"}}'''

    certificate = b'-----BEGIN CERTIFICATE-----\nMIID3DCCAsSgAwIBAgIUXSvdlpNv+rakK4q+KAQN8VgZ5dAwDQYJKoZIhvcNAQEL\nBQAwXjELMAkGA1UEBhMCQ04xEzARBgNVBAoTClRlbnBheS5jb20xHTAbBgNVBAsT\nFFRlbnBheS5jb20gQ0EgQ2VudGVyMRswGQYDVQQDExJUZW5wYXkuY29tIFJvb3Qg\nQ0EwHhcNMjAxMDE1MDc0MTUzWhcNMjUxMDE0MDc0MTUzWjBuMRgwFgYDVQQDDA9U\nZW5wYXkuY29tIHNpZ24xEzARBgNVBAoMClRlbnBheS5jb20xHTAbBgNVBAsMFFRl\nbnBheS5jb20gQ0EgQ2VudGVyMQswCQYDVQQGDAJDTjERMA8GA1UEBwwIU2hlblpo\nZW4wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC0mhjbl0VtvlTpZK9C\nHf20JxIaZjlPC2/+A6VRBIurVkvBfA531USwVD5Z9z4lsdqzuNpE3EH1/YmoGYzR\nMSVDzXM13KhbNQL+BfZqWUKlyTkJjRumTqjc7DkXGw9O1V8ZosPW6Ot9FEftSNYH\nE5z83BtJJ7VCsRnHMefac67O+t1OlYoq/w1czt8p4Qy9UdcL82a/S0EKxlVDpKeE\ns0DqJDA175pEPrYuL8mKbBYGnNvN+XjD8LrbqzzdSz6DGRtECpWgCqWSHQdKzf0w\n0mezoKWBIw3CdrqMuvNcOlSfX02BZwEFQOigU/vmx/QJWpxEzpyiKXTdz3xVb0Gd\n1aKnAgMBAAGjgYEwfzAJBgNVHRMEAjAAMAsGA1UdDwQEAwIE8DBlBgNVHR8EXjBc\nMFqgWKBWhlRodHRwOi8vZXZjYS5pdHJ1cy5jb20uY24vcHVibGljL2l0cnVzY3Js\nP0NBPTFCRDQyMjBFNTBEQkMwNEIwNkFEMzk3NTQ5ODQ2QzAxQzNFOEVCRDIwDQYJ\nKoZIhvcNAQELBQADggEBAJ6ZNqBBylSsX4KgZ7Fwcql/wjDJLSp/Wtr5U3M4wP+k\nI/tDXKGPQLZX1hJAgkYfp9WDvsHwlhyHQ6b966roR4ku+M6/f0ZZmQA01mKZF/kE\nfsjjO/uunQePKEu0vFA09zqm8HVWmo/ocBOYaUs5ra6mXFaCYHWxVF8eAxw1eyaP\numbJmWiDkmM6ILkJ2KpUu3zXkvTrxpQCi0KjgiCmMKRNv2+/1sHhvAMwEdw2UROo\nG9Am0YT6OyrVqhk8vqYAZm37zAhky/RX46Ev/3T5gkVeunFniD9CPZEfr9HzGsx4\nOfnLPxNQs8DZ+GmK39noeDkQ65qrAC9RYZjsQ0nwXAA=\n-----END CERTIFICATE-----' 

    x = check_notify_sign(timestamp, nonce, body, certificate, signature)
    print('xxx=', x)

    print('hook donw')
