# Application Status Pages

This document describes the application status tracking feature for the BSWD/CSG-DSE application system.

## Overview

After submitting a BSWD application, students can track the status of their application through dedicated status pages. The system supports five different application states.

## Application Status States

### 1. **Submitted** (Blue)
- Application has been successfully received
- Waiting in queue for review
- Student receives confirmation notification

### 2. **In Review** (Yellow)
- Application is being actively reviewed by the assessment team
- Typically takes 2-3 weeks
- No action required from student

### 3. **In Progress** (Orange)
- Additional information or documentation is needed
- Student must check email for specific requirements
- Application processing paused until requirements are met

### 4. **Accepted** (Green)
- Application has been approved
- Formal approval letter will be sent within 3-5 business days
- Funding disbursement information to follow

### 5. **Denied** (Red)
- Application did not meet eligibility criteria
- Detailed explanation provided via email
- Student may appeal within 30 days

## Pages

### `/application-status`
The main application status page that displays:
- Current status with color-coded badge and icon
- Application details summary
- Timeline of status updates
- Next steps information
- Action buttons (return home, print status)

**Usage:** This page will be displayed after successful application submission or can be accessed directly by students to check their application status.

### `/status-demo`
A development/demo page that allows viewing all status states:
- Interactive status selector
- Shows different mock applications for each status
- Useful for testing and demonstrations
- Should be removed or protected in production

## Components Modified

### `Submit.tsx`
- Enhanced the Review and Submit step
- Added comprehensive application summary
- Displays all form sections with collected data
- Handles application submission
- Shows success message and redirects to status page
- Includes loading states and animations

## Data Types

### `ApplicationStatus` Type
```typescript
export type ApplicationStatus = 'submitted' | 'in-review' | 'in-progress' | 'accepted' | 'denied';
```

### `Application` Interface
```typescript
export interface Application {
  id: string;                    // Unique application ID
  studentName: string;           // Full name of student
  studentId: string;             // Student ID number
  submittedDate: string;         // Date application was submitted
  status: ApplicationStatus;     // Current application status
  program: string;               // Program name
  institution: string;           // Educational institution
  studyPeriod: string;          // Study period (e.g., "Fall 2024 - Spring 2025")
  statusUpdatedDate: string;    // Date status was last updated
  reviewNotes?: string;         // Optional notes from reviewers
}
```

## Integration Notes

### Current Implementation
- Uses localStorage to store and retrieve submitted application data
- Form data from the application is saved when the user submits
- Application ID is auto-generated with format: `APP-YYYY-NNNNNN`
- Submission date is automatically set to the current date
- Status page reads from localStorage and displays user's actual information
- Falls back to mock data if no application is found in localStorage
- Automatic redirect after form submission (2 second delay)
- Status page accessible at `/application-status`

### Data Flow
1. User completes the BSWD application form
2. On submission, form data is transformed into Application format
3. Application data is saved to localStorage with key `currentApplication`
4. User is redirected to `/application-status`
5. Status page loads application data from localStorage
6. User's actual information is displayed in the Application Details section

### Future Integration Requirements

1. **API Integration**
   - Replace mock data with API calls to backend
   - Fetch application status based on student authentication
   - Real-time status updates

2. **Authentication**
   - Implement student authentication
   - Secure access to application status
   - Protect student data

3. **Database**
   - Store application submissions
   - Track status changes with timestamps
   - Store reviewer notes

4. **Notifications**
   - Email notifications on status changes
   - In-app notifications
   - SMS notifications (optional)

5. **Additional Features**
   - Document upload for "in-progress" status
   - Appeals process for "denied" status
   - PDF export of application status
   - Print-friendly version

## Styling

The pages use:
- Brand colors from `tailwind.config.js`
- Responsive design (mobile-friendly)
- Lucide React icons
- Consistent styling with the rest of the application

## Testing

To test different status states:
1. Navigate to `/status-demo`
2. Click on different status buttons to see how each state appears
3. Verify color coding, icons, and messaging

## Navigation Flow

```
Application Form → Submit (Step 7) → Success Message → Application Status Page
                                                             ↓
                                                    View Status Anytime
```

## Files

- `/frontend/src/pages/application-status.tsx` - Main status page
- `/frontend/src/pages/status-demo.tsx` - Demo/testing page
- `/frontend/src/components/bswd/steps/Submit.tsx` - Enhanced submit step
- `/frontend/src/types/bswd.ts` - Type definitions (updated)

## Dependencies

- `lucide-react` - For icons (already installed)
- `next/router` - For navigation (Next.js built-in)
- All existing project dependencies

No additional packages need to be installed.
