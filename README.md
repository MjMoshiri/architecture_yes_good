# Software Architecture Knowledge Base

This repository is my personal knowledge base, dedicated to documenting my journey of learning software architecture and system design. The goal is to create a structured and searchable collection of notes on various concepts, products, and real-world systems.

## Purpose

Over time, this repository will grow into a comprehensive resource covering a wide range of topics, from foundational concepts like the CAP theorem to specific technologies like Apache Kafka and analyses of systems like Twitter.

The intention is to not only store information but to structure it in a way that builds a connected knowledge graph, making it easy to see relationships and prerequisites between different topics.

## Structure

The content is organized into three main categories:

-   `/concepts`: Foundational ideas, patterns, and architectural principles.
-   `/products`: Specific technologies, databases, and tools.
-   `/systems`: Analyses and case studies of large-scale system designs.

For the detailed rules on structure, file naming, and content templates, please see the `[GUIDE.md](GUIDE.md)`.

## Searchable Knowledge

This is more than just a collection of markdown files. The repository includes a Python-based tool, `knowledge_base.py`, which uses a local vector database (ChromaDB) to provide semantic search capabilities.

-   **Adding Content:** When a new topic is added or updated, the `knowledge_base.py add <file_path>` command is used to parse the document and index it.
-   **Searching:** The `knowledge_base.py search "<query>"` command allows for searching the entire knowledge base using natural language, helping to find the most relevant documents for a given question.

This turns a simple set of notes into a powerful, personal search engine for software architecture topics.

### Example Search

![Example Search Result](assets/search_example.png)
