---
title: "Zero Trust Security Model"
tags: ["security", "zero-trust", "networking"]
prerequisites: []
status: "stub"
last_updated: "2025-10-24"
---

## Core Principles

### No Implicit Trust Zone
- **Description**: Assumes no user or device is trusted by default, regardless of its location on the network (internal or external). Every access request must be authenticated and authorized.
- **Key Takeaway**: The network perimeter is dead. Trust is earned, not given.

### No Ownership Assumption
- **Description**: Assumes that the organization does not own the network or the devices connecting to it. This is critical in BYOD (Bring Your Own Device) and cloud environments.
- **Key Takeaway**: Secure the data and the access to it, not the pipes or the endpoints.

### Insecure Connections
- **Description**: All network traffic is assumed to be insecure and potentially hostile. All connections must be encrypted, authenticated, and monitored.
- **Key Takeaway**: Encrypt everything, everywhere.

### Consistent Security Policies
- **Description**: Security policies are applied consistently across all environments (on-prem, cloud, hybrid) and for all users and devices.
- **Key Takeaway**: Policy enforcement should be centralized and dynamic, not siloed and static.

---

## Continuous Verification

### Access Limitation
- **Description**: Follows the principle of least privilege. Users and devices are granted the minimum level of access required to perform their tasks.
- **Key Takeaway**: Just-in-time and just-enough access.

### Limit the Blast Radius
- **Description**: Micro-segmentation is used to create small, isolated network zones. If one segment is breached, the damage is contained.
- **Key Takeaway**: Isolate workloads and resources to prevent lateral movement.

### Automate
- **Description**: Automation is used for policy enforcement, threat detection, and incident response to ensure consistency and speed.
- **Key Takeaway**: Manual security is not scalable.

---

## Zero Trust Architecture Components

### Plane
- **Control Plane**: The "brains" of the system. It makes access decisions based on policies and signals from various sources (identity providers, device health, etc.).
- **Data Plane**: The "muscle" of the system. It enforces the decisions made by the control plane.

### Key Components
- **Policy Decision Point (PDP)**: The control plane component that makes the access decision. Also known as the Policy Engine.
- **Policy Enforcement Point (PEP)**: The data plane component that enforces the policy (e.g., a gateway, proxy, or agent).
- **Policy Administrator (PA)**: The component responsible for creating and managing security policies.
