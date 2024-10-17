import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ authUser, children }) => {
  // Check if the user is an admin
  if (authUser?.usertype !== "isAdmin") {
    // Redirect to the home page or any other page if the user is not an admin
    return <Navigate to="/" />;
  }

  // Render the children if the user is an admin
  return children;
};

export default AdminRoute;