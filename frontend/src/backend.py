from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load API key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing in .env")

# Initialize Gemini
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-pro")

# Flask setup
app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("text", "")

    if not user_input:
        return jsonify({"response": "No input provided"}), 400

    try:
        response = model.generate_content(user_input)
        return jsonify({"response": response.text})
    except Exception as e:
        print("Error:", e)
        return jsonify({"response": "Gemini API failed."}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
