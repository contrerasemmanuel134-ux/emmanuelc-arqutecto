
import json
import os

class Memory:
    def __init__(self, memory_file="conversation_history.json"):
        self.memory_file = memory_file
        self.history = self.load_history()

    def load_history(self):
        if os.path.exists(self.memory_file):
            with open(self.memory_file, "r") as f:
                return json.load(f)
        return []

    def save_history(self):
        with open(self.memory_file, "w") as f:
            json.dump(self.history, f, indent=4)

    def add_message(self, role, content):
        self.history.append({"role": role, "content": content})
        self.save_history()
