# US Trade Navigator

A modern customer portal for the US Trade Navigator system using Vite, React, TypeScript, Supabase, and Stripe.

## Deployment to Netlify

### Prerequisites

1. Ensure your code is committed to GitHub (or another Git provider)
2. Create a Netlify account if you don't have one already

### Option 1: Deploy from the Netlify UI

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Configure the build settings:
   - Branch to deploy: `master` (or your default branch)
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 2: Deploy using the Netlify CLI

1. Install the Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize your site:
   ```bash
   netlify init
   ```
   - Select "Create & configure a new site"
   - Follow the prompts to set up your site

4. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

### Environment Variables

Make sure to set the following environment variables in your Netlify site settings:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

### Continuous Deployment

Netlify will automatically deploy your site when you push changes to your Git repository. The build settings are already configured in the `netlify.toml` file.

## Development

### Installation

```bash
# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```

### Building for Production

```bash
# Build for production
npm run build
