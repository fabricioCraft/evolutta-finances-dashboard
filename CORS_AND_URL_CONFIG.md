# CORS and URL Configuration Guide

This document outlines the CORS (Cross-Origin Resource Sharing) and URL configurations implemented in the Evolutta Finances Dashboard project.

## Overview

CORS has been configured at multiple levels to ensure proper communication between:
- Frontend application (React/Next.js)
- Backend API (NestJS)
- Supabase Edge Functions
- Supabase Auth

## Configuration Details

### 1. NestJS Backend CORS Configuration

**File:** `src/main.ts`

The main NestJS application has been configured with CORS to allow requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `https://localhost:3000`
- `https://127.0.0.1:3000`

**Allowed Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
**Allowed Headers:** Content-Type, Authorization, Accept
**Credentials:** Enabled

### 2. Supabase Edge Functions CORS

Both Edge Functions have been updated with proper CORS headers:

#### Belvo Webhook Handler
**File:** `supabase/functions/belvo-webhook-handler/index.ts`

- Handles OPTIONS preflight requests
- Includes CORS headers in all responses
- Allows webhook-specific headers: `x-belvo-signature`, `x-signature`

#### Transaction Processor
**File:** `supabase/functions/transaction-processor/index.ts`

- Handles OPTIONS preflight requests
- Includes CORS headers in all responses
- Configured for internal Supabase communication

### 3. Supabase Auth Configuration

**File:** `supabase/config.toml`

**Site URL:** `http://127.0.0.1:3000`

**Additional Redirect URLs:**
- `https://127.0.0.1:3000`
- `http://localhost:3000`
- `https://localhost:3000`

## Environment-Specific Configuration

### Development Environment
- Uses `127.0.0.1` and `localhost` for local development
- Supports both HTTP and HTTPS protocols
- Default ports: 3000 (frontend), 54321 (Supabase API)

### Production Environment
To deploy to production, update the following:

1. **NestJS CORS Origins** (`src/main.ts`):
   ```typescript
   origin: [
     // ... existing local URLs
     'https://your-frontend-domain.com'
   ]
   ```

2. **Supabase Auth URLs** (`supabase/config.toml`):
   ```toml
   site_url = "https://your-frontend-domain.com"
   additional_redirect_urls = [
     # ... existing local URLs
     "https://your-frontend-domain.com"
   ]
   ```

3. **Environment Variables** (`.env`):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Security Considerations

### Edge Functions
- Webhook handler validates signatures when `WEBHOOK_SECRET_KEY` is configured
- Transaction processor requires JWT verification (`verify_jwt = true`)
- Both functions use service role keys for database operations

### CORS Headers
- Edge Functions use `Access-Control-Allow-Origin: *` for maximum compatibility
- NestJS backend uses specific origin allowlist for better security
- Credentials are enabled only where necessary

## Troubleshooting

### Common CORS Issues

1. **Preflight Request Failures**
   - Ensure OPTIONS method is handled in Edge Functions
   - Check that all required headers are included in `Access-Control-Allow-Headers`

2. **Authentication Errors**
   - Verify JWT tokens are properly included in requests
   - Check that `Authorization` header is allowed in CORS configuration

3. **Redirect URL Mismatches**
   - Ensure all frontend URLs are included in `additional_redirect_urls`
   - Check that protocol (HTTP/HTTPS) matches exactly

### Testing CORS Configuration

Use browser developer tools or tools like Postman to test:

1. **Preflight Requests:**
   ```bash
   curl -X OPTIONS \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     http://127.0.0.1:54321/functions/v1/belvo-webhook-handler
   ```

2. **Actual Requests:**
   ```bash
   curl -X POST \
     -H "Origin: http://localhost:3000" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-token" \
     -d '{"test": "data"}' \
     http://127.0.0.1:54321/functions/v1/transaction-processor
   ```

## Maintenance

When adding new frontend domains or changing URLs:

1. Update NestJS CORS configuration
2. Update Supabase auth redirect URLs
3. Test all authentication flows
4. Verify Edge Function accessibility
5. Update this documentation

## Related Files

- `src/main.ts` - NestJS CORS configuration
- `supabase/config.toml` - Supabase auth and general configuration
- `supabase/functions/*/index.ts` - Edge Function CORS headers
- `.env.example` - Environment variable templates