import React, { useEffect, useState } from "react";
import "./PrivacyPolicy.css";
import { useWebContactUsStore } from "../../Store/useWebStores/useWebContactUsStore";
import {useWebNavStore} from "../../Store/useWebStores/useWebNavStore"
// const privacyPolicyData = [
//     {
//         subHeading: "COLLECTION OF PERSONAL INFORMATION",
//         paragraphs: [
//             "We collect personal information from you when you provide it to us. For example, if you purchase a product from us or register yourself on our website, we may collect your name, gender, mailing address, telephone number and email address. If you sign up to receive a newsletter, we will collect your email address. If you take advantage of special services offered by us, we may collect other personal information about you.",
//             "We use your personal information for internal purposes such as processing, keeping you informed of your order and in relation to providing services and ancillary services. We reserve the right to collect general demographic and other anonymous information that does not personally identify you. This information is not associated with your personally identifiable information and cannot be linked to you personally. The information we collect also includes your shipping address, and billing address.",
//             "You represent that the personal information you provide from time to time is correct and updated and you have all the rights, permissions and consents to provide the same.",
//         ],
//     },
//     {
//         subHeading: "USE AND PROCESSING OF PERSONAL INFORMATION",
//         paragraphs: [
//             "The personal information collected by us may be used for a number of purposes connected with our business operations which may include the following:"
//         ],
//         points: [
//             "to deal with requests, enquiries and complaints, customer service and related activities;",
//             "to respond to your queries and fulfil your requests for information regarding our products and services;",
//             "to customize our offerings for you;",
//             "to analyse user trends and help improve our offerings;",
//             "to notify you about our new products or services and for sending you important information regarding our products or services;",
//             "for legitimate business purposes;",
//             "to respond to judicial process and for providing information to law enforcement agencies as permitted by law; and",
//             "for any other purpose in connection with our business operations"
//         ]
//     },
//     {
//         paragraphs: [
//             "Bewakoof Brands Private Limited (**\"we/us/our\"**) respect the privacy of our customers and users of our website (**\"you\"**). Our practices and procedures in relation to the collection and use of your data/ information have been set out below in this privacy policy. This privacy policy will familiarize you with the manner in which we may collect, use, share, transfer and disclose your data/ information.",
//             "We collect only the information necessary for our business purposes such as to provide you with services, complete your order, to contact you regarding the status of your order or in relation to relevant marketing or other ancillary services provided by us or deemed relevant by us in relation to the services.",
//             "For the purpose of this privacy policy, sensitive personal data or information of a person (**\"SPDI\"**) is as defined under the Information Technology Act 2000 (**\"IT Act\"**) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Information) Rules 2011 (**\"SPDI Rules\"**). Please note that usage of the term Personal Information in this Privacy Policy includes Sensitive Personal Data or Information, wherever appropriate and/or mandated under the IT Act and the SPDI Rules.",
//         ],
//         points: [
//             "We do not store your credit card information.",
//             "We will not rent or sell your name or personal information.",
//             "We utilize \"cookies\" to help recognize you as a repeat visitor and to track traffic patterns on our site. This information is completely anonymous. We use this information only to improve the user-friendliness and functionality of our website."
//         ]
//     }
// ];

export default function PrivacyPolicy() {
    const {setIsLoadingComponent} = useWebNavStore();
    const {getPrivacyPolicyData} = useWebContactUsStore();
    const [privacyPolicyData, setPrivacyPolicyData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingComponent(true);
            const res = await getPrivacyPolicyData();
            if (res?.length) setPrivacyPolicyData(res);
            setIsLoadingComponent(false);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div className="privacy-policy-page-container">
            <h1 className="privacy-policy-page-heading">Privacy Policy</h1>
            {privacyPolicyData?.map((section, index) => (
                <div className="privacy-policy-page-section" key={index}>
                    {section?.subHeading && (
                        <h2 className="privacy-policy-page-subheading">{section.subHeading}</h2>
                    )}
                    {section?.paragraphs && section?.paragraphs.map((para, i) => (
                        <p className="privacy-policy-page-paragraph" key={i}>{para}</p>
                    ))}
                    {section?.points && (
                        <ul className="privacy-policy-page-points">
                            {section?.points.map((point, j) => (
                                <li className="privacy-policy-page-point" key={j}>{point}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}
