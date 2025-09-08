import React, { useEffect, useState } from "react";
import { useWebContactUsStore } from "../../../../Store/useWebStores/useWebContactUsStore";
import "./AboutUsEdit.css";

export default function AboutUsEdit() {
    const {
        getAboutUsData,
        editAboutUsContent,
        updateAboutUsMiddleData,
        updateFooterHighlights,
    } = useWebContactUsStore();

    const [buttonClicked, setButtonClicked] = useState(false)
    const [contentList, setContentList] = useState([]);
    const [middle, setMiddle] = useState({ mainHeading: "", bannerImage: "", subHeading: "", details: "" });
    const [footerHeading, setFooterHeading] = useState("");
    const [footerList, setFooterList] = useState([]);
    const [content, setContent] = useState({ mainHeading: "", subHeading: "", image: "", details: "" });
    const [footerItem, setFooterItem] = useState({ title: "", description: "" });

    useEffect(() => {
        const fetchData = async () => {
            const res = await getAboutUsData();
            if (res?.aboutUsContent?.length) setContentList(res.aboutUsContent);
            if (res?.aboutUsMiddleData) setMiddle(res.aboutUsMiddleData);
            if (res?.footerHighlights) {
                setFooterHeading(res.footerHighlights.footerHeading || "");
                setFooterList(res.footerHighlights.details || []);
            }
        };
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEnter = (e, type) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (type === "content") {
                setContentList([...contentList, content]);
                setContent({ mainHeading: "", subHeading: "", image: "", details: "" });
            } else if (type === "footer") {
                setFooterList([...footerList, footerItem]);
                setFooterItem({ title: "", description: "" });
            }
        }
    };

    const handleContentSubmit = async (e) => {
        e.preventDefault();
        setButtonClicked(true);
        const res = await editAboutUsContent(contentList);
        if (res?.aboutUsContent) setContentList(res.aboutUsContent);
        setButtonClicked(false);
    };

    const handleMiddleSubmit = async (e) => {
        e.preventDefault();
        setButtonClicked(true);
        const res = await updateAboutUsMiddleData(middle);
        if (res?.aboutUsMiddleData) setMiddle(res.aboutUsMiddleData);
        setButtonClicked(false);
    };

    const handleFooterSubmit = async (e) => {
        e.preventDefault();
        setButtonClicked(true);
        const res = await updateFooterHighlights({ footerHeading, details: footerList });
        if (res?.footerHighlights) {
            setFooterHeading(res.footerHighlights.footerHeading);
            setFooterList(res.footerHighlights.details);
        }
        setButtonClicked(false);
    };

    const removeFromContentList = (index) => {
        setContentList(contentList.filter((_, i) => i !== index));
    };

    const removeFromFooterList = (index) => {
        setFooterList(footerList.filter((_, i) => i !== index));
    };

    return (
        <div className="about-us-edit-outer-div">
            {/* About Us Content */}
            <form onSubmit={handleContentSubmit} className="about-us-edit-inner-div">
                <h3>About Us Content (Array)</h3>
                <b>Main Heading</b>
                <input type="text" placeholder="Main Heading" value={content.mainHeading}
                    onChange={(e) => setContent({ ...content, mainHeading: e.target.value })}
                    onKeyDown={(e) => handleEnter(e, "content")}
                />
                <b>Sub Heading</b>
                <input type="text" placeholder="Sub Heading" value={content.subHeading}
                    onChange={(e) => setContent({ ...content, subHeading: e.target.value })}
                    onKeyDown={(e) => handleEnter(e, "content")}
                />
                <b>Image Url</b>
                <input type="text" placeholder="Image URL" value={content.image}
                    onChange={(e) => setContent({ ...content, image: e.target.value })}
                    onKeyDown={(e) => handleEnter(e, "content")}
                />
                <b>Details</b>
                <textarea placeholder="Details" value={content.details}
                    onChange={(e) => setContent({ ...content, details: e.target.value })}
                    onKeyDown={(e) => handleEnter(e, "content")}
                />
                <b>Press Enter to add More Content</b>
                <div className={`about-us-Submit-button-div ${buttonClicked?"about-us-Submit-button-clicked":""}`}>
                    <button type="submit" disabled={buttonClicked} className="about-us-Submit-button">Submit About Us Content</button>

                </div>

                {contentList.length > 0 && (
                    <div className="preview-section">
                        <h4>Preview:</h4>
                        {contentList.map((item, index) => (
                            <div key={index} className="preview-items">
                                <div className="about-us-preview-item">
                                    <p><strong>{item.mainHeading}</strong> - {item.subHeading}</p>
                                    <button onClick={() => removeFromContentList(index)} className="delete-button">×</button>
                                </div>
                                <img src={item.image} alt="" width={100} />
                                <p>{item.details}</p>
                            </div>
                        ))}
                    </div>
                )}
            </form>

            {/* About Us Middle */}
            <form onSubmit={handleMiddleSubmit} className="about-us-edit-inner-div">
                <h3>About Us Middle (Single Object)</h3>
                <b>Main Heading</b>
                <input type="text" placeholder="Main Heading" value={middle.mainHeading}
                    onChange={(e) => setMiddle({ ...middle, mainHeading: e.target.value })}
                />
                <b>Sub Heading</b>
                <input type="text" placeholder="Sub Heading" value={middle.subHeading}
                    onChange={(e) => setMiddle({ ...middle, subHeading: e.target.value })}
                />
                <b>Banner Image</b>
                <input type="text" placeholder="Banner Image" value={middle.bannerImage}
                    onChange={(e) => setMiddle({ ...middle, bannerImage: e.target.value })}
                />
                <b>Details</b>
                <textarea placeholder="Details" value={middle.details}
                    onChange={(e) => setMiddle({ ...middle, details: e.target.value })}
                />
                <div className={`about-us-Submit-button-div ${buttonClicked?"about-us-Submit-button-clicked":""}`}>
                <button type="submit" className="about-us-Submit-button" disabled={buttonClicked} >Submit Middle Data</button>

                </div>

                {middle?.mainHeading && (
                    <div className="preview-section">
                        <h4>Preview:</h4>
                        <strong>{middle.mainHeading}</strong> - {middle.subHeading}
                        <br />
                        <img src={middle.bannerImage} alt="" width={100} />
                        <p>{middle.details}</p>
                    </div>
                )}
            </form>

            {/* Footer Highlights */}
            <form onSubmit={handleFooterSubmit} className="about-us-edit-inner-div">
                <h3>Footer Highlights (Array)</h3>
                <b>AboutUs Footer Heading</b>
                <input type="text" placeholder="Footer Heading" value={footerHeading}
                    onChange={(e) => setFooterHeading(e.target.value)}
                />
                <b>Title</b>
                <input type="text" placeholder="Title" value={footerItem.title}
                    onChange={(e) => setFooterItem({ ...footerItem, title: e.target.value })}
                    onKeyDown={(e) => handleEnter(e, "footer")}
                />
                <b>Description</b>
                <textarea placeholder="Description" value={footerItem.description}
                    onChange={(e) => setFooterItem({ ...footerItem, description: e.target.value })}
                    onKeyDown={(e) => handleEnter(e, "footer")}
                />
                <b>Press Enter to add more details</b>
                <div className={`about-us-Submit-button-div ${buttonClicked?"about-us-Submit-button-clicked":""}`}>
                    <button type="submit" disabled={buttonClicked} className="about-us-Submit-button">Submit Footer Data</button>
                </div>


                {footerList.length > 0 && (
                    <div className="preview-section">
                        <h4>Preview:</h4>
                        <strong><b>{footerHeading}</b></strong>
                        {footerList.map((item, index) => (
                            <div key={index} className="preview-item">
                                <div className="about-us-preview-it">
                                    <strong>{item.title}</strong>
                                    <p>{item.description}</p>
                                </div>
                                <button onClick={() => removeFromFooterList(index)} className="delete-button">×</button>
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
}
