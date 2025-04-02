# EasyShift - Frontend

This repository contains the frontend implementation for **EasyShift**, a user-friendly scheduling management application developed using React, Redux Toolkit, and Bootstrap. The frontend interacts with the [EasyShift backend](https://github.com/PopovEva/EasyShift-backend-django) to provide an intuitive interface for managing employee shifts and schedules across multiple branches.

## 🚀 Tech Stack

- **React 18.3.1**
- **Redux Toolkit**
- **React Router DOM**
- **Axios**
- **Bootstrap 5.3.3**
- **React Bootstrap**
- **React Datepicker**
- **FontAwesome Icons**
- **React Toastify**
- **Custom WeekPicker** to ensure Sunday-based week selection

## 🖥 User Interface

The frontend includes:

- 🔐 Login using JWT and role-based redirection (Admin/Worker).
- 🗓 Weekly schedule viewing for workers.
- 📤 Shift preference submission (Employees can submit their shift preferences directly.).
- 📋 Admin can view submitted preferences and build new schedules accordingly.
- ✅ Schedule creation, assignment, and approval interface for admins.
- ✍️ In-place editable schedule cells with employee dropdown.
- 💬 Notifications for admins and employees.
- 🎉 Confetti-based "Well Done!" button for fun.
- 📱 Fully responsive design for mobile and desktop.

### 📌 Admin Panel
- Manage profile data
- CRUD operations for employees, rooms, branches
- Create, update, approve, and delete schedules
- Manage and view weekly schedules
- Notifications handling
- Admin view of all shift preferences submitted by workers.
- Create schedules based on employee preferences.


### 📅 Worker Panel
- View personal weekly schedule
- Submit shift preferences (planned feature)
- Manage personal profile data
- Shift Preferences Submission

## 📂 Project Structure
```
src/
├── api/
│   └── axios.js
├── assets/
├── components/
│   ├── Footer.jsx
│   ├── Navbar.jsx
│   ├── PrivateRoute.jsx
│   ├── WeekPicker.jsx
│   └── PraiseYourself.jsx
├── pages/
│   ├── AdminOptions/
│   │   ├── AdminProfileData.jsx
│   │   ├── AdminScheduleManagement.jsx
│   │   ├── BranchesList.jsx
│   │   ├── BranchCreateModal.jsx
│   │   ├── BranchEditModal.jsx
│   │   ├── CreateSchedule.jsx
│   │   ├── EmployeesList.jsx
│   │   ├── EmployeeCreateModal.jsx
│   │   ├── EmployeeEditModal.jsx
│   │   ├── RoomsList.jsx
│   │   ├── RoomCreateModal.jsx
│   │   ├── RoomEditModal.jsx
│   │   └── WeeklySchedule.jsx
│   ├── WeeklySchedule/
│   │   ├── WeeklySchedule.jsx
│   │   └── WeeklySchedule.css
│   └── WorkerOptions/
│       ├── AdminProfile.jsx
│       ├── Login.jsx
│       ├── SubmitShifts.jsx
│       ├── WeeklySchedule.jsx
│       ├── WorkerProfile.jsx
│       └── WorkerProfileData.jsx
├── slices/
│   ├── createScheduleSlice.js
│   ├── scheduleSlice.js
│   └── userSlice.js
├── App.jsx
├── App.css
├── index.js
└── store.js
```

## Mobile Optimization

- Admin and Worker panels include fixed offcanvas menu triggers.
- Calendar and tables adapt to small screens with horizontal scroll.
- Navigation buttons are styled for better touch accessibility.

## 🚧 Installation and Setup

### Clone Repository
```bash
git clone https://github.com/PopovEva/EasyShift-frontend-react.git
cd EasyShift-frontend-react
```

### Install Dependencies
```bash
npm install
```

### Run Application
```bash
npm start
```

Frontend application will run at [http://localhost:3000](http://localhost:3000).

## 🌐 API Integration

Configured to interact with the backend via Axios:
- Base URL: set in `src/api/axios.js`

## 📦 Dependencies
Check `package.json` for detailed information:
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^7.0.1",
  "redux": "^5.0.1",
  "@reduxjs/toolkit": "^2.5.0",
  "axios": "^1.7.8",
  "bootstrap": "^5.3.3",
  "react-bootstrap": "^2.10.9",
  "react-datepicker": "^8.1.0",
  "react-toastify": "^10.0.6",
  "@fortawesome/react-fontawesome": "^0.2.2"
}
```

<!-- ## 📸 Screenshots

Screenshots of the application's interface are available in the repository (`/screenshots` folder). -->

## 🚀 Future Features
- Employee shift preference submission- Done
<!-- - Enhanced AI-based schedule optimization -->

<!-- ## 📥 Contributing
Pull requests are encouraged. For major changes, please open an issue first to discuss your proposals. -->

---


### ⭐️ **EasyShift** - is committed to improving the efficiency of shift scheduling. Whether you're an administrator at your desk or an employee on the go, EasyShift is designed to support your scheduling needs.


For more insights into the backend setup and features, visit the [EasyShift Backend Repository](https://github.com/PopovEva/EasyShift-backend-django).
