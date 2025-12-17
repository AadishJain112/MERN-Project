import { Route, Routes } from 'react-router-dom';
import './App.css';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';
import ManageUsers from './pages/admin/ManageUsers';
import ManageClassrooms from './pages/admin/ManageClassrooms';
import StudentDashboard from './pages/student/StudentDashboard';
import MyActivities from './pages/student/MyActivities';
import Profile from './pages/student/Profile';
import UploadActivity from './pages/student/UploadActivity';
import StudentClassrooms from './pages/student/StudentClassrooms';
import StudentClassroomView from './pages/student/StudentClassroomView';
import StudentAssignmentView from './pages/student/StudentAssignmentView';
import PendingActivities from './pages/teacher/PendingActivities';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ClassroomView from './pages/teacher/ClassroomView';
import AssignmentView from './pages/teacher/AssignmentView';
import StudentProfileView from './pages/teacher/StudentProfileView';

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute roles={['student']} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/classrooms" element={<StudentClassrooms />} />
        <Route path="/student/upload" element={<UploadActivity />} />
        <Route path="/student/activities" element={<MyActivities />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/classroom/:classroomId" element={<StudentClassroomView />} />
        <Route path="/student/assignment/:assignmentId" element={<StudentAssignmentView />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={['teacher']} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/pending" element={<PendingActivities />} />
        <Route path="/teacher/classroom/:classroomId" element={<ClassroomView />} />
        <Route path="/teacher/assignment/:assignmentId" element={<AssignmentView />} />
        <Route path="/teacher/student/:studentId" element={<StudentProfileView />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/classrooms" element={<ManageClassrooms />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
