# ImpactHouse College - School Management Portal Design Guidelines

## Design Approach
**System**: Material Design 3 with premium enterprise adaptations for educational administration.

**Core Principles**:
- Professional sophistication with modern educational warmth
- Data clarity through high contrast and structured layouts
- Efficient workflows with keyboard-first interactions
- Trust-building through polished, consistent design

---

## Color Palette
**Primary**: Deep navy blue (#1a365d) for headers, primary actions
**Secondary**: Royal blue (#2563eb) for interactive elements, highlights
**Neutral Foundation**: 
- Backgrounds: Pure white (#ffffff) and cool gray (#f8fafc)
- Borders: Light gray (#e2e8f0)
- Text: Charcoal (#1e293b) primary, Gray (#64748b) secondary
**Accents**: 
- Success: Emerald (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)
- Info: Sky blue (#0ea5e9)

---

## Typography System
**Font**: Inter (primary), Roboto (fallback)
- **Hero/Display**: 48px bold
- **Page Titles**: 32px semibold
- **Section Headers**: 24px semibold
- **Card Titles**: 18px semibold
- **Body Text**: 16px regular
- **Metadata/Labels**: 14px regular
- **Captions**: 13px regular
- **Monospace (data)**: 14px JetBrains Mono

---

## Layout System
**Spacing Units**: Tailwind 3, 4, 6, 8, 12, 16

**Grid Structure**:
- Max container width: max-w-7xl
- Dashboard cards: 3-column grid (lg:grid-cols-3)
- Data tables: Full-width with max-w-full
- Forms: 2-column layout (lg:grid-cols-2)
- Sidebar navigation: Fixed 280px width

---

## Core Components

### Navigation
**Top Bar** (h-16):
- Deep navy background with white text
- Logo left-aligned (h-8)
- Global search center (w-96)
- Profile menu, notifications right-aligned
- Sticky positioning

**Sidebar** (280px):
- White background with subtle border-right
- Hierarchical menu items (p-3 each)
- Active state: Royal blue background with rounded corners
- Icon + label pattern (24px icons, gap-3)
- Collapsible section headers

### Dashboard Cards
**Stat Cards**:
- White background, rounded-lg, subtle shadow
- Large numeric display (36px bold)
- Label below (14px gray)
- Small trend indicator (↑↓ with percentage)
- Padding: p-6

**Quick Action Cards**:
- Hover-lift effect
- Icon top-left (40px circular background)
- Title + description stack
- Arrow icon bottom-right
- Padding: p-4, gap-4

### Data Tables
**Structure**:
- White background with border
- Header row: Light gray background (#f8fafc), sticky
- Alternating row backgrounds for scannability
- Row height: h-14
- Cell padding: px-6 py-3
- Action column right-aligned with icon buttons
- Pagination bottom-right (showing "1-10 of 234")

**Table Features**:
- Sortable column headers (with arrow indicators)
- Checkbox selection (left column)
- Status badges in cells (rounded-full, px-3 py-1)
- Row hover: Light blue background

### Forms
**Input Fields**:
- Height: h-12
- Border: 1px solid light gray
- Focus: 2px royal blue ring
- Label above: 14px semibold, mb-2
- Error state: Red border + message below
- Padding: px-4

**Buttons**:
- Primary: Deep navy background, white text, h-11, px-6, rounded-lg
- Secondary: White background, navy border and text
- Ghost: Transparent, navy text
- On images: Backdrop blur (backdrop-blur-sm) with white/10 background

### Search (Command Palette)
**Modal Overlay**:
- Centered, max-w-2xl, max-h-[600px]
- White background, rounded-xl, shadow-2xl
- Backdrop: Black/50 with blur
- Search input: h-14, border-bottom only
- Results: Scrollable container with grouped categories
- Category headers: 12px uppercase, gray, mb-3
- Result items: p-3, hover background, keyboard navigable
- Filters bar: Pill-based below input (gap-2)

### Modals & Dialogs
- Max width: max-w-lg to max-w-2xl based on content
- Padding: p-6 to p-8
- Header: pb-4 with border-bottom
- Footer: pt-6 with border-top, right-aligned actions
- Close button: Top-right (absolute positioning)

---

## Page Layouts

### Dashboard Home
**Hero Section** (h-64):
- Gradient background (navy to royal blue)
- Welcome message + user name (32px white)
- Quick stats row (4 metrics in white cards overlapping bottom)
- Padding: px-12, py-8

**Main Content**:
- 3-column grid for stat cards
- Recent activity feed (2-column: timeline left, details right)
- Upcoming events calendar widget
- Gap: gap-6 throughout

### Student/Teacher Directory
- Search bar with advanced filters
- Grid view (default): 3-column cards with avatars
- Table view toggle: Full data table
- Cards include: Large avatar (64px), name, ID, status badge, department/grade

### Class Management
- Calendar view with color-coded classes
- List view with expandable details
- Sidebar showing current schedule
- Quick add floating action button (bottom-right, 56px circular)

---

## Images

**Hero Sections**:
- Dashboard welcome: Abstract educational imagery (books, graduation, collaboration) with gradient overlay (navy/80 opacity)
- Login page: Campus building or students collaborating (full-screen, split layout with form overlay)
- About/Info pages: Authentic campus photos with text overlays

**Profile Avatars**:
- Circular, 40px (small), 64px (medium), 128px (large)
- Placeholder: Initials on colored background
- Border: 2px white when grouped

**Icons**:
- Use Heroicons library via CDN
- 20px (inline), 24px (navigation), 40px (feature cards)

**Illustrations** (optional accents):
- Empty states: Subtle, minimal line art
- Onboarding: Educational-themed spot illustrations

---

## Accessibility
- WCAG AAA contrast ratios (navy on white: 12.6:1)
- Focus indicators: 2px solid royal blue ring with offset
- ARIA labels on all interactive elements
- Keyboard navigation throughout (Tab, Arrow keys, Escape)
- Screen reader announcements for dynamic content
- Skip-to-main-content link

---

## Responsive Behavior
- **Desktop (lg+)**: Full sidebar, 3-column grids, expanded tables
- **Tablet (md)**: Collapsed sidebar (icons only), 2-column grids
- **Mobile (base)**: Bottom navigation bar, single-column stack, simplified tables (card view)

---

## Animations
Use sparingly for feedback:
- Button press: Subtle scale (95%)
- Card hover: Lift (translateY -2px) with shadow increase
- Modal entry: Scale 95% → 100%, fade in (200ms)
- Page transitions: Fade only (150ms)
- Loading: Subtle pulse on skeleton loaders