import React, { useEffect, useState } from 'react';
import './ContactUs.css';

import { Search, Send, ChevronDown, ChevronRight } from 'lucide-react';
import { useWebContactUsStore } from '../../Store/useWebStores/useWebContactUsStore';
import {useWebNavStore} from "../../Store/useWebStores/useWebNavStore"

const ContactUs = () => {
    const {setIsLoadingComponent} = useWebNavStore();
    const { getContactUsData } = useWebContactUsStore()
    const [helpData, setHelpData] = useState([]);
    const [activeMain, setActiveMain] = useState();
    const [openSub, setOpenSub] = useState({}); // key: subHeading title
    const [addressDetails, setAddressDetails] = useState({})
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingComponent(true);
            const res = await getContactUsData();
            // console.log("getContactUsData=",res);
            setHelpData(res.helpData || []);
            setActiveMain(res.helpData[0]?.mainHeading || []);
            setAddressDetails(res.addressDetails || {});
            setIsLoadingComponent(false);
        };
        fetchData();
    }, [getContactUsData,setIsLoadingComponent]);

    if(!helpData.length){
        return (<div></div>)
    }

    return (
        <div className="contact-us-main-container">
            <div className="contact-us-outer-box">
                <div className="contact-us-inner-box">
                    <div className="contact-us-header">
                        <div className="contact-us-left">
                            <h2 className="contact-us-title">
                                Contact Us <span className="contact-us-underline" />
                            </h2>
                            <p className="contact-us-subtitle">What’s your query about?</p>
                            <div className="contact-us-search-container">
                                <Search size={18} className="contact-us-search-icon" />
                                <input
                                    type="text"
                                    className="contact-us-search-input"
                                    placeholder="Search your Query here"
                                />
                            </div>
                        </div>
                        <div className="contact-us-right">
                            <Send className="contact-us-send-icon" size={120} strokeWidth={1.5} fill='yellow' color='#444' />
                        </div>
                    </div>

                    {/* //helping details// */}
                    <div className="contact-us-helping-details">
                        <div className="contact-us-sidebar">
                            {helpData && helpData.map((section) => (
                                <div
                                    key={section.mainHeading}
                                    className={`contact-us-main-heading ${activeMain === section.mainHeading ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveMain(section.mainHeading);
                                        setOpenSub({});
                                    }}
                                >
                                    {section.mainHeading}
                                </div>
                            ))}
                            
                        </div>

                        <div className="contact-us-content">
                            <h3 className="contact-us-content-title">{activeMain}</h3>
                            
                            {helpData && helpData
                                .find((section) => section.mainHeading === activeMain)
                                .subHeadings?.map((sub) => (
                                    <div key={sub.title} className="contact-us-subsection">
                                        <div
                                            className="contact-us-subtitle"
                                            onClick={() => setOpenSub((prev) => ({ ...prev, [sub.title]: !prev[sub.title] }))}
                                        >
                                            {sub.title}
                                            {openSub[sub.title] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </div>
                                        {openSub[sub.title] && (
                                            <ul className="contact-us-sub-details">
                                                {sub.details.map((detail, idx) => (
                                                    <li key={idx}>{detail}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* // Address Details // */}
                    {addressDetails && <div className="contact-us-address-details">
                        <h3 className="contact-us-address-heading">Corporate Address :</h3>
                        <div className="contact-us-address-underline" />
                        <p className="contact-us-address-line">{addressDetails?.companyName}</p>
                        <p className="contact-us-address-line">{addressDetails?.area+", "+addressDetails?.city}</p>
                        <p className="contact-us-address-line">{addressDetails?.landmark+", "+addressDetails?.street}</p>
                        <p className="contact-us-address-line">{addressDetails?.state+", "+addressDetails?.country+", "+addressDetails?.pinCode}</p>
                        
                        <div className="contact-us-contact-line-container">
                            {addressDetails?.contactLines?.map((item,index)=>(
                                <p className="contact-us-contact-line" key={index}>
                                    {item.startingLine}{' '}
                                    <span className="contact-us-highlight">{item.highlightLine}</span>
                                    {' '}{item.endingLine}
                                </p>
                            ))}
                        </div>
                    </div>}
                    


                </div>
            </div>
        </div>
    );
};

export default ContactUs;



