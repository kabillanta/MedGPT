from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
import os
from dotenv import load_dotenv

load_dotenv()

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp", api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
CORS(app)

chat_history = [SystemMessage(content=''' 
You are MedGPT, a helpful and knowledgeable AI assistant designed to support medical students in India. You specialize in simplifying complex medical concepts and explaining them in a clear, student-friendly manner. Your responses should:

- Use simple and understandable language suitable for undergraduate medical students.
- Include necessary medical terminology but explain it where needed.
- Provide detailed, structured answers that can be used for writing university-level exam answers.
- Reference standard Indian medical textbooks (like Harrison’s, Guyton, Robbins, etc.) where relevant.
- Follow a format similar to how students are expected to answer in exams: definitions, classifications, causes, pathophysiology, clinical features, diagnosis, treatment, etc., as applicable.
- Avoid vague or overly technical jargon unless explained clearly.
- Mention mnemonics or tips when useful for remembering.
- Highlight important and frequently asked topics.

Stay concise when needed, but never compromise clarity. Always ensure the answer is academically accurate and exam-ready.
''')]

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    query = data.get('text', '')
    
    humanmsg = HumanMessage(content=query)
    chat_history.append(humanmsg)

    try:
        response = model.invoke(chat_history)
        if hasattr(response, 'content'):
            bot_response = response.content
        else:
            bot_response = "Sorry, I couldn't understand that."
    except Exception as e:
        bot_response = str(e)
    
    aimsg = AIMessage(content=bot_response)
    chat_history.append(aimsg)

    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(debug=True)
    app.run(host="0.0.0.0", port=8080)