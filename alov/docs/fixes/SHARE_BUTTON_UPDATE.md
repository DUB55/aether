# Share Button Update - Dropdown Menu with Download

## Changes Applied

### 1. Added Download Handler Function
Added `handleDownloadProject` function after `handleShare` (around line 1027-1070):

```typescript
const handleDownloadProject = async () => {
  if (!project) return
  
  const tid = toast.loading("Preparing download...")
  
  try {
    // Use JSZip to create a zip file
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    
    // Add all project files to zip
    Object.entries(project.files).forEach(([path, content]) => {
      zip.file(path, content)
    })
    
    // Add a project info file
    const projectInfo = {
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      description: `Project exported from Aether on ${new Date().toLocaleString()}`
    }
    zip.file('project-info.json', JSON.stringify(projectInfo, null, 2))
    
    // Generate zip file
    const blob = await zip.generateAsync({ type: 'blob' })
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("Project downloaded successfully!", { id: tid })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    toast.error(`Download failed: ${errorMessage}`, { id: tid })
  }
}
```

### 2. Replace Share Button with Dropdown Menu
Find the Share button (around line 1595-1604) and replace with:

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-11 px-4 rounded-full text-xs font-bold gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
    >
      <Share2 className="w-3.5 h-3.5" /> Share
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem 
      onClick={handleShare}
      className="cursor-pointer gap-2"
    >
      <Share2 className="w-4 h-4" />
      Copy Link
    </DropdownMenuItem>
    <DropdownMenuItem 
      onClick={handleDownloadProject}
      className="cursor-pointer gap-2"
    >
      <ArrowUpRight className="w-4 h-4" />
      Download Project
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Features

### Copy Link
- Copies the current editor URL to clipboard
- Shows success toast notification
- Allows sharing the project with others

### Download Project
- Creates a ZIP file containing all project files
- Includes a `project-info.json` with metadata
- Downloads with project name as filename
- Shows loading and success notifications

## User Experience

1. Click "Share" button
2. Dropdown menu appears with two options:
   - **Copy Link** - Copies URL to clipboard
   - **Download Project** - Downloads entire project as ZIP

## Technical Details

- Uses `jszip` library (already installed in package.json)
- Dynamic import to reduce bundle size
- Proper error handling with toast notifications
- Clean URL management (creates and revokes object URLs)
- Sanitized filename (replaces spaces with hyphens)

## Testing

To test:
1. Open any project in the editor
2. Click the "Share" button in the header
3. Select "Copy Link" - should copy URL and show toast
4. Select "Download Project" - should download a ZIP file with all project files

## Files Modified

- `src/app/editor/[projectId]/page.tsx`
  - Added `handleDownloadProject` function
  - Converted Share button to DropdownMenu
  - Added menu items for Copy Link and Download Project
