---
title: "Apache Kafka"
tags: [ "message-queue", "streaming", "distributed-system", "pub-sub" ]
prerequisites:
  - "concepts/messaging/pub-sub.md"
status: "learning"
last_updated: "2025-08-22"
todos:
  - "Explain the role of Zookeeper/KRaft in managing the cluster."
  - "Detail the lifecycle of a message from producer to consumer."
  - "Add a section on Kafka's internal log-based architecture."
  - "Create and link prerequisite doc on the pub/sub pattern."
---

## Summary

Apache Kafka is a distributed streaming platform used for building real-time data pipelines and streaming applications. It is designed to be high-throughput, scalable, and fault-tolerant, functioning as a publish-subscribe messaging system where applications can send (produce) and receive (consume) streams of data records. Its core capability is handling continuous streams of data in a reliable and durable manner.

## Core Concepts

-   **Broker:** A single Kafka server. Brokers are responsible for receiving messages from producers, assigning them offsets, and storing them on disk.
-   **Cluster:** A group of brokers working together to form the Kafka messaging system. A cluster provides load balancing, scalability, and fault tolerance.
-   **Producer:** A client application that writes (publishes) streams of records to one or more Kafka topics.
-   **Consumer:** A client application that reads (subscribes to) streams of records from one or more Kafka topics.
-   **Topic:** A named category or feed to which records are published. Topics in Kafka are partitioned and spread across multiple brokers.
-   **Partition:** A topic is divided into one or more partitions. Each partition is an ordered, immutable sequence of records that is continually appended to. Partitions allow for parallelism, as multiple consumers can read from different partitions of the same topic simultaneously.
-   **Offset:** A unique, sequential ID assigned to each record within a partition. It guarantees the order of messages within that specific partition.

## Producer & Consumer Mechanics

### Writing Messages with Producers

-   **Message Keys:** Producers can send messages with a key (e.g., a user ID, a device ID). If a key is present, Kafka's default partitioner guarantees that all messages with the same key will always be sent to the same partition. This is critical for ensuring the order of messages for a specific entity. If the key is null, messages are distributed in a round-robin fashion across partitions.
-   **Acknowledgments (`acks`):** This producer setting controls the durability of a write. It's a trade-off between performance and reliability.
    -   `acks=0`: The producer doesn't wait for any acknowledgment. This offers the highest throughput but messages can be lost.
    -   `acks=1`: (Default) The producer waits for the leader broker to acknowledge the write. This is a balanced approach.
    -   `acks=all`: The producer waits for the leader and all in-sync replicas to acknowledge the write. This provides the strongest durability guarantee but has higher latency.

### Reading Messages with Consumers

-   **Consumer Groups:** A consumer group is a set of consumers that cooperate to consume data from a topic. Each partition of a topic is consumed by exactly one consumer within the group. This is Kafka's mechanism for scaling consumption and processing data in parallel. If you have more consumers in a group than partitions, the excess consumers will be idle.
-   **Offset Management:** Kafka tracks the last record fetched by a consumer group for each partition. This position is called the "offset." The process of updating this position is called an "offset commit." This is a critical concept for message delivery guarantees.
    -   **At-most-once:** Commit offsets before processing the message. If the consumer crashes after committing but before processing, the message is lost.
    -   **At-least-once:** Commit offsets after processing the message. If the consumer crashes after processing but before committing, the message will be re-processed by another consumer. This is the most common guarantee.
    -   **Exactly-once:** Achieved through more complex transactional capabilities in Kafka, ensuring a message is processed once and only once.
