# /register routes — Multi-step registration

Four-step flow. Each step passes the email forward via URL search params.
The password is held in `sessionStorage` between steps 3 and 4 and cleared after account creation.

| Step | Route                    | Action                                             | Next                        |
|------|--------------------------|----------------------------------------------------|-----------------------------|
| 1    | `/register`              | Email + terms → `POST /api/users/register/init`    | `/register/verify?email=…`  |
| 2    | `/register/verify`       | 6-digit OTP → `POST /api/users/register/verify`    | `/register/password?email=…`|
| 3    | `/register/password`     | Password + confirm → saved to sessionStorage        | `/register/profile?email=…` |
| 4    | `/register/profile`      | Name, surname, reason?, promo? → `POST /api/users/register/complete` → auto-login → `/projects` |

## Resend OTP

On the verify page, "Resend code" calls `POST /api/users/register/init` again (with the
same email), which upserts a fresh token and sends a new email.

## Guard

If the user lands on `/register/profile` without a password in sessionStorage, they are
redirected back to `/register/password`.
