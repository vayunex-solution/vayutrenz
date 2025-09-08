import React, { useEffect, useState } from "react";
import { useWebContactUsStore } from "../../../../Store/useWebStores/useWebContactUsStore";
import "../AboutUSEdit/AboutUsEdit.css";

export default function PrivacyPolicyEdit() {
    const {
        getPrivacyPolicyData,
        insertPrivacyPolicyData,
    } = useWebContactUsStore();

    const [contentList, setContentList] = useState([]);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [content, setContent] = useState({
        subHeading: "",
        paragraphs: "",
        points: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            const res = await getPrivacyPolicyData();
            if (res?.length) setContentList(res);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEnter = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const newContent = {
                subHeading: content.subHeading?.trim() || undefined,
                paragraphs: content.paragraphs
                    ? content.paragraphs.split(",,").map(p => p.trim()).filter(Boolean)
                    : [],
                points: content.points
                    ? content.points.split(",,").map(p => p.trim()).filter(Boolean)
                    : [],
            };

            setContentList([...contentList, newContent]);
            setContent({ subHeading: "", paragraphs: "", points: "" });
        }
    };

    const handleContentSubmit = async (e) => {
        e.preventDefault();
        setButtonClicked(true);
        const res = await insertPrivacyPolicyData(contentList);
        if (res?.length) setContentList(res);
        setButtonClicked(false);
    };

    const removeFromContentList = (index) => {
        setContentList(contentList.filter((_, i) => i !== index));
    };

    return (
        <div className="about-us-edit-outer-div">
            <form onSubmit={handleContentSubmit} className="about-us-edit-inner-div">
                <h3>Privacy Policy Sections (Array)</h3>

                <b>Sub Heading</b>
                <input
                    type="text"
                    placeholder="Sub Heading (Optional)"
                    value={content.subHeading}
                    onChange={(e) => setContent({ ...content, subHeading: e.target.value })}
                    onKeyDown={handleEnter}
                />

                <b>Paragraphs (Separate by double commas: ,,)</b>
                <textarea
                    placeholder="Paragraph 1,,Paragraph 2,,Paragraph 3"
                    value={content.paragraphs}
                    onChange={(e) => setContent({ ...content, paragraphs: e.target.value })}
                    onKeyDown={handleEnter}
                />

                <b>Points (Separate by double commas: ,,)</b>
                <input
                    type="text"
                    placeholder="Point 1,,Point 2,,Point 3"
                    value={content.points}
                    onChange={(e) => setContent({ ...content, points: e.target.value })}
                    onKeyDown={handleEnter}
                />

                <b>Press Enter to Add Section</b>
                <div className={`about-us-Submit-button-div ${buttonClicked?"about-us-Submit-button-clicked":""}`}>
                    <button type="submit" disabled={buttonClicked} className="about-us-Submit-button">Submit Privacy Policy</button>
                </div>
                    

                {contentList.length > 0 && (
                    <div className="preview-section">
                        <h4>Preview:</h4>
                        {contentList.map((item, index) => (
                            <div key={index} className="preview-items">
                                <div className="about-us-preview-item">
                                    <p><strong>{item.subHeading || "No Subheading"}</strong></p>
                                    <button
                                        onClick={() => removeFromContentList(index)}
                                        className="delete-button"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div>
                                    {item.paragraphs?.map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                                <ul>
                                    {item.points?.map((point, j) => (
                                        <li key={j}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
}

