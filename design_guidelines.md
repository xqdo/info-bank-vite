# Design Guidelines: Arabic Trivia Tournament Management System

## Design Approach: Material Design System
**Rationale**: Information-dense tournament management requiring clear data hierarchy, strong visual feedback for game states, and accessible controls for administrators. Material Design provides robust patterns for complex data displays, state management, and form controls essential for tournament administration.

---

## Core Design Elements

### Typography
**Arabic-Optimized Font System**:
- Primary: Noto Sans Arabic (via Google Fonts CDN)
- Fallback: Cairo, sans-serif
- Display hierarchy: 
  - Tournament titles: text-4xl font-bold
  - Section headers: text-2xl font-semibold
  - Question text (display): text-3xl font-medium (for large screen visibility)
  - Body text: text-base
  - Small labels: text-sm

**RTL Configuration**: Apply `dir="rtl"` to html element, use `text-right` as default alignment

### Layout System
**Spacing Primitives**: Tailwind units 4, 6, 8, 12 for consistent rhythm
- Component padding: p-6 or p-8
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-6
- Form field spacing: space-y-4

**Grid System**:
- Admin dashboard: 12-column grid (grid-cols-12)
- Tournament bracket: Flexible multi-column based on round count
- Settings forms: Single column max-w-2xl for focus

---

## Application Structure

### 1. Admin Control Panel
**Layout**: Sidebar navigation (w-64) + main content area
- **Sidebar**: Tournament list, active games, settings access
- **Main area**: Dynamic content based on selected view
- **Status bar**: Current tournament name, game phase, participant count

### 2. Tournament Creation Interface
**Form Layout**: Vertical single-column (max-w-3xl)
- Participant count selector: Large radio buttons with icons (2/4/8/16/32)
- Settings sections in expansion panels:
  - Game configuration (rounds count, questions per round)
  - Help tools allocation per participant
  - Round type sequence configuration
- Participant name input: Dynamic list with add/remove controls
- Create button: Large, prominent at bottom

### 3. Bracket Visualization
**Tournament Tree Display**:
- Horizontal bracket layout (left-to-right for RTL)
- Each match card shows: Participant names, current score, match status
- Visual connectors: Stroke lines between rounds
- Highlight active match with elevated shadow
- Responsive: Stack vertically on smaller screens

### 4. Game Display Screen (Projected Interface)
**Full-screen question display**:
- Question text: Centered, text-3xl, maximum readability
- Answer choices: Large buttons (4 options in 2x2 grid)
- Round indicator: Fixed top-right showing "جولة X من Y"
- Score display: Fixed top-left showing both participants' scores
- Mode indicator: Badge showing current round type (selective/free-for-all)

### 5. Admin Game Control
**Split-screen layout**:
- Left panel (40%): Live bracket preview, participant help tool status
- Right panel (60%): Question queue, answer reveal controls, next question button
- Bottom bar: Help tool activation buttons, emergency controls

---

## Component Library

### Navigation
- Sidebar menu items: h-12, icon + text, hover state with subtle background
- Breadcrumbs: For deep navigation (tournament > match > game)

### Forms & Inputs
**Text inputs**:
- Height: h-12
- Border: border-2 with focus ring
- Labels: text-sm font-medium, mb-2
- RTL placeholder alignment

**Selection Controls**:
- Radio groups: Visual cards for participant count selection
- Checkboxes: For help tool selections
- Dropdowns: Native select with custom styling

### Data Display

**Match Cards**:
- Elevation: shadow-md, hover:shadow-lg
- Structure: Participant names stacked, divider, score display
- Status badge: Top-right corner (active, completed, upcoming)

**Score Panels**:
- Large numerals: text-5xl font-bold
- Participant name: text-xl
- Progress bars: For round completion

**Question Cards**:
- White background, border, rounded corners
- Question number badge
- Answer choices as full-width buttons (h-16)
- Correct answer indicator (post-reveal)

### Buttons
**Primary actions**: 
- Size: px-8 py-3
- Font: text-base font-semibold
- Examples: Start game, Next question, Create tournament

**Secondary actions**:
- Outlined variant
- Examples: Cancel, Back, Edit settings

**Help tool buttons**:
- Icon + text, compact (px-4 py-2)
- Disabled state when tool is depleted

### Status Indicators
- Color-coded badges for game states
- Icon + text combination
- Examples: Active, Completed, Waiting

### Overlays
**Modal dialogs**:
- Max-width: max-w-lg
- Backdrop: Semi-transparent overlay
- Uses: Confirm actions, help tool activation, tournament completion

---

## Critical RTL Considerations
- All padding/margin: Use start/end instead of left/right
- Flex/grid direction: Reverse for RTL where needed
- Icons: Mirror directional icons (arrows, chevrons)
- Bracket flow: Ensure logical right-to-left progression

---

## Accessibility
- Minimum touch target: 44x44px for all interactive elements
- Focus indicators: Visible focus rings on all controls
- ARIA labels: For icon-only buttons
- Keyboard navigation: Full keyboard support for admin controls
- Screen reader support: Proper heading hierarchy, landmark regions

---

## Icons
**Library**: Heroicons (via CDN)
- Navigation: home, cog, trophy icons
- Actions: plus, trash, edit, arrow icons
- Status: check-circle, x-circle, clock
- Game controls: play, pause, forward, refresh

---

## Performance Considerations
- Bracket rendering: Virtual scrolling for 32+ participant tournaments
- Question loading: Preload next 5 questions
- WebSocket updates: Debounced UI updates for real-time score changes