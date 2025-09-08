import React from 'react';
import './WelcomeHeader.css';
import {useWebNavStore } from "../../Store/useWebStores/useWebNavStore.js"


const WelcomeHeader = ({headerImage,headerText}) => {
    const {navBarData} = useWebNavStore();
    // console.log('navBarData',navBarData);

    const homeBackground = './home-background.png'; // adjust path as needed
    
    return (
        <header
            className="welcome-header"
            style={{ backgroundImage: `url(${headerImage?headerImage:homeBackground})` }}
        >
            <div className="overlay-text">
                <div className="text-box">
                    <h1>{`Welcome to ${navBarData?.applicationName?navBarData?.applicationName:"Our Store"}`}</h1>
                    <p>{headerText?headerText:"Where style meets the latest trends—just"}</p>
                </div>
            </div>
        </header>
    );
};

export default WelcomeHeader;
