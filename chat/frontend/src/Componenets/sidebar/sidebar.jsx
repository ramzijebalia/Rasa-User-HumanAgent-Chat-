import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faInfoCircle, faSackXmark, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import '../../Pages/HChat/style.scss';

const SidebarComponenet = () => {
  return (
<SideBarArea>

      <SidebarMenu>
        <SidebarMenuItem>
          <Link to="/">
            <FontAwesomeIcon icon={faHome} /> Home
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link to="/Report">
            <FontAwesomeIcon icon={faInfoCircle} /> Report
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link to="/Settings">
            <FontAwesomeIcon icon={faSackXmark} /> Settings
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>

    </SideBarArea>
  );
};

const SideBarArea = styled.div ` 
  width: 10%;
  flex-shrink: 0;
  background-color: #131324;
  `;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
`;

const SidebarMenuItem = styled.li`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #4e0eff;
  &:last-child {
    border-bottom: none;
  }
  a {
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
    &:hover {
      color: #4e0eff;
    }
    svg {
      margin-right: 0.5rem;
    }
  }
`;

export default SidebarComponenet;
