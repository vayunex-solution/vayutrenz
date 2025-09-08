import React, { useEffect, useState } from 'react';
import './ContactUsEdit.css';
import { useWebContactUsStore } from '../../../../Store/useWebStores/useWebContactUsStore.js';

export default function ContactUsEdit() {
    const { getContactUsData, insertHelpingDetails } = useWebContactUsStore();

    const [helpData, setHelpData] = useState([]);
    const [mainHeading, setMainHeading] = useState('');
    const [title, setTitle] = useState('');
    const [paragraph, setParagraph] = useState('');
    const [addressDetails, setAddressDetails] = useState({})
    const [buttonClicked, setButtonClicked] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const res = await getContactUsData();
            setHelpData(res.helpData || []);
            setAddressDetails(res.addressDetails || {});
        };
        fetchData();
    }, [getContactUsData]);

    const handleAddEntry = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!mainHeading.trim() || !title.trim() || !paragraph.trim()) return;

            // Split paragraph by double comma
            const detailsArray = paragraph.split(",,").map((line) => line.trim()).filter(Boolean);

            setHelpData((prevData) => {
                const existingMain = prevData.find((item) => item.mainHeading === mainHeading);
                if (existingMain) {
                    return prevData.map((item) =>
                        item.mainHeading === mainHeading
                            ? {
                                ...item,
                                subHeadings: [
                                    ...item.subHeadings,
                                    { title, details: detailsArray },
                                ],
                            }
                            : item
                    );
                } else {
                    return [
                        ...prevData,
                        {
                            mainHeading,
                            subHeadings: [{ title, details: detailsArray }],
                        },
                    ];
                }
            });

            setTitle('');
            setParagraph('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonClicked(true);
        const res = await insertHelpingDetails(helpData);
        if (res && res.helpData) {
            console.log(res);
            setHelpData(res.helpData);
        }
        setButtonClicked(false);
    };

    const removeMainHeading = (mainHeadingToRemove) => {
        setHelpData(helpData.filter((item) => item.mainHeading !== mainHeadingToRemove));
    };

    const removeSubHeading = (mainHeadingTarget, titleToRemove) => {
        setHelpData((prevData) =>
            prevData.map((item) =>
                item.mainHeading === mainHeadingTarget
                    ? {
                        ...item,
                        subHeadings: item.subHeadings.filter((sh) => sh.title !== titleToRemove),
                    }
                    : item
            ).filter((item) => item.subHeadings.length > 0 || item.mainHeading !== mainHeadingTarget)
        );
    };

    return (
        <div className="web-edit-page-outer-div">
            <AddressDetailsEdit addressDetails={addressDetails}/>
            <div className="web-edit-page-inner-div">
                <h2 className="web-edit-page-heading">Edit Contact Us Help Section</h2>

                <form className="web-edit-page-form" onSubmit={handleSubmit}>
                    <label className="web-edit-page-label">Main Heading</label>
                    <input
                        type="text"
                        placeholder="Main Heading"
                        className="web-edit-page-input"
                        value={mainHeading}
                        onChange={(e) => setMainHeading(e.target.value)}
                        onKeyDown={handleAddEntry}
                    />

                    <label className="web-edit-page-label">Sub Heading Title</label>
                    <input
                        type="text"
                        placeholder="Sub Heading Title"
                        className="web-edit-page-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleAddEntry}
                    />

                    <label className="web-edit-page-label">Details / Paragraph (use `,,` to separate lines) <br />Press<b> Enter</b> to insert (Title and Details) </label>
                    <input
                        type="text"
                        placeholder="Details / Paragraph"
                        className="web-edit-page-input"
                        value={paragraph}
                        onChange={(e) => setParagraph(e.target.value)}
                        onKeyDown={handleAddEntry}
                    />

                    <div className={`about-us-Submit-button-div ${buttonClicked?"about-us-Submit-button-clicked":""}`}>
                        <button type="submit" disabled={buttonClicked} className="web-edit-page-submit-btn">
                            Submit
                        </button>
                    </div>
                </form>

                <div className="web-edit-page-preview">
                    {helpData.map((section, i) => (
                        <div key={i} className="web-edit-page-main-heading">
                            <div className="web-edit-page-main-heading-header">
                                <h3>{section.mainHeading}</h3>
                                <button
                                    className="web-edit-page-remove-btn"
                                    onClick={() => removeMainHeading(section.mainHeading)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="web-edit-page-subheadings">
                                {section.subHeadings.map((sub, j) => (
                                    <div key={j} className="web-edit-page-subheading">
                                        <div className="web-edit-page-subheading-header">
                                            <strong>{sub.title}</strong>
                                            <button
                                                className="web-edit-page-remove-btn"
                                                onClick={() => removeSubHeading(section.mainHeading, sub.title)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <ul>
                                            {sub.details.map((detail, k) => (
                                                <li key={k}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                
            </div>
        </div>
    );
}


// AddressDetailsEdit.jsx
function AddressDetailsEdit({addressDetails}) {
    const { insertAddressDetails } = useWebContactUsStore();

    const [formData, setFormData] = useState({
        companyName: '',
        country: '',
        pinCode: '',
        city: '',
        state: '',
        street: '',
        area: '',
        landmark: '',
        contactLines: [],
    });

    const [contactInput, setContactInput] = useState({
        startingLine: '',
        highlightLine: '',
        endingLine: '',
    });
    const [buttonClicked, setButtonClicked] = useState(false)

    useEffect(() => {
        if(addressDetails){
            console.log("addressDetails",addressDetails);
            setFormData(addressDetails);
        }
    //// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addressDetails]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleContactInputChange = (e) => {
        const { name, value } = e.target;
        setContactInput((prev) => ({ ...prev, [name]: value }));
    };

    const handleContactKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (contactInput.startingLine && contactInput.highlightLine && contactInput.endingLine) {
                setFormData((prev) => ({
                    ...prev,
                    contactLines: [...prev.contactLines, contactInput],
                }));
                setContactInput({ startingLine: '', highlightLine: '', endingLine: '' });
            }
        }
    };

    const removeContactLine = (index) => {
        setFormData((prev) => ({
            ...prev,
            contactLines: prev.contactLines.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonClicked(true);
        console.log("form-data=",formData);
        const requiredFields = ['companyName', 'country', 'pinCode', 'city', 'state', 'street', 'area'];
        for (let field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill the ${field}`);
                return;
            }
        }
        const res=await insertAddressDetails(formData);
        if(res){
            console.log("res-handel-submit",res);
            setFormData(res.addressDetails);
        }
        setButtonClicked(false);
    };

    return (
        <div className="web-edit-page-inner-div">
            <form onSubmit={handleSubmit} className="web-edit-page-form address-form">
                <h3 className="web-edit-page-heading">Address Details</h3>
                {[{name:'companyName',label:'CompanyName'}, {name:'country',label:'Country'}, {name:'pinCode',label:'PinCode/ZipCode/PostalCode'}, {name:'city',label:'City'}, {name:'state',label:'State'}, {name:'street',label:'Street'}, {name:'area',label:'Area'}, {name:'landmark',label:'Landmark'}].map((field) => (
                    <div key={field.name} className="web-edit-page-input-wrapper">
                        <label className="web-edit-page-label">{field.label}</label>
                        <input
                            className="web-edit-page-input"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            required={field !== 'landmark'}
                        />
                    </div>
                ))}

                <div className="web-edit-page-contact-wrapper">
                    <h4 className="web-edit-page-subheading">Contact Lines</h4>
                    <p className='web-edit-page-p'>Eg:-(Press <b>Enter</b> to insert more lines)</p>
                    <p className='web-edit-page-p'>Eg:-(contact us on <b>abcd@example.com</b> for more details)</p>
                    <input
                        name="startingLine"
                        placeholder="Starting Line"
                        value={contactInput.startingLine}
                        onChange={handleContactInputChange}
                        onKeyDown={handleContactKeyDown}
                        className="web-edit-page-input"
                    />
                    <input
                        name="highlightLine"
                        placeholder="Highlight Line"
                        value={contactInput.highlightLine}
                        onChange={handleContactInputChange}
                        onKeyDown={handleContactKeyDown}
                        className="web-edit-page-input"
                    />
                    <input
                        name="endingLine"
                        placeholder="Ending Line"
                        value={contactInput.endingLine}
                        onChange={handleContactInputChange}
                        onKeyDown={handleContactKeyDown}
                        className="web-edit-page-input"
                    />
                </div>

                <div className="web-edit-page-preview address-preview">
                    {formData?.contactLines?.map((line, idx) => (
                        <div key={idx} className="web-edit-page-contact-line" style={{ display: 'flex', justifyContent: "space-between" }}>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: `${line.startingLine} <b>${line.highlightLine}</b> ${line.endingLine}`,
                                }}
                            ></span>
                            <button
                                type="button"
                                className="web-edit-page-remove-btn"
                                onClick={() => removeContactLine(idx)}
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                </div>

                <div className={`about-us-Submit-button-div ${buttonClicked?"about-us-Submit-button-clicked":""}`}>
                    <button type="submit" disabled={buttonClicked} className="web-edit-page-submit-btn">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}

