# Living Lore Board

> A generative-AI storytelling board powered by FLUX.1 image generation and a FastAPI backend.

## Project Structure

```
living-lore-board/
├── backend/          # FastAPI server + ML pipeline
│   ├── app.py
│   ├── ml_pipeline/
│   └── requirements.txt
├── frontend/         # React/Vite frontend
├── DESIGN.md         # Architecture & design notes
└── TROUBLESHOOTING.md
```

---

## 🔐 Authentication Guide: Hugging Face CLI (Recommended)

To download and run gated models like `FLUX.1-schnell` locally, your Python environment must be
authenticated with Hugging Face. We recommend using the Hugging Face Command Line Interface (CLI)
because it securely stores your token at the machine level, keeping it entirely out of your source
code and preventing accidental leaks to GitHub.

### Prerequisites

Before running the CLI tool, ensure you have completed the following:

1. **Account:** You have an active [Hugging Face account](https://huggingface.co/).
2. **Access Granted:** You have visited the
   [FLUX.1-schnell model page](https://huggingface.co/black-forest-labs/FLUX.1-schnell) and clicked
   **"Agree and access repository"**.
3. **Token Generated:** You have generated a Read-Access Token from your Hugging Face
   [Access Tokens settings page](https://huggingface.co/settings/tokens). Keep this token copied to
   your clipboard.

### Step-by-Step CLI Login Process

**Step 1: Open the Integrated Terminal**
Open a new terminal window inside your project workspace (e.g., in VS Code or IBM Bob).

**Step 2: Activate the Virtual Environment**
Authentication should be tied to the environment running your backend. Ensure your `venv` is active.
Your terminal prompt should look similar to this:

```bash
(venv) PS E:\living-lore-board\backend>
```

**Step 3: Execute the Login Command**
Type the following command and press **Enter**:

```bash
huggingface-cli login
```

> The CLI is automatically installed as a dependency when you install the `transformers` and
> `diffusers` libraries.

**Step 4: Paste Your Token**
The terminal will prompt you with:
`Token:`

- Paste your copied Access Token here.
- **Crucial Security Note:** When you paste the token, the terminal will **not** display any
  characters, asterisks, or movement. This is a standard security feature to prevent
  shoulder-surfing. Just paste it once and press **Enter**.

**Step 5: Git Credentials Prompt**
The CLI will ask:
`Add token as git credential? (Y/n)`

- Type `n` and press **Enter**. (You only need this token to download model weights via Python, not
  to push code to Hugging Face repositories).

**Step 6: Success Verification**
If successful, the terminal will output:

```
Login successful. Your token has been saved to C:\Users\YourName\.cache\huggingface\token
```

**Step 7: Restart the Server**
The authentication state is read when the Python process starts. You must restart your FastAPI
server for the new credentials to take effect:

```bash
uvicorn app:app --reload
```

You can now trigger the API from the frontend. The `diffusers` library will detect the saved token
and automatically begin downloading the FLUX.1 model weights!

---

## Running the Backend

```bash
cd backend
# Activate venv first (see above), then:
pip install -r requirements.txt
uvicorn app:app --reload
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

See [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) for common issues and fixes.
