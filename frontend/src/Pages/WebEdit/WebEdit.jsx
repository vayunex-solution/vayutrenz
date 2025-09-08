import { useState } from 'react';
import './WebEdit.css';
import NavEdit from './Components/NavEdit/NavEdit';
import ContactUsEdit from './Components/ContactUsEdit/ContactUsEdit';
import AboutUsEdit from './Components/AboutUSEdit/AboutUsEdit';
import PrivacyPolicyEdit from './Components/PrivacyPolicyEdit/PrivacyPolicyEdit';
import HomeEditPage from './Components/HomeEditPage/HomeEditPage';
import AddOwnerSeller from './Components/AddOwnerSeller/AddOwnerSeller';
import CreateCategoryForm from '../CreateCategoryForm/CreateCategoryForm.jsx';

export default function WebEdit() {
    const [activeSection, setActiveSection] = useState('Home');

    const renderSection = () => {
        switch (activeSection) {
            case 'Navbar':
                return <div className="web-edit-page-section web-edit-page-navbar">Navbar <NavEdit/></div>;
            case 'ContactUs':
                return <div className="web-edit-page-section web-edit-page-contactus">Contact Us <ContactUsEdit/></div>;
            case 'AboutUs':
                return <div className="web-edit-page-section web-edit-page-aboutus">About Us <AboutUsEdit/></div>;
            case 'PrivacyPolicy':
                return <div className="web-edit-page-section web-edit-page-privacy-policy">Privacy Policy <PrivacyPolicyEdit/></div>;
            case 'Home':
                return <div className="web-edit-page-section web-edit-page-home">Home <HomeEditPage/></div>;
            case 'Owner/Seller':
                return <div className="web-edit-page-section web-edit-page-home">Owner/Seller <AddOwnerSeller/></div>;
            case 'CreateCategory':
                return <div className="web-edit-page-section web-edit-page-home">Create Category <CreateCategoryForm/></div>;
            default:
                return null;
        }
    };

    return (
        <div className="web-edit-page-container">
            <div className="web-edit-page-button-row">
                {['Home', 'Navbar', 'ContactUs', 'AboutUs', 'PrivacyPolicy', "Owner/Seller", "CreateCategory"].map((section) => (
                    <button
                        key={section}
                        className={`web-edit-page-button ${activeSection === section ? 'active' : ''}`}
                        onClick={() => setActiveSection(section)}
                    >
                        {section}
                    </button>
                ))}
            </div>
            <div className="web-edit-page-content">
                {renderSection()}
            </div>
        </div>
    );
}
