import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import AdminRoute from './components/AdminRoute'
import WriterRoute from './components/WriterRoute'
import AppLayout from './layout/AppLayout'
import WriterLayout from './layout/WriterLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AllBlogs from './pages/AllBlogs'
import Categories from './pages/Categories'
import CategoryDetail from './pages/CategoryDetail'
import Comments from './pages/Comments'
import AdminDashboard from './pages/AdminDashboard'
import WriterDashboard from './pages/WriterDashboard'
import WriterMain from './pages/WriterMain'
import WriterArticles from './pages/WriterArticles'
import WriterPublished from './pages/WriterPublished'
import WriterComments from './pages/WriterComments'
import WriterProfile from './pages/WriterProfile'
import ArticleEditor from './components/writer/ArticleEditor'
import DraftManagement from './components/writer/DraftManagement'
import WriterAnalytics from './components/writer/WriterAnalytics'
import WriterCategories from './components/writer/WriterCategories'
import WriterMediaLibrary from './components/writer/WriterMediaLibrary'
import WriterSchedule from './components/writer/WriterSchedule'


const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
          />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
          />          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="blogs" element={<AllBlogs />} />
            <Route path="categories" element={<Categories />} />
            <Route path="category/:slug" element={<CategoryDetail />} />
            <Route path="comments" element={<Comments />} />
          </Route>
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          {/* Writer Panel Routes - Protected for writers only */}
          <Route path="/writer" element={
            <WriterRoute>
              <WriterLayout />
            </WriterRoute>
          }>
            <Route index element={<WriterMain />} />
            <Route path="dashboard" element={<WriterDashboard />} />
            <Route path="articles" element={<WriterArticles />} />
            <Route path="write" element={<ArticleEditor />} />
            <Route path="edit/:id" element={<ArticleEditor />} />
            <Route path="drafts" element={<DraftManagement />} />
            <Route path="published" element={<WriterPublished />} />            <Route path="analytics" element={<WriterAnalytics />} />
            <Route path="comments" element={<WriterComments />} />            <Route path="categories" element={<WriterCategories />} />
            <Route path="media" element={<WriterMediaLibrary />} />            <Route path="profile" element={<WriterProfile />} />
            <Route path="schedule" element={<WriterSchedule />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="mt-20"
          style={{
            zIndex: 9999 // Higher than navbar's z-50
          }}
          toastClassName="relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer" />
      </BrowserRouter>
    </Provider>
  )
}

export default App