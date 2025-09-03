# Aureus Frontend

A modern React frontend for the Aureus DeFi platform on Stellar Soroban blockchain.

## Features

- **Smart Savings**: Inflation-protected savings with automated rebalancing
- **Yield Farming**: Liquidity provision across multiple DeFi protocols  
- **Inflation Hedge**: Multi-asset portfolio protection
- **Real-time Data**: Oracle-powered economic indicators
- **Stellar Integration**: Seamless Freighter wallet connection

## Tech Stack

- **React 19** - Latest React with modern hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Lucide React** - Beautiful SVG icons
- **Stellar SDK** - Blockchain interactions
- **Headless UI** - Accessible components

## Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn
- Freighter wallet browser extension

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   └── Layout.jsx     # Main app layout with navigation
├── contexts/          # React contexts
│   └── StellarContext.jsx  # Stellar wallet & contract integration
├── pages/             # Route components
│   ├── LandingPage.jsx    # Homepage
│   ├── Dashboard.jsx      # Portfolio overview
│   ├── Savings.jsx        # Savings management
│   ├── YieldFarming.jsx   # Yield farming pools
│   └── InflationHedge.jsx # Inflation protection
├── App.jsx            # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Stellar Integration

The app integrates with Stellar Soroban smart contracts:

- **Savings Contract**: Interest-bearing deposits with inflation protection
- **DeFi Yield Contract**: Liquidity provision and yield farming
- **Inflation Hedge Contract**: Multi-asset allocation strategies  
- **Oracle Contract**: Real-time economic data feeds

### Contract Addresses

Update contract addresses in `src/contexts/StellarContext.jsx`:

```javascript
const CONTRACT_ADDRESSES = {
  SAVINGS: 'YOUR_SAVINGS_CONTRACT_ADDRESS',
  DEFI_YIELD: 'YOUR_DEFI_YIELD_CONTRACT_ADDRESS', 
  INFLATION_HEDGE: 'YOUR_INFLATION_HEDGE_CONTRACT_ADDRESS',
  ORACLE: 'YOUR_ORACLE_CONTRACT_ADDRESS'
}
```

## Environment Setup

Create `.env` file for environment variables:

```bash
VITE_STELLAR_NETWORK=testnet
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
```

## Wallet Connection

The app uses Freighter wallet for Stellar interactions:

1. Install [Freighter browser extension](https://freighter.app/)
2. Create or import a Stellar account
3. Connect wallet through the app interface

## Design System

- **Colors**: Primary (gold/yellow), gray scale
- **Typography**: System fonts for optimal performance
- **Icons**: Lucide React for consistency
- **Layout**: Responsive grid with mobile-first approach
- **Components**: Accessible with proper ARIA labels

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Pages

1. Create component in `src/pages/`
2. Add route to `src/App.jsx`
3. Update navigation in `src/components/Layout.jsx`

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic color classes

## Deployment

### Build

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your git repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables if needed

## Security Considerations

- Never expose private keys in frontend code
- Use environment variables for sensitive configuration
- Validate all user inputs
- Implement proper error handling for contract calls
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
