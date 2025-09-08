import React, { useEffect, useRef, useState } from 'react';
import './HomePage.css';
import ImageSlider from "../../Components/ImageSlider/ImageSlider.jsx"
import ProductSlider from "../../Components/ProductSlider/ProductSlider.jsx"
import TrendingCategories from "../../Components/TrendingCategories/TrendingCategories.jsx"
import AdvertisementPanel from "../../Components/AdvertisementPanel/AdvertisementPanel.jsx"
import WelcomeHeader from "../../Components/WelcomeHeader/WelcomeHeader.jsx"
import { ArrowUp } from 'lucide-react';
import { useWebHomeStore } from '../../Store/useWebStores/useWebHomeStore.js';
import { useCategoryStore } from '../../Store/useWebStores/useCategoryStore.js';
import { useDataStore } from '../../Store/useDataStore.js';
import {useWebNavStore} from "../../Store/useWebStores/useWebNavStore"

function HomePage() {
    const {setIsLoadingComponent} = useWebNavStore();
    const {gender} = useDataStore()
    const { categoryMap,fetchCategories } = useCategoryStore()
    const { getHomeData, homePageData } = useWebHomeStore();
    const [listCount, setListCount] = useState(1);
    const [genderData, setGenderData] = useState();
    const containerRef = useRef(null);

    const [categoryObj, setCategoryObj] = useState({});

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

    // Example usage
    // useEffect(() => {
    //     const exampleId = Object.keys(categoryObj)[0];
    //     if (exampleId) {
    //         console.log("Example:", categoryObj[exampleId]); // should print categoryName
    //     }
    // }, [categoryObj]);


    useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        
        const handelGetData=async()=>{
            setIsLoadingComponent(true);
            await getHomeData();
            setIsLoadingComponent(false);
        }
        handelGetData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let storedGender = localStorage.getItem("WebGender");

        if (storedGender === "female") {
            // console.log("female");
            homePageData[1] && setGenderData(homePageData[1]);
        } else if (storedGender === "male") {
            // console.log("male");
            homePageData[0] && setGenderData(homePageData[0]);
        } else {
            storedGender = "male"; // default value
            homePageData[0] && setGenderData(homePageData[0]);
        }
    }, [gender,homePageData]);




    // Scroll event to load more and toggle back-to-top
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

            // Trigger when user is within 100vh (1 screen height) of bottom
            if (scrollHeight - scrollTop - clientHeight <= clientHeight) {
                setListCount((prev) => prev + 1);
            }

        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    // Render repeated blocks
    const renderBlocks = () => {
        const components = [];
        for (let i = 0; i < listCount; i++) {
            components.push(
                <React.Fragment key={i}>
                    <ImageSlider slideImages={genderData?.data?.imageSlider} />
                    <ProductSlider categoryId={genderData?.data?.productSlider[i*3+1]} categoryObj={categoryObj} />
                    <TrendingCategories trendingCategories={genderData?.data?.trendingCategories} categoryObj={categoryObj}/>
                    <ProductSlider categoryId={genderData?.data?.productSlider[i*3+2]} categoryObj={categoryObj}/>
                    <AdvertisementPanel offer={genderData?.data?.advertisementPanel[i%2]} />
                    <ProductSlider categoryId={genderData?.data?.productSlider[i*3+3]} categoryObj={categoryObj}/>
                </React.Fragment>
            );
        }
        return components;
    };

    return (
        <div className="home-page" ref={containerRef}>
            <WelcomeHeader headerImage={genderData?.data?.headerImage} headerText={genderData?.data?.headerText}/>
            {renderBlocks()}

        </div>
    );
}

export default HomePage;
