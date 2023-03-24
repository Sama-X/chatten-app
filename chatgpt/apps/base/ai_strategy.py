"""
Chatgpt key selection strategy.
"""

import heapq
import random
from random import shuffle

from datetime import datetime
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
    USING_KEYS = set()
    UNUSED_KEYS = set()
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
        self.KEY_MAP = key_map

        keys = list(key_map.keys() or settings.CHATGPT_KEYS)
        shuffle(keys)
        self.UNUSED_KEYS = set(keys)
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
        self.UNUSED_KEYS.discard(key)
        self.USING_KEYS.discard(key)


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

        key = random.choice(list(self.UNUSED_KEYS))

        self.USING_KEYS.add(key)

        return key
    
    def release_key(self, key):
        """
        release key.
        """
        if key in self.USING_KEYS:
            self.USING_KEYS.remove(key)
            self.UNUSED_KEYS.add(key)


class PriorityStrategy(BaseStrategy):
    """
    priority queue strategy.
    """
    TASKS = []
    DROP_KEYS = set()
    TASK_MAP = {}

    def __init__(self) -> None:
        """
        init.
        """
        self.name = 'priority'
        super().__init__()
        for key in self.UNUSED_KEYS:
            heapq.heappush(self.TASKS, (0, key))
            self.UNUSED_KEYS.add(key)

    def get_api_key(self):
        """
        get api key.
        """
        if not self.TASKS:
            return None

        priority, key = heapq.heappop(self.TASKS)
        while key in self.DROP_KEYS:
            if not self.TASKS:
                return None
            priority, key = heapq.heappop(self.TASKS)

        self.USING_KEYS.add(key)
        self.TASK_MAP[key] = priority + 1

        return key

    def release_key(self, key):
        """
        release key.
        """
        priority = self.TASK_MAP.pop(key, 0)
        heapq.heappush(self.TASKS, (priority + 1, key))
        self.USING_KEYS.remove(key)
        self.UNUSED_KEYS.add(key)

    def drop_key(self, key):
        """
        drop key.
        """
        self.DROP_KEYS.add(key)
        self.USING_KEYS.discard(key)
        self.UNUSED_KEYS.discard(key)
        if key in self.TASK_MAP:
            self.TASK_MAP.pop(key)
        while self.TASKS and self.TASKS[0][1] in self.DROP_KEYS:
            heapq.heappop(self.TASKS)


class DurationWeightedStrategy(BaseStrategy):
    """
    duration-weighted strategy.
    """
    WEIGHT_MAP = {}
    KEY_LAST_USED_MAP = {}

    def __init__(self) -> None:
        """
        init.
        """
        self.name = 'duration-weighted'
        super().__init__()
        for key in self.UNUSED_KEYS:
            self.WEIGHT_MAP[key] = 1

    def get_api_key(self):
        """
        get api key.
        """
        if not self.UNUSED_KEYS:
            return None

        now = datetime.now()
        total_weight = sum(self.WEIGHT_MAP.values())
        normalized_weights = {key: weight / total_weight for key, weight in self.WEIGHT_MAP.items()}
        random_num = random.random()
        cumulative_weight = 0
        selected_key = None
        for key, weight in normalized_weights.items():
            cumulative_weight += weight
            if cumulative_weight >= random_num:
                selected_key = key
                break

        if not selected_key:
            # fallback to random selection
            selected_key = random.choice(list(self.UNUSED_KEYS))

        self.USING_KEYS.add(selected_key)
        self.UNUSED_KEYS.remove(selected_key)
        if selected_key not in self.KEY_LAST_USED_MAP:
            self.KEY_LAST_USED_MAP[selected_key] = now
        else:
            self.WEIGHT_MAP[selected_key] = 1 / (now - self.KEY_LAST_USED_MAP[selected_key]).total_seconds()

        return selected_key

    def release_key(self, key):
        """
        release key.
        """
        now = datetime.now()
        self.KEY_LAST_USED_MAP[key] = now
        self.USING_KEYS.remove(key)
        self.UNUSED_KEYS.add(key)

    def drop_key(self, key):
        """
        drop key
        """
        self.KEY_LAST_USED_MAP.pop(key, 0)
        self.WEIGHT_MAP.pop(key, 0)
        self.USING_KEYS.discard(key)
        self.UNUSED_KEYS.discard(key)
