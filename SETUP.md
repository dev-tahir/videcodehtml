# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Setup PostgreSQL Database

### Option A: Local PostgreSQL
```bash
# Create database
createdb ai_page_creator

# Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_page_creator"
```

### Option B: Cloud Database (Recommended)
Use Neon (free): https://neon.tech
1. Create account
2. Create database
3. Copy connection string to `.env.local`

## Step 3: Generate NextAuth Secret
```bash
# On Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or online: https://generate-secret.vercel.app/32
```

Update `NEXTAUTH_SECRET` in `.env.local`

## Step 4: Setup Database Schema
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## Step 5: Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Step 6: Create Your First Account
1. Click "Get Started"
2. Sign up with email
3. Start creating pages!

## Optional: Chrome Path for Screenshots

If screenshots don't work, set Chrome path in `.env.local`:
```
CHROME_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

## Troubleshooting

### Database errors
- Make sure PostgreSQL is running
- Check DATABASE_URL is correct
- Try `npx prisma db push` again

### Prisma errors
```bash
npx prisma generate
npx prisma db push --force-reset
```

### Port already in use
```bash
# Change port
npm run dev -- -p 3001
```

## Production Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Go to vercel.com
3. Import repository
4. Add environment variables
5. Deploy!

### Environment Variables for Production
- DATABASE_URL
- NEXTAUTH_URL (your domain)
- NEXTAUTH_SECRET (new secret)
- DEFAULT_OPENROUTER_API_KEY
- CHROME_EXECUTABLE_PATH (if needed)

## Next Steps

1. Customize the landing page
2. Add your branding
3. Set up Stripe for payments
4. Configure custom domain
5. Add analytics

## Support

- Check README.md for detailed documentation
- Review code comments
- Open GitHub issues for bugs

Happy building! 🚀
