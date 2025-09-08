/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Footer from './Components/Footer/Footer.jsx';
import Navbar from './Components/Navbar/Navbar';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop.jsx';
import MyAccount from './Pages/AccountPage/MyAccount.jsx';
import CartPage from './Pages/CartPage/CartPage.jsx';
import CollectionPage from './Pages/CollectionPage/CollectionPage.jsx';
import ContactUs from './Pages/ContactUs/ContactUs.jsx';
import HomePage from './Pages/HomePage/HomePage.jsx';
import LoginPage from './Pages/LoginPage/LoginPage.jsx';
import ProductPage from './Pages/ProductPage/ProductPage.jsx';
import WebEdit from './Pages/WebEdit/WebEdit.jsx';
import WishList from './Pages/WishList/WishList.jsx';
// import LoginSignup from './Pages/LoginSignupPage/LoginSignup.jsx';
import BusinessAccountCreationPage from './Pages/BusinessAccountCreationPage/BusinessAccountCreationPage.jsx';
import CreateCategoryForm from './Pages/CreateCategoryForm/CreateCategoryForm.jsx';
import LoadingComponent from './Pages/LoadingComponent/LoadingComponent.jsx';
import ProductListPage from './Pages/ProductListPage/ProductListPage.jsx';
import { useAuthStore } from './Store/useAuthStore.js';
import { useUserStore } from './Store/useAuthUserStore.js';
import { useDataStore } from './Store/useDataStore.js';

import { useAuth0 } from "@auth0/auth0-react";
import AddProductPage from './Pages/AddProductPage/AddProductPage.jsx';
import AboutUs from './Pages/AboutUs/AboutUs.jsx';
import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy.jsx';
// import {axiosInstance} from "./lib/axios.js"

function App() {
  const {setGender,gender} = useDataStore()
  const location = useLocation();
  const { login, authUser } = useAuthStore();
  const { getUserWishlist } = useUserStore();
  const { getAccessTokenSilently, getIdTokenClaims, user } = useAuth0();


  useEffect(() => {
    const silentlyLogin = async () => {
      try {
        await getAccessTokenSilently(); // tries silent login
        const token = await getIdTokenClaims();
        token?.__raw && await login({...user,token:token.__raw})
        // const res = await axiosInstance.post("/auth/login", {
        //     token: token.__raw,
        // });
        // console.log('token=', token.__raw);

      } catch (error) {
        console.log("Silent login failed =", error);
      }
    };
    silentlyLogin();
  }, [user]);

  // useEffect(() => {
  //   const handelLogin = async () => {
  //     await login(user);
  //     // console.log("loginWithBusinessAccount",localStorage.getItem("loginWithBusinessAccount"))
  //     // console.log("loginData",loginData);
  //   }
  //   user && handelLogin();
  // }, [user])

  useEffect(() => {
    if (authUser && authUser.role === "user") {
      getUserWishlist(authUser._id);
    }
  }, [authUser, getUserWishlist]);


  useEffect(() => {
    let gender = localStorage.getItem("WebGender");
    if (gender === "female") {
      // console.log("female");
    } else if (gender === "male") {
      // console.log("male");
    } else {
      gender = "male"; // default value
      setGender(gender);
      // console.log("gender setting", gender);
    }
  }, [gender]);

  // const {user} = useAuth0();
  // const navigate = useNavigate();


  return (
    <>

      <Navbar />
      <div className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection/:collectionId" element={<CollectionPage />} />
          <Route path="/search" element={<CollectionPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/myaccount/:route" element={<MyAccount />} />
          <Route path="/myaccount" element={<MyAccount />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/add-products" element={<AddProductPage />} />
          <Route path="/product-list" element={<ProductListPage />} />
          <Route path="/create-category" element={<CreateCategoryForm />} />


          {/* ////////// */}
          {/* <Route path="/login" element={<LoginSignup/>} />
          <Route path="/signup" element={<LoginSignup/>} /> */}
          {/* ///////// */}

          <Route path="/webedit" element={<WebEdit />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/aboutus/our-story" element={<AboutUs />} />
          <Route path="/business" element={<BusinessAccountCreationPage />} />

          {/* <Route path="*" element={
            <div className="not-found"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'full' }}>
              <h1>Page Not Found</h1>
            </div>
          } /> */}
        </Routes>

        <LoadingComponent isLoading={false} />
        <ScrollToTop />
      </div>
      {location.pathname !== "/" && <Footer />}
    </>
  )
}

export default App
