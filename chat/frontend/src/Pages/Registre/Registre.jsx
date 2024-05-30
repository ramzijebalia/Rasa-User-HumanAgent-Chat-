import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute , checkUniqueFields } from "../../utils/APIRoutes";

export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyPrefix: ""
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  // function to validate the unicity of the username , email companyName and teh compnayPrefix
  const handleValidation = () => {
    const { firstName, lastName, username, email, companyPrefix, companyName } = values;
    if (firstName.trim() === "" || lastName.trim() === "") {
      toast.error("Please provide your full name.", toastOptions);
      return false;
    } else if (username.length < 3) {
      toast.error("Username should be greater than 3 characters.", toastOptions);
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    } else if (companyName.trim() === "" || companyPrefix.trim() === "") {
      toast.error("Please provide your company details.", toastOptions);
      return false;
    } /*else if (companyPrefix.trim().length !== 4) {
      toast.error("Company Prefix should be exactly 4 characters long.", toastOptions);
      return false;
    } */
    return true;
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const { firstName, lastName, username, email, companyName, companyPrefix } = values;
  
    // Check validation
    if (!handleValidation()) {
      return; // Validation failed, don't proceed
    }
    try {
      // Check unique fields
      const { data } = await axios.post(checkUniqueFields, { username, email, companyPrefix });
      if (data.status === false) {
        if (data.field === "username") {
          toast.error("Username already exists.", toastOptions);
        } else if (data.field === "email") {
          toast.error("Email already exists.", toastOptions);
        } else if (data.field === "companyPrefix") {
          toast.error("Company Prefix already exists.", toastOptions);
        }
        return; // Don't proceed with registration
      }
  
      // Proceed with registration if all checks pass
      const registerData = {
        firstName,
        lastName,
        username,
        email,
        companyName,
        companyPrefix
      };
      const registerResponse = await axios.post(registerRoute, registerData);
  
      if (registerResponse.data.status === false) {
        toast.error(registerResponse.data.msg, toastOptions);
        return; // Don't proceed if registration failed
      }
  
      // Registration successful
      localStorage.setItem(
        process.env.REACT_APP_LOCALHOST_KEY,
        JSON.stringify(registerResponse.data.user)
      );
      navigate("/");
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Error during registration. Please try again later.", toastOptions);
    }
  };
  

  return (
    <>
      <FormContainer>
        <form onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <h1>Register</h1>
          </div>
          <div className="row">
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              onChange={(e) => handleChange(e)}
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className="row">
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={(e) => handleChange(e)}
            />
            <input
              type="text"
              placeholder="Username"
              name="username"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className="row">
            <input
              type="text"
              placeholder="Company Name"
              name="companyName"
              onChange={(e) => handleChange(e)}
            />
            <input
              type="text"
              placeholder="Company Prefix"
              name="companyPrefix"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <button type="submit">Create User</button>
          <span>
            Already have an account ? <Link to="/login">Login.</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 5rem;
    }
    h1 {
      color: white;
      text-transform: uppercase;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 3rem 5rem;
  }
  input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    width: 100%;
    font-size: 1rem;
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }
  .row {
    display: flex;
    gap: 1rem;
  }
  button {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
  span {
    color: white;
    text-transform: uppercase;
    a {
      color: #4e0eff;
      text-decoration: none;
      font-weight: bold;
    }
  }
`;
