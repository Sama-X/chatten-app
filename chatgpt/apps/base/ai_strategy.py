"""
Chatgpt key selection strategy.
"""

import heapq
from random import shuffle
import random
from django.conf import settings

from chat.models import ChatgptKeyModel


class StrategyError(Exception):
    """
    strategy error.
    """


class BaseStrategy:
    """
    base strategy.
    """
    USING_KEYS = []
    UNUSED_KEYS = []
    KEY_MAP = {}
    name = None

    INITIALIZATION = False

    def __init__(self) -> None:
        """
        init.
        """
        items = ChatgptKeyModel.objects.filter(
            enable=True, is_delete=False
        ).only('id', 'key').all()

        key_map = {}
        for item in items:
            key_map[item.key] = item.id

        keys = list(key_map.keys() or settings.CHATGPT_KEYS)
        shuffle(keys)
        self.KEY_MAP = key_map
        self.UNUSED_KEYS = keys
        self.INITIALIZATION = True

    def get_api_key(self):
        """
        get chatgpt api key.
        """
        raise NotImplementedError("Need to implement this method")
    
    def get_api_key_id(self, key):
        """
        get key id by key.
        """
        return self.KEY_MAP.get(key)
    
    def release_key(self, key):
        """
        release key.
        """
        pass

    def drop_key(self, key):
        """
        drop key.
        """
        if key in self.UNUSED_KEYS:
            self.UNUSED_KEYS.pop(key)
        if key in self.USING_KEYS:
            self.USING_KEYS.pop(key)


class UnusedStrategy(BaseStrategy):
    """
    unused strategy.
    """

    def __init__(self) -> None:
        """
        init.
        """
        self.name = "unused"
        super().__init__()

    def get_api_key(self):
        """
        get api key.
        """
        if not self.UNUSED_KEYS:
            return None

        key = random.choice(self.UNUSED_KEYS)

        self.USING_KEYS.append(key)

        return key
    
    def release_key(self, key):
        """
        release key.
        """
        if key in self.USING_KEYS:
            self.USING_KEYS.remove(key)
            self.UNUSED_KEYS.append(key)


class PriorityStrategy(BaseStrategy):
    """
    priority queue strategy.
    """
    TASKS = []
    DROP_KEYS = []
    TASK_MAP = {}

    def __init__(self) -> None:
        """
        init.
        """
        self.name = 'priority'
        super().__init__()
        for key in self.UNUSED_KEYS:
            heapq.heappush(self.TASKS, (0, key))

    def get_api_key(self):
        """
        get api key.
        """
        key, priority = None, 0
        while self.TASKS:
            priority, key = heapq.heappop(self.TASKS)
            if key in self.DROP_KEYS:
                continue
            break

        if not key:
            return None

        self.TASK_MAP[key] = priority + 1

        return key

    def release_key(self, key):
        """
        release key.
        """
        priority = 0
        if key in self.TASK_MAP:
            priority = self.TASK_MAP.pop(key)

        heapq.heappush(self.TASKS, (priority + 1, key))

    def drop_key(self, key):
        """
        drop key.
        """
        self.DROP_KEYS.append(key)
