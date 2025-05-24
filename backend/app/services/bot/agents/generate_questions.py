import json
from typing import Any, Dict, Optional

from app.services.llm_base import LLMBase
from langchain.prompts import ChatPromptTemplate


class QuestionGenerator:
    """
    Class to generate multiple-choice questions from text.
    """

    # Prompt template for question generation
    PROMPT_TEMPLATE = """
    Analise o seguinte texto e crie exatamente {numero_perguntas} perguntas de múltipla escolha sobre o conteúdo e exatamente {numero_alternativas} alternativas para cada pergunta.

    TEXTO:
    {texto}

    INSTRUÇÕES:
    1. Crie {numero_perguntas} perguntas baseadas no texto acima.
    2. Crie {numero_alternativas} alternativas para cada pergunta.
    3. Cada pergunta deve ter exatamente {numero_alternativas} alternativas.
    4. Apenas uma alternativa deve estar correta para cada pergunta.
    5. Indique qual alternativa é a correta para cada pergunta.
    6. Para cada alternativa, inclua um campo "explicacao" que explique brevemente:
       - Para a alternativa correta: por que ela está correta
       - Para as alternativas incorretas: por que estão incorretas
    7. Retorne os dados em formato JSON exatamente como no exemplo a seguir, sem texto adicional:

    ```json
    {{
    "perguntas": [
        {{
        "pergunta": "Texto da pergunta 1?",
        "alternativas": [
            {{
                "letra": "A",
                "texto": "Alternativa A",
                "correta": false,
                "explicacao": "Esta alternativa está incorreta porque contradiz o conceito X mencionado no texto."
            }},
            {{
                "letra": "B",
                "texto": "Alternativa B",
                "correta": true,
                "explicacao": "Esta alternativa está correta porque corresponde exatamente ao conceito explicado no parágrafo Y do texto."
            }},
            {{
                "letra": "C",
                "texto": "Alternativa C",
                "correta": false,
                "explicacao": "Esta alternativa está incorreta porque confunde o conceito Z com W."
            }},
            {{
                "letra": "D",
                "texto": "Alternativa D",
                "correta": false,
                "explicacao": "Esta alternativa está incorreta porque apresenta uma informação que não consta no texto."
            }}
        ]
        }},
        ...
    ]
    }}
    ```

    Importante: As explicações devem ser concisas (curta) e baseadas nas informações do texto. Para alternativas corretas, explique por que estão certas; para incorretas, explique por que estão erradas seja curto mas detalhado ter uma boa explicação.
    """

    def __init__(self, llm_model: Optional[LLMBase] = None):
        """
        Initializes the question generator.

        Args:
            llm_model (LLMBase, optional): LLM model instance. If not provided, creates a new one.
        """
        self.llm_model = llm_model if llm_model else LLMBase()
        self.prompt_template = self.PROMPT_TEMPLATE

    def update_prompt(self, new_prompt: str) -> None:
        """
        Updates the prompt template used to generate questions.

        Args:
            new_prompt (str): New prompt template
        """
        self.prompt_template = new_prompt

    def generate(
        self, text: str, num_questions: int, num_choices: int = 4
    ) -> Dict[str, Any]:
        """
        Generates multiple-choice questions from a text.

        Args:
            text (str): Text for analysis
            num_questions (int): Number of questions to generate (between 1 and 9)
            num_choices (int): Number of choices for each question (default: 4)

        Returns:
            dict: JSON with questions and choices
        """
        if not isinstance(num_questions, int) or num_questions < 1 or num_questions > 9:
            raise ValueError(
                "The number of questions must be an integer between 1 and 9."
            )

        prompt = ChatPromptTemplate.from_template(self.prompt_template)

        message = prompt.format_messages(
            texto=text, numero_perguntas=num_questions, numero_alternativas=num_choices
        )

        response = self.llm_model.get_model().invoke(message)

        try:
            content = response.content
            json_start = content.find("```json")

            if json_start != -1:
                json_end = content.rfind("```")
                json_text = content[json_start + 7 : json_end].strip()
            else:
                json_text = content

            json_text = json_text.strip()
            result = json.loads(json_text)

            if "perguntas" not in result:
                raise ValueError("Invalid response format: 'perguntas' key not found.")

            return result

        except json.JSONDecodeError as e:
            raise ValueError(
                f"Failed to parse JSON from response: {e}\nOriginal response: {content}"
            )
