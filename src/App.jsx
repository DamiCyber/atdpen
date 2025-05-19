import { Routes, Route } from 'react-router-dom';
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Loader from './components/Loader'
import Register from './components/Register'
import Teachers from './components/Teachers'
import Student from './components/Student'
import Setting from './components/Setting'
import AddTeachers from './components/AddTeachers'
import AddStudents from './components/AddStudents'
import AssignTeacher from './components/AssignTeacher'
import ListofClass from "./components/ListofClass"
import ViewAttendance from './components/ViewAttendance'
import ParentDash from './components/ParentDash'
import TeachersDashboard from './components/TeachersDashboard'
import ViewAllAttendance from './components/ViewAllAttendance'
import Mark from './components/Mark'
import AssignStudent from './components/AssignStudent'
import NoStudent from './components/NoStudent'
import SchoolViewAllAttendance from './components/SchoolViewAllAttendance'
import ListOfParents from './components/ListOfParents'
import CreateClass from './components/CreateClass'
import TeachersProfileDetails from './components/TeachersProfileDetails'
import AddSubject from './components/AddSubject'
import AssignSubjectToClass from './components/AssignSubjectToClass'
import SubjectList from './components/SubjectList'
import SchoolEdit from './components/SchoolEdit'
import InvitationPage from './components/InvitationPage'
import ParentView from './components/ParentView'
import ResultUpload from './components/ResultUpload'
import PictureUploadForTeacher from './components/PictureUploadForTeacher'
import UploadStudentpic from './components/UploadStudentpic'
import StudentProfile from './components/StudentProfile'
import Admission from './components/Admission'
import AssignSubjectToTeacher from './components/AssignSubjectToTeacher'
import AssignSubjectToStudent from './components/AssignSubjectToStudent'
import ViewResult from './components/ViewResult'
import TeacherProfileEdit from './components/TeacherProfileEdit'
import ParentProfileEdit from './components/ParentProfileEdit'
import ParentProfileDetails from './components/parentProfileDetails'
import SchoolDetails from './components/SchoolDetails'
import SchoolProfile from './components/SchoolProfile'
import TeacherstudentDetails from './components/TeacherstudentDetails'
import ParentChild from './components/ParentChild'
import ParentStudentDetails from './components/ParentStudentDetails'
import TeacherDetails from './components/TeacherDetails'
import TeacherScanner from './components/TeacherScanner';

const App = () => {
  return (
    <>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<Loader />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Teachers/Dashboard" element={<TeachersDashboard />} />
        <Route path="/ParentDashboard" element={<ParentDash />} />

        {/* Teacher Management Routes */}
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/teachers/:teacherId" element={<TeacherDetails />} />
        <Route path="/teachers/add" element={<AddTeachers />} />
        <Route path="/teachers/assign" element={<AssignTeacher />} />
        <Route path="/teachers/profile/edit" element={<TeacherProfileEdit />} />
        <Route path="/teachers/profile/details" element={<TeachersProfileDetails />} />
        <Route path="/teachers/upload-picture" element={<PictureUploadForTeacher />} /> 
        <Route path="/teachers/scan" element={<TeacherScanner />} />
        <Route path="/teachers/students/:studentId" element={<TeacherstudentDetails />} />
             
        {/* Student Management Routes */}
        <Route path="/students" element={<Student />} />
        <Route path="/students/add" element={<AddStudents />} />
        <Route path="/students/assign" element={<AssignStudent />} />
        <Route path="/students/no-student/:classId" element={<NoStudent />} />
        <Route path="/students/profile/:studentId" element={<StudentProfile />} />
        <Route path="/students/admission/:inviteId" element={<Admission />} />
        <Route path="/students/upload-picture/:studentId" element={<UploadStudentpic />} />

        {/* Class Management Routes */}
        <Route path="/classroom/create" element={<CreateClass />} />
        <Route path="/classroom/list" element={<ListofClass />} />

        {/* Subject Management Routes */}
        <Route path="/subjects/create" element={<AddSubject />} />
        <Route path="/subjects/list" element={<SubjectList />} />
        <Route path="/subjects/assign-to-class" element={<AssignSubjectToClass />} />
        <Route path="/subjects/assign-to-teacher" element={<AssignSubjectToTeacher />} />
        <Route path="/subjects/assign-to-student" element={<AssignSubjectToStudent />} />

        {/* Attendance Routes */}
        <Route path="/attendance/view" element={<ViewAttendance />} />
        <Route path="/attendance/mark" element={<Mark />} />
        <Route path="/attendance/view-all/:schoolId" element={<ViewAllAttendance />} />
        <Route path="/attendance/details" element={<SchoolViewAllAttendance />} />

        {/* Parent Routes */}
        <Route path="/parents/list" element={<ListOfParents />} />
        <Route path="/parents/view/:studentId" element={<ParentView />} />
        <Route path="/parents/profile/edit" element={<ParentProfileEdit />} />
        <Route path="/parents/profile/details" element={<ParentProfileDetails />} />
        <Route path="/parents/children" element={<ParentChild />} />
        <Route path="/parents/students/:studentId" element={<ParentStudentDetails />} />

        {/* School Management Routes */}
        <Route path="/school/edit" element={<SchoolEdit />} />
        <Route path="/school/invitation" element={<InvitationPage />} />
        <Route path="/school/details" element={<SchoolDetails />} />
        <Route path="/school/profile" element={<SchoolProfile />} />

        {/* Result Management Routes */}
        <Route path="/results/upload" element={<ResultUpload />} />
        <Route path="/results/view" element={<ViewResult />} />

        {/* Settings Route */}
        <Route path="/settings" element={<Setting />} />
      </Routes>
    </>
  )
}

export default App
