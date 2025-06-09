from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
import os
from dotenv import load_dotenv
import fitz

load_dotenv()

chatmodel = ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp", api_key=os.getenv("GOOGLE_API_KEY"))
summarizermodel = ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp", api_key=os.getenv("GOOGLE_API_KEY"))


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
        response = chatmodel.invoke(chat_history)
        if hasattr(response, 'content'):
            bot_response = response.content
        else:
            bot_response = "Sorry, I couldn't understand that."
    except Exception as e:
        bot_response = str(e)
    
    aimsg = AIMessage(content=bot_response)
    chat_history.append(aimsg)

    return jsonify({"response": bot_response})




@app.route('/summarize', methods=['POST'])
def summarize():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty file name'}), 400

    try:
        doc = fitz.open(stream=file.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()

        chat_history = [SystemMessage(content='''
        You are MedGPT, an AI tutor specialized in helping undergraduate medical students in India understand and revise complex concepts quickly and effectively.

        Summarize the following medical study material in a way that is:

        - Clear and student-friendly for quick exam preparation
        - Structured like a university answer (definition → classification → causes → pathophysiology → clinical features → diagnosis → treatment → important points)
        - Based on standard Indian medical textbooks (Harrison’s, Guyton, Robbins, etc.)
        - Inclusive of mnemonics, diagrams (describe if needed), and frequently asked exam points
        - Written in concise but academically accurate language
        - Helpful even if the student hasn’t prepared earlier

        Make sure the summary allows the student to write a full exam answer based solely on this explanation.

        --- BEGIN STUDY MATERIAL ---
        {text}
        --- END STUDY MATERIAL ---

        ''')]        
        
        prompt = f"Summarize the following medical study material for quick exam revision:\n\n{text}"
        chat_history.append(HumanMessage(content=prompt))
        response = summarizermodel.invoke([chat_history[0] + chat_history[-1]])
        summary = response.content if hasattr(response, "content") else "No summary generated."

        return jsonify({'summary': summary})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
