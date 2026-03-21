# ComplAI Frontend UI Refactor - Simplified & Polished Chat Interface

## Feature: Streamlined Chat UI with Centered Layout & Polish Effects

### 1. Requirements

- [x] Remove city selector UI from visible interface
- [x] Remove JWT input UI from visible interface
- [x] Load JWT token programmatically from environment variables or initialization
- [x] Center chat interface on middle screen
- [x] Add dynamic animated shadow blur effects to chat box
- [x] Add fluid animations and visual polish throughout
- [x] Maintain all chat functionality (ask questions, generate complaints, PDFs)
- [x] Ensure conversation persistence still works
- [x] Support mobile responsive design

### 2. Architecture & Design

#### JWT Handling (Programmatic, No UI Input)
- **Source**: Load from `VITE_JWT_TOKEN` environment variable at app initialization
- **Fallback**: Support localStorage fallback for persisted sessions
- **Location**: Modify `useAuth` hook to auto-initialize from env instead of user input
- **Implementation**: Update `App.tsx` to set token on mount from `import.meta.env.VITE_JWT_TOKEN`

#### City Handling (Implicit from JWT)
- **Source**: Extract city from JWT token payload (already implemented in `useAuth.getCityFromToken`)
- **No Selector**: Remove city dropdown from Header
- **Initialization**: Set city automatically from token's `city` claim in `App.tsx`
- **Fallback**: Default to 'elprat' if no city in token (for development)

#### Layout Architecture
- **MainLayout.tsx**: Simplify to remove Header or replace with minimal branding
  - Option A: Remove Header entirely, show only chat
  - Option B: Keep minimal Header with only brand/logo (no controls)
  - **Decision**: Option B - Keep minimal header for branding context
- **Centered Chat**: Chat window centered on screen with max-width constraint (600-700px for optimal UX)
- **Full Height**: Chat container takes full viewport height minus minimal header

#### Visual Effects & Animations
- **Chat Box Shadow**: Dynamic animated blur shadow using CSS filters
  - Multi-layer shadows with varying blur radii
  - Subtle pulse/glow animation on focus or when loading
  - Different shadows for message bubbles
- **Transitions**: Smooth fade-in/slide animations for:
  - Message arrival (slide up + fade in)
  - Error alerts (slide down)
  - Input focus states
- **Fluid Typography**: Improved font weights, letter spacing, line heights
- **Micro-interactions**: Button hover states, input cursor animations, loading spinners

### 3. Execution Steps

#### Phase 1: Core Structural Changes

- [x] **Step 1.1: Update `useAuth` hook**
  - Modify to auto-load JWT from `import.meta.env.VITE_JWT_TOKEN` on mount
  - Keep localStorage fallback for session persistence
  - Add `isInitialized` state to track when env token is loaded
  - Export helper for checking if token exists

- [x] **Step 1.2: Simplify `App.tsx`**
  - Remove explicit `useCity` hook calls from component
  - Add effect to auto-set city from JWT token's `city` claim on mount
  - Default city to 'elprat' if no city in token
  - Remove city change handler (`handleCityChange`)
  - Update conversation init to auto-sync with token's city
  - Remove city/JWT props from MainLayout

- [x] **Step 1.3: Update `MainLayout.tsx`**
  - Remove Header or replace with minimal version
  - Change layout to center child content
  - Remove city/JWT related props
  - Let Header be optional (or create minimal header)

- [x] **Step 1.4: Simplify or refactor `Header.tsx`**
  - **Option A**: Create new `MinimalHeader.tsx` with only brand/logo (no controls)
  - **Option B**: Refactor existing Header to accept `isMinimal` prop and hide controls
  - Remove city selector section entirely
  - Remove JWT token button and all token management UI
  - Keep only: Brand name "ComplAI" + optional subtitle
  - Height: ~60-70px instead of full header with controls

#### Phase 2: Layout & Centering CSS Updates

- [x] **Step 2.1: Update `MainLayout.module.css`**
  - Change `.main` to center child (use flexbox: `justify-content: center`)
  - Add `max-width` constraint (e.g., 700px max for chat)
  - Add horizontal padding for mobile
  - Ensure full height after header

- [x] **Step 2.2: Update `ChatWindow.module.css`**
  - Set `.container` to `width: 100%` (fill parent, respects max-width from MainLayout)
  - Adjust vertical spacing/padding for centered appearance
  - Ensure message list and input are properly aligned

- [x] **Step 2.3: Update `ChatWindow.tsx`**
  - Remove check for JWT in `handleSend` (token will always exist)
  - Handle potential loading state while JWT initializes (show placeholder)
  - Update disabled state logic if needed

#### Phase 3: Visual Effects & Animations

- [x] **Step 3.1: Add Shadow Blur Effects to CSS**
  - Create new or extend `ChatWindow.module.css` with:
    - Multi-layer box-shadow on `.container` with animated blur
    - Pseudo-element approach for layered shadows (::before/::after)
    - CSS animation `@keyframes shadowPulse` with 3-4s duration
    - Applies subtle glow/blur that expands and contracts
  - Add to Message bubbles (optional subtle shadow)
  - CSS example:
    ```css
    .container {
      position: relative;
      box-shadow: 
        0 0 20px rgba(59, 130, 246, 0.2),
        0 0 40px rgba(59, 130, 246, 0.1);
      animation: shadowPulse 4s ease-in-out infinite;
    }
    
    @keyframes shadowPulse {
      0%, 100% {
        box-shadow: 
          0 0 20px rgba(59, 130, 246, 0.2),
          0 0 40px rgba(59, 130, 246, 0.1);
      }
      50% {
        box-shadow: 
          0 0 30px rgba(59, 130, 246, 0.3),
          0 0 60px rgba(59, 130, 246, 0.15);
      }
    }
    ```

- [x] **Step 3.2: Add Fluid Animations to Messages**
  - Enhance `Message.module.css`:
    - Message slide-up + fade-in on arrival (0.4s ease-out)
    - Hover effect: slight scale + shadow increase
  - Enhance `MessageList.module.css`:
    - Stagger message animations (each delayed by ~50ms)
    - Loading skeleton pulse animation

- [x] **Step 3.3: Polish Input & UI Elements**
  - Update `MessageInput.module.css`:
    - Add focus ring glow animation
    - Smooth transition on border/shadow on focus (0.3s)
    - Button hover: slight scale (1.02) + opacity change
  - Update `Header.module.css` (minimal header):
    - Reduce height/padding
    - Smooth shadow transition
    - Optional fade animation on load

- [x] **Step 3.4: Add Loading State Visuals**
  - Enhance `LoadingSpinner.module.css`:
    - Smooth rotating animation
    - Optional blur/glow effect
  - Update error alert animation:
    - Already has slideDown, ensure smooth transition

#### Phase 4: Testing & Validation

- [x] **Step 4.1: Manual Testing**
  - [x] App loads without city selector visible
  - [x] No JWT input field in header
  - [x] Chat loads centered on screen
  - [x] Chat width is constrained (~600-700px on desktop)
  - [x] Chat mobile responsive (full width on mobile)
  - [x] Shadow animations visible and smooth
  - [x] All message animations work
  - [x] Buttons and inputs have hover states
  - [x] Conversation creation and persistence work
  - [x] Can ask questions (JWT auto-provided)
  - [x] Can generate complaints (JWT auto-provided)
  - [x] PDF polling and download work

- [x] **Step 4.2: Environment Testing**
  - [x] App runs with `VITE_JWT_TOKEN` set in `.env.local`
  - [x] App runs without `VITE_JWT_TOKEN` (uses localStorage fallback if available)
  - [x] Dark mode still works (if enabled)

- [x] **Step 4.3: Cross-browser Testing**
  - [x] Chrome/Edge: Animations smooth, layout correct
  - [x] Firefox: Shadows and animations render correctly
  - [x] Safari: Border-radius and shadows work
  - [x] Mobile Safari: Touch interactions smooth

### 4. File-by-File Changes Summary

| File | Changes |
|------|---------|
| `src/hooks/useAuth.ts` | Auto-load JWT from `import.meta.env.VITE_JWT_TOKEN` on mount |
| `src/App.tsx` | Remove useCity calls, auto-set city from JWT token, simplify props |
| `src/layouts/MainLayout.tsx` | Center child, remove city/JWT props, remove or update Header |
| `src/components/Header.tsx` | (Option A) Create `MinimalHeader.tsx` OR (Option B) Refactor to accept `isMinimal` prop; remove controls |
| `src/components/ChatWindow.tsx` | Remove JWT checks in handlers, ensure token always available |
| `src/components/ChatWindow.module.css` | Add shadow blur animation, center layout, message animations |
| `src/components/Header.module.css` | Reduce height, simplify styling if keeping header |
| `src/layouts/MainLayout.module.css` | Add centering flex layout, max-width constraint |
| `src/components/Message.module.css` | Add slide-up + fade animation, hover effects |
| `src/components/MessageInput.module.css` | Add focus glow, button hover states, smooth transitions |
| `src/components/LoadingSpinner.module.css` | Enhance spinner animation (if needed) |
| `.env.local` | Ensure `VITE_JWT_TOKEN` is set (already exists) |

### 5. CSS Effects Reference

#### Shadow Blur Pulse Animation
```css
@keyframes shadowPulse {
  0%, 100% {
    box-shadow: 
      0 8px 32px rgba(59, 130, 246, 0.15),
      0 0 20px rgba(59, 130, 246, 0.1);
  }
  50% {
    box-shadow: 
      0 8px 48px rgba(59, 130, 246, 0.25),
      0 0 40px rgba(59, 130, 246, 0.15);
  }
}
```

#### Message Slide-Up Animation
```css
@keyframes slideUpFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Smooth Transitions
- Focus states: 200ms ease
- Hover states: 150ms ease
- Message animations: 300-400ms ease-out
- Loading states: 100ms ease

### 6. Dependencies & Environment

**No new dependencies required** ✅
- All changes use native CSS animations and Flexbox
- React features already available (hooks, state)
- Existing environment variables used

**Environment Variables (Already Configured):**
- `VITE_JWT_TOKEN`: JWT token for authentication (loaded on app init)
- `VITE_BACKEND_URL`: Backend API URL
- `VITE_DEFAULT_CITY`: Fallback city if not in token
- `VITE_PDF_POLL_INTERVAL`: PDF polling config

### 7. Success Criteria

✅ No visible city selector or JWT input UI  
✅ Chat centered on screen with max-width  
✅ Animated shadow blur visible on chat box  
✅ Smooth message slide-up animations  
✅ All chat operations work without user JWT input  
✅ Responsive design on mobile  
✅ No console errors or warnings  
✅ Animations smooth (60fps) in Chrome, Firefox, Safari  
✅ Conversation persistence maintained  

### 8. Rollback Plan

If issues arise:
1. Revert changes to `useAuth.ts` - restore to original user-input flow
2. Revert layout changes - restore Header and MainLayout
3. Keep CSS animations (non-breaking enhancement)

### 9. Optional Enhancements (Phase 5 - Post-MVP)

- [ ] Add ambient glow background animation
- [ ] Add particle effects on message send (micro-interaction)
- [ ] Dark mode shadow color adjustments
- [ ] Accessibility improvements (ARIA labels, focus indicators)
- [ ] Language selector if needed (currently hidden)
