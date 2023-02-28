"""
Common util module.
"""


import random


class CommonUtil:
    """
    common util class.
    """

    @classmethod
    def generate_sms_code(cls, length=6):
        """
        generate sms code.
        """
        return "".join([str(random.randint(0, 9)) for i in range(length)])
