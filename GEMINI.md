# Gemini Agent Guidelines for Knowledge Base Management

This document outlines the rules and workflow for me, the Gemini agent, to follow when managing this knowledge base repository.

## 1. Core Objective

The repository is a personal, searchable knowledge base on software engineering topics. My primary role is to help you add new, high-quality, and consistently formatted content. The key is that every document must be indexed in the local ChromaDB vector database to be searchable.

## 2. Content Types

There are four primary types of content I will create:

-   **Concepts (`/concepts`):** A deep-dive article on a single, standalone topic. These are the foundational building blocks.
    -   *Example: `concepts/distributed-systems/raft.md`*
-   **Products (`/products`):** A detailed document about a specific technology, database, or tool. Structurally, these are identical to `concepts`.
    -   *Example: `products/kafka.md`*
-   **Case Studies (`/case-studies`):** An analysis of a real-world system design or architecture. These are more narrative in structure.
    -   *Example: `case-studies/netflix-kafka.md`*
-   **Paths (`/paths`):** A curated sequence of documents designed to guide learning on a broader subject. These files are linked together using the `prerequisites` field.
    -   *Example: `paths/security-plus/core-security-principles.md`*

## 3. File Structure and Content Rules

Every file I create MUST adhere to the following structure to ensure it can be parsed and indexed correctly by the `knowledge_base.py` script.

### 3.1. File Naming

-   Use lowercase letters.
-   Separate words with hyphens (`-`).
-   Use the `.md` extension.
-   Example: `concepts/distributed-systems/raft.md`

### 3.2. YAML Frontmatter

Every file MUST begin with a YAML frontmatter block.

```yaml
---
title: "Title of the Document"
tags: [ "tag1", "tag2", "relevant-keywords" ]
prerequisites: [ "path/to/prerequisite.md" ] # Leave empty [] if none
status: "draft" # Can be draft, learning, or complete
last_updated: "YYYY-MM-DD" # The date of the last significant edit
todos: # Optional: A list of future improvements
  - "Add a diagram."
  - "Explain a related concept."
---
```

-   **`title`**: The formal title of the document.
-   **`tags`**: A list of lowercase keywords.
-   **`prerequisites`**: A list of paths to other documents that should be read first.
-   **`status`**: The maturity of the content. I will default to `draft`.
-   **`last_updated`**: I will use the current date.

### 3.3. Markdown Content

-   **For `concepts` and `products`:**
    -   `## Summary`: A concise, one-paragraph overview.
    -   `## Core Concepts`: A breakdown of the key ideas.
    -   `## Use Cases`: (Optional but recommended) When the concept/product is applicable.
    -   `## References`:** This section should only be included if you explicitly provide links or if I use external sources to generate the content. Otherwise, it will be omitted.
-   **For `case-studies`:** The structure is more flexible and narrative, often including sections like `## The Problem`, `## The Solution`, and `## Scale and Architecture`.
-   **For `paths`:** The structure is flexible, designed to logically guide learning through a topic.

## 4. My Workflow

When you ask me to add new content, I will follow this exact procedure:

1.  **Clarify & Plan:** I will determine the type (`concept`, `product`, `case-study`, or `path`) based on what you asked and use that to determine the correct file path.
2.  **Draft Content:** I will write the full markdown content, including the YAML frontmatter, following all the rules above.
3.  **Write File:** I will use the `write_file` tool to save the content.
4.  **Review and Approval:** I will await your feedback or approval of the quality of the content before proceeding.
5.  **Index Document:** I will then run the `knowledge_base.py` script to add the new document to the vector database. The command will be:
    ```bash
    python knowledge_base.py add "path/to/new-file.md"
    ```
6.  **Commit File:** After indexing, I will prepare the file for a git commit by:
    a. I will pull the latest changes from the remote repository.
    b. I will stage the new file using `git add "path/to/new-file.md"`.
    c. I will verify with `git status`.
    d. I will commit with a message (e.g., `Add <Topic Name>`).
    e. I will push the commit to the remote repository.
