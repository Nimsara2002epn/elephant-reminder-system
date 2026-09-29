# 🐘 Elephant – Web-based Bill and Event Reminder System

> **SLIIT SE2030 – Software Engineering Project (Year 2 Semester 1)**  
> **Group:** `2026-Y2-S1-MLB-B11G2-03`

---

## 👥 Team Member Task & File Allocation

| Member Name | Registration No | Subsystem / Role | Key Backend & Frontend Files |
| :--- | :--- | :--- | :--- |
| **Wickramasinghe E.P.N** *(Lead)* | `IT25100067` | **Auth Infrastructure + Bills Management** | `User*`, `Bill*`, `BillsPage.jsx`, `AuthContext.jsx`, `Jwt*` |
| **Epa C.D.W** | `IT25101441` | **Event Lifecycle & Scheduling** | `Event*`, `EventsPage.jsx`, `CalendarView.jsx` |
| **Abilash M** | `IT25102234` | **Smart Reminders & Notifications** | `Reminder*`, `Notification*`, `RemindersPage.jsx`, `TopBar.jsx` |
| **Sathsaranie R.M.N.K** | `IT25102625` | **Reports & Analytics + User Feedback** | `Report*`, `UserFeedback*`, `ReportsPage.jsx`, `FeedbackPage.jsx` |
| **Dissanayake D.M.M.S** | `IT25103194` | **Shared Activity & Collaboration** | `SharedGroup*`, `GroupMember*`, `GroupBill*`, `GroupsPage.jsx` |
| **Diyunuge S.M.L** | `IT25100524` | **Platform Security & Reliability** | `Backup*`, `SecurityLog*`, `SecurityPage.jsx` |

---

## 🚀 Quick Setup Instructions

### 1. Database Setup (MySQL)
1. Open MySQL Workbench / Command Line.
2. Run the script located in `database/elephant_db_schema.sql`:
   ```bash
   mysql -u root -p < database/elephant_db_schema.sql
   ```
3. Update `src/main/resources/application.properties` with your local MySQL password if different:
   ```properties
   spring.datasource.password=YOUR_PASSWORD
   ```

### 2. Backend Setup (Spring Boot)
```bash
# Navigate to project root
./mvnw clean spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 3. Frontend Setup (React + Vite)
```bash
# Navigate to frontend folder
cd elephant-frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🌿 Git Branching Workflow

Each member creates their own feature branch before coding:
```bash
# 1. Pull latest changes
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/<your-it-number>-<module-name>

# 3. Commit your changes
git add .
git commit -m "Add: Implemented <feature-name>"

# 4. Push to GitHub
git push -u origin feature/<your-it-number>-<module-name>

# 5. Create a Pull Request (PR) on GitHub to merge into main.
```
