"""
api service.
"""
from django.db import transaction

from base.sama import SamaClient
from users.models import ScoreLogModel, ScoreModel, WalletModel


class UserService:
    """
    user service.
    """

    @classmethod
    @transaction.atomic
    def add_score(cls, user_id, amount, chain):
        """
        add score.
        """
        with transaction.atomic():
            obj = ScoreModel.objects.filter(user_id=user_id).first()
            if not obj:
                obj = ScoreModel(user_id=user_id, balance=0)

            obj.balance += amount
            obj.save()

            wallet_obj = WalletModel.objects.filter(
                user_id=user_id, chain=chain
            ).first()

            if not wallet_obj:
                wallet = SamaClient.create_wallet()
                if wallet.result:
                    wallet_obj = WalletModel(
                        user_id=user_id,
                        address=wallet.address,
                        private_key=wallet.private_key,
                    )
                    wallet_obj.save()

            txid, resp = '', ''
            if wallet_obj:
                result = SamaClient.create_transaction(wallet_obj.address, amount, wallet_obj.private_key)
                if result.result:
                    txid, resp = result.txID, result.json()

            ScoreLogModel.objects.create(
                user_id=user_id, score_id=obj.id,
                category=ScoreLogModel.CATEGORY_ADD,
                amount=amount,
                txid=txid,
                result=resp
            )
