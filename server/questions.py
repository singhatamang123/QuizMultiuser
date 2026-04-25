import random
import os
import json
from google import genai
from dotenv import load_dotenv
from models import Question

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

# Hardcoded fallback questions
QUESTION_BANK: list[Question] = [
    # Class V - Fundamentals, Shortcuts, Types
    Question(
        text="What is a computer?",
        options=["A. A magic box", "B. An electronic machine", "C. A mechanical engine", "D. A display device"],
        answer="B",
        explanation="A computer is an electronic machine that processes information and data.",
        category="Class V",
    ),
    Question(
        text="Which of the following is considered the brain of the computer?",
        options=["A. Monitor", "B. Keyboard", "C. CPU", "D. Mouse"],
        answer="C",
        explanation="The CPU (Central Processing Unit) is considered the brain of the computer.",
        category="Class V",
    ),
    Question(
        text="What is the shortcut key for copying text in MS-Word?",
        options=["A. Ctrl + C", "B. Ctrl + X", "C. Ctrl + V", "D. Ctrl + Z"],
        answer="A",
        explanation="Ctrl + C is used to copy the selected text in MS-Word.",
        category="Class V",
    ),
    Question(
        text="Which type of computer is easily portable and can be carried on your lap?",
        options=["A. Desktop", "B. Supercomputer", "C. Laptop", "D. Mainframe"],
        answer="C",
        explanation="A laptop is designed to be portable and can be easily used on a person's lap.",
        category="Class V",
    ),
    Question(
        text="What is the shortcut key to undo an action in MS-Word?",
        options=["A. Ctrl + Z", "B. Ctrl + Y", "C. Ctrl + U", "D. Ctrl + X"],
        answer="A",
        explanation="Ctrl + Z is the shortcut to undo your last action.",
        category="Class V",
    ),
    Question(
        text="Which device is used to type text into a computer?",
        options=["A. Printer", "B. Keyboard", "C. Speakers", "D. Scanner"],
        answer="B",
        explanation="The keyboard is the primary input device used for typing characters and numbers.",
        category="Class V"
    ),
    Question(
        text="What does a mouse help us do on a computer screen?",
        options=["A. Print papers", "B. Hear sound", "C. Point and Click", "D. Store files"],
        answer="C",
        explanation="A mouse is a pointing device that allows us to interact with items on the screen.",
        category="Class V"
    ),
    Question(
        text="Which of these is an Output device?",
        options=["A. Monitor", "B. Microphone", "C. Mouse", "D. Webcam"],
        answer="A",
        explanation="The monitor shows (outputs) the information processed by the computer.",
        category="Class V"
    ),
    Question(
        text="What is the physical part of a computer called?",
        options=["A. Software", "B. Malware", "C. Hardware", "D. Operating System"],
        answer="C",
        explanation="Hardware refers to the physical components you can touch, like the monitor or CPU.",
        category="Class V"
    ),
    Question(
        text="Which key is used to start a new line while typing?",
        options=["A. Spacebar", "B. Shift", "C. Enter", "D. Backspace"],
        answer="C",
        explanation="The Enter key is used to move the cursor to the beginning of the next line.",
        category="Class V"
    ),

    # Class VI - Fundamentals, Shortcuts, Types
    Question(
        text="What does RAM stand for?",
        options=["A. Random Access Memory", "B. Read Access Memory", "C. Run All Memory", "D. Real Active Memory"],
        answer="A",
        explanation="RAM stands for Random Access Memory, which is the temporary storage in a computer.",
        category="Class VI",
    ),
    Question(
        text="Which of these is an input device?",
        options=["A. Monitor", "B. Printer", "C. Keyboard", "D. Speaker"],
        answer="C",
        explanation="A keyboard is an input device used to enter data into the computer.",
        category="Class VI",
    ),
    Question(
        text="What is the shortcut to select all text in MS-Word?",
        options=["A. Ctrl + S", "B. Ctrl + A", "C. Ctrl + D", "D. Ctrl + F"],
        answer="B",
        explanation="Ctrl + A selects all the text in the document.",
        category="Class VI",
    ),
    Question(
        text="Which of the following is the most powerful type of computer?",
        options=["A. Minicomputer", "B. Microcomputer", "C. Mainframe", "D. Supercomputer"],
        answer="D",
        explanation="Supercomputers are the fastest and most powerful type of computers.",
        category="Class VI",
    ),
    Question(
        text="What is the shortcut key to paste copied text in MS-Word?",
        options=["A. Ctrl + P", "B. Ctrl + V", "C. Ctrl + C", "D. Ctrl + X"],
        answer="B",
        explanation="Ctrl + V is used to paste the copied or cut text.",
        category="Class VI",
    ),
    Question(
        text="What is the full form of URL?",
        options=["A. Uniform Resource Locator", "B. Universal Radio Link", "C. United Road Line", "D. User Remote Login"],
        answer="A",
        explanation="URL stands for Uniform Resource Locator, which is the address of a web page.",
        category="Class VI"
    ),
    Question(
        text="Who is known as the father of modern computers?",
        options=["A. Bill Gates", "B. Charles Babbage", "C. Steve Jobs", "D. Alan Turing"],
        answer="B",
        explanation="Charles Babbage designed the Analytical Engine, the first general-purpose computer design.",
        category="Class VI"
    ),
    Question(
        text="1 Gigabyte (GB) is equal to how many Megabytes (MB)?",
        options=["A. 100 MB", "B. 512 MB", "C. 1024 MB", "D. 2048 MB"],
        answer="C",
        explanation="In computing, 1 GB is exactly 1024 MB.",
        category="Class VI"
    ),
    Question(
        text="Which language does a computer understand directly?",
        options=["A. English", "B. Machine Language", "C. Python", "D. HTML"],
        answer="B",
        explanation="Computers only understand Machine Language (Binary: 0s and 1s).",
        category="Class VI"
    ),
    Question(
        text="What is the full form of WWW?",
        options=["A. World Wide Web", "B. Web Wide World", "C. Wide World Web", "D. World Web Wide"],
        answer="A",
        explanation="WWW stands for World Wide Web, the system of interlinked hypertext documents.",
        category="Class VI"
    ),

    # Class VII - History, MS-Word Lab
    Question(
        text="Who is known as the father of the computer?",
        options=["A. Alan Turing", "B. Charles Babbage", "C. Bill Gates", "D. Steve Jobs"],
        answer="B",
        explanation="Charles Babbage is considered the father of the computer for inventing the Analytical Engine.",
        category="Class VII",
    ),
    Question(
        text="Which generation of computers used vacuum tubes?",
        options=["A. First Generation", "B. Second Generation", "C. Third Generation", "D. Fourth Generation"],
        answer="A",
        explanation="First-generation computers used vacuum tubes for circuitry.",
        category="Class VII",
    ),
    Question(
        text="In MS-Word, how do you insert a page break?",
        options=["A. Ctrl + Enter", "B. Shift + Enter", "C. Alt + Enter", "D. Spacebar"],
        answer="A",
        explanation="Ctrl + Enter is the shortcut to insert a manual page break.",
        category="Class VII",
    ),
    Question(
        text="To change the line spacing to double in MS-Word, what shortcut is used?",
        options=["A. Ctrl + 1", "B. Ctrl + 2", "C. Ctrl + D", "D. Ctrl + Space"],
        answer="B",
        explanation="Ctrl + 2 sets the line spacing of the selected paragraph to double.",
        category="Class VII",
    ),
    Question(
        text="What was the name of the first electronic general-purpose computer?",
        options=["A. UNIVAC", "B. ENIAC", "C. EDVAC", "D. ABACUS"],
        answer="B",
        explanation="ENIAC (Electronic Numerical Integrator and Computer) was the first electronic general-purpose computer.",
        category="Class VII",
    ),
    Question(
        text="Which topology uses a central hub to connect all computers?",
        options=["A. Bus", "B. Ring", "C. Star", "D. Mesh"],
        answer="C",
        explanation="In a Star topology, all nodes are connected to a central device like a hub or switch.",
        category="Class VII"
    ),
    Question(
        text="What does 'BCC' stand for in an Email?",
        options=["A. Basic Carbon Copy", "B. Blind Carbon Copy", "C. Blue Carbon Copy", "D. Bold Carbon Copy"],
        answer="B",
        explanation="BCC (Blind Carbon Copy) allows you to send an email to someone without others seeing their address.",
        category="Class VII"
    ),
    Question(
        text="Which protocol is used to transfer files over the internet?",
        options=["A. HTTP", "B. FTP", "C. SMTP", "D. IP"],
        answer="B",
        explanation="FTP stands for File Transfer Protocol, specifically designed for moving files between computers.",
        category="Class VII"
    ),
    Question(
        text="What is the shortcut to 'Undo' the last action?",
        options=["A. Ctrl + U", "B. Ctrl + Y", "C. Ctrl + Z", "D. Ctrl + Shift + Z"],
        answer="C",
        explanation="Ctrl + Z is the universal shortcut for Undo.",
        category="Class VII"
    ),
    Question(
        text="Which device is used to connect a computer to a telephone line for internet?",
        options=["A. Router", "B. Switch", "C. Modem", "D. Hub"],
        answer="C",
        explanation="A Modem modulates and demodulates signals to allow internet access over phone lines.",
        category="Class VII"
    ),

    # Class VIII - History, MS-Word Lab
    Question(
        text="Which generation of computers first introduced microprocessors?",
        options=["A. First", "B. Second", "C. Third", "D. Fourth"],
        answer="D",
        explanation="Fourth-generation computers are characterized by the use of microprocessors.",
        category="Class VIII",
    ),
    Question(
        text="Who is credited with being the first computer programmer?",
        options=["A. Ada Lovelace", "B. Charles Babbage", "C. Grace Hopper", "D. Alan Turing"],
        answer="A",
        explanation="Ada Lovelace is widely recognized as the first computer programmer for her work on the Analytical Engine.",
        category="Class VIII",
    ),
    Question(
        text="In MS-Word, what feature allows you to send the same letter to multiple people?",
        options=["A. Macro", "B. Mail Merge", "C. Format Painter", "D. Track Changes"],
        answer="B",
        explanation="Mail Merge is used to create multiple documents, such as personalized letters, at once.",
        category="Class VIII",
    ),
    Question(
        text="How do you create a hanging indent in a MS-Word paragraph?",
        options=["A. Ctrl + T", "B. Ctrl + M", "C. Ctrl + H", "D. Ctrl + I"],
        answer="A",
        explanation="Ctrl + T creates a hanging indent in the current paragraph.",
        category="Class VIII",
    ),
    Question(
        text="What invention replaced vacuum tubes in the second generation of computers?",
        options=["A. Integrated Circuits", "B. Microprocessors", "C. Transistors", "D. Diodes"],
        answer="C",
        explanation="Transistors replaced vacuum tubes, making computers smaller, faster, and more reliable.",
        category="Class VIII",
    ),
    Question(
        text="Which HTML tag is used to create a hyperlink?",
        options=["A. <link>", "B. <a>", "C. <href>", "D. <url>"],
        answer="B",
        explanation="The <a> (anchor) tag is used with the 'href' attribute to create links in HTML.",
        category="Class VIII"
    ),
    Question(
        text="In Python, which function is used to display output?",
        options=["A. display()", "B. show()", "C. print()", "D. write()"],
        answer="C",
        explanation="The print() function sends data to the standard output (screen).",
        category="Class VIII"
    ),
    Question(
        text="What does SQL stand for?",
        options=["A. Simple Query Language", "B. Structured Query Language", "C. System Query Logic", "D. Standard Question List"],
        answer="B",
        explanation="SQL is a standard language for managing and manipulating databases.",
        category="Class VIII"
    ),
    Question(
        text="In Python, which of these is used for a single-line comment?",
        options=["A. //", "B. /*", "C. #", "D. <!--"],
        answer="C",
        explanation="The # symbol is used for comments in Python.",
        category="Class VIII"
    ),
    Question(
        text="Which of these is a type of primary memory?",
        options=["A. Hard Disk", "B. RAM", "C. Pendrive", "D. DVD"],
        answer="B",
        explanation="RAM and ROM are the two main types of primary (internal) memory.",
        category="Class VIII"
    ),
]


async def generate_questions(category: str = "Class V", n: int = 10, topic: str = None) -> list[Question]:
    """
    Returns n generated questions using Gemini API with multi-model fallback.
    """
    if not client:
        print("[WARN] No GEMINI_API_KEY found. Falling back to local QUESTION_BANK.")
        return get_fallback_questions(category, n)
        
    actual_topic = topic if topic else f"Computer fundamentals, history, or basic MS-Word practicals appropriate for {category}"
    
    prompt = f"""
    You are an expert quiz master. Create {n} multiple-choice questions for {category} level students.
    Topic: {actual_topic}.
    
    Output MUST be a raw JSON array of objects. Do not include markdown code blocks.
    Each object must have exactly these keys: "text", "options", "answer", "explanation", "category".
    """

    # Try different models in order of efficiency
    for model_name in ["gemini-1.5-flash", "gemini-1.0-pro"]:
        try:
            print(f"[API] Calling {model_name} for topic: {actual_topic}...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            text = response.text.strip()
            
            # Clean JSON string
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            
            data = json.loads(text.strip())
            questions = [
                Question(
                    text=item["text"],
                    options=item["options"],
                    answer=item["answer"],
                    explanation=item["explanation"],
                    category=item["category"],
                ) for item in data
            ]
            
            print(f"[API] Successfully generated {len(questions)} questions using {model_name}.")
            return questions
            
        except Exception as e:
            print(f"[WARN] {model_name} failed: {e}")
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print(f"[INFO] Quota hit for {model_name}, trying next option...")
                continue
            break # Stop if it's a non-quota error (like syntax)

    print("[ERROR] All AI options exhausted. Falling back to local QUESTION_BANK.")
    return get_fallback_questions(category, n)

def get_fallback_questions(category: str, n: int) -> list[Question]:
    """
    Returns shuffled questions from the local bank for the specific category.
    Ensures students only get questions for their grade level.
    """
    filtered = [q for q in QUESTION_BANK if q.category == category]
    
    # If we found no questions for this category (highly unlikely with our bank),
    # only then do we use the full bank to prevent a crash.
    if not filtered:
        filtered = QUESTION_BANK

    shuffled = filtered.copy()
    random.shuffle(shuffled)
    
    # If the bank has fewer than n questions, it will return all available for that class.
    return shuffled[:n]