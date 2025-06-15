# Black-Scholes Option Pricing Calculator

A React-based web application that calculates option prices and Greeks using the Black-Scholes model.

## Features

- Calculate European call and put option prices
- View option Greeks (Delta, Gamma, Vega, Theta, Rho)
- Verify put-call parity
- Responsive design

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Deployment

This project is set up to deploy to GitHub Pages automatically on push to the `main` or `master` branch.

### Prerequisites

1. A GitHub account
2. A repository named `black-scholes-calculator` (or update the `base` in `vite.config.js` and `homepage` in `package.json`)

### Deployment Steps

1. Update the `homepage` field in `package.json` with your GitHub username:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/black-scholes-calculator"
   ```

2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/black-scholes-calculator.git
   git push -u origin main
   ```

3. Go to your repository on GitHub
4. Navigate to Settings > Pages
5. Under "Source", select "GitHub Actions"
6. The site will be automatically deployed to `https://YOUR_GITHUB_USERNAME.github.io/black-scholes-calculator`

## Manual Deployment

If you want to deploy manually:

```bash
npm run deploy
```

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- GitHub Pages
- GitHub Actions
