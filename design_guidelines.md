# Search UI Design Guidelines - School Management Portal

## Design Approach
**System**: Material Design 3 with enterprise adaptations - optimal for data-dense, professional environments where clarity and efficiency are paramount.

**Key Principles**:
- Instant feedback and progressive disclosure
- Keyboard-first interaction patterns
- Scannable, structured results
- Zero-state guidance

---

## Typography System
- **Search Input**: 16px medium weight, sans-serif (Inter/Roboto)
- **Result Titles**: 14px semibold
- **Metadata**: 13px regular, reduced opacity
- **Command Shortcuts**: 12px monospace for keyboard hints
- **Empty States**: 15px regular with generous line-height

---

## Layout & Spacing
**Spacing Units**: Tailwind 2, 3, 4, 6, 8 for consistency
- Search input padding: p-4
- Result items: p-3 with gap-2 between sections
- Modal container: max-w-2xl with responsive padding
- Vertical rhythm: gap-4 between result groups

---

## Core Components

### 1. Command Palette Search
**Trigger**: 
- Persistent search bar in top navigation (w-96)
- Global keyboard shortcut indicator (⌘K / Ctrl+K)

**Modal Overlay**:
- Centered, 640px width, max-h-[600px]
- Backdrop blur with semi-transparent background
- Appears with smooth scale animation (95% → 100%)

**Search Input**:
- Large, prominent field at top (h-14)
- Magnifying glass icon left-aligned
- Placeholder: "Search students, teachers, classes..."
- Real-time filtering (no submit button)
- Clear button (X) appears when typing

### 2. Results Structure

**Grouped Categories**:
Display results in distinct sections with headers:
- Students (with enrollment status badge)
- Teachers (with department label)
- Classes (with schedule info)
- Documents (with file type icons)

Each category shows max 4 results, "View all X results" link to expand.

**Individual Result Card**:
```
[Avatar/Icon] [Primary Text - Name/Title]
              [Secondary Text - ID, Grade, or Department]
              [Tertiary - Last activity or status]
              [Action Icons - view, edit, message]
```

**Result Interactions**:
- Hover state: subtle background lift
- Keyboard navigation: visible focus ring with arrow keys
- Enter to select, Tab to cycle through actions
- Display keyboard shortcuts on right (⏎, ⌘E)

### 3. Advanced Filters Bar
Below search input, collapsible pill-based filters:
- Role: All / Student / Teacher / Staff
- Status: Active / Inactive / Archived
- Grade/Department quick filters
- Date range selector for activity
Each filter as rounded pill with count badge, dismissible with X

### 4. Empty & Zero States

**No Search Query**:
- Recent searches (last 5)
- Quick actions (Add Student, View Reports)
- Popular searches or suggestions

**No Results Found**:
- Clear messaging: "No results for '[query]'"
- Suggestions: Check spelling, try different terms
- Quick action: "Add new student" button

**Loading State**:
- Skeleton loaders matching result card structure
- Subtle pulsing animation

---

## Visual Hierarchy

**Information Density**:
- Avatar/icons: 40px circular (students/teachers), 32px square (documents)
- Status badges: Small, rounded, right-aligned
- Metadata in reduced opacity (60-70%)
- Action icons: 20px, appear on hover/focus

**Result Prioritization**:
1. Exact matches highlighted
2. Recent interactions bubble up
3. Contextual relevance (same class/grade)

---

## Accessibility
- ARIA labels for all interactive elements
- Screen reader announcements for result counts
- Focus trap within modal
- Escape key to close
- High contrast mode support
- Clear focus indicators (2px solid ring)

---

## Responsive Behavior
- **Desktop**: Full command palette experience
- **Tablet**: Narrower modal (90vw), stacked filter pills
- **Mobile**: Full-screen overlay, simplified filters in expandable drawer

---

## Images
**None required** - This is a functional search interface where icons, avatars, and UI elements provide sufficient visual context. Focus on clarity over decorative imagery.

---

## Performance Considerations
- Results appear within 200ms of keystroke
- Debounce search after 150ms of inactivity
- Progressive loading for large result sets
- Cache recent searches locally