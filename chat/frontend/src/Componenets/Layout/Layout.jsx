// Layout.js
import React from 'react';
import Navbar from '../navbar/navbar';
import SidebarComponenet from '../sidebar/sidebar';
import styled from 'styled-components';

const Layout = ({ children }) => {
  return (
    <Container>
      <Navbar />
      <Main>
        <SidebarComponenet />
        <Content>{children}</Content>
      </Main>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
  overflow: hidden; /* Prevent content overflow */
`;

const Main = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden; /* Prevent content overflow */
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  margin-top: 2%;
  overflow: hidden; /* Prevent content overflow */
`;

export default Layout;
