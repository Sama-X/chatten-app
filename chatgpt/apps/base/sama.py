"""
sama sdk.
"""

import json
import logging
from subprocess import PIPE, Popen
import traceback

from typing import Optional
from pydantic import BaseModel, Field

from django.conf import settings

logger = logging.getLogger(__name__)



class SamaTranasctionResult(BaseModel):
    """
    sama transaction result.
    """
    result: bool
    txID: str
    error: Optional[str]


class SamaWalletResult(BaseModel):
    """
    sama wallet result.
    """
    result: bool
    address: str
    private_key: str = Field(..., alias="privateKey")


class SamaClient:
    """
    sama client.
    """

    @classmethod
    def create_wallet(cls) -> SamaWalletResult:
        """
        create wallet.
        """
        try:
            with Popen([settings.SAMA_CLIENT, 'create'], stdout=PIPE) as pro:
                values = pro.communicate()
                logger.info('【sama wallet】 create wallet result: %s', values)
                if values:
                    data = json.loads(values[0])
                    return SamaWalletResult(result=True, **data)
        except OSError as error:
            logger.error('【sama wallet】 create wallet error reason: %s', error)
        except Exception as error:
            logger.error('【sama wallet】 create wallet error reason: %s', error)

        return SamaWalletResult(result=False, address="", privateKey="")

    @classmethod
    def create_transaction(cls, to_address, amount, private_key) -> SamaTranasctionResult:
        """
        create avax transaction.
        """
        try:
            with Popen([settings.SAMA_CLIENT, '--endpoint', settings.SAMA_NODE_ENDPOINT, 'transfer',
                        to_address, str(amount), private_key], stdout=PIPE) as pro:
                values = pro.communicate()
                logger.info('【sama transaction】create transfer transaction result: %s', values)
                if values:
                    data = json.loads(values[0])
                    return SamaTranasctionResult(**data)
        except OSError as error:
            logger.error('【sama transaction】 create transaction error reason: %s', error)
        except Exception as error:
            logger.error('【sama transaction】 create transaction error reason: %s', error)

        return SamaTranasctionResult(result=False, txID="", error=traceback.format_exc())
