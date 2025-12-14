# InscriptionService Frontend

A modern, clean React frontend for managing student inscriptions with AI-powered analysis.

## Features

✨ **Core Features**
- 📋 Complete inscription management (CRUD)
- 📁 Document upload and verification
- 🤖 AI-powered document and student analysis
- 📊 Dashboard with analytics and metrics
- 📧 Email notifications
- 📄 PDF generation and export
- 🎯 Advanced filtering and search

✅ **Quality & Design**
- Modern, original design (no Bootstrap/Tailwind)
- Form validation with detailed error messages
- Responsive layout (desktop, tablet, mobile)
- Clean, semantic HTML
- Smooth animations and transitions
- Accessibility best practices
- Color-coded status indicators
- Loading states and error handling

🔒 **Best Practices**
- RESTful API integration
- Proper error handling
- Form validation (email, file size, file type)
- Loading indicators
- Success/error toast notifications
- Modal dialogs for important actions
- Drag-and-drop file upload
- Efficient state management

## Project Structure

```
front/
├── src/
│   ├── api/
│   │   └── apiClient.js          # API integration layer
│   ├── components/
│   │   ├── Header.jsx             # Navigation header
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── InscriptionForm.jsx    # Form with validation
│   │   ├── InscriptionList.jsx    # Inscriptions table
│   │   ├── DocumentUploader.jsx   # File upload with drag-drop
│   │   └── AIAnalysis.jsx         # AI analysis interface
│   ├── styles/
│   │   └── globalStyles.js        # Global CSS variables
│   ├── utils/
│   │   └── validation.js          # Form validation utilities
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # Entry point
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── package.json                   # Dependencies
└── .env.example                   # Environment variables template
```

## Installation

```bash
# Navigate to frontend directory
cd front

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080
```

## API Integration

The frontend connects to the backend API at `http://localhost:8080`. All API endpoints are defined in `src/api/apiClient.js`:

- **Inscriptions**: GET, POST, PUT, DELETE
- **Documents**: Upload, verify, validate, download
- **Mail**: Send confirmation, rejection, notifications
- **PDF**: Generate inscription and bordereau documents
- **Gemini AI**: Document analysis, student classification, deliberation

## Form Validation

Comprehensive validation for:
- ✓ Required fields
- ✓ Email format
- ✓ Phone numbers
- ✓ File size (max 10MB)
- ✓ File types (PDF, JPEG, PNG)
- ✓ Date format
- ✓ Custom rules

## Design System

### Colors
- **Primary**: #000000 (Black)
- **Secondary**: #FFFFFF (White)
- **Accent**: #f0f0f0 (Light Gray)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Warning**: #f59e0b (Orange)
- **Info**: #3b82f6 (Blue)

### Typography
- Font Family: System font stack (Apple-system, Segoe UI, etc.)
- Smooth font rendering
- Optimized line heights

### Spacing
- 0.5rem (8px)
- 1rem (16px)
- 1.5rem (24px)
- 2rem (32px)

### Components
- Forms with inline validation
- Data tables with sorting/filtering
- Modal dialogs
- Toast notifications
- Loading spinners
- Status badges
- File upload zones

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Development Tips

1. **Hot Reload**: Changes are automatically reloaded during development
2. **API Mocking**: To test without backend, mock responses in `apiClient.js`
3. **Styled Components**: All styling uses styled-components for scoped CSS
4. **Validation**: Check `validation.js` to add custom validation rules
5. **Error Handling**: API errors are caught and displayed via toast notifications

## Production Build

The build is optimized for performance:
- Tree-shaking to remove unused code
- Minification
- Asset optimization
- Code splitting

```bash
npm run build
```

Built files are in the `dist/` directory.

## License

MIT
