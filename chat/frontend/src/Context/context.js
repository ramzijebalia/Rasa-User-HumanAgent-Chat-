import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext(undefined); // Create the context

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    // Retrieve currentUser from local storage if it exists
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Save currentUser to local storage whenever it changes
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);
  

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

