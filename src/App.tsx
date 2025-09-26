import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BoardPage } from './pages/BoardPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { Navigation } from './components/Navigation';
import { ToastContainer } from 'react-toastify';

export const App = () => {
	return (
		<Router>
			<Navigation />
			<Routes>
				<Route path="/board" element={<BoardPage />} />
				<Route path="/issue/:id" element={<IssueDetailPage />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="*" element={<Navigate to="/board" />} />
			</Routes>
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				pauseOnHover
			/>
		</Router>
	);
};
