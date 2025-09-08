import React, { useEffect } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import { useCategoryStore } from "../../Store/useWebStores/useCategoryStore";
import { useWebNavStore } from "../../Store/useWebStores/useWebNavStore";

const Footer = () => {
    const {socialMediaLinks,getSocialMediaLinks} = useWebNavStore();
    const {categoryMap,fetchCategories} = useCategoryStore();
    
    
    useEffect(() => {
    !categoryMap?.length && fetchCategories();
    !socialMediaLinks.length && getSocialMediaLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    
    const footerData = {
        customerService: [{name:"Contact Us",link:"/contactus"}, {name:"Track Order",link:"/myaccount/orders"}, {name:"More Details",link:"/contactus"}],
        company: [{name:"About Us",link:"/aboutus/our-story"}, {name:"Terms & Conditions",link:"/privacy-policy"}, {name:"Privacy Policy",link:"/privacy-policy"}],
        socialMedia: [
            { name: "Facebook", link: `https://facebook.com/${socialMediaLinks?.facebook}` },
            { name: "Instagram", link: `https://www.instagram.com/${socialMediaLinks?.instagram}` },
            { name: "Twitter", link: `https://twitter.com/${socialMediaLinks?.twitter}` },
            { name: "Snapchat", link: `https://www.snapchat.com/${socialMediaLinks?.snapchat}` },
            { name: "Youtube", link: `https://www.youtube.com/${socialMediaLinks?.youtube}` },
        ],
    };

    return (
        <footer className="footer-container">
            {/* Upper Part */}
            <div className="footer-top">
                <div className="footer-block">
                    <h4>Customer Service</h4>
                    {footerData.customerService.map((item, index) => (
                        <Link key={index} to={item.link}>{item.name}</Link>
                    ))}
                    {/* <p>📦 15 Days Return Policy*</p>
                    <p>💰 Cash On Delivery*</p> */}
                </div>
                <div className="footer-block">
                    <h4>Company</h4>
                    {footerData.company.map((item, index) => (
                        <Link key={index} to={item.link}>{item.name}</Link>
                    ))}
                    {/* <h4>Download the App</h4>
                    <div className="app-buttons">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
                        <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" />
                    </div> */}
                </div>
                <div className="footer-block">
                    <h4>Connect With Us</h4>
                    {footerData.socialMedia.map((social, index) => (
                        <a key={index} href={social.link} target="_blank" rel="noreferrer">
                            {social.name}
                        </a>
                    ))}
                </div>
                <div className="footer-block">
                    <h4>Keep Up To Date</h4>
                    <div className="subscribe-box">
                        <input type="text" placeholder="Enter Email Id:" />
                        <button>SUBSCRIBE</button>
                    </div>
                    
                    <h4>100% Secure Payment</h4>
                    <div className="payment-icons">
                        <img src="https://img.icons8.com/color/48/000000/google-pay-india.png" alt="GPay" />
                        <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" />
                        <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="MasterCard" />
                    </div>
                </div>
            </div>

            <hr />

            {/* Lower Part */}
            <div className="footer-bottom">
                {Object.entries(categoryMap).map(([title, value]) => (
                    <div key={title} className="footer-section">
                        <h4>{title.toLowerCase()==='unisex'?"Men-Women Cloths":`${title[0].toUpperCase()+title.slice(1)} Cloths`}</h4>
                        {value.map((item) => (
                            <Link key={item._id} to={"/collection/"+item.categoryName+"--"+item._id}>{item.categoryName}</Link>
                        ))}
                    </div>
                ))}
            </div>
        </footer>
    );
};

export default Footer;
