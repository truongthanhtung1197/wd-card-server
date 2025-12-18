erDiagram

    USERS ||--o{ USER_ROLES : has
    USERS ||--o{ ORDERS : creates
    USERS ||--o{ CUSTOMERS : owns
    USERS ||--o{ SALES : becomes

    SALES ||--o{ CUSTOMERS : manages
    SALES ||--o{ ORDERS : earns_commission

    PACKAGES ||--o{ ORDERS : applied_to
    PACKAGES ||--o{ PACKAGE_FEATURES : defines

    TEMPLATES ||--o{ TEMPLATE_FIELDS : contains
    TEMPLATES ||--o{ WEDDINGS : used_by

    CUSTOMERS ||--o{ WEDDINGS : owns
    ORDERS ||--o{ WEDDINGS : grants_permission

    WEDDINGS ||--o{ WEDDING_CONTENTS : has
    WEDDINGS ||--o{ WEDDING_FRIENDS : personalizes
    WEDDINGS ||--o{ RSVPS : receives
    WEDDINGS ||--o{ MEDIA : stores


    USERS {
        bigint id PK
        varchar email
        varchar password_hash
        enum status
        datetime created_at

    }

    USER_ROLES {
        bigint id PK
        bigint user_id FK
        enum role
    }

    SALES {
        bigint id PK
        bigint user_id FK
        decimal commission_percent
        enum status
        full_name
        bank_name
        bank_number
    }

    CUSTOMERS {
        bigint id PK
        bigint user_id FK
        bigint sale_id FK
        varchar full_name
        varchar phone
        datetime created_at
    }

    PACKAGES {
        bigint id PK
        varchar name
        decimal price
        int duration_days
        enum status
    }

    PACKAGE_FEATURES {
        bigint id PK
        bigint package_id FK
        varchar feature_key
        varchar feature_description
        varchar feature_value
    }

    ORDERS {
        bigint id PK
        bigint user_id FK
        bigint package_id FK
        bigint sale_id FK
        decimal commission_percent_snapshot
        date start_at
        date end_at
        enum status
        payment_status
    }

    TEMPLATES {
        bigint id PK
        varchar name
        varchar preview_image
        enum status
    }

    TEMPLATE_FIELDS {
        bigint id PK
        bigint template_id FK
        varchar key
        varchar label
        varchar type
        boolean required
        int display_order
    }

    WEDDINGS {
        bigint id PK
        bigint user_id FK
        bigint customer_id FK
        bigint template_id FK
        bigint order_id FK
        varchar slug
        enum type
        enum status
        datetime created_at
    }

    WEDDING_CONTENTS {
        bigint id PK
        bigint wedding_id FK
        varchar key
        text value
    }

    WEDDING_FRIENDS {
        bigint id PK
        bigint wedding_id FK
        varchar friend_name
        varchar relation
        text personal_message
    }

    RSVPS {
        bigint id PK
        bigint wedding_id FK
        varchar guest_name
        enum attendance
        text message
        datetime created_at
    }

    MEDIA {
        bigint id PK
        bigint wedding_id FK
        varchar owner_type
        bigint owner_id
        enum media_type
        varchar url
        varchar thumb_url
        json metadata
        datetime created_at
    }
