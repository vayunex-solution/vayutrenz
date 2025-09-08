import React, { useEffect, useState } from "react";
import { useCategoryStore } from "../../../../Store/useWebStores/useCategoryStore.js";
import { useWebHomeStore } from "../../../../Store/useWebStores/useWebHomeStore.js";
import "./HomeEditPage.css";

export default function HomeEditPage() {
    const { categoryMap, newCategory, fetchCategories } = useCategoryStore();
    const {
        getHomeData,
        homePageData,
        insertMaleHeaderData,
        insertFemaleHeaderData,
        insertMaleProductSliderData,
        insertFemaleProductSliderData,
        insertMaleTrendingCategoriesData,
        insertFemaleTrendingCategoriesData,
        insertMaleImageSliderData,
        insertFemaleImageSliderData,
        insertMaleAdvertisementPanelData,
        insertFemaleAdvertisementPanelData
    } = useWebHomeStore();

    const initialGenderData = {
        headerImage: "",
        headerText: "",
        productSlider: [],
        trendingCategories: [],
        imageSlider: [],
        advertisementPanel: [],
    };

    const [genderView, setGenderView] = useState("male");
    const [categoryObj, setCategoryObj] = useState({})
    const [homeData, setHomeData] = useState({
        male: { ...initialGenderData },
        female: { ...initialGenderData },
    });

    const [inputData, setInputData] = useState({
        imageSlider: { image: "", route: "" },
        advertisementPanel: { image: "", route: "", offerEndDate: "" },
        trendingCategories: { image: "", category: "" },
    });

    const [loadingHeader, setLoadingHeader] = useState(false);
    const [loadingProductSlider, setLoadingProductSlider] = useState(false);
    const [loadingTrending, setLoadingTrending] = useState(false);
    const [loadingImageSlider, setLoadingImageSlider] = useState(false);
    const [loadingAdPanel, setLoadingAdPanel] = useState(false);

    useEffect(() => {
        fetchCategories();
        
    }, [fetchCategories]);

    useEffect(() => {
        getHomeData();
    }, [getHomeData]);

    useEffect(() => {
            const tempObj = {};
            Object.values(categoryMap).forEach((categoryList) => {
                categoryList.forEach(({ _id, categoryName }) => {
                    tempObj[_id] = categoryName;
                });
            });
            setCategoryObj(tempObj);
            // console.log("categoryObj:", tempObj);
        }, [categoryMap]);

    useEffect(() => {
        const updatedData = { male: {}, female: {} };
        homePageData?.forEach((entry) => {
            updatedData[entry.gender] = entry.data;
        });
        setHomeData({
            male: { ...initialGenderData, ...updatedData.male },
            female: { ...initialGenderData, ...updatedData.female },
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [homePageData]);

    const handleSubmitSection = async (section) => {
        const gender = genderView;
        const sectionData = homeData[gender][section];
        const fnMap = {
            header: gender === "male" ? insertMaleHeaderData : insertFemaleHeaderData,
            productSlider: gender === "male" ? insertMaleProductSliderData : insertFemaleProductSliderData,
            trendingCategories: gender === "male" ? insertMaleTrendingCategoriesData : insertFemaleTrendingCategoriesData,
            imageSlider: gender === "male" ? insertMaleImageSliderData : insertFemaleImageSliderData,
            advertisementPanel: gender === "male" ? insertMaleAdvertisementPanelData : insertFemaleAdvertisementPanelData,
        };

        const loadingSetterMap = {
            header: setLoadingHeader,
            productSlider: setLoadingProductSlider,
            trendingCategories: setLoadingTrending,
            imageSlider: setLoadingImageSlider,
            advertisementPanel: setLoadingAdPanel,
        };

        loadingSetterMap[section](true);

        const payload = { gender, data: section === "header" ? {
            headerImage: homeData[gender].headerImage,
            headerText: homeData[gender].headerText,
        } : sectionData };

        await fnMap[section](payload);
        setTimeout(() => loadingSetterMap[section](false), 1000);
    };

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setHomeData((prev) => ({
    //         ...prev,
    //         [genderView]: {
    //             ...prev[genderView],
    //             [name]: value,
    //         },
    //     }));
    // };


    const handleEnter = (e, section) => {
        if (e.key === "Enter") {
            e?.preventDefault();
            const newItem = { ...inputData[section] };
            setHomeData((prev) => ({
                ...prev,
                [genderView]: {
                    ...prev[genderView],
                    [section]: [...prev[genderView][section], newItem],
                },
            }));
            setInputData((prev) => ({ ...prev, [section]: { image: "", route: "", offerEndDate: "" } }));
        }
    };

    const addProductSliderCategory = (categoryId) => {
        setHomeData((prev) => ({
            ...prev,
            [genderView]: {
                ...prev[genderView],
                productSlider: [...new Set([...prev[genderView].productSlider, categoryId])],
            },
        }));
    };

    const addTrendingCategory = (image, categoryId) => {
        if (!image || !categoryId) return;
        setHomeData((prev) => ({
            ...prev,
            [genderView]: {
                ...prev[genderView],
                trendingCategories: [...prev[genderView].trendingCategories, { image, category: categoryId }],
            },
        }));
        setInputData((prev) => ({ ...prev, trendingCategories: { image: "", category: "" } }));
    };

    const removeItem = (section, index,e) => {
        e?.preventDefault();
        setHomeData((prev) => ({
            ...prev,
            [genderView]: {
                ...prev[genderView],
                [section]: prev[genderView][section].filter((_, i) => i !== index),
            },
        }));
    };

    // const isDataEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    // const handleSubmit = async (e) => {
    //     e?.preventDefault();
    //     const payload = ["male", "female"].map((gender) => ({
    //         gender,
    //         data: homeData[gender],
    //     }));

    //     const existingDataMap = {};
    //     homePageData.forEach(entry => existingDataMap[entry.gender] = entry.data);

    //     const noChange = ["male", "female"].every(g => isDataEqual(homeData[g], existingDataMap[g]));

    //     if (noChange) return alert("No changes to submit");

    //     setLoading(true);
    //     await insertHomeData(payload);
    //     setTimeout(() => setLoading(false), 1000);
    // };

    const data = homeData[genderView];

    return (
        <div className="home-edit-outer-div">
            <form className="home-edit-form" >
                <h2 className="home-edit-title">Home Edit Page</h2>

                <label>Add Data For Both Genders</label>
                <div className="home-edit-toggle">
                    <button type="button" className={`home-edit-page-buttons ${genderView === "male" ? "active" : "inactive"}`} onClick={(e) => {e?.preventDefault(); setGenderView("male")}}>Male</button>
                    <button type="button" className={`home-edit-page-buttons ${genderView === "female" ? "active" : "inactive"}`} onClick={(e) => {e?.preventDefault(); setGenderView("female")}}>Female</button>
                </div>

                {/* /// welcome header /// */}

                <h3 className="home-edit-sub-heading">Welcome Header</h3>
                <div style={{width:"100%",height:"200px",backgroundColor:"#ccc"}}>
                    {data.headerImage && <img style={{width:"100%",height:"100%"}} src={data.headerImage} alt="img" />}
                </div>
                <label>Header Image
                <input className="home-edit-input" type="text" placeholder="Header Image URL" value={data.headerImage} onChange={(e) => setHomeData(prev => ({ ...prev, [genderView]: { ...prev[genderView], headerImage: e.target.value } }))} />
                </label>
                <label>Header Text
                <input className="home-edit-input" type="text" placeholder="Header Text" value={data.headerText} onChange={(e) => setHomeData(prev => ({ ...prev, [genderView]: { ...prev[genderView], headerText: e.target.value } }))} />
                </label>
                <div className="home-edit-submit-row">
                    <button type="button" className="home-edit-submit-button" style={{ backgroundColor: loadingHeader ? "black" : "green" }} disabled={loadingHeader} onClick={(e) => {e?.preventDefault();handleSubmitSection("header")}}>
                        {loadingHeader ? "Saving..." : "Save Header Section"}
                    </button>
                </div>
            </form>
                

            <form className="home-edit-form" >
                <h3 className="home-edit-sub-heading">Product Slider</h3>
                <label>Click a buttons to add product-related categories to the list (shown products of that Categories to users from top to bottom)
                <div className="home-edit-category-buttons">
                    {Object.entries({ ...categoryMap, ...newCategory }).map(([type, categories]) => (
                        <div className="home-edit-page-buttons-div" key={type}><p>{type}</p>
                            {categories?.map((cat) => (
                                <button className="home-edit-page-buttons" type="button" key={cat._id} onClick={(e) =>{ e?.preventDefault(); addProductSliderCategory(cat._id)}}>
                                    {cat.categoryName}
                                </button>
                            ))}
                        </div>
                    ))}
                </div></label>
                <div className="home-edit-submit-row">
                    <button type="button" className="home-edit-submit-button" style={{ backgroundColor: loadingProductSlider ? "black" : "green" }} disabled={loadingProductSlider} onClick={(e) => {e?.preventDefault(); handleSubmitSection("productSlider")}}>
                        {loadingProductSlider ? "Saving..." : "Save Product Slider"}
                    </button>
                </div>
                <div className="home-edit-preview">
                    <h4>Preview - {genderView}:</h4>
                    <ul>
                        {data?.productSlider?.length && data.productSlider.map((catId, i) => {
                            // console.log("cat",catId);
                            return (
                            <li key={i}>{(i+1)+': '+categoryObj[catId]+'--'+catId}<button onClick={(e) => {e?.preventDefault(); removeItem("productSlider", i)}}>×</button></li>
                        )})}
                    </ul>
                </div>
            </form>
                

            <form className="home-edit-form" >
                <h3 className="home-edit-sub-heading">Trending Categories</h3>
                <div style={{width:"150px",height:"200px",backgroundColor:"#ccc",margin:"auto"}}>
                    {inputData.trendingCategories.image && <img style={{width:"100%",height:"100%"}} src={inputData.trendingCategories.image} alt="img" />}
                </div>
                <label>Categories Product Image Url
                <input className="home-edit-input" type="text" placeholder="Trending Image URL" value={inputData.trendingCategories.image} onChange={(e) => setInputData({ ...inputData, trendingCategories: { ...inputData.trendingCategories, image: e.target.value } })} />
                </label>

                <label>Select The Category Name (and click on the button)
                    <select className="home-edit-input" value={inputData.trendingCategories.category} onChange={(e) => setInputData({ ...inputData, trendingCategories: { ...inputData.trendingCategories, category: e.target.value } })}>
                        <option value="">--Select Category--</option>
                        {Object.entries({ ...newCategory, ...categoryMap }).map(([type, categories]) => (
                            categories?.map((cat) => (
                                <option key={cat._id + type} value={cat._id}>{cat.categoryName}</option>
                            ))
                        ))}
                    </select>
                </label>
                <button className="home-edit-page-buttons" type="button" onClick={(e) => {e?.preventDefault(); addTrendingCategory(inputData.trendingCategories.image, inputData.trendingCategories.category)}}>
                    Add Trending Category
                </button>
                <div className="home-edit-submit-row">
                    <button type="button" className="home-edit-submit-button" style={{ backgroundColor: loadingTrending ? "black" : "green" }} disabled={loadingTrending} onClick={(e) => {e?.preventDefault(); handleSubmitSection("trendingCategories")}}>
                        {loadingTrending ? "Saving..." : "Save Trending Categories"}
                    </button>
                </div>
                <div className="home-edit-preview">
                    <h4>Preview - {genderView}:</h4>
                    <ul style={{padding:"0",margin:"0",width:"100%",display:"flex",gap:"3px",overflowX:"scroll"}}>
                        {data.trendingCategories.map((item, i) => {
                            // console.log(JSON.stringify(item.category));
                            return (
                            <li style={{listStyle:"none",width:"fit-content"}} key={i}>
                                <button onClick={(e) => {e?.preventDefault(); removeItem("trendingCategories", i)}}>×</button>
                                {i+1}
                                <div style={{width:"150px",height:"220px",backgroundColor:"#ccc",display:"inline-block"}}>
                                    {categoryObj[item.category]+'--'+item.category}
                                    {item.image && <img style={{width:"100%",height:"100%"}} src={item.image} alt="img" />}
                                </div>
                            </li>
                        )})}
                    </ul>
                </div>
            </form>
                

            <form className="home-edit-form" >
                <h3 className="home-edit-sub-heading">Image Slider</h3>
                <div style={{width:"200px",height:"200px",backgroundColor:"#ccc",margin:"auto"}}>
                    {inputData.imageSlider.image && <img style={{width:"100%",height:"100%"}} src={inputData.imageSlider.image} alt="img" />}
                </div>
                <label>Image Url (Image Should be Square in Shape)
                <input className="home-edit-input" type="text" placeholder="Image URL" value={inputData.imageSlider.image} onChange={(e) => setInputData({ ...inputData, imageSlider: { ...inputData.imageSlider, image: e.target.value } })} onKeyDown={(e) => handleEnter(e, "imageSlider")} />
                </label>
                <label>Route link, (use '--' between)<br/>
                    (for category '/categoryName--categoryId'), Eg:-(/Jeans--686cf5381d373792d0563aa2)<br/>
                    (for offer '/offerName--offer'), Eg:-(/bye-2-for-999--offer)<br/>
                    (for any Query like Gender, discount), Eg:-(/all-cloths?Gender=MEN&Discount=40%25%20or%20more)<br/>
                    (or go to the 'Route' and 'Copy and Past' and check is that route is working of not)<br/>
                <input className="home-edit-input" type="text" placeholder="/all-cloths?Discount=40%25%20or%20more" value={inputData.imageSlider.route} onChange={(e) => setInputData({ ...inputData, imageSlider: { ...inputData.imageSlider, route: e.target.value } })} onKeyDown={(e) => handleEnter(e, "imageSlider")} />
                </label>
                <div className="home-edit-submit-row">
                    <button type="button" className="home-edit-submit-button" style={{ backgroundColor: loadingImageSlider ? "black" : "green" }} disabled={loadingImageSlider} onClick={(e) => {e?.preventDefault(); handleSubmitSection("imageSlider")}}>
                        {loadingImageSlider ? "Saving..." : "Save Image Slider"}
                    </button>
                </div>
                <div className="home-edit-preview">
                    <h4>Preview - {genderView}:</h4>
                    <ul style={{padding:"0",margin:"0",width:"100%",display:"flex",gap:"3px",overflowX:"scroll"}}>
                        {data.imageSlider.map((item, i) => (
                            <li style={{listStyle:"none",width:"fit-content"}} key={i}>
                                <button onClick={(e) => {e?.preventDefault(); removeItem("imageSlider", i)}}>×</button>
                                {i+1}
                                <div style={{width:"200px",height:"220px",backgroundColor:"#ccc",display:"inline-block"}}>
                                    {item.route}
                                    {item.image && <img style={{width:"100%",height:"100%"}} src={item.image} alt="img" />}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </form>
                

            <form className="home-edit-form" >
                <h3 className="home-edit-sub-heading">Advertisement Panel</h3>
                <div style={{width:"100%",height:"200px",backgroundColor:"#ccc"}}>
                    {inputData.advertisementPanel.image && <img style={{width:"100%",height:"100%"}} src={inputData.advertisementPanel.image} alt="img" />}
                </div>
                <label>Advertisement Image
                <br />
                <input className="home-edit-input" type="text" placeholder="Add Image URL" value={inputData.advertisementPanel.image} onChange={(e) => setInputData({ ...inputData, advertisementPanel: { ...inputData.advertisementPanel, image: e.target.value } })} onKeyDown={(e) => handleEnter(e, "advertisementPanel")} />
                </label>
                <label>Route link, (use '--' between)<br/>
                    (for category '/categoryName--categoryId'), Eg:-(/Jeans--686cf5381d373792d0563aa2)<br/>
                    (for offer '/offerName--offer'), Eg:-(/bye-2-for-999--offer)<br/>
                    (for any Query like Gender, discount), Eg:-(/all-cloths?Gender=MEN&Discount=40%25%20or%20more)<br/>
                    <input className="home-edit-input" type="text" placeholder="Route" value={inputData.advertisementPanel.route} onChange={(e) => setInputData({ ...inputData, advertisementPanel: { ...inputData.advertisementPanel, route: e.target.value } })} onKeyDown={(e) => handleEnter(e, "advertisementPanel")} />
                </label>
                <label>Advertisement Ending Date
                    <br/>
                    <input className="home-edit-input" type="date" value={inputData.advertisementPanel.offerEndDate} onChange={(e) => setInputData({ ...inputData, advertisementPanel: { ...inputData.advertisementPanel, offerEndDate: e.target.value } })} onKeyDown={(e) => handleEnter(e, "advertisementPanel")} />
                </label>

                <div className="home-edit-submit-row">
                    <button type="button" className="home-edit-submit-button" style={{ backgroundColor: loadingAdPanel ? "black" : "green" }} disabled={loadingAdPanel} onClick={(e) => {e?.preventDefault(); handleSubmitSection("advertisementPanel")}}>
                        {loadingAdPanel ? "Saving..." : "Save Advertisement Panel"}
                    </button>
                </div>

                <div className="home-edit-preview">
                    <h4>Preview - {genderView}:</h4>
                    <ul>
                        {data.advertisementPanel.map((item, i) => (
                            <li key={i}>
                                <button onClick={(e) => {e?.preventDefault(); removeItem("advertisementPanel", i)}}>×</button>
                                {i+1}
                                <div style={{width:"100%",height:"200px"}}>
                                    {item.image && <img style={{width:"100%",height:"100%"}} src={item.image} alt="img" />}
                                </div>
                                <p>{'route-('+item.route+'), Ending Date-('+item.offerEndDate+")"}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </form>
        </div>
    );
}
