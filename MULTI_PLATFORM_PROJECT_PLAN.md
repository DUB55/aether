# Multi-Platform Project Management System Plan

## Overview
Implement a comprehensive multi-platform project management system that allows users to create projects that exist either:
1. **Aether-only** - Files stored in Aether cloud, accessible from web and desktop
2. **Hybrid** - Files stored both in Aether cloud and locally on desktop

## Key Features Required

### 1. Project Type Selection (Desktop Only)
- Add project type selection dialog when creating new projects
- Options: "Aether Cloud Only" vs "Cloud + Local"
- Only show this dialog in Tauri desktop app

### 2. Enhanced Project Schema
- Extend Project type to include storage mode and local path
- Track sync status between cloud and local files
- Store last sync timestamps

### 3. Cross-Platform Chat Persistence
- Save chat history in database linked to user account
- Enable chat continuity across web and desktop
- Maintain conversation context across sessions

### 4. Local File Management
- Local file system operations (desktop only)
- File watching and synchronization
- Diff detection and conflict resolution

### 5. Sync Engine
- Detect differences between cloud and local files
- Automatic synchronization when desktop app starts
- Handle merge conflicts intelligently

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Update Project Type Definition
```typescript
// Extend src/types.ts
export interface Project {
  // ... existing fields
  storageMode: 'cloud' | 'hybrid';
  localPath?: string; // Only for hybrid projects
  lastSyncAt?: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'local-only' | 'cloud-only';
  localFileHashes?: Record<string, string>; // Track local file versions
  cloudFileHashes?: Record<string, string>; // Track cloud file versions
}
```

#### 1.2 Create Project Type Selection Component
- New component: `ProjectTypeDialog.tsx`
- Only renders in Tauri environment
- Clean UI for selecting storage mode
- Local folder picker for hybrid projects

#### 1.3 Database Schema Updates
- Add new collections/tables for:
  - Project chat history (per user, per project)
  - File sync metadata
  - Sync conflict logs

### Phase 2: Chat Persistence

#### 2.1 Chat History Storage
- Modify FirebaseProvider to save chat messages to database
- Create separate chat history collection
- Link messages to both user and project

#### 2.2 Chat Loading & Continuity
- Load chat history when opening projects
- Maintain conversation context across platforms
- Handle offline/online chat gracefully

#### 2.3 Real-time Sync
- Implement real-time chat sync across platforms
- Use Firebase real-time listeners or WebSocket
- Handle concurrent editing scenarios

### Phase 3: Local File Management (Desktop Only)

#### 3.1 Tauri File Operations
- Create Tauri commands for:
  - File/directory creation
  - File reading/writing
  - Directory watching
  - File hashing for diff detection

#### 3.2 Local Storage Service
- Create `src/lib/local-storage.ts`
- Abstract file operations behind interface
- Handle file permissions and errors

#### 3.3 File Watcher Service
- Monitor local file changes
- Queue changes for sync
- Handle file system events

### Phase 4: Sync Engine

#### 4.1 Diff Detection
- Compare file hashes between cloud and local
- Identify added, modified, deleted files
- Generate change manifests

#### 4.2 Conflict Resolution
- Detect conflicting changes
- Present resolution options to user
- Implement merge strategies (latest wins, manual merge)

#### 4.3 Sync orchestration
- Coordinate bidirectional sync
- Handle network failures gracefully
- Provide sync progress feedback

### Phase 5: UI/UX Enhancements

#### 5.1 Project Creation Flow
- Update project creation to include type selection
- Guide users through hybrid setup process
- Set appropriate expectations

#### 5.2 Sync Status Indicators
- Visual indicators for sync status
- Progress bars for sync operations
- Error notifications and resolution guidance

#### 5.3 Project Management UI
- Filter projects by storage type
- Show last sync times
- Provide manual sync triggers

### Phase 6: Testing & Polish

#### 6.1 Cross-Platform Testing
- Test web ↔ desktop continuity
- Verify sync reliability
- Test edge cases and error scenarios

#### 6.2 Performance Optimization
- Optimize large file sync
- Implement incremental sync
- Cache strategies for better UX

## Technical Architecture

### Components to Create
1. `ProjectTypeDialog.tsx` - Project type selection
2. `SyncStatusIndicator.tsx` - Visual sync status
3. `ConflictResolver.tsx` - Handle merge conflicts
4. `LocalStorageService.ts` - File operations abstraction
5. `SyncEngine.ts` - Core sync logic
6. `FileWatcher.ts` - Monitor local changes

### Services to Implement
1. Local file system service (Tauri commands)
2. File hashing service
3. Diff computation service
4. Conflict resolution service
5. Sync orchestration service

### Database Updates
1. Chat history collection
2. Sync metadata collection
3. Conflict log collection
4. User preferences for sync settings

## Implementation Dependencies

### Required Dependencies
- `chokidar` (for file watching, via Tauri)
- `crypto` (for file hashing)
- `diff` (for text comparison)
- Additional Tauri plugins for file system access

### Firebase Schema Changes
- Chat history collection structure
- Enhanced project document structure
- Sync metadata indexing

## Success Criteria

1. ✅ Users can choose project type on desktop
2. ✅ Chat history persists across platforms
3. ✅ Hybrid projects sync bidirectionally
4. ✅ Conflicts are detected and resolvable
5. ✅ Performance is acceptable for large projects
6. ✅ Error handling is robust and user-friendly

## Risks & Mitigations

### Technical Risks
- **File sync conflicts**: Implement robust conflict detection
- **Performance issues**: Use incremental sync and hashing
- **Network reliability**: Implement offline queueing

### User Experience Risks
- **Complexity**: Provide clear guidance and defaults
- **Data loss**: Implement backup and recovery mechanisms
- **Confusion**: Use clear visual indicators and messaging

## Timeline Estimate

- **Phase 1**: 2-3 days (Core infrastructure)
- **Phase 2**: 2-3 days (Chat persistence)
- **Phase 3**: 3-4 days (Local file management)
- **Phase 4**: 4-5 days (Sync engine)
- **Phase 5**: 2-3 days (UI/UX)
- **Phase 6**: 2-3 days (Testing & polish)

**Total Estimated Time**: 15-21 days

## Next Steps

1. Review and approve this plan
2. Begin with Phase 1 implementation
3. Set up development environment for testing
4. Create test scenarios for each phase
5. Establish success metrics and testing criteria

---

**Note**: This plan assumes the existing Firebase/GitHub infrastructure will be enhanced rather than replaced. The sync engine will work with the existing project storage system while adding local file capabilities.
