import argparse
import yaml
import chromadb
import os
from pathlib import Path
from rich.console import Console
from rich.table import Table
import chromadb.utils.embedding_functions as embedding_functions
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Constants & Configuration ---
DB_PATH = Path("./chroma_db")
COLLECTION_NAME = "software_architecture"
MODEL_NAME = "models/embedding-001" # Gemini embedding model

# --- Initialize Services ---
console = Console()

# Check for API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    console.print("[bold red]Error: GEMINI_API_KEY environment variable not set.[/bold red]")
    console.print("[yellow]Please set your Gemini API key to proceed.[/yellow]")
    exit(1)

# Initialize the embedding function
embedding_function = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
    api_key=api_key, model_name=MODEL_NAME
)

client = chromadb.PersistentClient(path=str(DB_PATH))
collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    embedding_function=embedding_function
)

# --- Core Functions ---

def parse_markdown(file_path: Path):
    """Parses the markdown file to extract YAML front matter and the full text content."""
    try:
        text = file_path.read_text()
        parts = text.split('---')
        if len(parts) < 3:
            return None, None

        metadata = yaml.safe_load(parts[1])
        content = parts[2].strip()
        return metadata, content
    except Exception as e:
        console.print(f"[bold red]Error parsing file {file_path}: {e}[/bold red]")
        return None, None


def add_document(file_path_str: str):
    """Adds or updates a document in the ChromaDB collection."""
    file_path = Path(file_path_str)
    if not file_path.exists():
        console.print(f"[bold red]Error: File not found at '{file_path_str}'[/bold red]")
        return

    doc_id = str(file_path)
    metadata, document_content = parse_markdown(file_path)

    if metadata is None:
        console.print(f"[yellow]Skipping {file_path}. Could not parse front matter.[/yellow]")
        return

    if not document_content:
        console.print(f"[yellow]Warning: No content found in {file_path}.[/yellow]")
        return

    # Convert lists in metadata to comma-separated strings
    processed_metadata = {}
    for key, value in metadata.items():
        if isinstance(value, list):
            processed_metadata[key] = ", ".join(map(str, value))
        else:
            processed_metadata[key] = value

    try:
        collection.upsert(
            ids=[doc_id],
            documents=[document_content],
            metadatas=[processed_metadata]
        )
        console.print(f"[green]Successfully indexed document:[/green] '{metadata.get('title', doc_id)}'")
    except Exception as e:
        console.print(f"[bold red]Error indexing document {file_path}: {e}[/bold red]")


def search_documents(query: str, n_results: int = 3):
    """Searches for documents in the collection."""
    if not query:
        console.print("[bold red]Search query cannot be empty.[/bold red]")
        return

    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
    except Exception as e:
        console.print(f"[bold red]Error during search: {e}[/bold red]")
        return

    table = Table(title=f"Search Results for '{query}'")
    table.add_column("Score", style="cyan", no_wrap=True)
    table.add_column("Title", style="magenta")
    table.add_column("File Path", style="green")

    ids = results.get('ids', [[]])[0]
    distances = results.get('distances', [[]])[0]
    metadatas = results.get('metadatas', [[]])[0]

    if not ids:
        console.print("[yellow]No results found.[/yellow]")
        return

    for doc_id, dist, meta in zip(ids, distances, metadatas):
        score = round((1 - dist), 2) if dist is not None else 'N/A'
        table.add_row(str(score), meta.get('title', 'N/A'), doc_id)

    console.print(table)


# --- CLI Interface ---

def main():
    """Main function to handle command-line arguments."""
    parser = argparse.ArgumentParser(description="Knowledge Base Manager for Software Architecture")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # 'add' command
    add_parser = subparsers.add_parser("add", help="Add or update a document in the knowledge base.")
    add_parser.add_argument("path", type=str, help="The path to the markdown file.")

    # 'search' command
    search_parser = subparsers.add_parser("search", help="Search the knowledge base.")
    search_parser.add_argument("query", type=str, help="The search query.")

    args = parser.parse_args()

    if args.command == "add":
        add_document(args.path)
    elif args.command == "search":
        search_documents(args.query)

if __name__ == "__main__":
    main()