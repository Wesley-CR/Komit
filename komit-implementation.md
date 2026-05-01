# Komit — Backend Implementation Spec

You are implementing the backend for **Komit**, a single-tenant commission tracker for an artist. This is a university project for IC-6821 Diseño de Software (TEC). Follow this spec exactly. Do not add features beyond what is specified.

## Stack

- **Java 21**
- **Spring Boot 3.4.x** (latest stable)
- **Maven**
- **PostgreSQL 17** (running in Docker)
- **JPA / Hibernate**
- **Lombok**
- **springdoc-openapi** for Swagger UI
- Base package: `com.swj.komit`

## Project Constraints (from course spec)

- Backend only. No frontend, no Thymeleaf, no HTML views.
- No security/auth (explicitly out of scope).
- REST API (chosen over GraphQL).
- Layered architecture: Controllers → Services → Repositories → Entities.
- Clean separation of concerns. Constructor injection only (no field `@Autowired`).
- Use DTOs for all API input/output. Never expose JPA entities directly.
- All JPA relationships default to `LAZY` unless explicitly justified otherwise.

## Package Structure

```
com.swj.komit
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
│   ├── request/
│   └── response/
├── mapper/
├── exception/
├── enums/
└── KomitApplication.java
```

## Configuration Files

### `src/main/resources/application.yml`

```yaml
spring:
  application:
    name: komit
  datasource:
    url: jdbc:postgresql://localhost:5432/komit
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
server:
  port: 8080
springdoc:
  swagger-ui:
    path: /swagger-ui.html
```

### `docker-compose.yml` (project root)

```yaml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: komit
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Maven dependencies (`pom.xml`)

Required starters / libraries:
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `org.postgresql:postgresql` (runtime)
- `org.projectlombok:lombok` (provided + annotation processor)
- `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.7.0`
- `spring-boot-starter-test` (test scope, included by default)

---

## Domain Model

### Enums (in `com.swj.komit.enums`)

```java
public enum CommissionStatus {
    PENDING, IN_PROGRESS, COMPLETED, CANCELLED
}

public enum MilestoneStatus {
    PENDING, IN_PROGRESS, COMPLETED, CANCELLED
}

public enum RevisionStatus {
    PENDING, ADDRESSED, REJECTED
}
```

All enums must be persisted with `@Enumerated(EnumType.STRING)`.

### Entities (in `com.swj.komit.entity`)

All entities use:
- `@Entity`
- Lombok `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`
- `Long id` as primary key with `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- `LocalDateTime createdAt` and `LocalDateTime updatedAt` audit columns where it makes sense (Commission, Milestone, Revision, Payment). Use `@PrePersist` / `@PreUpdate` to populate them, OR enable `@EnableJpaAuditing` with `@CreatedDate` / `@LastModifiedDate`.

#### 1. Client
- `String name` (required, not blank)
- `String contact` (required, not blank — free-form: email/discord/twitter handle)
- `String notes` (optional, `@Column(columnDefinition = "TEXT")`)
- `OneToMany` to Commission (mappedBy = "client")

#### 2. CommissionType
- `String name` (required, unique)
- `String description` (optional, TEXT)
- `BigDecimal basePrice` (required, precision 10 scale 2)
- `OneToMany` to Commission (mappedBy = "commissionType")

#### 3. Commission
- `String title` (required)
- `String description` (TEXT)
- `@ManyToOne` Client (required, FK `client_id`)
- `@ManyToOne` CommissionType (required, FK `commission_type_id`)
- `CommissionStatus status` (required, default PENDING)
- `LocalDate deadline` (optional)
- `BigDecimal agreedPrice` (required, precision 10 scale 2)
- `String currency` (required, e.g., "USD", "CRC", default "USD")
- `LocalDateTime createdAt`, `LocalDateTime updatedAt`
- `LocalDateTime cancelledAt` (nullable)
- `String cancellationReason` (nullable, TEXT)
- `@OneToMany` Milestone (mappedBy = "commission", cascade = ALL, orphanRemoval = true)
- `@OneToMany` Payment (mappedBy = "commission", cascade = ALL, orphanRemoval = true)
- `@OneToMany` Reference (mappedBy = "commission", cascade = ALL, orphanRemoval = true)
- `@ManyToMany` Tag (via join table `commission_tag`)

#### 4. Milestone
- `String name` (required, e.g., "Sketch", "Lineart", "Color", "Final")
- `Integer orderIndex` (required, position in the workflow)
- `@ManyToOne` Commission (required, FK `commission_id`)
- `MilestoneStatus status` (required, default PENDING)
- `LocalDate dueDate` (optional)
- `LocalDateTime completedAt` (nullable)
- `String deliverableUrl` (nullable — set when completed)
- `@OneToMany` Revision (mappedBy = "milestone", cascade = ALL, orphanRemoval = true)

#### 5. Revision
- `@ManyToOne` Milestone (required, FK `milestone_id`)
- `Integer roundNumber` (required, auto-assigned: max(roundNumber) + 1 for that milestone, starting at 1)
- `String feedbackText` (required, TEXT)
- `LocalDateTime requestedAt` (required, set on creation)
- `LocalDateTime addressedAt` (nullable)
- `RevisionStatus status` (required, default PENDING)

#### 6. Payment
- `@ManyToOne` Commission (required, FK `commission_id`)
- `BigDecimal amount` (required, precision 10 scale 2, must be > 0)
- `String paymentMethod` (required, free-form: "PayPal", "SINPE", "Wise", etc.)
- `LocalDateTime paidAt` (required)
- `String notes` (optional, TEXT)

#### 7. Reference
- `@ManyToOne` Commission (required, FK `commission_id`)
- `String url` (required)
- `String description` (optional)

#### 8. Tag
- `String name` (required, unique)
- `@ManyToMany(mappedBy = "tags")` Commission (no cascade — tags exist independently)

#### 9. Join table `commission_tag`
- Implicit via `@ManyToMany` + `@JoinTable(name = "commission_tag", joinColumns = @JoinColumn(name = "commission_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))` on the Commission side.

---

## Repositories (in `com.swj.komit.repository`)

One per entity, all extend `JpaRepository<Entity, Long>`. Add custom query methods as needed for filtering. Examples:

```java
public interface CommissionRepository extends JpaRepository<Commission, Long> {
    List<Commission> findByStatus(CommissionStatus status);
    List<Commission> findByClientId(Long clientId);
    List<Commission> findByDeadlineBefore(LocalDate date);
    List<Commission> findByTagsId(Long tagId);
}

public interface RevisionRepository extends JpaRepository<Revision, Long> {
    List<Revision> findByMilestoneId(Long milestoneId);
    List<Revision> findByMilestoneIdAndStatus(Long milestoneId, RevisionStatus status);
    Optional<Revision> findTopByMilestoneIdOrderByRoundNumberDesc(Long milestoneId);
}
```

Add other obvious finders per entity (`findByCommissionId`, etc.).

---

## DTOs (in `com.swj.komit.dto`)

### Request DTOs (`com.swj.komit.dto.request`)

Use Java records or Lombok-annotated classes. Apply `jakarta.validation` annotations: `@NotBlank`, `@NotNull`, `@Positive`, `@Size`, `@Email` where appropriate.

Required request DTOs:
- `CreateClientRequest`, `UpdateClientRequest`
- `CreateCommissionTypeRequest`, `UpdateCommissionTypeRequest`
- `CreateCommissionRequest` (includes optional list of milestone definitions to override defaults)
- `UpdateCommissionRequest`
- `CancelCommissionRequest` (optional reason)
- `CreateMilestoneRequest`, `UpdateMilestoneRequest`
- `CompleteMilestoneRequest` (deliverableUrl, forceComplete boolean)
- `CreateRevisionRequest` (feedbackText only — roundNumber and status are server-set)
- `CreatePaymentRequest`
- `CreateReferenceRequest`
- `CreateTagRequest`
- `AssignTagRequest` (tagId)

### Response DTOs (`com.swj.komit.dto.response`)

No validation annotations. Designed for clean serialization. Avoid bidirectional cycles — children include parent IDs but not parent objects.

Required response DTOs:
- `ClientResponse`
- `CommissionTypeResponse`
- `CommissionResponse` (includes nested lists of milestones, payments, references, tags)
- `CommissionSummaryResponse` (lighter version for list endpoints — no nested collections)
- `MilestoneResponse` (includes nested revisions)
- `RevisionResponse`
- `PaymentResponse`
- `ReferenceResponse`
- `TagResponse`
- `BalanceResponse` (agreedPrice, totalPaid, balance, isOverpaid, tipAmount)

---

## Mappers (in `com.swj.komit.mapper`)

Manual mapper classes (no MapStruct — keep it simple). One per entity. Static methods or Spring `@Component` beans, your choice — be consistent.

Required mappers:
- `ClientMapper`, `CommissionTypeMapper`, `CommissionMapper`, `MilestoneMapper`, `RevisionMapper`, `PaymentMapper`, `ReferenceMapper`, `TagMapper`

Each provides:
- `toEntity(CreateXRequest)` — for creates
- `updateEntity(Entity, UpdateXRequest)` — applies non-null fields
- `toResponse(Entity)` — for outputs
- `toResponseList(List<Entity>)` — for collections

---

## Services (in `com.swj.komit.service`)

Concrete classes (no interfaces — alcance académico). Constructor injection with `final` fields and Lombok `@RequiredArgsConstructor`. Annotated `@Service` and `@Transactional` at class level (override with `@Transactional(readOnly = true)` for read-only methods).

One service per entity. Services orchestrate repository calls, enforce business rules, and handle mapping (or delegate to mappers).

### Critical business rules to enforce in services:

1. **Creating a Commission auto-generates milestones from the CommissionType.** For now, since we don't model template milestones on CommissionType, default to four milestones: "Sketch" (order 1), "Lineart" (order 2), "Color" (order 3), "Final" (order 4), all PENDING. If `CreateCommissionRequest` provides custom milestones, use those instead.

2. **Completing a milestone with PENDING revisions:** if the request's `forceComplete` is `false` and the milestone has any revisions in `PENDING` status, throw `BusinessRuleException` with HTTP 409. The exception message must list the pending revision IDs so the client can confirm. If `forceComplete` is `true`, proceed and complete the milestone (set status COMPLETED, completedAt = now, deliverableUrl from request).

3. **Registering a Revision:**
   - Auto-assign `roundNumber` as `max(roundNumber) + 1` for that milestone, starting at 1 if none exist.
   - Set `requestedAt = now()`, `status = PENDING`.
   - Allowed even if the milestone is already COMPLETED (reflects real-world post-delivery feedback).

4. **Addressing a Revision:** sets status to ADDRESSED and `addressedAt = now()`. Rejecting sets status to REJECTED. Both fail if the revision is not currently PENDING.

5. **Registering a Payment:** allowed even if total payments exceed `agreedPrice`. The excess is treated as a tip — never reject. The `BalanceResponse` exposes this via `isOverpaid` and `tipAmount`.

6. **Cancelling a Commission:**
   - Sets commission status to CANCELLED, `cancelledAt = now()`, stores the reason if provided.
   - Cascades: any milestone in PENDING or IN_PROGRESS becomes CANCELLED. COMPLETED milestones are preserved.
   - Payments and revisions are preserved as-is (historical record).
   - Fails with 409 if commission is already COMPLETED or CANCELLED.

7. **Balance calculation:** `totalPaid = sum(payments.amount)`. `balance = agreedPrice - totalPaid`. If `totalPaid > agreedPrice`, `isOverpaid = true`, `tipAmount = totalPaid - agreedPrice`, `balance = 0`.

---

## Controllers (in `com.swj.komit.controller`)

All controllers:
- Annotated `@RestController` and `@RequestMapping("/api/...")`.
- Constructor injection.
- Methods return `ResponseEntity<T>`.
- Validate request bodies with `@Valid`.
- Correct HTTP status codes:
  - `201 Created` for successful POST creating a resource (with `Location` header when feasible).
  - `200 OK` for successful GET / PUT / action endpoints.
  - `204 No Content` for successful DELETE.
  - `404 Not Found` via `ResourceNotFoundException`.
  - `409 Conflict` via `BusinessRuleException`.
  - `400 Bad Request` via validation errors (handled globally).

### Endpoints to implement

#### Clients — `/api/clients`
```
GET    /api/clients
GET    /api/clients/{id}
POST   /api/clients
PUT    /api/clients/{id}
DELETE /api/clients/{id}
GET    /api/clients/{id}/commissions
```

#### Commission Types — `/api/commission-types`
```
GET    /api/commission-types
GET    /api/commission-types/{id}
POST   /api/commission-types
PUT    /api/commission-types/{id}
DELETE /api/commission-types/{id}
```

#### Commissions — `/api/commissions`
```
GET    /api/commissions                    (query params: status, clientId, deadlineBefore, tagId)
GET    /api/commissions/{id}
POST   /api/commissions
PUT    /api/commissions/{id}
DELETE /api/commissions/{id}
POST   /api/commissions/{id}/cancel        (body: CancelCommissionRequest)
GET    /api/commissions/{id}/balance
```

For `GET /api/commissions`, support all four query params combinable. Use `@RequestParam(required = false)`.

#### Milestones
```
GET    /api/commissions/{commissionId}/milestones
POST   /api/commissions/{commissionId}/milestones
PUT    /api/milestones/{id}
DELETE /api/milestones/{id}
POST   /api/milestones/{id}/complete       (body: CompleteMilestoneRequest)
```

#### Revisions
```
GET    /api/milestones/{milestoneId}/revisions
POST   /api/milestones/{milestoneId}/revisions
GET    /api/revisions/{id}
POST   /api/revisions/{id}/address
POST   /api/revisions/{id}/reject
DELETE /api/revisions/{id}
```

#### Payments
```
GET    /api/commissions/{commissionId}/payments
POST   /api/commissions/{commissionId}/payments
GET    /api/payments/{id}
DELETE /api/payments/{id}
```
(no PUT — payments are immutable historical records; correction is delete-and-recreate)

#### References
```
GET    /api/commissions/{commissionId}/references
POST   /api/commissions/{commissionId}/references
DELETE /api/references/{id}
```

#### Tags
```
GET    /api/tags
POST   /api/tags
DELETE /api/tags/{id}
POST   /api/commissions/{commissionId}/tags         (body: AssignTagRequest with tagId)
DELETE /api/commissions/{commissionId}/tags/{tagId}
```

---

## Exception Handling (in `com.swj.komit.exception`)

### Custom exceptions

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}

public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) { super(message); }
}
```

### `GlobalExceptionHandler` annotated `@RestControllerAdvice`

Handle:
- `ResourceNotFoundException` → 404 with `{ "error": "...", "message": "..." }`
- `BusinessRuleException` → 409 with same shape
- `MethodArgumentNotValidException` (from `@Valid`) → 400 with field errors
- `Exception` (catch-all) → 500 with generic message

Define an `ErrorResponse` DTO: `{ String error, String message, LocalDateTime timestamp, Map<String, String> fieldErrors (optional) }`.

---

## Code Quality Requirements

These will be evaluated. Follow them strictly:

1. **Constructor injection only.** No `@Autowired` on fields. Use `@RequiredArgsConstructor` from Lombok with `final` fields.
2. **Single Responsibility Principle.** Each service handles one entity's business logic. Cross-entity orchestration goes in the most-relevant service (e.g., creating a Commission with auto-generated milestones lives in `CommissionService`, not `MilestoneService`).
3. **No business logic in controllers.** Controllers only: validate input, call service, map to response, return ResponseEntity.
4. **No JPA entities returned from controllers.** Always DTOs.
5. **All `@ManyToOne` and `@OneToMany` are `LAZY`.** Default for `@OneToMany` is already lazy; for `@ManyToOne` you must specify `fetch = FetchType.LAZY` explicitly.
6. **Use `@Transactional(readOnly = true)` for read methods.** Default `@Transactional` for writes.
7. **Validation on all request DTOs.** Required fields use `@NotNull` / `@NotBlank`; numeric constraints use `@Positive` / `@Min` / `@Max`.
8. **No `System.out.println`.** Use SLF4J: `private static final Logger log = LoggerFactory.getLogger(ClassName.class);` or Lombok's `@Slf4j`.
9. **Meaningful exception messages.** "Client with id 5 not found" — not "not found".
10. **No magic strings/numbers** for things like default milestone names. Define constants where appropriate.

---

## Implementation Order (suggested)

To keep the project compilable at every step:

1. Initialize Maven project, set up `pom.xml`, create package structure.
2. Create `application.yml` and `docker-compose.yml`. Verify postgres container starts.
3. Implement enums.
4. Implement all entities with their relationships. Run the app once to verify Hibernate creates all tables.
5. Implement repositories.
6. Implement DTOs (request and response).
7. Implement mappers.
8. Implement exception classes and `GlobalExceptionHandler`.
9. Implement services in this order: `ClientService`, `CommissionTypeService`, `TagService`, `CommissionService`, `MilestoneService`, `RevisionService`, `PaymentService`, `ReferenceService`. (Bottom-up by dependency.)
10. Implement controllers in the same order as services.
11. Verify Swagger UI loads at `http://localhost:8080/swagger-ui.html` and shows all endpoints.

---

## Out of Scope — Do Not Implement

- Authentication, authorization, security
- Frontend, HTML views, Thymeleaf
- Email sending, notifications, file uploads
- Caching, async processing
- Database migrations (Flyway/Liquibase) — `ddl-auto=update` is sufficient
- Unit/integration tests (the spec doesn't require them; if there's time at the end, add a smoke test for `CommissionService.createCommission`)
- Pagination on list endpoints (return full lists for now)
- Soft deletes (use hard deletes)

---

## Final Deliverable

A running Spring Boot app that:
- Starts cleanly with `mvn spring-boot:run` after `docker compose up -d`.
- Exposes all endpoints listed above.
- Returns appropriate HTTP status codes.
- Has Swagger UI available for exploration.
- Has zero compilation warnings beyond Lombok-related ones.

When done, print a summary of:
- All endpoints implemented (grouped by resource).
- Any deviations from this spec (with justification).
- Any TODOs or known limitations.
