# AI Page Creator - Next.js App

An AI-powered HTML page creation and management platform with intelligent line-stitching technology and agentic AI decision-making.

## Features

✨ **AI-Powered Page Generation** - Create stunning HTML pages using natural language prompts
🎯 **Line Stitching Technology** - Edit specific code lines without regenerating entire pages
🤖 **Agentic Mode** - AI autonomously decides what to create or edit
📝 **Multiple AI Models** - Choose from GPT-4o, Claude 3.5, Gemini 2.0 Flash, and more
🔐 **Authentication** - Secure email/password authentication with NextAuth.js
👥 **Community Sharing** - Share pages with the community and vote on favorites
📊 **Version History** - Track all changes with git-style history
💳 **Subscription Plans** - Free tier with 10 pages/month, Pro plan for unlimited access
🎨 **Manual Editing** - Direct code editing for Pro users
📱 **Responsive Design** - Beautiful UI built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI SDK with OpenRouter
- **Styling**: Tailwind CSS
- **Screenshots**: Puppeteer-core
- **Forms**: React Hook Form + Zod
- **Payments**: Stripe (ready to integrate)

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenRouter API key (default provided)
- Chrome browser (for Puppeteer screenshots)

## Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd AppBuilder
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Copy `.env.local` and update with your values:
```bash
# Database - Update with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/ai_page_creator"

# NextAuth - Generate secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# OpenRouter API (Default provided, or use your own)
DEFAULT_OPENROUTER_API_KEY="xxx"
DEFAULT_MODEL="google/gemini-2.0-flash-lite-001"
AGENT_MODEL="google/gemini-2.0-flash-thinking-exp:free"

# Stripe (Add your keys for subscription)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Chrome Path (Optional - will use system Chrome if not set)
# CHROME_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

4. **Setup the database**
```bash
# Create the database
createdb ai_page_creator

# Run Prisma migration
npx prisma migrate dev --name init

# Or if migration fails, push the schema
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

5. **Start the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Setup

### Using PostgreSQL locally:

```bash
# Install PostgreSQL (Windows)
# Download from: https://www.postgresql.org/download/windows/

# Or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Create database
createdb ai_page_creator

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_page_creator"
```

### Using cloud PostgreSQL (Recommended for production):

- **Neon**: https://neon.tech (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app
- **Vercel Postgres**: https://vercel.com/storage/postgres

## Project Structure

```
AppBuilder/
├── app/
│   ├── api/                   # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── generate/         # AI page generation
│   │   ├── edit/             # AI page editing
│   │   ├── pages/            # Page CRUD operations
│   │   ├── vote/             # Community voting
│   │   └── settings/         # User settings
│   ├── auth/                 # Auth pages (signin, signup)
│   ├── chat/                 # Chat interface for AI interaction
│   ├── view/                 # Page viewer and editor
│   ├── settings/             # Settings page
│   ├── pricing/              # Pricing page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── providers.tsx         # Session provider
├── lib/
│   ├── ai.ts                 # AI integration logic
│   ├── auth.ts               # NextAuth configuration
│   ├── encryption.ts         # API key encryption
│   ├── limits.ts             # Usage limits
│   ├── prisma.ts             # Prisma client
│   └── screenshot.ts         # Puppeteer screenshot logic
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/
│   └── screenshots/          # Generated page screenshots
├── types/
│   └── next-auth.d.ts        # TypeScript definitions
└── package.json
```

## Key Features Explained

### Agentic Mode
The AI agent (using Gemini 2.0 Flash Thinking) analyzes user requests and decides whether to:
- Create a new page
- Edit existing page with line-stitching
- Answer questions about the page

### Line Stitching
Instead of regenerating entire pages, the AI identifies specific line ranges to modify:
```typescript
{
  lineStart: 10,
  lineEnd: 15,
  newContent: "replacement code",
  explanation: "what changed"
}
```

### Version History
Every edit is saved as a history entry, allowing users to:
- Navigate through previous versions
- Restore any previous state
- See exactly what changed and when

### Community Sharing
- Free users' pages are public by default
- Pro users can choose to keep pages private
- Community can vote on shared pages
- Pro users can duplicate community pages

## Usage Limits

### Free Tier
- 10 pages per month
- 100 history entries per month
- Pages shared by default
- Access to all AI models

### Pro Plan ($5/month)
- Unlimited pages
- Unlimited history entries
- Private pages option
- Manual code editing
- Duplicate community pages
- Priority support

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS
- DigitalOcean

## Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Generate a new secret for production
- `DEFAULT_OPENROUTER_API_KEY` - Your OpenRouter API key
- All Stripe keys if enabling subscriptions

## Stripe Integration (Optional)

To enable paid subscriptions:

1. Create a Stripe account
2. Create a product and price
3. Add Stripe keys to environment variables
4. Implement webhook endpoint at `/api/webhooks/stripe`
5. Update subscription logic in codebase

## Screenshots with Puppeteer

The app uses Puppeteer-core to generate page screenshots. Make sure Chrome is installed:

**Windows**: Chrome is usually at `C:\Program Files\Google\Chrome\Application\chrome.exe`
**Mac**: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
**Linux**: `/usr/bin/google-chrome`

Set `CHROME_EXECUTABLE_PATH` in `.env.local` if Chrome is in a different location.

## Troubleshooting

### Database connection issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Puppeteer issues
- Install Chrome browser
- Set correct CHROME_EXECUTABLE_PATH
- Check system permissions

### API errors
- Verify OpenRouter API key is valid
- Check API rate limits
- Review error logs

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review existing issues

## Roadmap

- [ ] Stripe payment integration
- [ ] Webhook for subscription management
- [ ] Export pages to GitHub
- [ ] Custom domain support
- [ ] Team collaboration features
- [ ] API access for developers
- [ ] Mobile app
- [ ] Plugin system

## Credits

Built with:
- Next.js
- OpenRouter AI
- Prisma
- Tailwind CSS
- NextAuth.js

---

Made with ❤️ for developers who want to build faster with AI
