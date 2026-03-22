## Security Implementation: Single Tab Per Device

### Overview
This security feature restricts the ComplAI web application to only one active session per device using browser APIs to detect and manage multiple tabs.

### How It Works

#### 1. **Tab Detection Mechanism**
The `useTabDetection` hook uses two mechanisms depending on browser support:

- **Primary (Modern Browsers)**: BroadcastChannel API
  - Creates a broadcast channel named `complai_tab_channel`
  - Each tab announces itself as active when the page loads
  - Listens for messages from other tabs on the same channel
  - Immediately detects when another tab becomes active

- **Fallback (Older Browsers)**: Storage Events
  - Uses `sessionStorage` to track active tabs
  - Each tab writes a heartbeat every 1 second to `complai_tab_active`
  - Listens for storage change events
  - Detects other tabs when their `sessionStorage` key changes

#### 2. **Session Tracking**
Each tab gets a unique ID generated as:
```
tab_${timestamp}_${randomString}
```
This ID is stored in `sessionStorage` under key `complai_tab_id` ensuring:
- Different tabs get different IDs
- Reloading a tab preserves the same ID
- Closing a tab removes the ID from the session

#### 3. **Conflict Resolution**
When multiple tabs are detected:
1. The `useTabDetection` hook sets `isMultipleTabsDetected = true`
2. App.tsx displays the `TabConflictModal` component
3. User must click "Continue with this tab" to proceed
4. The hook calls `forceTabActive()` to register this tab as the active one
5. Other tabs see the conflict and can respond accordingly

### File Structure

```
src/
├── hooks/
│   ├── useTabDetection.ts          # Core tab detection hook
│   └── useTabDetection.test.ts     # Unit tests
├── components/
│   ├── TabConflictModal.tsx        # Warning modal component
│   ├── TabConflictModal.test.tsx   # Component tests
│   └── TabConflictModal.module.css # Styling
└── App.tsx                          # Integration point
```

### Usage in App.tsx

```typescript
const tabDetection = useTabDetection();
const [tabConflictDismissed, setTabConflictDismissed] = useState(false);

// Display modal when conflicts are detected
<TabConflictModal
  isVisible={tabDetection.isMultipleTabsDetected && !tabConflictDismissed}
  onContinueThisTab={() => {
    tabDetection.forceTabActive();
    setTabConflictDismissed(true);
  }}
/>
```

### Security Benefits

1. **Prevents Account Takeover**: Only one active session per device means:
   - Attackers cannot silently open a malicious tab
   - User sees immediate warning of unauthorized tabs
   
2. **Session Integrity**: Ensures:
   - Only one set of conversation history is active
   - JWT tokens are not duplicated across tabs
   - No conflicting state mutations

3. **User Awareness**: 
   - Clear modal warning when tabs conflict
   - User explicitly chooses to continue or close tab
   - Visible notification of potential security issue

### Browser Compatibility

✅ **Fully Supported**:
- Chrome/Edge 54+
- Firefox 38+
- Safari 15.1+

⚠️ **Fallback (Storage Events)**:
- Older browsers without BroadcastChannel
- Works but with ~1 second detection delay

❌ **Not Supported**:
- Private browsing in some browsers may limit sessionStorage
- Service worker environments may have limitations

### Environment Variables

No new environment variables required. The feature works with existing JWT authentication.

### Testing

Run tests:
```bash
npm test
```

Run type checking:
```bash
npm run type-check
```

### Future Enhancements

1. **Automatic Tab Closure**: Could automatically close conflicting tabs
2. **Admin Dashboard**: Track active sessions across devices
3. **Device Binding**: Bind JWT tokens to specific device IDs
4. **Multi-Device Support**: Allow multiple devices, but single tab per device
5. **Suspicious Activity Logging**: Log when tab conflicts are detected

### Related Files

- `src/hooks/useAuth.ts` - JWT token management
- `src/services/storageService.ts` - Local/session storage handling
- `.github/copilot-instructions.md` - Architecture guidelines
