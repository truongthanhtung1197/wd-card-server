## Remaining Todos (ERD Refactor)

1. **update-order-module**
   - Redefine `Order` entity to match `ORDERS` in `docs/erd.md` (user_id, package_id, sale_id, commission_percent_snapshot, start_at, end_at, status).
   - Implement basic CRUD service + controller (`create`, `list`, `detail`, `update`, `soft delete`) using DTOs and guards (JwtAuthGuard + RolesGuard).

2. **create-template-modules**
   - Create `Template` entity/module for `TEMPLATES` (id, name, preview_image, status).
   - Create `TemplateField` entity/module for `TEMPLATE_FIELDS` (template_id, key, label, type, required, display_order).
   - Add CRUD APIs for both (basic create/list/detail/update/soft delete).

3. **create-wedding-modules**
   - Implement modules for:
     - `WEDDINGS` (user_id, customer_id, template_id, order_id, slug, type, status, created_at).
     - `WEDDING_CONTENTS` (wedding_id, key, value).
     - `WEDDING_FRIENDS` (wedding_id, friend_name, relation, personal_message).
   - Provide CRUD APIs for each, wired with appropriate FKs to `User`, `Customer`, `Template`, `Order`.

4. **create-rsvp-module**
   - Create `Rsvp` entity/module for `RSVPS` (wedding_id, guest_name, attendance, message, created_at).
   - Add CRUD APIs for RSVPs under a `/rsvps` (or nested under weddings) endpoint.

5. **create-media-module**
   - Create `Media` entity/module for `MEDIA` (wedding_id, owner_type, owner_id, media_type, url, thumb_url, metadata, created_at).
   - Add basic CRUD APIs; upload/storage integration sẽ xử lý sau.

6. **update-guards**
   - Update `RolesGuard` (and any dependent logic) to read roles strictly from `USER_ROLES` (via `UserRole` entity) instead of legacy `User.role` relation.
   - Ensure `ROLE.SUPER_ADMIN` bypass logic still works with the new source of truth.

7. **create-constants**
   - Add dedicated constants (under `src/shared/constants/`) for remaining enums in ERD:
     - Order status for new `ORDERS` (if khác với legacy `ORDER_STATUS`).
     - Template status.
     - Wedding type & status.
     - Rsvp attendance.
     - Media type.

8. **update-app-module**
   - After all new modules are created, ensure `AppModule` only imports modules that exist in the new ERD model (User, UserRole, Sales, Customer, Package, PackageFeature, Order, Template, TemplateField, Wedding*, Rsvp, Media, Notification, Auth, etc.).
   - Loại bỏ hoàn toàn mọi import/module còn sót lại từ kiến trúc cũ (nếu còn).


