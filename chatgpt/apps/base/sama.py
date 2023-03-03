"""
sama sdk.
"""

import json
import logging
from subprocess import PIPE, Popen

from django.conf import settings

logger = logging.getLogger(__name__)


class SamaClient:
    """
    sama client.
    """

    @classmethod
    def create_wallet(cls) -> dict | None:
        """
        create wallet.
        """
        try:
            with Popen([settings.AVAX_CLIENT, 'create'], stdout=PIPE) as pro:
                values = pro.communicate()
                logger.info('【sama wallet】 create wallet result: %s', values)
                if values:
                    data = json.loads(values[0])
                    return data
        except OSError as error:
            logger.error('【sama wallet】 create wallet error reason: %s', error)

        return None

    @classmethod
    def create_transaction(cls, to_address, amount, private_key):
        """
        create avax transaction.
        """
        try:
            with Popen([settings.AVAX_CLIENT, '--endpoint', settings.SAMA_NODE_ENDPOINT, 'transfer',
                        to_address, amount, private_key], stdout=PIPE) as pro:
                values = pro.communicate()
                logger.info('【sama transaction】create transfer transaction result: %s', values)
                if values:
                    data = json.loads(values[0])
                    return data
        except OSError as error:
            logger.error('【sama transaction】 create transaction error reason: %s', error)

        return None
