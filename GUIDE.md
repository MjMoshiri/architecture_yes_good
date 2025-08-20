# Knowledge Base Guide

This repository is a structured knowledge base for software architecture topics. The goal is to maintain a consistent and machine-readable format that can be indexed by a local vector database for semantic search.

## Philosophy

1.  **Consistency is Key:** Every document must follow the defined template. This ensures that our scripts can correctly parse and index the information.
2.  **Atomicity:** Each document should focus on a single, well-defined topic.
3.  **Interconnected:** Use the `prerequisites` metadata to link concepts together, forming a knowledge graph.

## Directory & File Structure

The repository is organized into three main categories:

-   `/concepts`: Foundational ideas and patterns (e.g., CAP Theorem, Sharding, Pub/Sub).
-   `/products`: Specific technologies and tools (e.g., PostgreSQL, RabbitMQ, Docker).
-   `/systems`: Case studies and designs of large-scale systems (e.g., Twitter's Feed, TinyURL).

### File Naming Convention

Both directories and file names should be **lowercase** and use hyphens for multiple words (e.g., `message-queues`, `cap-theorem.md`).

## Content Format & Status Management

Every knowledge file **must** be a Markdown (`.md`) file and **must** begin with YAML front matter, as defined in the `[TEMPLATE.md](TEMPLATE.md)`.

### Structured TODOs

To track future work or areas for deeper study within a topic, use the `todos` list in the front matter.

**Example:**
```yaml
todos:
  - "Research Vitess and CockroachDB sharding strategies"
  - "Add a section on performance tuning"
```

This structured format allows for future tooling to query and manage outstanding learning tasks across the entire knowledge base.

## The Knowledge Base Script

A Python script, `knowledge_base.py`, is used to manage the vector database.

**Functionality:**

-   `python knowledge_base.py add <path/to/file.md>`: Adds or updates a document in the vector database.
-   `python knowledge_base.py search "your query"`: Searches the knowledge base for relevant documents.

## Workflow: An AI-Driven Process

The process is designed to be simple. You provide the topic, and the AI agent handles the organization.

1.  **State your intent:** "I want to learn about [Topic Name]."
2.  **AI Determines Location:** The agent will analyze the topic and decide the most logical category (`concepts`, `products`, or `systems`) and sub-folder.
3.  **AI Creates Structure:** If a suitable sub-folder exists, the new topic file will be placed there. If not, a new, appropriately named sub-folder will be created first.
4.  **AI Confirms Action:** The agent will confirm the file's location (e.g., "I have created the file at `products/databases/cassandra.md`").
5.  **Content Creation:** You provide the content for the new file.
6.  **Automatic Indexing:** Once the content is saved, the agent automatically indexes the file into the vector database.
