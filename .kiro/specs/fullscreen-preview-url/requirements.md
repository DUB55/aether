# Requirements Document

## Introduction

This document defines the requirements for adding a fullscreen preview URL feature to Aether. The feature will enable users to generate a URL that displays only the deployed webpage in fullscreen mode, without any editor UI elements, making it suitable for sharing and presenting the final output.

## Glossary

- **Aether**: The web-based editor application for building websites with AI assistance
- **Deploy_System**: The component responsible for publishing and sharing projects
- **Preview_URL**: A URL that displays the webpage content without editor UI
- **Fullscreen_Mode**: Display mode showing only the webpage content, occupying the entire viewport
- **Editor_UI**: The interface elements including chat panel, code editor, tabs, and toolbars
- **Project_Data**: The collection of files (HTML, CSS, JavaScript) that comprise the user's website
- **URL_Generator**: The component that creates shareable URLs with embedded or referenced project data
- **Viewer_Page**: A standalone page that renders only the webpage content without editor chrome

## Requirements

### Requirement 1: Generate Fullscreen Preview URL

**User Story:** As a user, I want to generate a fullscreen preview URL for my deployed project, so that I can share a clean view of my webpage without the editor interface.

#### Acceptance Criteria

1. WHEN a user deploys a project, THE Deploy_System SHALL generate both a standard editor URL and a fullscreen preview URL
2. THE Fullscreen_Preview_URL SHALL contain all necessary Project_Data to render the webpage independently
3. THE URL_Generator SHALL support both hash-based (quick link) and secure (GitHub-based) URL formats for fullscreen previews
4. THE Deploy_System SHALL display both URLs in the deploy panel with clear labels distinguishing them

### Requirement 2: Render Fullscreen Preview

**User Story:** As a viewer, I want to see only the webpage content when I open a fullscreen preview URL, so that I can experience the site without distractions.

#### Acceptance Criteria

1. WHEN a Fullscreen_Preview_URL is opened, THE Viewer_Page SHALL render only the webpage content
2. THE Viewer_Page SHALL NOT display any Editor_UI elements including chat panel, code editor, tabs, or toolbars
3. THE Viewer_Page SHALL occupy the entire browser viewport with the webpage content
4. WHEN the webpage content includes multiple files, THE Viewer_Page SHALL resolve file references correctly

### Requirement 3: Support Existing URL Formats

**User Story:** As a user, I want fullscreen preview URLs to work with both quick link and secure sharing methods, so that I have flexibility in how I share my work.

#### Acceptance Criteria

1. WHERE quick link sharing is used, THE URL_Generator SHALL embed compressed Project_Data in the URL hash
2. WHERE secure sharing is used, THE URL_Generator SHALL reference encrypted Project_Data stored on GitHub
3. WHEN a hash-based Fullscreen_Preview_URL is opened, THE Viewer_Page SHALL decompress and render the embedded Project_Data
4. WHEN a GitHub-based Fullscreen_Preview_URL is opened, THE Viewer_Page SHALL fetch, decrypt, and render the referenced Project_Data

### Requirement 4: Copy Fullscreen Preview URL

**User Story:** As a user, I want to easily copy the fullscreen preview URL to my clipboard, so that I can quickly share it with others.

#### Acceptance Criteria

1. THE Deploy_System SHALL provide a copy button next to the fullscreen preview URL
2. WHEN the copy button is clicked, THE Deploy_System SHALL copy the fullscreen preview URL to the clipboard
3. WHEN the URL is copied successfully, THE Deploy_System SHALL display a confirmation message
4. IF the clipboard operation fails, THEN THE Deploy_System SHALL display an error message

### Requirement 5: Maintain URL Compatibility

**User Story:** As a developer, I want fullscreen preview URLs to use the same data format as editor URLs, so that the codebase remains maintainable and consistent.

#### Acceptance Criteria

1. THE URL_Generator SHALL use the same encryption and compression algorithms for fullscreen preview URLs as for editor URLs
2. THE Viewer_Page SHALL reuse existing decryption and decompression utilities
3. THE Fullscreen_Preview_URL SHALL include a parameter or path segment that identifies it as a viewer-only URL
4. WHEN Project_Data is updated, THE Deploy_System SHALL regenerate both editor and fullscreen preview URLs with the updated data

### Requirement 6: Handle Missing or Invalid Data

**User Story:** As a viewer, I want to see a helpful error message if a fullscreen preview URL is invalid or incomplete, so that I understand what went wrong.

#### Acceptance Criteria

1. IF a Fullscreen_Preview_URL contains invalid or corrupted data, THEN THE Viewer_Page SHALL display an error message
2. IF a Fullscreen_Preview_URL references missing GitHub data, THEN THE Viewer_Page SHALL display an error message indicating the resource was not found
3. IF decryption fails for a secure Fullscreen_Preview_URL, THEN THE Viewer_Page SHALL display an error message indicating invalid or missing decryption key
4. THE Viewer_Page SHALL provide a link to return to the main Aether application in error scenarios

### Requirement 7: Preserve Webpage Functionality

**User Story:** As a viewer, I want the webpage to function normally in fullscreen preview mode, so that I can interact with it as intended.

#### Acceptance Criteria

1. THE Viewer_Page SHALL enable JavaScript execution for the webpage content
2. THE Viewer_Page SHALL allow form submissions and user interactions within the webpage
3. THE Viewer_Page SHALL support modal dialogs and popups within the webpage
4. THE Viewer_Page SHALL apply the same sandbox restrictions as the editor preview iframe to maintain security
