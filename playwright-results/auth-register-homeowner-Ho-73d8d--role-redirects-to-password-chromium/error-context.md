# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/register-homeowner.spec.ts >> Homeowner registration flow @smoke >> step 3 – select homeowner role redirects to password
- Location: e2e/auth/register-homeowner.spec.ts:47:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByText(/homeowner/i) resolved to 2 elements:
    1) <p class="text-body font-semibold text-ink">Homeowner</p> aka getByRole('button', { name: 'Homeowner I want to plan my' })
    2) <p class="mb-4 text-eyebrow text-muted/60">For homeowners</p> aka getByText('For homeowners')

Call log:
  - waiting for getByText(/homeowner/i)

```

# Test source

```ts
  1  | import type { Page } from '@playwright/test';
  2  | import { expect } from '@playwright/test';
  3  | 
  4  | export class RegisterPage {
  5  |   constructor(private readonly page: Page) {}
  6  | 
  7  |   // Step 1 – email
  8  |   async gotoInit() {
  9  |     await this.page.goto('/register');
  10 |   }
  11 | 
  12 |   async fillEmailInit(email: string) {
  13 |     await this.page.getByLabel('Email').fill(email);
  14 |   }
  15 | 
  16 |   async acceptTerms() {
  17 |     const checkbox = this.page.locator('input[type="checkbox"]').first();
  18 |     if (!(await checkbox.isChecked())) await checkbox.check();
  19 |   }
  20 | 
  21 |   async submitInit() {
  22 |     await this.page.getByRole('button', { name: /continue|next|send/i }).click();
  23 |   }
  24 | 
  25 |   // Step 2 – OTP
  26 |   async fillOtp(code: string) {
  27 |     // The verify page uses a single input[inputmode="numeric"] with maxlength=6
  28 |     const single = this.page.locator('input[inputmode="numeric"]');
  29 |     if (await single.count() > 0) {
  30 |       await single.first().fill(code);
  31 |       return;
  32 |     }
  33 |     // Fallback: individual digit inputs (alternative OTP UI)
  34 |     const inputs = await this.page.locator('input[maxlength="1"], input[name^="digit"]').all();
  35 |     if (inputs.length >= 6) {
  36 |       const digits = code.split('');
  37 |       for (let i = 0; i < 6; i++) await inputs[i].fill(digits[i]);
  38 |     } else {
  39 |       await this.page.locator('input[type="text"]').first().fill(code);
  40 |     }
  41 |   }
  42 | 
  43 |   async submitOtp() {
  44 |     await this.page.getByRole('button', { name: /verify|confirm|next/i }).click();
  45 |   }
  46 | 
  47 |   // Step 3 – role
  48 |   async selectRole(role: 'homeowner' | 'contractor') {
  49 |     const label = role === 'homeowner' ? /homeowner/i : /contractor/i;
> 50 |     await this.page.getByText(label).click();
     |                                      ^ Error: locator.click: Error: strict mode violation: getByText(/homeowner/i) resolved to 2 elements:
  51 |   }
  52 | 
  53 |   async submitRole() {
  54 |     await this.page.getByRole('button', { name: /continue|next/i }).click();
  55 |   }
  56 | 
  57 |   // Step 4 – password
  58 |   async fillPassword(password: string) {
  59 |     await this.page.getByLabel(/^password$/i).fill(password);
  60 |     await this.page.getByLabel(/confirm password/i).fill(password);
  61 |   }
  62 | 
  63 |   async submitPassword() {
  64 |     await this.page.getByRole('button', { name: /continue|next|set/i }).click();
  65 |   }
  66 | 
  67 |   // Step 5 – profile
  68 |   async fillProfile(name: string, surname: string) {
  69 |     await this.page.getByLabel(/first name|name/i).first().fill(name);
  70 |     await this.page.getByLabel(/last name|surname/i).fill(surname);
  71 |   }
  72 | 
  73 |   async submitProfile() {
  74 |     await this.page.getByRole('button', { name: /finish|complete|create/i }).click();
  75 |   }
  76 | 
  77 |   async expectRedirectToVerify() {
  78 |     await expect(this.page).toHaveURL(/\/register\/verify/);
  79 |   }
  80 | 
  81 |   async expectRedirectToRole() {
  82 |     await expect(this.page).toHaveURL(/\/register\/role/);
  83 |   }
  84 | 
  85 |   async expectRedirectToPassword() {
  86 |     await expect(this.page).toHaveURL(/\/register\/password/);
  87 |   }
  88 | 
  89 |   async expectRedirectToProfile() {
  90 |     await expect(this.page).toHaveURL(/\/register\/profile/);
  91 |   }
  92 | }
  93 | 
```