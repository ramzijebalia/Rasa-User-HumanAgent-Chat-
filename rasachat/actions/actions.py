
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.events import UserUtteranceReverted , SlotSet , FollowupAction
from rasa_sdk.executor import CollectingDispatcher
import asyncio
import websockets
import json
from rasa_sdk.types import DomainDict



# Declare tenant data outside the class
TENANT_DATA = {
    "Chat_com1": {
        "greeting": "Welcome to the Pharmacy. How can I assist you today?",
        "domain": "pharmacy"
    },
    "Chat_com2": {
        "greeting": "Welcome to the Coffee Shop. What would you like to know?",
        "domain": "coffee_shop"
    }

}

# action to set  domain uisng teh tenentID
class ActionAskDomain(Action):
    def name(self) -> Text:
        return "action_ask_domain"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        tenant_id = tracker.latest_message['metadata']['tenantId']
        print("Received message:", tracker.latest_message)
        print("Tenant ID:", tenant_id)

        # Access tenant data from the global variable
        tenant_info = TENANT_DATA.get(tenant_id) 

        if tenant_info:
            dispatcher.utter_message(text=tenant_info["greeting"])
            return [SlotSet("active_domain", tenant_info["domain"])]
        else:
            dispatcher.utter_message(text="Welcome! How can I help you today?")
            return [SlotSet("active_domain", None)]


# action to give the user the choice if he wanna  activate the human handoff or he wanna continue chatting with the rasa bot
class ActionFallback(Action):
    def name(self) -> Text:
        return "action_fallback"

    def run(
            self,
            dispatcher: "CollectingDispatcher",
            tracker: Tracker,
            domain: "DomainDict",
    ) -> List[Dict[Text, Any]]:
        # add different functionalities like google search, wiki search, etc to provide more answer
        latest_message = tracker.latest_message.get("text")
        buttons = [
            {"title": "Yes", "payload": "/request_human_handoff"},
            {"title": "No", "payload": "/continue_chat"}
        ]
        dispatcher.utter_message(text="Sorry, I didn't understand that. Would you like to talk with a human agent?", buttons=buttons)
        return []


# action to handle the human handoff request
class ActionHandleHumanHandoff(Action):
    def name(self) -> Text:
        return "action_handle_human_handoff"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # Check if the user requested a human handoff
        if tracker.latest_message.get("text") == "/request_human_handoff":
            dispatcher.utter_message(text="Sure, let me connect you with a human agent.")
            # Notify admin about handoff request
            # await self.notify_admin({"message": "User requested human handoff."})
            # Revert the latest user message so that it's not processed by Rasa
            return [UserUtteranceReverted()]

        # If not, continue with normal message processing by Rasa
        return []


