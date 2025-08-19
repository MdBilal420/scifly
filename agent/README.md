# SciFly Agent Setup

## Environment Configuration

1. Copy the template file to create your local environment configuration:
   ```bash
   cp env.local.yaml.template env.local.yaml
   ```

2. Edit `env.local.yaml` and replace the placeholder values with your actual API keys:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SERPER_API_KEY`: Your Serper API key
   - `GROQ_API_KEY`: Your Groq API key
   - `LANGSMITH_API_KEY`: Your LangSmith API key
   - `GOOGLE_API_KEY`: Your Google API key
   - `TAVILY_API_KEY`: Your Tavily API key

## Security Note

The `env.local.yaml` file contains sensitive API keys and is excluded from version control. Never commit this file to the repository.

## Running the Agent

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the agent:
   ```bash
   python main.py
   ```

The agent will be available at `http://localhost:8080`