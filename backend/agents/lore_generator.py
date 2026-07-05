"""
Lore Generator – LangChain + Google Gemini (gemini-2.5-flash, cloud)

Accepts a list of 2–6 NodeRef objects and weaves them into a single lore narrative.

Orchestration order:
  1. cascade_config  → verify budget & latency constraints
  2. memory_manager  → recall any prior lore for this entity group
  3. Gemini 2.5 Flash → generate new lore (via Google Generative AI API)
  4. memory_manager  → retain the generated lore
"""
from __future__ import annotations

import os
from typing import TYPE_CHECKING

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from fastapi import HTTPException

from agents.cascade_config import check_constraints, record_call
from agents.memory_manager import recall, retain

if TYPE_CHECKING:
    # NodeRef is a Pydantic model defined in app.py; imported only for type hints
    # to avoid a circular import at runtime.
    from app import NodeRef


async def generate_lore(nodes: list) -> str:
    """Generate lore that weaves together all supplied nodes (2–6 entities).

    Args:
        nodes: list of NodeRef-like objects with `.name` and `.type` attributes.
    """
    # 1. Check for the API key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Google API Key missing in .env file.")

    # 2. Governance check
    check_constraints()

    # 3. Build a stable memory key from all node names (sorted for consistency)
    sorted_names = sorted(n.name.lower() for n in nodes)
    memory_key = "::".join(sorted_names)
    prior = recall(memory_key)
    memory_context = prior if prior else "No prior history recorded."

    # 4. Dynamically format the entity list for the prompt
    entities_text = "\n".join(
        f"{i}. {node.name} (Type: {node.type})"
        for i, node in enumerate(nodes, 1)
    )

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.8,
        )

        template = (
            "You are a master fantasy worldbuilder. The user has selected a web of "
            "interconnected entities from their world.\n\n"
            "Entities to connect:\n{entity_list}\n\n"
            "Prior context: {memory_context}\n\n"
            "Write a cohesive, engaging, 3-paragraph piece of lore that organically "
            "weaves all of these specific characters, locations, events, and organizations "
            "together into a single narrative or historical record. Make it mysterious and "
            "highly detailed. Ensure every entity listed above plays a meaningful role in "
            "the story. Do not use markdown formatting."
        )

        prompt = PromptTemplate.from_template(template)
        chain = prompt | llm
        response = await chain.ainvoke({
            "entity_list": entities_text,
            "memory_context": memory_context,
        })

        lore = response.content

        # 5. Persist to memory
        retain(memory_key, lore)

        # 6. Record usage for cascadeflow budget tracking
        record_call()

        return lore

    except HTTPException:
        raise
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect to Gemini API.")
