import { useEffect, useState } from "react";
import { useWebNavStore } from "../../../../Store/useWebStores/useWebNavStore.js";
import "./NavEdit.css";

const NavEdit = () => {
    const [logoImage, setLogoImage] = useState("");
    const [logoText, setLogoText] = useState("");
    const [applicationName, setApplicationName] = useState("");

    // const [topNavInput, setTopNavInput] = useState("");
    const [bottomNavInput, setBottomNavInput] = useState("");
    // const [topNavItems, setTopNavItems] = useState([]);
    const [bottomNavItems, setBottomNavItems] = useState([]);
    const {
        navBarData,
        updateLogo,
        socialMediaLinks,
        getSocialMediaLinks,
        updateSocialMediaLinks,
        updateBottomNavItems
    } = useWebNavStore();

    useEffect(() => {
    if(navBarData.bottomNavItems.length && bottomNavItems.length===0){
        setBottomNavItems([...navBarData.bottomNavItems]);
        
    }
    console.log(navBarData.bottomNavItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navBarData])
    

    // console.log(navBarData.bottomNavItems)

    const handleLogoSubmit = async (e) => {
        e.preventDefault();
        const logoData = {
            logoImage: logoImage.trim(),
            logoText: logoText.trim(),
            applicationName: applicationName.trim(),
        };
        await updateLogo(logoData);
        console.log("Logo Data:", logoData);
    };

    // const handleTopNavSubmit = async(e) => {
    //     e.preventDefault();
    //     console.log("Top Nav Items:", topNavItems);
    //     await updateTopNavItems(topNavItems)
    //     handleClearItems(setTopNavItems)
    // };

    const handleBottomNavSubmit = async (e) => {
        e.preventDefault();
        console.log("Bottom Nav Items:", bottomNavItems);
        await updateBottomNavItems(bottomNavItems);
        // handleClearItems(setBottomNavItems)
    };

    const handleAddItem = (input, setItems, inputSetter) => {
        if (!input.includes(",,")) return;
        const [rawName, rawRoute] = input.split(",,");
        const name = rawName.trim();
        const route = rawRoute.trim().replace(/\s+/g, "-");
        if (name && route) {
            setItems((prev) => [...prev, { name, route }]);
            inputSetter("");
        }
    };

    const handleClearItems = (setItems) => {
        setItems([]);
    };

    const handleKeyDown = (e, input, setItems, inputSetter) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddItem(input, setItems, inputSetter);
        }
    };



    const [links, setLinks] = useState({
        facebook: "",
        instagram: "",
        twitter: "",
        snapchat: "",
        youtube: "",
    });

    useEffect(() => {
        const fetchLinks = async () => {
            socialMediaLinks.length && setLinks(socialMediaLinks);
            if(!socialMediaLinks.length){
                const data = await getSocialMediaLinks();
                if(data) setLinks(data);
            }
        };
        fetchLinks();
    }, [getSocialMediaLinks,socialMediaLinks]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLinks((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateSocialMediaLinks(links);
    };


    return (
        <div className="web-edit-main-container">
            <div className="web-edit-inner-div">
                {/* LOGO SECTION */}
                <div className="web-edit-first-div">
                    <h2 className="web-edit-section-heading">Logo</h2>
                    <form className="web-edit-navbar-form" onSubmit={handleLogoSubmit}>
                        <div className="web-edit-form-box">
                            <label className="web-edit-label">
                                Logo Image URL:
                                <input
                                    type="text"
                                    className="web-edit-input"
                                    value={logoImage}
                                    onChange={(e) => setLogoImage(e.target.value)}
                                    placeholder="Enter logo image URL"
                                />
                            </label>

                            <label className="web-edit-label">
                                Logo Text:
                                <input
                                    type="text"
                                    className="web-edit-input"
                                    value={logoText}
                                    onChange={(e) => setLogoText(e.target.value)}
                                    placeholder="Enter logo text"
                                />
                            </label>

                            <label className="web-edit-label">
                                Application Name:
                                <input
                                    type="text"
                                    className="web-edit-input"
                                    value={applicationName}
                                    onChange={(e) => setApplicationName(e.target.value)}
                                    placeholder="Enter application name"
                                />
                            </label>

                            <button type="submit" className="web-edit-submit-button">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>

                {/* NAV ITEMS SECTION */}
                <div className="web-edit-second-div">
                    <h2 className="web-edit-section-heading">Nav-Items</h2>

                    {/* Bottom Nav Form */}
                    <form className="web-edit-nav-form" onSubmit={handleBottomNavSubmit}>
                        <div className="web-edit-nav-subform">
                            <label className="web-edit-label">
                                <b>Bottom Nav Item</b> <br />
                                Separate 'Name and Route' by 'Double Commas'<br />
                                Eg:-(SHOP NOW,,/Jeans--686cf5381d373792d0563aa2)
                                <input
                                    type="text"
                                    className="web-edit-input"
                                    value={bottomNavInput}
                                    onChange={(e) => setBottomNavInput(e.target.value)}
                                    onKeyDown={(e) =>
                                        handleKeyDown(
                                            e,
                                            bottomNavInput,
                                            setBottomNavItems,
                                            setBottomNavInput
                                        )
                                    }
                                />
                            </label>
                            <div className="web-edit-button-group">
                                <button
                                    type="button"
                                    className="web-edit-add-button"
                                    onClick={() =>
                                        handleAddItem(
                                            bottomNavInput,
                                            setBottomNavItems,
                                            setBottomNavInput
                                        )
                                    }
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    className="web-edit-clear-button"
                                    onClick={() => handleClearItems(setBottomNavItems)}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <br />

                        <button type="submit" className="web-edit-submit-button">
                            Submit Bottom Nav Items
                        </button>
                    </form>
                    <ul className="web-edit-items-list">
                        {bottomNavItems.map((item, idx) => (
                            <li key={idx}>
                                {`${idx+1}. ${item.name} ,, ${item.route}`}
                                <button
                                    style={{background:'none',border:'none',color:'red',fontSize:'16px',cursor:'pointer',padding:"0px",marginLeft:"20px"}}
                                    type="button"
                                    className="web-edit-remove-button"
                                    onClick={() =>{
                                        setBottomNavItems((prev) => prev.filter((_, i) => i !== idx))
                                    }
                                    }
                                >
                                    ❌
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                

                    {/* Social Media */}
                <div className="web-edit-second-div">
                    <h2 className="web-edit-section-heading">Nav-Items</h2>
                    <form className="web-edit-nav-form" onSubmit={handleSubmit}>
                        <div className="web-edit-nav-subform">
                            {Object.entries(links).map(([site, value]) => (
                                <label key={site} className="web-edit-label">
                                    {site.charAt(0).toUpperCase() + site.slice(1)} Link:
                                    <input
                                        type="text"
                                        className="web-edit-input"
                                        name={site}
                                        value={value}
                                        onChange={handleChange}
                                    />
                                </label>
                            ))}
                        </div>

                        <label><br/></label>
                        <button type="submit" className="web-edit-submit-button">
                            Submit Social Media Links
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NavEdit;
