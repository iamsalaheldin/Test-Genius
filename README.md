# Test Genius

Test Genius is an AI-powered test case generation and management tool designed to streamline the software testing process. It leverages advanced AI models to generate comprehensive test cases based on user-provided specifications and supports exporting test cases in CSV format for easy integration with other tools.

## Features
- AI-powered test case generation using Google Gemini API.
- Export test cases to CSV in a customizable format.
- Manage and filter test cases by type and priority.
- Upload and analyze specification files in various formats (PDF, DOCX, TXT, MD).
- User-friendly interface for managing test plans and reports.

## Project Structure
```
TestGenius/
├── components.json
├── drizzle.config.ts
├── generated-icon.png
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── client/
│   ├── index.html
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── file-upload.tsx
│   │   │   ├── test-case-detail-modal.tsx
│   │   │   ├── test-case-table.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   ├── uploaded-file-item.tsx
│   │   │   └── ui/
│   │   │       ├── accordion.tsx
│   │   │       ├── alert-dialog.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── aspect-ratio.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── breadcrumb.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── carousel.tsx
│   │   │       ├── chart.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── collapsible.tsx
│   │   │       ├── command.tsx
│   │   │       ├── context-menu.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── drawer.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── form.tsx
│   │   │       ├── hover-card.tsx
│   │   │       ├── input-otp.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── menubar.tsx
│   │   │       ├── navigation-menu.tsx
│   │   │       ├── pagination.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── resizable.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── slider.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── toast.tsx
│   │   │       ├── toaster.tsx
│   │   │       ├── toggle-group.tsx
│   │   │       ├── toggle.tsx
│   │   │       └── tooltip.tsx
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── home.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── reports.tsx
│   │   │   └── view-test-plans.tsx
├── server/
│   ├── gemini.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
└── uploads/
    ├── files-1745480985365-147761330.txt
    ├── files-1745482651101-172718248.txt
    ├── files-1745483339962-283505024.txt
    ├── files-1745484584006-524239359.txt
    ├── files-1745484680249-751799233.txt
    ├── files-1745484713870-303254240.txt
    ├── files-1745484976989-829368948.txt
    ├── files-1745485358252-823798143.txt
    ├── files-1745490161781-654641900.txt
    ├── files-1745490676221-285298621.txt
    ├── files-1745491015946-455733137.txt
    └── files-1745491268620-137706523.txt
```

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/iamsalaheldin/Test-Genius.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:5000`.

