# Requirements Document

## Introduction

This document specifies requirements for improving the Aether web-based editor's user experience. The improvements focus on streamlining the deploy workflow, enhancing copy button interactions, introducing a settings system for link mode preferences, and ensuring AI functionality works correctly with the existing backend endpoint.

## Glossary

- **Aether_Editor**: The web-based code editor application for building and previewing web projects
- **Copy_Button**: UI button that copies text to the user's clipboard
- **Deploy_URL**: The shareable URL generated after publishing a project
- **Settings_Panel**: A new UI component for configuring user preferences
- **Link_Mode**: User preference for generating either safe (encrypted) or quick (hash-based) share links
- **AI_Chat**: The conversational AI interface for generating and modifying code
- **Backend_Endpoint**: The server API at /api/chatbot that processes AI requests
- **Custom_Messagebox**: A modal dialog component for displaying information with interactive elements
- **Download_Button**: UI button that exports the project as an HTML file
- **Deploy_Tab**: The existing tab/page in the editor dedicated to deployment options

## Requirements

### Requirement 1: Instant Copy Button Feedback

**User Story:** As a user, I want copy buttons to work instantly without alerts or popups, so that I can quickly copy URLs without interruption.

#### Acceptance Criteria

1. WHEN a user clicks a Copy_Button, THE Aether_Editor SHALL copy the associated text to the clipboard immediately
2. WHEN a user clicks a Copy_Button, THE Aether_Editor SHALL change the button icon to a checkmark
3. WHILE the checkmark is displayed, THE Aether_Editor SHALL maintain the visual feedback for 2 seconds
4. WHEN 2 seconds have elapsed after a copy action, THE Aether_Editor SHALL restore the original copy icon
5. WHEN a user clicks a Copy_Button, THE Aether_Editor SHALL NOT display any toast notifications or alert dialogs
6. IF the clipboard operation fails, THEN THE Aether_Editor SHALL display a subtle error indicator on the button for 2 seconds

### Requirement 2: Settings Panel with Link Mode Toggle

**User Story:** As a user, I want to configure my preferred link generation mode in a settings panel, so that I can choose between safe or quick links without seeing both options every time.

#### Acceptance Criteria

1. THE Aether_Editor SHALL provide a Settings_Panel accessible from the main interface
2. THE Settings_Panel SHALL include a toggle control for selecting Link_Mode
3. THE Settings_Panel SHALL offer two Link_Mode options: "Safe Link" and "Quick Link"
4. WHEN a user selects a Link_Mode, THE Aether_Editor SHALL persist the preference in browser local storage
5. WHEN the Aether_Editor loads, THE Aether_Editor SHALL restore the user's saved Link_Mode preference
6. WHERE no Link_Mode preference exists, THE Aether_Editor SHALL default to "Safe Link" mode
7. THE Settings_Panel SHALL display a description explaining the difference between Safe Link and Quick Link modes
8. WHEN generating share links, THE Aether_Editor SHALL use the selected Link_Mode from Settings_Panel

### Requirement 3: Unified Deploy Button Placement

**User Story:** As a user, I want the deploy button positioned next to the download button in the top right, so that I can access deployment quickly from any view.

#### Acceptance Criteria

1. THE Aether_Editor SHALL display a deploy button in the top right header area
2. THE Aether_Editor SHALL position the deploy button immediately adjacent to the Download_Button
3. WHEN a user clicks the deploy button, THE Aether_Editor SHALL initiate the deployment process
4. THE deploy button SHALL remain visible and accessible from all editor tabs and views
5. THE deploy button SHALL use consistent styling with other header buttons

### Requirement 4: Deploy Tab Removal

**User Story:** As a user, I want a streamlined interface without the separate deploy tab, so that the editor feels less cluttered.

#### Acceptance Criteria

1. THE Aether_Editor SHALL NOT display the Deploy_Tab in the tab navigation
2. THE Aether_Editor SHALL remove all UI elements associated with the Deploy_Tab panel
3. WHEN a user switches between tabs, THE Aether_Editor SHALL NOT include "Deploy" as an available option
4. THE Aether_Editor SHALL maintain all other existing tabs (Preview, Code, History)

### Requirement 5: Deploy URL Display in Custom Messagebox

**User Story:** As a user, I want to see the generated deploy URL in a clean modal dialog with a working copy button, so that I can easily access and share my deployed project.

#### Acceptance Criteria

1. WHEN deployment completes successfully, THE Aether_Editor SHALL display a Custom_Messagebox
2. THE Custom_Messagebox SHALL contain the generated Deploy_URL in a read-only text field
3. THE Custom_Messagebox SHALL include a Copy_Button that follows the instant feedback pattern from Requirement 1
4. WHEN a user clicks the Copy_Button in the Custom_Messagebox, THE Aether_Editor SHALL copy the Deploy_URL to the clipboard
5. THE Custom_Messagebox SHALL include a close button to dismiss the dialog
6. THE Custom_Messagebox SHALL include an "Open in New Tab" button to view the deployed project
7. IF deployment fails, THEN THE Aether_Editor SHALL display an error message in the Custom_Messagebox with details about the failure

### Requirement 6: AI Backend Integration

**User Story:** As a user, I want the AI chat functionality to work seamlessly with the existing backend, so that I can generate and modify code through conversation.

#### Acceptance Criteria

1. WHEN a user sends a message in AI_Chat, THE Aether_Editor SHALL POST the request to the Backend_Endpoint at /api/chatbot
2. THE Aether_Editor SHALL format AI requests with the required JSON structure containing user input and conversation history
3. WHEN the Backend_Endpoint returns a streaming response, THE Aether_Editor SHALL parse and display the content progressively
4. THE Aether_Editor SHALL handle SSE (Server-Sent Events) format responses from the Backend_Endpoint
5. WHEN the AI generates file content, THE Aether_Editor SHALL extract and save files using the BEGIN FILE and END FILE markers
6. IF the Backend_Endpoint returns an error, THEN THE Aether_Editor SHALL display an appropriate error message in the AI_Chat
7. THE Aether_Editor SHALL support aborting in-progress AI requests
8. WHEN a user aborts an AI request, THE Aether_Editor SHALL cancel the network request and update the UI accordingly
