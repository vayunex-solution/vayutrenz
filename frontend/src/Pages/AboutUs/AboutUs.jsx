import React, { useEffect, useState } from "react";
import "./AboutUs.css";
// import image1 from "../../assets/category-image.png"; // Replace with actual image path or use imported image
// import aboutBanner from '../../assets/about-us-banner-Image.png'
import { useWebContactUsStore } from "../../Store/useWebStores/useWebContactUsStore";


// const aboutUsContent = [
//     {
//         mainHeading: "Our Story",
//         subHeading: "Our story starts with the name Bewakoof®.",
//         image: image1,
//         details: `Society perceives Bewakoof as stupid. But what does society call Bewakoof? Often, it’s anything different or anything that’s done differently.
// Often when people have done the right thing, without caring about what society thinks, they have been called Bewakoof. These are the people who have changed the world and made it a better place.`,
//     },
//     {
//         mainHeading: "Our Story",
//         subHeading: "Our story starts with the name Bewakoof®.",
//         image: image1,
//         details: `Society perceives Bewakoof as stupid. But what does society call Bewakoof? Often, it’s anything different or anything that’s done differently.
// Often when people have done the right thing, without caring about what society thinks, they have been called Bewakoof. These are the people who have changed the world and made it a better place.`,
//     },
// ];
// const aboutUsMiddleData = [
//     {
//         mainHeading: "Who We Are",
//         bannerImage: aboutBanner, // make sure aboutBanner is imported
//         subHeading: "Empowering Everyday Fashion",
//         details:
//             "We are a modern fashion and lifestyle brand focused on bringing value and accessibility to the forefront. With over 1 crore+ products sold, 250+ team members, and millions of loyal customers, we’re proud of our journey and even more excited about what’s to come.",
//     },
// ];
// const footerHighlights = [
//     {
//         title: "Innovative Design",
//         description: "Creating designs that are an extension of you.",
//     },
//     {
//         title: "Direct to Consumer Model",
//         description: "Bringing accessibility and value to everyday fashion.",
//     },
//     {
//         title: "Homegrown",
//         description: "Imagined in India, Made in India.",
//     },
// ];

export default function AboutUs() {
    const {getAboutUsData} = useWebContactUsStore()
    const [aboutUsData, setAboutUsData] = useState(null);

    useEffect(() => {
        const getData=async()=>{
            const res = await getAboutUsData();
            setAboutUsData(res);
        }
        
        getData();
    }, [getAboutUsData])
    
    if(!aboutUsData){
        return (<div>No Data</div>)
    }

    if(aboutUsData){
        console.log("aboutUsData",aboutUsData);
    }

    return (
        <div className="about-us-outer-div">
            <div className="about-us-inner-div">
                {/* Top Heading */}
                {aboutUsData?.aboutUsContent && (
                    <div className="about-us-container">
                        {aboutUsData?.aboutUsContent.map((section, index) => (
                            <div key={index} className="about-us-section">
                                <h1 className="about-us-main-heading">{section.mainHeading}</h1>
                                <div className="about-us-bottom">
                                    <div className="about-us-left">
                                        <img src={section.image} alt="About us" />
                                    </div>
                                    <div className="about-us-right">
                                        <h2 className="about-us-sub-heading">{section.subHeading}</h2>
                                        <p className="about-us-paragraph">
                                            {section.details.split("\n").map((line, i) => (
                                                <span key={i}>
                                                    {line}
                                                    <br />
                                                    <br />
                                                </span>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                {aboutUsData?.aboutUsMiddleData && (
                    <div className="about-us-middle-container">
                        <h2 className="about-us-main-heading">{aboutUsData?.aboutUsMiddleData?.mainHeading}</h2>
                        <img src={aboutUsData?.aboutUsMiddleData?.bannerImage} alt="About Us Banner" className="about-banner" />
                        <h3 className="about-us-sub-heading">{aboutUsData?.aboutUsMiddleData?.subHeading}</h3>
                        <p className="about-us-paragraph">{aboutUsData?.aboutUsMiddleData?.details}</p>
                    </div>
                )}

                {aboutUsData?.footerHighlights &&
                    <div className="about-footer">
                        {/* Footer Top Section */}
                        <div className="about-footer-top-item">
                            <h2 className="main-heading">{aboutUsData?.footerHighlights?.footerHeading}</h2>
                        </div>

                        {/* Footer Bottom Section */}
                        <div className="about-footer-bottom">
                            {aboutUsData?.footerHighlights?.details?.map((item, index) => (
                                <div className="footer-section" key={index}>
                                    <h3 className="sub-heading">{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                }

            </div>
        </div>
    );
}
