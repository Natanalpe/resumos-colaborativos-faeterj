import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import { LoginRoute } from "./LoginRoute";
import { ProtectedRoute } from "./ProtectedRoutes";
import { AuthProvider } from "../context/AuthContext";
import ChangePassword from "../components/RenewPassword/ChangePassword";
import PasswordResetHandler from "../components/RenewPassword/PasswordResetHandler";
import Summary from "../pages/Summary/Summary";
import UsersDashboard from "../pages/configurations/Users/UsersDashboard";
import NewsDashboard from "../pages/configurations/News/NewsDashboard";
import SubjectsDashboard from "../pages/configurations/Subjects/SubjectsDashboard";
import SystemDashboard from "../pages/configurations/System/SystemDashboard";
import { MainLayout } from "../components/Layout/MainLayout";
import { Profile } from "../pages/Profile/Profile";
import { RegisterEmail } from "../pages/RegisterEmail/RegisterEmail";
import SetPassword from "../pages/SetPassword/SetPassword";
import ConfirmPasswordChange from "../pages/ConfirmPasswordChange/ConfirmPasswordChange";
import { Collection } from "../pages/Profile/Collection/Collection";
import { RecoverPassword } from "../pages/RecoverPassword/RecoverPassword";

export default function AppRoutes() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<LoginRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/recuperar-senha" element={<RecoverPassword />} />
                </Route>


                <Route path="/definir-senha" element={<SetPassword />} />
                <Route path="/confirmar-mudanca-senha" element={<ConfirmPasswordChange />} />

                <Route element={<MainLayout />}>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/summary" element={<Summary />} />

                        <Route path="/configurations">
                            <Route path="users" element={<UsersDashboard />} />
                            <Route path="news" element={<NewsDashboard />} />
                            <Route path="subjects" element={<SubjectsDashboard />} />
                            <Route path="system" element={<SystemDashboard />} />
                        </Route>

                        <Route path="/registeremail" element={<RegisterEmail />} />

                        <Route path="/primeiroacesso" element={
                            <PasswordResetHandler>
                                <ChangePassword />
                            </PasswordResetHandler>
                        } />

                        <Route path="/profile">
                            <Route path=":user_id" element={<Profile />} />
                            <Route path=":user_id/collection/:collection_id" element={<Collection />} />
                            <Route path=":user_id/saved" element={<Collection />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}