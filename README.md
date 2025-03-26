# US Trade Navigator

A comprehensive platform for global trade intelligence. Access real-time trade data, market insights, and HS code analytics to make informed decisions.

## Features

- Global Trade Data Analysis
- HS Code Analytics
- Market Insights
- Real-time Trade Statistics
- User Authentication
- Subscription Management
- Interactive Dashboard

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- shadcn/ui
- Lucide Icons

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/us-trade-navigator.git
   ```

2. Install dependencies:
   ```bash
   cd us-trade-navigator
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
us-trade-navigator/
├── public/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── pages/
│   └── App.tsx
├── supabase/
│   └── migrations/
└── package.json
```

## Database Setup

The project uses Supabase as the backend. The database schema and migrations are located in the `supabase/migrations` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.