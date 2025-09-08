import React, { useRef } from 'react';
import './ProductSlider.css';
import { ChevronRight } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard.jsx';
import {useNavigate} from 'react-router-dom';
import {useDataStore} from '../../Store/useDataStore.js';
import { useState } from 'react';
import { useEffect } from 'react';
import {useCategoryStore} from '../../Store/useWebStores/useCategoryStore.js'
// let gender = localStorage.getItem("WebGender");

const ProductSlider = ({categoryId}) => {
    const {categoryObj}=useCategoryStore();
    const scrollRef = useRef();
    const navigate = useNavigate();
    const {getProductsByCategoryId} = useDataStore();
    const [gender, setGender] = useState()
    const [products, setProducts] = useState();
    

    useEffect(() => {
    let storedGender = localStorage.getItem("WebGender");
    // console.log("gender=",storedGender)
    setGender(storedGender)
    }, [])
    
    useEffect(() => {
        let storedGender = localStorage.getItem("WebGender");
        const getProducts=async()=>{
            // console.log("gender=",storedGender)
            const res = await getProductsByCategoryId({categoryId,gender:storedGender});
            if(res){
                setProducts(res);
            }
        }
        categoryId && getProducts();
    }, [categoryId,getProductsByCategoryId])
    

    const scroll = (direction) => {
        const containerWidth = scrollRef.current.offsetWidth;
        let cardsPerView = 5;

        if (window.innerWidth <= 350) {
            cardsPerView = 1;
        } else if (window.innerWidth <= 500) {
            cardsPerView = 2;
        } else if (window.innerWidth <= 750) {
            cardsPerView = 3;
        } else if (window.innerWidth <= 1000) {
            cardsPerView = 4;
        }

        const cardWidth = containerWidth / cardsPerView;

        scrollRef.current.scrollBy({
            left: direction === 'left' ? -cardWidth : cardWidth,
            behavior: 'smooth'
        });
    };

    if(!products?.length){
        return <div></div>
    }


    return (
        <>
            <div className="card-container">
                <div className='card-container-heading'>
                    <h2 className='heading-text'>{categoryObj[categoryId]?.toUpperCase().split("-").join(" ")} FOR {gender==="female"?"WOMEN":"MEN"}</h2>
                </div>

                <button className="arrow left" onClick={() => scroll('left')}><ChevronLeft className='arrow-icon'/></button>

                <div className="product-scroll-wrapper" ref={scrollRef}>
                    {products?.map((product, index) => (
                        <ProductCard product={product} key={index} />
                    ))}
                </div>

                <button className="arrow right" onClick={() => scroll('right')}><ChevronRight className='arrow-icon'/></button>
                
                <div className='bottom-label'>
                    <p
                        className='bottom-label-text'
                        onClick={()=>navigate(`/collection/${categoryObj[categoryId].split(" ").join("-").split("'").join("")}--${categoryId}`)}
                    >Discover More</p>
                </div>
            </div>
        </>
    );
};

export default ProductSlider;
