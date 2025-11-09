# Email System Documentation

## Overview
The BSWD application uses Supabase Edge Functions with Resend API for sending psycho-educational assessment referral emails.

## Architecture
```
User Form → Frontend → Edge Function → Resend API → Email Delivered
```

**Simple & Direct:**
- No queue system
- No automation needed
- Instant email delivery (10-20 seconds)

## Components

### 1. Edge Function
**Location:** `supabase/functions/send-psycho-ed-email/index.ts`

**What it does:**
- Receives email request from frontend
- Sends email immediately via Resend API
- Returns success/failure response

**Deployed to:** Supabase project `lspqgwjlifgepomifbrd`

### 2. Frontend Integration
**Location:** `frontend/src/lib/notify.ts`

**Function:** `sendPsychoEdReferral(email, studentName, studentId)`

**Usage in form:** Called when user checks "Psycho-Educational Assessment" checkbox

### 3. Environment Variables

**Supabase Secrets (Edge Function):**
- `RESEND_API_KEY` - Set via Supabase CLI

**Frontend (.env.local):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Configuration

### Resend API
- **Test Domain:** `onboarding@resend.dev` (current)
- **Production:** Requires verified domain
- **API Key:** Configured in Supabase secrets

### Email Template
Current email includes:
- Subject: "Psycho-Educational Assessment Referral"
- Student name and ID
- Basic HTML formatting
- BSWD branding

## Testing

### Test Page
**URL:** http://localhost:3001/test-email

**Steps:**
1. Enter email address
2. Click "Send Test Email"
3. Check inbox (may be in spam)

### Manual Test
```bash
# Deploy Edge Function
npx supabase functions deploy send-psycho-ed-email --project-ref lspqgwjlifgepomifbrd --no-verify-jwt

# Test via curl (PowerShell)
Invoke-RestMethod -Uri "https://lspqgwjlifgepomifbrd.supabase.co/functions/v1/send-psycho-ed-email" `
  -Method POST `
  -Headers @{"Authorization"="Bearer YOUR_SERVICE_ROLE_KEY"; "Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","studentName":"Test Student","studentId":"12345"}'
```

## Deployment

### Deploy Edge Function
```bash
cd EdVisingU-Capstone
npx supabase functions deploy send-psycho-ed-email --project-ref lspqgwjlifgepomifbrd --no-verify-jwt
```

### Set Secrets
```bash
npx supabase secrets set RESEND_API_KEY=your_api_key --project-ref lspqgwjlifgepomifbrd
```

### Verify Deployment
```bash
npx supabase secrets list --project-ref lspqgwjlifgepomifbrd
```

## Production Checklist

- [ ] Verify domain in Resend dashboard
- [ ] Update `from` email address in Edge Function
- [ ] Test email delivery to real addresses
- [ ] Configure email template/branding
- [ ] Set up email tracking (optional)
- [ ] Monitor Edge Function logs in Supabase dashboard

## Troubleshooting

### Email not received
1. Check spam/junk folder
2. Verify Resend API key is set: `npx supabase secrets list --project-ref lspqgwjlifgepomifbrd`
3. Check Edge Function logs in Supabase dashboard
4. Test with the test page first

### Edge Function errors
1. Redeploy: `npx supabase functions deploy send-psycho-ed-email --project-ref lspqgwjlifgepomifbrd --no-verify-jwt`
2. Check logs in Supabase dashboard
3. Verify RESEND_API_KEY secret is set

### Frontend errors
1. Check browser console for errors
2. Verify `.env.local` has correct Supabase URL and keys
3. Test Edge Function directly first

## Files Structure

```
EdVisingU-Capstone/
├── supabase/
│   └── functions/
│       └── send-psycho-ed-email/
│           └── index.ts           # Edge Function code
├── frontend/
│   ├── .env.local                 # Environment variables
│   └── src/
│       ├── lib/
│       │   └── notify.ts          # Email sending logic
│       └── pages/
│           ├── test-email.tsx     # Test page
│           └── api/
│               └── notify/
│                   └── psycho-ed-referral.ts  # (OLD - not used)
└── EMAIL_SYSTEM.md                # This file
```

## Support

For issues or questions:
1. Check Supabase dashboard logs
2. Check Resend dashboard for delivery status
3. Review this documentation
4. Test with test-email page first
