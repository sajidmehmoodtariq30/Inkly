# 📝 Inkly - Modern Blogging Platform

<div align="center">

![Inkly Logo](client/src/assets/logo.png)

A comprehensive, modern blogging platform built with the MERN stack featuring advanced content management, analytics, and multi-role user system.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

[🚀 Live Demo](https://inkly-beta.vercel.app) | [📖 Documentation]() | [🐛 Report Bug](https://github.com/sajidmehmoodtariq30/inkly/issues) | [✨ Request Feature](https://github.com/sajidmehmoodtariq30/inkly/issues)

</div>

---

## 🌟 Features

### 🔐 **Multi-Role Authentication System**

- **User Registration & Login** with email/username and Google OAuth
- **Role-based Access Control** (Admin, Writer, User)
- **JWT Authentication** with refresh token mechanism
- **Firebase Integration** for Google authentication
- **Profile Management** with avatar upload and social links

### ✍️ **Advanced Content Management**

- **Rich Text Editor** with Markdown support using @uiw/react-md-editor
- **Draft, Review, and Publish** workflow system
- **Category & Tag Management** with hierarchical structure
- **Media Library** with drag-and-drop file upload to Cloudinary
- **Article Scheduling** for future publication
- **SEO-Friendly URLs** with automatic slug generation
- **Featured Images** and excerpt management

### 👤 **User Roles & Permissions**

#### 🛡️ **Admin Dashboard**

- **User Management** - Create, edit, ban/unban users
- **Category Administration** - Hierarchical category management
- **Content Moderation** - Review and manage all articles
- **Analytics & Insights** - Platform-wide statistics and performance metrics
- **Bulk Operations** - Export data and batch actions

#### ✏️ **Writer Panel**

- **Personal Dashboard** with writing goals and statistics
- **Article Management** - Create, edit, delete, and schedule articles
- **Analytics** - Views, likes, comments, and engagement metrics
- **Comment Moderation** - Approve and manage article comments
- **Media Library** - Personal file management system
- **Performance Tracking** - Article performance and audience insights

#### 👥 **User Features**

- **Article Reading** with full-text search
- **Commenting System** with moderation
- **Social Features** - Like and engage with content
- **Profile Customization** with social media links
- **Notification Preferences** for email and push notifications

### 📊 **Analytics & Insights**

- **Real-time Analytics** for views, likes, and comments
- **Engagement Metrics** and performance tracking
- **Category Performance** analysis
- **User Activity** monitoring
- **Content Statistics** and growth metrics

### 🔍 **Search & Discovery**

- **Full-text Search** across articles and categories
- **Advanced Filtering** by category, date, popularity
- **Related Articles** recommendation system
- **Category Browsing** with article counts
- **Trending Content** based on engagement

### 🎨 **Modern UI/UX**

- **Responsive Design** built with Tailwind CSS
- **Component Library** using Radix UI primitives
- **Dark/Light Mode** support
- **Mobile-First** approach
- **Intuitive Navigation** and smooth user experience

## 🛠️ Tech Stack

### **Frontend**

- **React 19.1.0** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4.1.8** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Router 7.6.1** - Client-side routing
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling with validation
- **Lucide React** - Beautiful icon library

### **Backend**

- **Node.js** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication and authorization
- **Cloudinary** - Media storage and optimization
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### **Authentication & Services**

- **Firebase Authentication** - Google OAuth integration
- **JWT Tokens** - Secure authentication with refresh tokens
- **Cookie-based Sessions** - Secure session management

### **DevOps & Deployment**

- **Vercel** - Frontend and backend deployment
- **MongoDB Atlas** - Cloud database hosting
- **Cloudinary** - Cloud-based media management
- **Environment Variables** - Secure configuration management

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB database
- Cloudinary account
- Firebase project (for Google Auth)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sajidmehmoodtariq30/inkly.git
   cd inkly
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the server directory:

   ```env
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # App Configuration
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

   Create `.env` file in the client directory:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1/
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   ```

5. **Start the development servers**

   **Backend:**

   ```bash
   cd server
   npm run dev
   ```

   **Frontend:**

   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## 📁 Project Structure

``` bash
inkly/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI components (buttons, cards, etc.)
│   │   │   ├── admin/         # Admin-specific components
│   │   │   ├── writer/        # Writer panel components
│   │   │   └── app/           # Application layout components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── redux/             # State management
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   └── assets/            # Static assets
│   ├── public/                # Public assets
│   └── package.json           # Frontend dependencies
│
├── server/                     # Node.js backend application
│   ├── controllers/           # Route controllers
│   │   ├── AuthController.js  # Authentication logic
│   │   ├── AdminController.js # Admin operations
│   │   └── WriterController.js# Writer operations
│   ├── models/                # Database models
│   │   ├── UserModel.js       # User schema
│   │   ├── ArticleModel.js    # Article schema
│   │   ├── CategoryModel.js   # Category schema
│   │   └── MediaModel.js      # Media schema
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   ├── database/              # Database configuration
│   └── package.json           # Backend dependencies
│
├── LICENSE                     # MIT License
└── README.md                  # Project documentation
```

## 🔗 API Endpoints

### **Authentication**

- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/googleLogin` - Google OAuth login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh` - Refresh access token

### **Content Management**

- `GET /api/v1/users/articles` - Get public articles
- `GET /api/v1/users/articles/:id` - Get specific article
- `GET /api/v1/categories` - Get public categories
- `GET /api/v1/stats` - Get platform statistics

### **Writer Panel**

- `GET /api/v1/writer/dashboard` - Writer dashboard data
- `POST /api/v1/writer/articles` - Create new article
- `PUT /api/v1/writer/articles/:id` - Update article
- `GET /api/v1/writer/analytics` - Writer analytics
- `POST /api/v1/writer/media` - Upload media files

### **Admin Panel**

- `GET /api/v1/admin/overview` - Admin dashboard statistics
- `GET /api/v1/admin/users` - Manage users
- `GET /api/v1/admin/categories` - Manage categories
- `GET /api/v1/admin/analytics` - Platform analytics

## 🎯 Features In Detail

### **Article Management**

- **Rich Editor**: Full-featured markdown editor with live preview
- **Auto-save**: Automatic draft saving to prevent content loss
- **SEO Optimization**: Meta descriptions, featured images, and clean URLs
- **Reading Time**: Automatic calculation of estimated reading time
- **Social Sharing**: Built-in sharing capabilities

### **Media Management**

- **Cloud Storage**: Secure file uploads to Cloudinary
- **Image Optimization**: Automatic image compression and formatting
- **Drag & Drop**: Intuitive file upload interface
- **Media Library**: Organized file management with search and filtering
- **Usage Tracking**: Monitor media file usage across articles

### **Analytics Dashboard**

- **Real-time Metrics**: Live view counts and engagement data
- **Performance Insights**: Article performance over time
- **Audience Analytics**: Reader demographics and behavior
- **Content Statistics**: Most popular articles and categories
- **Growth Tracking**: User and content growth metrics

### **User Experience**

- **Responsive Design**: Optimized for all device sizes
- **Fast Loading**: Optimized performance with lazy loading
- **Accessibility**: WCAG compliant with keyboard navigation
- **Search Functionality**: Full-text search with filters
- **Notification System**: Toast notifications for user feedback

## 🔒 Security Features

- **JWT Authentication** with secure httpOnly cookies
- **Password Hashing** using bcrypt
- **Input Validation** and sanitization
- **CORS Configuration** for secure cross-origin requests
- **File Upload Security** with type validation
- **Rate Limiting** for API endpoints
- **Environment Variable Protection**

## 🎨 UI Components

Built with modern design principles using:

- **Radix UI** for accessible component primitives
- **Tailwind CSS** for consistent styling
- **Lucide Icons** for beautiful iconography
- **Custom Components** for specialized functionality
- **Responsive Layouts** for optimal viewing on all devices

## 📈 Performance Optimizations

- **Code Splitting** with React.lazy and Suspense
- **Image Optimization** through Cloudinary
- **Caching Strategies** for API responses
- **Database Indexing** for faster queries
- **Pagination** for large data sets
- **Lazy Loading** for images and components

## 🌐 Deployment

### **Frontend (Vercel)**

The React application is optimized for Vercel deployment with:

- Automatic builds from Git commits
- Environment variable configuration
- SPA routing configuration
- Performance monitoring

### **Backend (Vercel Functions)**

The Express.js API is deployed as Vercel serverless functions:

- Auto-scaling based on demand
- Global edge network deployment
- Environment variable management
- Database connection optimization

### **Database (MongoDB Atlas)**

- Cloud-hosted MongoDB instance
- Automatic backups and monitoring
- Global cluster distribution
- Security and compliance features

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**

- Follow ESLint configuration for code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sajid Mehmood Tariq**

- GitHub: [@sajidmehmoodtariq30](https://github.com/sajidmehmoodtariq30)
- Email: <sajidmehmoodtariq5@gmail.com>
- LinkedIn: [Your LinkedIn](https://www.linkedin.com/in/sajid-mehmood-tariq/)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://radix-ui.com/) - Component primitives
- [Cloudinary](https://cloudinary.com/) - Media management
- [Vercel](https://vercel.com/) - Deployment platform
- [Firebase](https://firebase.google.com/) - Authentication services

## 📊 Project Stats

- **Frontend**: React 19.1.0 with modern hooks and features
- **Backend**: Node.js with Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **UI Components**: 50+ custom components
- **API Endpoints**: 25+ RESTful endpoints
- **Authentication**: JWT + OAuth integration
- **File Storage**: Cloudinary integration
- **Deployment**: Vercel with CI/CD

---

<div align="center">

**[⬆ Back to Top](#-inkly---modern-blogging-platform)**

Made with ❤️ by [Sajid Mehmood Tariq](https://github.com/sajidmehmoodtariq30)

</div>
