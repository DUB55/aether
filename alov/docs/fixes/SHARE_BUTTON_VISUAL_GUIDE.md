# Share Button - Visual User Guide

## Before (Old Design)
```
┌────────────────────────────────────────────────────┐
│  Header                                            │
│  [Refresh] [Share] [Publish]                       │
└────────────────────────────────────────────────────┘
         Click → Copies link immediately
```

## After (New Design)
```
┌────────────────────────────────────────────────────┐
│  Header                                            │
│  [Refresh] [Share ▼] [Publish]                     │
└────────────────────────────────────────────────────┘
              │
              │ Click
              ▼
    ┌─────────────────────────┐
    │  🔗 Copy Link           │ ← Copies URL to clipboard
    │  📦 Download Project    │ ← Downloads ZIP file
    └─────────────────────────┘
```

## User Flow 1: Copy Link

### Step 1: Click Share Button
```
[Share ▼] ← Click here
```

### Step 2: Dropdown Appears
```
┌─────────────────────────┐
│  🔗 Copy Link           │ ← Click here
│  📦 Download Project    │
└─────────────────────────┘
```

### Step 3: Success Notification
```
┌──────────────────────────────────────┐
│  ✓ Editor link copied to clipboard! │
└──────────────────────────────────────┘
```

### Result
✅ URL is now in your clipboard
✅ You can paste it anywhere (Ctrl+V / Cmd+V)
✅ Share with team members, clients, etc.

## User Flow 2: Download Project

### Step 1: Click Share Button
```
[Share ▼] ← Click here
```

### Step 2: Dropdown Appears
```
┌─────────────────────────┐
│  🔗 Copy Link           │
│  📦 Download Project    │ ← Click here
└─────────────────────────┘
```

### Step 3: Loading Notification
```
┌──────────────────────────┐
│  ⏳ Preparing download... │
└──────────────────────────┘
```

### Step 4: Download Starts
```
Browser downloads: my-project.zip
```

### Step 5: Success Notification
```
┌────────────────────────────────────────┐
│  ✓ Project downloaded successfully!   │
└────────────────────────────────────────┘
```

### Result
✅ ZIP file downloaded to your Downloads folder
✅ Contains all project files
✅ Includes project-info.json with metadata

## What's in the ZIP File?

```
my-project.zip
├── index.html          ← Your HTML file
├── styles.css          ← Your CSS file
├── script.js           ← Your JavaScript file
├── [other files]       ← All other project files
└── project-info.json   ← Project metadata
```

### project-info.json Example
```json
{
  "name": "My Project",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T12:30:00.000Z",
  "description": "Project exported from Aether on 1/15/2024, 12:30:00 PM"
}
```

## Button States

### Normal State
```
[Share ▼]
```
- Gray text
- Rounded corners
- Subtle hover effect

### Hover State
```
[Share ▼]  ← Slightly darker background
```

### Dropdown Open
```
[Share ▼]  ← Active state
    │
    ▼
┌─────────────────────────┐
│  🔗 Copy Link           │
│  📦 Download Project    │
└─────────────────────────┘
```

### Menu Item Hover
```
┌─────────────────────────┐
│  🔗 Copy Link           │ ← Highlighted
│  📦 Download Project    │
└─────────────────────────┘
```

## Keyboard Navigation

### Open Dropdown
```
Tab → Focus on Share button
Enter/Space → Open dropdown
```

### Navigate Menu
```
↓ Arrow Down → Next item
↑ Arrow Up → Previous item
Enter → Select item
Esc → Close dropdown
```

## Mobile Experience

On mobile devices:
```
┌──────────────────┐
│  [Share ▼]       │ ← Tap here
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  🔗 Copy Link    │ ← Tap to copy
│  📦 Download     │ ← Tap to download
└──────────────────┘
```

## Color Scheme

All colors follow your requirements:

### Button
- Text: Gray (muted-foreground)
- Background: Transparent
- Hover: Light gray (muted)
- Border: None

### Dropdown Menu
- Background: White (light mode) / Dark gray (dark mode)
- Border: Gray
- Shadow: Subtle gray shadow

### Menu Items
- Text: Black/White (based on theme)
- Hover: Light gray background
- Icons: Match text color

### Notifications (Toasts)
- Background: Dark gray
- Text: White
- Success icon: Green (only for icon)
- Loading icon: Gray

## Accessibility Features

✅ **Keyboard Navigation**
- Tab to focus
- Arrow keys to navigate
- Enter to select
- Escape to close

✅ **Screen Readers**
- Proper ARIA labels
- Announces menu state
- Reads menu items clearly

✅ **Focus Management**
- Visible focus indicators
- Logical tab order
- Returns focus after close

✅ **Touch Targets**
- Large enough for fingers
- Proper spacing
- No accidental clicks

## Error Scenarios

### Download Fails
```
┌────────────────────────────────────┐
│  ✗ Download failed: [error reason] │
└────────────────────────────────────┘
```

### No Project Files
```
┌────────────────────────────────────┐
│  ✗ No files to download            │
└────────────────────────────────────┘
```

### Clipboard Not Available
```
┌────────────────────────────────────┐
│  ✗ Could not copy to clipboard     │
└────────────────────────────────────┘
```

## Tips for Users

💡 **Copy Link** is perfect for:
- Sharing with team members
- Bookmarking your work
- Sending to clients for review
- Creating project shortcuts

💡 **Download Project** is perfect for:
- Creating backups
- Working offline
- Transferring to another computer
- Archiving completed projects
- Sharing via email or USB

## Quick Reference

| Action | Shortcut | Result |
|--------|----------|--------|
| Open menu | Click Share | Dropdown appears |
| Copy link | Click "Copy Link" | URL in clipboard |
| Download | Click "Download Project" | ZIP file downloads |
| Close menu | Click outside / Esc | Menu closes |

## That's It!

The Share button is now a powerful tool with two essential features:
1. **Copy Link** - Share instantly
2. **Download Project** - Backup easily

Both work seamlessly with clear feedback and error handling! 🎉
