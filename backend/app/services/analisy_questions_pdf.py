from app.services.bot.agents.generate_questions import QuestionGenerator
from app.services.bot_models import botModelGemini
from app.tools.extract_data_pdf import extract_pdf_data
from app.tools.format_Json import formatJson


async def analyze_questions_pdf(pdf_path, num_questions, num_alternatives):
    text, _ = extract_pdf_data(pdf_path)

    gemini_model = botModelGemini()

    question_generator = QuestionGenerator(llm_model=gemini_model)

    generated_questions = question_generator.generate(
        text=text,
        num_questions=num_questions,
        num_choices=num_alternatives,
    )

    formatted_result = formatJson(generated_questions)

    # print(formatted_result)
    return formatted_result
