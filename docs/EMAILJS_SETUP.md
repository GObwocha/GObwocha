# EmailJS Notification Setup Guide (No Custom Domain Required)

This guide walks you through setting up **EmailJS** so that contact enquiries submitted on [gobwocha.vercel.app/contact](https://gobwocha.vercel.app/contact) are delivered directly to your personal Gmail inbox (**`ondiekobwocha@gmail.com`**) with **zero custom domain or DNS verification** required.

---

## 1. Why EmailJS?

- **Direct Gmail Connection:** Connects directly to your Gmail account via secure Google OAuth.
- **No Custom Domain Needed:** You don't need to purchase or configure DNS/DKIM/SPF records.
- **100% Free:** Free tier provides 200 emails per month, ideal for a professional personal portfolio.
- **Dual Reliability:** Enquiries are both saved permanently in your **Supabase PostgreSQL database** and forwarded immediately to your **Gmail inbox**.
- **Instant Direct Reply:** Hitting **Reply** in Gmail responds directly to the visitor (`reply_to: visitor_email`).

---

## 2. Step-by-Step Setup (Takes ~3 Minutes)

### Step 1: Create an EmailJS Account
1. Visit **[emailjs.com](https://www.emailjs.com/)** and sign up for a free account.

### Step 2: Connect Your Gmail Account (Get Service ID)
1. In the left navigation, click **Email Services**.
2. Click **Add New Service**.
3. Select **Gmail**.
4. Click **Connect Account** and log in with your personal email: `ondiekobwocha@gmail.com`.
5. Check the box to grant EmailJS permission to send emails on your behalf.
6. Click **Create Service**.
7. Note down your **Service ID** (e.g. `service_ab12cd3`).

---

### Step 3: Create an Email Template (Get Template ID)
1. In the left navigation, click **Email Templates**.
2. Click **Create New Template**.
3. Set the **Subject line**:
   ```text
   New Portfolio Enquiry: {{from_name}} — {{project_type}}
   ```
4. In the **Content** body, paste:
   ```text
   You have received a new client enquiry from gobwocha.vercel.app:

   Client Name:  {{from_name}}
   Client Email: {{from_email}}
   Project Scope: {{project_type}}
   Received:     {{timestamp}}

   Client Message:
   ------------------------------------------------------------
   {{message}}
   ------------------------------------------------------------

   💡 Quick Reply: Simply hit "Reply" in your email client to reply directly to {{from_name}} ({{from_email}}).
   ```
5. Click the **Settings** tab (top right of the editor):
   - **To Email:** `ondiekobwocha@gmail.com`
   - **From Name:** `{{from_name}} (Portfolio Enquiry)`
   - **Reply To:** `{{reply_to}}` *(Crucial: this ensures hitting Reply in Gmail emails the visitor directly!)*
6. Click **Save** at the top right.
7. Note down your **Template ID** (e.g. `template_xy45zw6`).

---

### Step 4: Get Your Public Key
1. In the left navigation, click **Account**.
2. Under the **API Keys** tab, find **Public Key**.
3. Copy your **Public Key** (e.g. `aBcDeFg1234567`).

---

## 3. Adding the Variables to Vercel & Local Development

### For Local Testing (`.env.local`)
Add the 3 variables to your `.env.local` file:
```env
VITE_EMAILJS_SERVICE_ID=service_your_service_id
VITE_EMAILJS_TEMPLATE_ID=template_your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### For Production (Vercel Dashboard)
To activate this on your live deployment:
1. Open your **[Vercel Dashboard](https://vercel.com/)** -> select your `gobwocha` project.
2. Go to **Settings** -> **Environment Variables**.
3. Add the following 3 environment variables:
   - `VITE_EMAILJS_SERVICE_ID` = `service_your_service_id`
   - `VITE_EMAILJS_TEMPLATE_ID` = `template_your_template_id`
   - `VITE_EMAILJS_PUBLIC_KEY` = `your_public_key`
4. Select all environments (**Production**, **Preview**, **Development**).
5. Click **Save**.
6. Go to the **Deployments** tab, click the three dots (`...`) on your latest deployment, and click **Redeploy** (so Vercel bakes the new public environment variables into the frontend build).

---

## 4. Verification

1. Go to your live contact page: **[`https://gobwocha.vercel.app/contact`](https://gobwocha.vercel.app/contact)**.
2. Submit a test message with your name and message.
3. Check your Gmail inbox (`ondiekobwocha@gmail.com`):
   - The notification email will arrive within seconds.
   - Click **Reply** in Gmail to verify it addresses your test sender email directly.
4. Check your Supabase database:
   - The enquiry is also recorded in `public.contact_submissions`.
