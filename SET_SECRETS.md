# Set Secrets for Edge Function

## Step 1: Get Access Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate New Token"**
3. Give it a name like "CLI Access"
4. Copy the token (it looks like: sbp_...)

## Step 2: Login to Supabase CLI
```powershell
npx supabase login --token YOUR_ACCESS_TOKEN_HERE
```

## Step 3: Link Your Project
```powershell
npx supabase link --project-ref lspqgwjlifgepomifbrd
```

## Step 4: Set Secrets (Run these commands one by one)

```powershell
# Set Resend API Key
npx supabase secrets set RESEND_API_KEY=re_Cd3tKhAy_CkHc6TsWpwhg2mDr2NgBTpPa --project-ref lspqgwjlifgepomifbrd

# Set Supabase URL
npx supabase secrets set SUPABASE_URL=https://lspqgwjlifgepomifbrd.supabase.co --project-ref lspqgwjlifgepomifbrd

# Set Service Role Key
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcHFnd2psaWZnZXBvbWlmYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg3NjExNywiZXhwIjoyMDc1NDUyMTE3fQ.MZaptTlbHJA3y5ZPLTQA_SVa6MiSOkKX7x7I7luKuyI --project-ref lspqgwjlifgepomifbrd
```

## Step 5: Deploy the Function
```powershell
npx supabase functions deploy send-psycho-ed-email --project-ref lspqgwjlifgepomifbrd --no-verify-jwt
```

## Verify Secrets Were Set
```powershell
npx supabase secrets list --project-ref lspqgwjlifgepomifbrd
```

---

## Alternative: Set All Secrets at Once

Create a file called `secrets.env` (don't commit this!):
```
RESEND_API_KEY=re_Cd3tKhAy_CkHc6TsWpwhg2mDr2NgBTpPa
SUPABASE_URL=https://lspqgwjlifgepomifbrd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcHFnd2psaWZnZXBvbWlmYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg3NjExNywiZXhwIjoyMDc1NDUyMTE3fQ.MZaptTlbHJA3y5ZPLTQA_SVa6MiSOkKX7x7I7luKuyI
```

Then set all at once:
```powershell
npx supabase secrets set --env-file secrets.env --project-ref lspqgwjlifgepomifbrd
```

---

## 🎉 You're Done!

After setting secrets and deploying, proceed to set up the cron job in the SQL Editor (see DEPLOY_NOW.md).
