import random
from models import Question

# 20 hardcoded Nepal trivia questions
# We will replace this with Claude API later
QUESTION_BANK: list[Question] = [
    Question(
        text="Which river is considered the holiest in Nepal?",
        options=["A. Koshi", "B. Narayani", "C. Bagmati", "D. Karnali"],
        answer="C",
        explanation="The Bagmati River is considered the holiest river in Nepal. Pashupatinath Temple sits on its banks.",
        category="Nepal general",
    ),
    Question(
        text="What is the national bird of Nepal?",
        options=["A. Peacock", "B. Danphe (Himalayan Monal)", "C. Eagle", "D. Crane"],
        answer="B",
        explanation="The Danphe, also known as the Himalayan Monal, is the national bird of Nepal.",
        category="Nepal general",
    ),
    Question(
        text="In which year did Nepal become a federal democratic republic?",
        options=["A. 2005", "B. 2006", "C. 2008", "D. 2010"],
        answer="C",
        explanation="Nepal was declared a Federal Democratic Republic on May 28, 2008, ending 240 years of monarchy.",
        category="Nepal general",
    ),
    Question(
        text="What is the highest peak in Nepal?",
        options=["A. Kanchenjunga", "B. Lhotse", "C. Makalu", "D. Mount Everest"],
        answer="D",
        explanation="Mount Everest at 8,848.86m is the highest peak in Nepal and the world.",
        category="Nepal general",
    ),
    Question(
        text="Which city is known as the 'City of Temples' in Nepal?",
        options=["A. Kathmandu", "B. Pokhara", "C. Bhaktapur", "D. Patan"],
        answer="C",
        explanation="Bhaktapur is known as the City of Temples due to its extraordinary concentration of religious monuments.",
        category="Nepal general",
    ),
    Question(
        text="What is the name of Nepal's national flower?",
        options=["A. Lotus", "B. Rose", "C. Rhododendron", "D. Marigold"],
        answer="C",
        explanation="The Rhododendron (Lali Gurans) is Nepal's national flower. It blooms across the hills in spring.",
        category="Nepal general",
    ),
    Question(
        text="Which festival is known as the 'Festival of Lights' in Nepal?",
        options=["A. Dashain", "B. Tihar", "C. Holi", "D. Teej"],
        answer="B",
        explanation="Tihar is Nepal's Festival of Lights, celebrated over five days with oil lamps, candles, and fireworks.",
        category="festivals",
    ),
    Question(
        text="What is the traditional Nepali new year called?",
        options=["A. Dashain", "B. Bisket Jatra", "C. Navabarsha", "D. Maghe Sankranti"],
        answer="C",
        explanation="Navabarsha (also called Nawa Barsha) is the Nepali New Year, falling in mid-April.",
        category="festivals",
    ),
    Question(
        text="Which district of Nepal has the most UNESCO World Heritage Sites?",
        options=["A. Bhaktapur", "B. Lalitpur", "C. Kathmandu", "D. Kavrepalanchok"],
        answer="C",
        explanation="Kathmandu district has the most UNESCO World Heritage Sites including Pashupatinath, Swayambhunath, and Boudhanath.",
        category="Nepal general",
    ),
    Question(
        text="What is Dal Bhat?",
        options=["A. A Nepali dessert", "B. Lentil soup with rice — Nepal's national dish", "C. A fried snack", "D. A type of bread"],
        answer="B",
        explanation="Dal Bhat is Nepal's national dish — lentil soup served with rice, vegetables, and pickle. Eaten twice daily.",
        category="food",
    ),
    Question(
        text="Which mountain range does Mount Everest belong to?",
        options=["A. Annapurna Range", "B. Kanchenjunga Range", "C. Mahalangur Himal", "D. Langtang Range"],
        answer="C",
        explanation="Mount Everest is part of the Mahalangur Himal sub-range of the Himalayas.",
        category="geography",
    ),
    Question(
        text="What is the capital city of Nepal?",
        options=["A. Pokhara", "B. Biratnagar", "C. Lalitpur", "D. Kathmandu"],
        answer="D",
        explanation="Kathmandu is the capital and largest city of Nepal, situated in the Kathmandu Valley.",
        category="Nepal general",
    ),
    Question(
        text="Nepal shares its border with which two countries?",
        options=["A. India and Bangladesh", "B. India and China", "C. China and Bhutan", "D. India and Tibet"],
        answer="B",
        explanation="Nepal is landlocked between India to the south, east, and west, and China (Tibet) to the north.",
        category="geography",
    ),
    Question(
        text="What is the name of the main stupa in Boudha, Kathmandu?",
        options=["A. Swayambhunath", "B. Pashupatinath", "C. Boudhanath", "D. Muktinath"],
        answer="C",
        explanation="Boudhanath Stupa is one of the largest stupas in the world and a major center of Tibetan Buddhism in Nepal.",
        category="Nepal general",
    ),
    Question(
        text="Which sport is Nepal's national sport?",
        options=["A. Football", "B. Cricket", "C. Volleyball", "D. Kabaddi"],
        answer="C",
        explanation="Volleyball is the national sport of Nepal, declared so in 2017.",
        category="sports",
    ),
    Question(
        text="What is Sel Roti?",
        options=["A. A type of pickle", "B. A rice-based ring-shaped fried bread", "C. A lentil curry", "D. A fermented drink"],
        answer="B",
        explanation="Sel Roti is a traditional Nepali homemade sweet ring-shaped bread made from rice flour, especially made during Tihar and Dashain.",
        category="food",
    ),
    Question(
        text="In which year did the massive earthquake hit Nepal?",
        options=["A. 2013", "B. 2014", "C. 2015", "D. 2016"],
        answer="C",
        explanation="Nepal was struck by a devastating 7.8 magnitude earthquake on April 25, 2015, killing nearly 9,000 people.",
        category="Nepal general",
    ),
    Question(
        text="What is the name of the living goddess tradition in Nepal?",
        options=["A. Devi Mata", "B. Kumari", "C. Durga Devi", "D. Taleju"],
        answer="B",
        explanation="The Kumari is a living goddess tradition in Nepal — a prepubescent girl selected as the earthly manifestation of the goddess Taleju.",
        category="Nepal general",
    ),
    Question(
        text="Which Nepali mountaineer first summited Everest alongside Edmund Hillary?",
        options=["A. Pasang Lhamu Sherpa", "B. Apa Sherpa", "C. Tenzing Norgay", "D. Nirmal Purja"],
        answer="C",
        explanation="Tenzing Norgay Sherpa and Edmund Hillary were the first to summit Mount Everest on May 29, 1953.",
        category="Nepal general",
    ),
    Question(
        text="What does 'Namaste' literally mean?",
        options=["A. Good morning", "B. Welcome friend", "C. I bow to the divine in you", "D. Peace be with you"],
        answer="C",
        explanation="'Namaste' comes from Sanskrit — 'Namas' means bow, 'te' means to you. It means 'I bow to the divine in you.'",
        category="Nepal general",
    ),
]


def get_questions(category: str = "Nepal general", n: int = 10) -> list[Question]:
    """
    Returns n shuffled questions.
    For now returns from the hardcoded bank.
    Later: fetch from Redis cache generated by Claude API.
    """
    # Filter by category if possible, else use all
    filtered = [q for q in QUESTION_BANK if q.category == category]
    if len(filtered) < n:
        filtered = QUESTION_BANK  # fall back to all if not enough

    shuffled = filtered.copy()
    random.shuffle(shuffled)
    return shuffled[:n]