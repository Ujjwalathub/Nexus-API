import os
import json
import asyncio
from fastapi import HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

async def extract_entities(text: str) -> list[dict]:
    # 1. Grab your working Google API Key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Google API Key missing in .env file.")

    try:
        print("\n--- EXTRACTING ENTITIES WITH GEMINI ---")
        # 2. Connect to the working Gemini model
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.1 # Low temperature so it strictly follows instructions
        )

        # 3. Prompt Gemini to read the text and return strict JSON
        template = """
        Analyze the following text and extract the key fantasy entities (characters, locations, factions, or items).
        Return the result ONLY as a valid JSON array of objects. Do not include markdown formatting like ```json.
        Each object must have exactly two keys: "name" (the entity name) and "type" (must be "character", "location", "faction", or "item").

        Text: {text}
        """
        prompt = PromptTemplate.from_template(template)
        chain = prompt | llm
        
        # 4. Get the response
        response = await chain.ainvoke({"text": text})
        
        # 5. Clean up the response to ensure it's pure JSON
        raw_text = response.content.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        entities = json.loads(raw_text)
        print(f"Success! Found {len(entities)} entities.")
        print("---------------------------------------\n")
        
        return entities

    except Exception as e:
        print(f"\n--- EXTRACTION ERROR ---")
        print(str(e))
        print("------------------------\n")
        # Return an empty list if it fails so the frontend doesn't crash
        return []