import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Logout from '../Logout/Logout.jsx'
import '../../Pages/HChat/style.scss';

function Navbar() {
  const [currentUser, setCurrentUser] = useState(undefined);
  const navigate = useNavigate();

  const doSomething = async () => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate('/login');
    } else {
      setCurrentUser(
        await JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY))
      );
    }
  };

  useEffect(() => {
    doSomething();
  }, []);

  return (
    <NavbarContainer>
      <Logo>
        <h1>DashBoard</h1>
      </Logo>

      <SearchBar>
        <input type="text" placeholder="Search..." />
      </SearchBar>

      <UserSettings>
        <div className="dark-light">
          <svg
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </div>

        <div className="settings">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx={12} cy={12} r={3} />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <CurrentUser>{currentUser && currentUser.email}</CurrentUser>
        <Logout />
      </UserSettings>
    </NavbarContainer>
  );
}

const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #131324;
  height: 60px;
  width: 100%;

`;

const Logo = styled.div`
  h1 {
    color: white;
    text-transform: uppercase;
    margin: 0;
  }
`;

const SearchBar = styled.div`
  input {
    background-color: transparent;
    padding: 0.5rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    font-size: 1rem;
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }
`;

const UserSettings = styled.div`
  display: flex;
  align-items: center;

  div {
    margin-right: 1rem;
  }

  .dark-light {
    svg {
      width: 24px;
      height: 24px;
      stroke: white;
    }
  }

  .settings {
    svg {
      width: 24px;
      height: 24px;
      stroke: white;
    }
  }
`;

const CurrentUser = styled.div`
  color: white;
`;

export default Navbar;
