def formatJson(json_entrada):
    """
    Valida e padroniza o JSON de perguntas retornado pela LLM, incluindo explicações para cada alternativa.
    Garante que:
    - O formato siga o padrão esperado com perguntas e alternativas
    - Cada pergunta tenha entre 2 e 4 alternativas (A, B, C, D)
    - Cada pergunta tenha exatamente uma alternativa correta
    - Cada alternativa tenha um campo de explicação
    - O número de perguntas seja limitado a no máximo 9

    Args:
        json_entrada (dict): O JSON retornado pela LLM

    Returns:
        dict: JSON validado e padronizado
    """
    json_output = {"perguntas": []}

    if not isinstance(json_entrada, dict):
        return json_output

    perguntas = json_entrada.get("perguntas", [])
    if not isinstance(perguntas, list):
        return json_output

    for i, pergunta in enumerate(perguntas):
        if i >= 9:
            break

        if not isinstance(pergunta, dict) or "pergunta" not in pergunta:
            continue

        formatted_question = {
            "pergunta": str(pergunta.get("pergunta", "")),
            "alternativas": [],
        }

        if not formatted_question["pergunta"].strip():
            continue

        alternativas = pergunta.get("alternativas", [])
        if not isinstance(alternativas, list):
            alternativas = []

        has_correct = False

        valid_letters = ["A", "B", "C", "D"]
        formatted_alternatives = []

        for j, alternativa in enumerate(alternativas):
            if j >= 4:  # Máximo de 4 alternativas
                break

            if not isinstance(alternativa, dict):
                continue

            letra = alternativa.get(
                "letra", valid_letters[j] if j < len(valid_letters) else "?"
            )

            if letra not in valid_letters:
                letra = valid_letters[j] if j < len(valid_letters) else "?"

            texto = str(alternativa.get("texto", ""))
            if not texto.strip():
                continue

            correta = alternativa.get("correta", False)
            if not isinstance(correta, bool):
                correta = str(correta).lower() in ["true", "sim", "yes", "1"]

            if correta and has_correct:
                correta = False
            elif correta:
                has_correct = True

            # Obter a explicação para a alternativa ou criar uma padrão
            explicacao = str(alternativa.get("explicacao", ""))
            if not explicacao.strip():
                if correta:
                    explicacao = (
                        f"Esta alternativa está correta porque {texto.lower()}."
                    )
                else:
                    explicacao = (
                        "Esta alternativa está incorreta segundo o texto apresentado."
                    )

            formatted_alternatives.append(
                {
                    "letra": letra,
                    "texto": texto,
                    "correta": correta,
                    "explicacao": explicacao,
                }
            )

        if len(formatted_alternatives) < 2:
            continue

        if not has_correct and formatted_alternatives:
            formatted_alternatives[0]["correta"] = True

            formatted_alternatives[0]["explicacao"] = (
                f"Esta alternativa está correta porque {formatted_alternatives[0]['texto'].lower()}."
            )

        formatted_question["alternativas"] = formatted_alternatives

        json_output["perguntas"].append(formatted_question)

    return json_output
