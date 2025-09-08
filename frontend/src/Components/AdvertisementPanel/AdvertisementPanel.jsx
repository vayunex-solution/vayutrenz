import React, { useEffect, useState } from "react";
import "./AdvertisementPanel.css";

const SALE_END_DATE = new Date("2025-07-10T23:59:59"); // ← Change to your desired sale end time

const AdvertisementPanel = ({ offer }) => {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining());
    // const offerImage = "./offer-image1.png"; // Ensure image is in the correct folder

    function getTimeRemaining() {
        const now = new Date();
        const endDate = new Date(offer?.offerEndDate) // Ensure it's a Date object
        const total = endDate - now;

        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));

        // console.log(total, days, hours, minutes, seconds);
        return { total, days, hours, minutes, seconds };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeRemaining());
        }, 1000);

        return () => clearInterval(timer);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offer]);

    if (!offer) {
        return <div className="sale-ended" style={{width:"100%",textAlign:"center"}}></div>;
    }

    return (
        <div className="advertisement-panel">
            {offer && (
                <div className="offer-image-div">
                    <img src={offer.image} alt="Offer" className="offer-image" />
                </div>
            )}

            <div className="offer-label">
                <p className="offer-label-text">{timeLeft.total >= 0?"Deal Expires In":"Sale has ended!"}</p>
            </div>
            
            {timeLeft.total >= 0 &&
                <div className="reverse-time">
                    <div className="time-box">
                        <span>{timeLeft.days}</span>
                        <p>Days</p>
                    </div>
                    <div className="time-box">
                        <span>{timeLeft.hours}</span>
                        <p>Hours</p>
                    </div>
                    <div className="time-box">
                        <span>{timeLeft.minutes}</span>
                        <p>Minutes</p>
                    </div>
                    <div className="time-box">
                        <span>{timeLeft.seconds}</span>
                        <p>Seconds</p>
                    </div>
                </div>
            }
        </div>
    );
};

export default AdvertisementPanel;
