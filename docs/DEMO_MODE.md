# Demo Mode Implementation

## Overview

AlphaOptimize Demo Mode provides an isolated, fully functional workspace where users can explore all features without signing up. The demo uses realistic portfolio data and stubbed external integrations to simulate the complete user experience.

## Architecture

### Core Components

1. **Demo Context Provider** (`src/context/DemoModeContext.tsx`)
   - Manages demo session state
   - Handles automatic expiry and cleanup
   - Provides session management functions

2. **Demo Stub Services** (`src/services/demo-stubs.ts`)
   - Replaces real API calls with deterministic responses
   - Provides realistic demo data
   - Ensures no external calls are made in demo mode

3. **Service Factory** (`src/services/service-factory.ts`)
   - Dynamically switches between real and demo services
   - Maintains business logic compatibility
   - Enables seamless demo integration

4. **Demo Middleware** (`src/middleware.ts`)
   - Handles demo mode routing
   - Sets security headers
   - Manages demo cookies and sessions

### Demo Data

- **Portfolio Value**: $212,500 with realistic holdings
- **Performance**: 27.08% total return with detailed metrics
- **Holdings**: Mix of individual stocks (AAPL, MSFT, GOOGL, etc.) and ETFs
- **Alerts**: 3 active alerts for drift, performance, and tax opportunities
- **Tax Savings**: $2,340 in potential tax loss harvesting opportunities

## Security & Abuse Controls

### Rate Limiting

- **Demo Access**: 10 sessions per IP per 15 minutes
- **API Calls**: 60 requests per minute per session
- **AI Chat**: 10 messages per minute per session

### Security Measures

1. **Robots.txt**: Demo routes are disallowed for search engines
2. **Security Headers**: No-cache, no-index, frame protection
3. **Session Validation**: Strict session ID format validation
4. **Activity Detection**: Monitors for suspicious patterns
5. **IP Tracking**: Basic DoS protection

### Data Privacy

- All demo data is synthetic and contains no PII
- Sessions are isolated and automatically cleaned up
- No persistent storage of demo activities

## Session Management

### Session Lifecycle

1. **Creation**: User visits `/demo` → generates unique session ID
2. **Active**: 6-hour maximum duration with 30-minute idle timeout
3. **Extension**: Users can extend sessions when time is low
4. **Cleanup**: Automatic cleanup on expiry or manual exit

### Session Storage

- **SessionStorage**: Demo session data (isolated per tab)
- **Cookies**: Demo mode flag with 6-hour expiry
- **Memory**: Rate limiting and temporary state

## User Experience

### Entry Points

- **Landing Page**: "Try the live demo — no sign‑up" button
- **Login Page**: "try our interactive demo" link
- **Direct Access**: `/demo` URL

### Demo Features

- **Full Dashboard**: Complete portfolio overview
- **Portfolio Drift**: Real-time allocation analysis
- **AI Assistant**: Interactive chat with contextual responses
- **Tax Strategies**: Loss harvesting opportunities
- **Alerts**: Smart portfolio notifications
- **Connected Accounts**: Simulated Plaid integration

### Session Indicators

- **Top Banner**: Shows remaining time and session status
- **Warning System**: Alerts when session is about to expire
- **Easy Exit**: One-click demo exit with cleanup

## Implementation Details

### Service Integration

```typescript
// Services automatically switch based on demo mode
const authService = getAuthService(); // Returns demo or real service
const plaidService = getPlaidService(); // Stubbed in demo mode
const portfolioService = getPortfolioService(); // Uses demo data
```

### Demo Detection

```typescript
// Check if in demo mode
const isDemo = isDemoMode(); // Checks sessionStorage

// Demo mode context
const { state, startDemo, endDemo } = useDemoMode();
```

### Middleware Routing

```typescript
// Automatic demo routing
if (path.startsWith('/demo')) {
  // Set demo cookie and security headers
  // Allow access to demo routes
}
```

## Performance Considerations

### Optimizations

- **Lazy Loading**: Demo services loaded only when needed
- **Memory Management**: Automatic cleanup of expired sessions
- **Bundle Size**: Demo code is code-split from main application
- **Caching**: Demo data is cached in memory for performance

### Monitoring

- **Session Metrics**: Track demo usage patterns
- **Security Events**: Log suspicious activity
- **Performance**: Monitor demo load times
- **Error Tracking**: Capture demo-specific errors

## Deployment

### Environment Variables

```bash
# Demo mode configuration
NEXT_PUBLIC_DEMO_ENABLED=true
DEMO_SESSION_DURATION=6h
DEMO_IDLE_TIMEOUT=30m
```

### Security Headers

```typescript
// Automatically set for demo routes
'X-Demo-Mode': 'true'
'X-Robots-Tag': 'noindex, nofollow'
'X-Frame-Options': 'DENY'
'Cache-Control': 'no-cache, no-store'
```

## Maintenance

### Regular Tasks

1. **Data Updates**: Refresh demo portfolio data quarterly
2. **Security Review**: Audit rate limiting and abuse controls
3. **Performance Monitoring**: Check demo load times
4. **User Feedback**: Analyze demo completion rates

### Troubleshooting

#### Common Issues

1. **Session Not Starting**
   - Check browser localStorage/sessionStorage
   - Verify demo cookies are set
   - Check rate limiting status

2. **Demo Data Not Loading**
   - Verify service factory is routing correctly
   - Check demo stub implementations
   - Ensure demo context is provided

3. **Premature Session Expiry**
   - Check activity tracking
   - Verify timeout calculations
   - Review cleanup intervals

## Future Enhancements

### Planned Features

1. **Guided Tours**: Step-by-step feature introductions
2. **Demo Analytics**: Track user interaction patterns
3. **A/B Testing**: Test different demo flows
4. **Social Sharing**: Allow users to share demo results
5. **Demo Variants**: Different portfolio scenarios

### Technical Improvements

1. **Redis Integration**: Distributed rate limiting
2. **CDN Caching**: Optimize demo asset delivery
3. **Real-time Updates**: WebSocket integration for market data
4. **Mobile Optimization**: Enhanced mobile demo experience

## Compliance

### Privacy

- No personal data collection in demo mode
- GDPR compliant (no tracking/cookies for analytics)
- Clear demo disclaimers and data usage

### Security

- Regular security audits
- Penetration testing of demo endpoints
- Monitoring for abuse patterns
- Incident response procedures

## Support

### User Support

- **Help Documentation**: Comprehensive demo guides
- **FAQ**: Common demo questions and issues
- **Contact**: Support channels for demo feedback

### Developer Support

- **API Documentation**: Demo service interfaces
- **Testing**: Demo mode test scenarios
- **Debugging**: Demo-specific debugging tools
