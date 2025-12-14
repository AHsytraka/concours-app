# Backend Class Diagram

This document contains the UML class diagram for the Inscription Service backend.

## Entity Relationship Overview

```mermaid
---
title: Inscription Service - Backend Class Diagram
---
classDiagram
    direction TB

    %% Enumerations
    class UserRole {
        <<enumeration>>
        STUDENT
        INSTITUTION_ADMIN
        CONTEST_MANAGER
        DELIBERATION_MANAGER
        SYSTEM_ADMIN
    }

    class RegistrationStatus {
        <<enumeration>>
        PENDING
        UNDER_REVIEW
        FORM_INCOMPLETE
        PAYMENT_PENDING
        PAYMENT_VERIFIED
        APPROVED
        REJECTED
        CANCELLED
    }

    class ResultStatus {
        <<enumeration>>
        PASSED
        FAILED
        PENDING_DELIBERATION
        PENDING
        WAITING_LIST
    }

    class EventType {
        <<enumeration>>
        CONTEST
        SELECTION
    }

    class BacSeries {
        <<enumeration>>
        L
        OSE
        A
        A2
        C
        D
        S
        TECHNICAL
    }

    %% Main Entities
    class Institution {
        -Long id
        -String name
        -String acronym
        -String type
        -String registrationNumber
        -String description
        -String address
        -String city
        -String country
        -String phoneNumber
        -String email
        -String website
        -String logo
        -Boolean isActive
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
    }

    class User {
        -Long id
        -String email
        -String password
        -String firstName
        -String lastName
        -String cin
        -String birthDate
        -String birthPlace
        -String phone
        -String address
        -UserRole role
        -BacSeries bacSeries
        -Integer bacYear
        -String bacEntries
        -String highSchool
        -Double averageGrade
        -Boolean isActive
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
    }

    class Event {
        -Long id
        -String title
        -String description
        -EventType eventType
        -LocalDateTime registrationStart
        -LocalDateTime registrationEnd
        -LocalDateTime contestDate
        -LocalDateTime contestEndDate
        -LocalDateTime resultsDate
        -byte[] decreeFile
        -String decreeFilename
        -Boolean isDecreeVerified
        -List~String~ locations
        -Boolean isActive
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
    }

    class EventRegistration {
        -Long id
        -RegistrationStatus status
        -String registrationNumber
        -String formData
        -byte[] paymentReceiptFile
        -String paymentReceiptFilename
        -String paymentReference
        -Boolean isPaymentVerified
        -Boolean isFormCompleted
        -Boolean isSummonsSent
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
    }

    class ExamResult {
        -Long id
        -LocalDateTime examDate
        -String scoreData
        -Double totalScore
        -Double average
        -ResultStatus resultStatus
        -Integer ranking
        -Boolean isOnWaitlist
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
    }

    class Subject {
        -Long id
        -String name
        -Double coefficient
    }

    class DeliberationRule {
        -Long id
        -EventType eventType
        -String ruleName
        -Double passingScore
        -Double minAverage
        -Integer maxWaitlistPercentage
        -Boolean useWeightedAverage
        -String rankingAlgorithm
        -String customCriteria
        -String selectionCriteria
        -Boolean isActive
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
    }

    class RegistrationForm {
        -Long id
    }

    class RegistrationFormField {
        -Long id
        -String fieldName
        -String fieldLabel
        -String fieldType
        -Boolean isRequired
        -Boolean isAutoFilled
        -String autoFilledFrom
        -Integer fieldOrder
    }

    class SummonsTemplate {
        -Long id
        -String templateContent
        -String subject
    }

    class RegistrationNumber {
        -Long id
        -String registrationNumber
        -Boolean isUsed
        -String customFormat
    }

    class Document {
        -int id
        -String nom_fic
        -Boolean verifie
        -byte[] fichier
        -Boolean valide
        -String typeDocument
        -String donneesExtraites
        -Double scoreConfiance
    }

    class Inscription {
        -int id
        -int candidat_id
        -String nom
        -String prenom
        -String email
        -String statut
        -Date date_inscription
        -Boolean paiement_effectue
        -String Commentaire
        -Boolean admis
        -Boolean licence
        -Boolean master
    }

    %% Relationships
    Institution "1" --o "*" User : employs
    Institution "1" --o "*" Event : organizes
    Institution "1" --o "*" DeliberationRule : defines

    User "1" --o "*" EventRegistration : registers
    User "1" --o "*" ExamResult : receives

    Event "1" --o "*" EventRegistration : has
    Event "1" --o "*" ExamResult : produces
    Event "1" --o "*" Subject : contains
    Event "1" --o "*" RegistrationNumber : generates
    Event "1" --o "0..1" RegistrationForm : uses
    Event "1" --o "0..1" SummonsTemplate : uses
    Event "*" --o "0..1" DeliberationRule : follows

    RegistrationForm "1" --o "*" RegistrationFormField : contains

    RegistrationNumber "1" --o "0..1" EventRegistration : assigned to

    Inscription "1" --o "*" Document : has

    User ..> UserRole : has
    User ..> BacSeries : has
    Event ..> EventType : has
    EventRegistration ..> RegistrationStatus : has
    ExamResult ..> ResultStatus : has
```

## Entity Descriptions

### Core Entities

| Entity | Description |
|--------|-------------|
| **Institution** | Universities and educational institutions that organize contests |
| **User** | System users (students, admins, contest managers) |
| **Event** | Contests or selection processes organized by institutions |
| **EventRegistration** | Student registrations for specific events |
| **ExamResult** | Exam scores and deliberation results |

### Supporting Entities

| Entity | Description |
|--------|-------------|
| **Subject** | Exam subjects with coefficients for grade calculation |
| **DeliberationRule** | Rules for automatic grade deliberation |
| **RegistrationForm** | Custom registration form definitions |
| **RegistrationFormField** | Individual fields in registration forms |
| **SummonsTemplate** | Email templates for exam summons |
| **RegistrationNumber** | Pre-generated registration numbers for events |

### Legacy Entities

| Entity | Description |
|--------|-------------|
| **Inscription** | Legacy registration system |
| **Document** | Documents attached to legacy inscriptions |

### Enumerations

| Enum | Values |
|------|--------|
| **UserRole** | STUDENT, INSTITUTION_ADMIN, CONTEST_MANAGER, DELIBERATION_MANAGER, SYSTEM_ADMIN |
| **RegistrationStatus** | PENDING, UNDER_REVIEW, FORM_INCOMPLETE, PAYMENT_PENDING, PAYMENT_VERIFIED, APPROVED, REJECTED, CANCELLED |
| **ResultStatus** | PASSED, FAILED, PENDING_DELIBERATION, PENDING, WAITING_LIST |
| **EventType** | CONTEST, SELECTION |
| **BacSeries** | L, OSE, A, A2, C, D, S, TECHNICAL |

## Key Relationships

1. **Institution → Users**: One institution has many users (admins, managers)
2. **Institution → Events**: One institution organizes many events
3. **User → EventRegistration**: One user can register for many events
4. **Event → EventRegistration**: One event has many registrations
5. **Event → Subject**: One event has multiple exam subjects
6. **User/Event → ExamResult**: Results link users to their scores per event
7. **Event → DeliberationRule**: Events can follow deliberation rules for auto-grading
