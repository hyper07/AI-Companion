# Family Memory Dataset for ChatGPT Fine-Tuning

This folder contains a custom dataset (`family-memory-dataset.jsonl`) designed to fine-tune an OpenAI model (base: `gpt-4.1-mini-2025-04-14`) to act as a compassionate AI companion for an elderly patient with dementia.

## Family Profile Summary

**Patient:** Margaret Wilson (Born 1948)
- **Condition:** Dementia/memory difficulties

**Late Husband:** Robert Wilson
- **Status:** Deceased (1 year ago, heart attack)
- **Marriage:** 52 years
- **Interests:** Woodworking, gardening, drove a blue Ford truck

**Son:** David Wilson (Age 45)
- **Location:** Chicago
- **Occupation:** Architect
- **Family:** Wife Lisa, Children Emma (12) & Jake (9)
- **Contact:** Calls every Wednesday, visits holidays

**Daughter:** Sarah Wilson (Age 42)
- **Location:** 15 mins away
- **Occupation:** Nurse at St. Mary's Hospital
- **Visits:** Every Sunday
- **Pet:** Buddy (Golden Retriever)
- **Treat:** Brings oatmeal raisin cookies

## Dataset Format

The file follows a **supervised chat fine-tuning** format compatible with OpenAI's supervised fine-tuning API. Each line is a standalone JSON object representing a conversation snippet ending with a user message (a prompt-only example):

```json
{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]}
```

The assistant's response is **not** stored in the JSONL file; instead, the supervised fine-tuning job learns to generate appropriate assistant replies from these prompts and the system instructions.

## How to Use with OpenAI API

You can use this file to fine-tune a model using the OpenAI CLI or API.

### 1. Upload the File
```bash
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "purpose=fine-tune" \
  -F "file=@family-memory-dataset.jsonl"
```

### 2. Create a Fine-Tuning Job
Once you have the `file_id` from the upload step:
```bash
curl https://api.openai.com/v1/fine_tuning/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "training_file": "file-YOUR_FILE_ID",
    "model": "gpt-4.1-mini-2025-04-14"
  }'
```

### 3. Use the Fine-Tuned Model
After training is complete, you can use your new `ft:gpt-4.1-mini-2025-04-14...` model ID in your chat completion requests. It will be specialized to respond as Margaret's companion with knowledge of her family history.

---
*Note: This dataset is for demonstration and testing purposes for the Memory Companion app.*

## Grader Schema

The `grader-schema.json` file defines a structured evaluation rubric for assessing AI companion responses. It includes 6 grading dimensions:
- Empathy & Tone (25%)
- Factual Accuracy (25%)
- Safety & Non-Distress (20%)
- Deceased Person Handling (15%)
- Response Length (10%)
- Grounding & Orientation (5%)

A weighted average score of 3.5+ is required to pass. Responses are auto-failed if they argue with the patient, cause distress, or contain factual errors about the Wilson family.

## Validation Dataset

The `validation-dataset.jsonl` file contains 10 held-out conversation examples used to measure model performance after fine-tuning. These examples are NOT used during training and cover all major conversation categories:
- Questions about late husband Robert (2 examples)
- Questions about son David and family (2 examples)
- Questions about daughter Sarah (2 examples)
- Questions about grandchildren (1 example)
- Wellbeing and distress scenarios (2 examples)
- Happy memory affirmation (1 example)
