from flask import Flask, request, jsonify
import requests
import os
import json
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")  # Loaded from .env

HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"} if HUGGINGFACE_API_TOKEN else {}

HISTORY_DIR = "chat_history"
os.makedirs(HISTORY_DIR, exist_ok=True)

def save_history(user_email, message, response):
    history_file = os.path.join(HISTORY_DIR, f"{user_email}.json")
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            history = json.load(f)
    else:
        history = []
    history.append({"user": message, "bot": response})
    with open(history_file, 'w') as f:
        json.dump(history, f)

def get_history(user_email):
    history_file = os.path.join(HISTORY_DIR, f"{user_email}.json")
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            return json.load(f)
    return []

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_email = data.get('email')
    message = data.get('message')
    if not user_email or not message:
        return jsonify({"error": "Missing email or message"}), 400
    # Send to Hugging Face
    payload = {"inputs": message}
    try:
        print("Sending to Hugging Face:", payload)
        response = requests.post(HUGGINGFACE_API_URL, headers=HEADERS, json=payload)
        print("Response status:", response.status_code)
        print("Response body:", response.text)
        if response.status_code != 200:
            return jsonify({"error": "AI model error"}), 500
        result = response.json()
        bot_reply = result[0]["generated_text"][len(message):].strip() if isinstance(result, list) and result else "Sorry, I couldn't generate a response."
        save_history(user_email, message, bot_reply)
        return jsonify({"reply": bot_reply, "history": get_history(user_email)})
    except Exception as e:
        print("Exception in /chat:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['POST'])
def history():
    data = request.json
    user_email = data.get('email')
    if not user_email:
        return jsonify({"error": "Missing email"}), 400
    return jsonify({"history": get_history(user_email)})

if __name__ == '__main__':
    app.run(port=5005, debug=True) 