"""
User model module.
"""
from django.contrib.auth.hashers import make_password, check_password
from django.core.cache import cache
from django.db import models
from django.utils.translation import gettext as _
from base.models import BaseModel


class AccountModel(BaseModel):
    """
    Account table.
    """
    USER_TYPE_ANONY = 1
    USER_TYPE_NORMAL = 2

    username = models.CharField(max_length=32, null=False, unique=True, verbose_name=_("db:account:username"))
    mobile = models.CharField(max_length=16, null=True, verbose_name=_("db:account:user mobile"))
    _password_hash = models.CharField(max_length=512, null=True, verbose_name=_("db:account:user password"))
    nickname = models.CharField(max_length=32, null=True, verbose_name=_("db:account:user nickname"))
    avatar = models.CharField(max_length=128, null=True, verbose_name=_("db:account:user avatar"))
    experience = models.SmallIntegerField(default=10, verbose_name=_("db:account:user experience time"))
    is_vip = models.BooleanField(default=False, verbose_name=_("db:account:user is vip"))
    login_time = models.DateTimeField(null=True, verbose_name=_("db:account:user last login time"))
    login_ip = models.CharField(max_length=32, null=True, verbose_name=_("db:account:user last login ip"))
    user_type = models.SmallIntegerField(default=USER_TYPE_ANONY, verbose_name=_("db:account:user type"))
    openid = models.CharField(max_length=128, null=True, verbose_name=_("db:account:user wechat openid"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("db:account:Account")
        verbose_name_plural = verbose_name
        db_table = "account"

    @property
    def password(self):
        """
        """
        return None

    @password.setter
    def password(self, value):
        """
        generate password.
        """
        self._password_hash = make_password(value)

    def check_password(self, value) -> bool:
        """
        check password.
        """
        return check_password(value, self._password_hash or '')


class MessageLogModel(BaseModel):
    """
    message log table.
    """
    CATEGORY_NOTIFY = 0

    CATEGORY_NOTIFIES = (
        (CATEGORY_NOTIFY, _("db:MessageLog: category notify")),
    )
    CATEGORY_NOTIFIES_DICT = dict(CATEGORY_NOTIFIES)

    mobile = models.CharField(
        max_length=16, db_index=True, null=False, verbose_name=_("db:MessageLog:message mobile")
    )
    content = models.TextField(null=False, verbose_name=_("db:MessageLog:message content"))
    category = models.SmallIntegerField(default=0, verbose_name=_("db:MessageLog:message category"))
    success = models.BooleanField(default=False, verbose_name=_("db:MessageLog: message send status"))
    request_time = models.DateTimeField(verbose_name=_("db:MessageLog: request time"))
    response = models.TextField(null=True, verbose_name=_("db:MessageLog: send message response"))
    response_time = models.DateTimeField(null=True, verbose_name=_("db:MessageLog: response time"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("db:account:MessageLog")
        verbose_name_plural = verbose_name
        db_table = "message_log"


class SamaWalletModel(BaseModel):
    """
    wallet table.
    """

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("db:user account id"))
    chain = models.CharField(max_length=32, null=False, db_index=True, verbose_name=_("db:Wallet:belong to the chain"))
    balance = models.BigIntegerField(default=0, verbose_name=_("db:Wallet:balance"))
    address = models.CharField(max_length=64, null=False, db_index=True, verbose_name=_("db:Wallet:address"))
    private_key = models.CharField(max_length=512, null=False, verbose_name=_("db:Wallet:private key"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("SamaWallet")
        verbose_name_plural = verbose_name
        db_table = "sama_wallet"


class SamaScoreModel(BaseModel):
    """
    Sama score table.
    """

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("db:user account id"))
    balance = models.BigIntegerField(default=0, verbose_name=_("db:Score:score balance"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("SamaScore")
        verbose_name_plural = verbose_name
        db_table = "sama_account_score"


class SamaScoreLogModel(BaseModel):
    """
    Sama score log table.
    """
    CATEGORY_ADD = 1
    CATEGORY_SUB = -1

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("db:user account id"))
    score_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("db:ScoreLog:score id"))
    category = models.SmallIntegerField(default=CATEGORY_ADD, verbose_name=_("db:ScoreLog:score category"))
    amount = models.BigIntegerField(default=0, verbose_name=_("db:ScoreLog:score"))
    txid = models.CharField(max_length=128, null=True, verbose_name=_("db:ScoreLog:chain transaction id"))
    result = models.TextField(null=True, verbose_name=_("db:ScoreLog:chain response"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("SamaScoreLog")
        verbose_name_plural = verbose_name
        db_table = "sama_account_score_log"


class InviteLogModel(BaseModel):
    """
    invite logs.
    """

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("user account id"))
    inviter_user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("inviter user account id"))
    super_inviter_user_id = models.BigIntegerField(null=True, db_index=True, verbose_name=_("super inviter user account id"))
    experience = models.IntegerField(default=1, verbose_name=_("db: chat experience times"))
    expired_time = models.DateField(null=False, db_index=True, verbose_name=_("db:invite expired time"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("db:InviteLogs")
        verbose_name_plural = verbose_name
        db_table = "invite_log"


class ConfigModel(BaseModel):
    """
    config.
    """
    CACHE_CONFIG_PREFIX = "config:cache:{}"
    DURATION = 24 * 3600

    VALUE_TYPE_STR = "string"
    VALUE_TYPE_INT = "integer"
    VALUE_TYPE_BOOL = "boolean"

    CONFIG_FREE_TRIAL_COUNT = "free-trial-count"
    CONFIG_FREE_TRIAL_DAYS = "free-trial-days"
    CONFIG_PHONE_NUMBER_VALIDATION_REQUIRED = "phone-number-validation-required"
    CONFIG_LEVEL1_COMMISSION_RATIO = "level1_commission-ratio"
    CONFIG_LEVEL2_COMMISSION_RATIO = "level2_commission-ratio"
    CONFIG_POINT_TO_CASH_RATIO = "point-to-cash-ratio"
    CONFIG_POINT_TO_CHAT_COUNT_RATIO = "point-to-chat-count-ratio"
    CONFIG_INVITE_REWARD_COUNT = "invite-reward-count"

    CONFIGS = (
        CONFIG_FREE_TRIAL_DAYS,
        CONFIG_FREE_TRIAL_COUNT,
        CONFIG_PHONE_NUMBER_VALIDATION_REQUIRED,
        CONFIG_LEVEL1_COMMISSION_RATIO,
        CONFIG_LEVEL2_COMMISSION_RATIO,
        CONFIG_POINT_TO_CASH_RATIO,
        CONFIG_POINT_TO_CHAT_COUNT_RATIO,
        CONFIG_INVITE_REWARD_COUNT,
    )

    name = models.CharField(max_length=32, blank=False, db_index=True, null=False, verbose_name=_("config item name"))
    value = models.CharField(max_length=256, blank=True, null=True, verbose_name=_("config item value"))
    value_type = models.CharField(max_length=32, default=VALUE_TYPE_STR, verbose_name=_("config item value type"))
    description = models.TextField(verbose_name=_("config item description"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("Config")
        verbose_name_plural = verbose_name
        db_table = "config"

    @classmethod
    def clear_cache(cls, name=None):
        """
        clear cache.
        """
        if name is None:
            for item in cls.CONFIGS:
                key = cls.CACHE_CONFIG_PREFIX.format(item)
                cache.delete(key)
        else:
            key = cls.CACHE_CONFIG_PREFIX.format(name)
            cache.delete(key)

    @classmethod
    def get(cls, name, value=None, description=None, value_type=VALUE_TYPE_STR, force=False):
        """
        get config by cache.
        """
        key = cls.CACHE_CONFIG_PREFIX.format(name)
        if not force:
            result = cache.get(key)
            if result:
                return result

        obj = cls.objects.filter(name=name).first()
        if not obj:
            obj = cls.objects.create(
                name=name,
                value=value,
                value_type=value_type,
                description=description
            )

        if obj and obj.is_delete:
            return None

        cache.set(key, obj.value, cls.DURATION)

        return obj.value

    @classmethod
    def get_bool(cls, name, value=False, description=None, value_type=VALUE_TYPE_BOOL, force=False):
        """
        get config.
        """
        value = int(value)
        value = cls.get(name, value, description, value_type=value_type, force=force)

        return bool(value)

    @classmethod
    def get_int(cls, name, value=0, description=None, value_type=VALUE_TYPE_INT, force=False):
        """
        get config.
        """
        value = cls.get(name, value, description, value_type=value_type, force=force)

        return int(value) if value else 0

    @classmethod
    def config_init(cls):
        """
        """
        cls.get_int(
            cls.CONFIG_FREE_TRIAL_COUNT, 10, _("Number of free experiences, number type, must be greater than 0"),
            cls.VALUE_TYPE_INT
        )
        cls.get_bool(
            cls.CONFIG_PHONE_NUMBER_VALIDATION_REQUIRED, False,
            _("Whether to enable the verification rule of mobile phone number")
        )
        cls.get_int(
            cls.CONFIG_LEVEL1_COMMISSION_RATIO, 4000,
            _("The proportion of first level commission. Range is between (0-10000)"),
            cls.VALUE_TYPE_INT
        )
        cls.get_int(
            cls.CONFIG_LEVEL2_COMMISSION_RATIO, 800,
            _("The proportion of second level commission. Range is between (0-10000)"),
            cls.VALUE_TYPE_INT
        )
        cls.get_int(
            cls.CONFIG_POINT_TO_CASH_RATIO, 10,
            _("Set the redemption ratio of points withdrawal."),
            cls.VALUE_TYPE_INT
        )
        cls.get_int(
            cls.CONFIG_POINT_TO_CHAT_COUNT_RATIO, 1, _("Set the proportion of points redemption times"),
            cls.VALUE_TYPE_INT
        )
