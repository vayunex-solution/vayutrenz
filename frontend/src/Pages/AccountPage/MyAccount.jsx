// MyAccount.jsx
import MyWallet from './Componenets/MyWallet/MyWallet';
import MyProfile from './Componenets/MyProfile/MyProfile';
import './MyAccount.css';
import {
    LogOut, User, CreditCard, Wallet, MapPin, HelpCircle, Shirt, BookOpen, Users,
    User2, Plus, Pencil,
    List,
    Bold
} from 'lucide-react';
import alternativeProfileImg from "../../assets/alternative-profile-image.png"
import { useAuth0 } from "@auth0/auth0-react";
import MyAddresses from './Componenets/MyAddresses/MyAddresses';
import MyOrders from './Componenets/MyOrders/MyOrders';
import { useLocation,useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BusinessAccountCreationPage from '../BusinessAccountCreationPage/BusinessAccountCreationPage';

import { useWebNavStore } from '../../Store/useWebStores/useWebNavStore';
import { useAuthStore } from '../../Store/useAuthStore';

const MyAccount = () => {
    const {setIsLoadingComponent} = useWebNavStore();
    const {authUser,login} = useAuthStore();
    const navigate = useNavigate();
    const {pathname} = useLocation();
    // console.log( pathname)

    const {user,logout} = useAuth0();
    const firstLetter = user?.name?.charAt(0).toUpperCase();
    const userData = {
        phone: "7206273890",
    };
    // const [sidebarActiveItem, setSidebarActiveItem] = useState('Overview')
    

    useEffect(() => {
        const handelLogin = async ()=>{
            setIsLoadingComponent(true);
            await login(user);
            setIsLoadingComponent(false)
        }
        !user && setIsLoadingComponent(true);
        user && !authUser && handelLogin()
    }, [user, authUser, setIsLoadingComponent, login]);
    

    const sidebarUserItems=[
        {icon:<User2 />,title: "Overview",route:"/myaccount"},
        {icon:<Shirt />,title: "My Orders",route:"/myaccount/orders"},
        {icon:<CreditCard />,title: "My Payments",route:"/myaccount/payment"},
        {icon:<Wallet />,title: "My Wallet",route:"/myaccount/wallet"},
        {icon:<MapPin />,title: "My Addresses",route:"/myaccount/address"},
        {icon:<User />,title: "My Profile",route:"/myaccount/profile",},
    ]
    const userBoxes = [
        { icon: <Shirt />, route:"/myaccount/orders", title: "My Orders", desc: "View, Modify And Track Orders",},
        { icon: <CreditCard />, route:"/myaccount/payments", title: "My Payments", desc: "View And Modify Payment Methods",},
        { icon: <Wallet />, route:"/myaccount/wallet", title: "My Wallet", desc: "My Wallet History And Redeemed Gift Cards",},
        { icon: <MapPin />, route:"/myaccount/address", title: "My Addresses", desc: "Edit, Add Or Remove Addresses",},
        { icon: <User />, route:"/myaccount/profile", title: "My Profile", desc: "Edit Personal Info And Change Password",},
        { icon: <HelpCircle />, route:"/contactus", title: "Help & Support", desc: "Reach Out To Us",},
        { icon: <BookOpen />, route:"/aboutus/our-story", title: "Our Story", desc: "Our Story",},
        // { icon: <Users />, route:"/", title: "Fanbook", desc: "Fan Images",},
    ];

    const [boxes, setBoxes] = useState(userBoxes)
    const [sidebarItems, setSidebarItems] = useState(sidebarUserItems);
    
    const sellerBoxes = [
        {icon: <Plus />, route: "/add-products",title: "Add Products",desc: "Add or edit your product listings",},
        {icon: <List />,route: "/product-list",title: "Product List",desc: "View and manage all listed products",},
        // {icon: <Pencil />, route: "/edit-product",title: "Edit Product",desc: "Update Product data",},
        {icon: <Bold /> , route: "/myaccount/mybusiness",title: "My Business",desc: "View or Edit Business Details",},
    ];
    const ownerBoxes = [
        {icon: <Users />, route: "/webedit",title: "Add/Edit Users",desc: "Manage users and their roles",},
        {icon: <Pencil />, route: "/webedit",title: "Edit Data",desc: "Update website data",},
    ];
    

    useEffect(() => {
        if(authUser){
            if(authUser.role==="seller"){
                setSidebarItems([...sidebarUserItems,...sellerBoxes])
                setBoxes([...userBoxes,...sellerBoxes]);
            }
            else if(authUser.role==="owner" || authUser.role==="co-owner"){
                setSidebarItems([...sidebarUserItems,...ownerBoxes])
                setBoxes([...userBoxes,...ownerBoxes]);
            }
        }else{
            setSidebarItems(sidebarUserItems);
            setBoxes(userBoxes);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);
    

    const Overview = ()=>{
        return (
            <>
                <div className="account-header">
                    <div className='account-avatar-info'>
                        <div className="user-avatar">
                            {user?.picture ? (
                                <img src={user?.picture || alternativeProfileImg} loading="lazy" decoding="async" alt="User" />
                            ) : (
                                <div className="fallback-avatar">{firstLetter}</div>
                            )}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.name || "-----"}</div>
                            <div className="user-email">{user?.email || "-----@---.com"}</div>
                            <div className="user-phone">{userData.phone}</div>
                        </div>
                    </div>
                    <button className="edit-profile" onClick={()=>logout()}>LogOut</button>
                </div>

                <div className="account-grid">
                    {boxes.map((box, i) => (
                        <div className="account-box" key={i} onClick={()=>navigate(box.route)}>
                            <div className="account-box-icon">{box.icon}</div>
                            <div className="account-box-title">{box.title}</div>
                            <div className="account-box-desc">{box.desc}</div>
                        </div>
                    ))}
                </div>
            </>
        )
    }

    const ComponentToRender=()=>{
        if (typeof pathname === 'string'&& pathname.endsWith("/profile")) {
            return <MyProfile />
        }else if ((authUser && authUser.role==='seller') && typeof pathname === 'string'&& pathname.endsWith("/mybusiness")) {
            return <BusinessAccountCreationPage/>
        } else if (typeof pathname === 'string'&& pathname.endsWith("/wallet")) {
            return <MyWallet />;
        } else if (typeof pathname === 'string'&& pathname.endsWith("/address")) {
            return <MyAddresses />;
        } else if (typeof pathname === 'string'&& pathname.endsWith("/orders")) {
            return <MyOrders />;
        } else if (typeof pathname === 'string'&& pathname === "/myaccount") {
            return Overview();
        } else {
            return <div>404 Not Found</div>
        }
    }

    return (
        <div className="account-container">
            <div className="account-container-sidebar">
                {sidebarItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={()=>{navigate(item.route)}}
                        className={`menu-item ${item.route===pathname?"active":""}`}>
                            {item.icon}{item.title}
                    </div>
                ))}
                <div className="menu-item logout" onClick={()=>logout()}><LogOut/> Logout</div>
            </div>

            <div className="account-main">
                {ComponentToRender()}
            </div>
        </div>
    )
};

export default MyAccount;
