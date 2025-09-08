import React from "react";
import "./MyWallet.css";

// Sample data (replace or populate dynamically as needed)
const walletSummary = {
    totalBalance: 101,
};

const walletDetails = [
    {
        type: "Bewakoof Credit",
        icon: "❌",
        balance: 101,
        description:
            "Earned from referral, offers and cash back. Limited validity. Can be redeemed on orders above ₹498.",
    },
    {
        type: "Bewakoof Cash",
        icon: "🟢",
        balance: 0,
        description:
            "Received from refund for orders that you have returned, cancelled and gift card.",
    },
];

const walletBenefits = [
    {
        icon: "📦",
        title: "Quick Refunds",
    },
    {
        icon: "📱",
        title: "One-tap payment",
    },
    {
        icon: "🎟️",
        title: "Special Discounts",
    },
];

export default function MyWallet() {
    return (
        <div className="my-wallet-container">
            <div className="my-wallet-balance">
                ₹{walletSummary.totalBalance}
                <div className="my-wallet-balance-subtext">Total Wallet balance</div>
            </div>

            <div className="my-wallet-details">
                {walletDetails.map((item, index) => (
                    <div key={index} className="my-wallet-card">
                        <div className="my-wallet-header">
                            <span className="my-wallet-icon">{item.icon}</span>
                            <strong>{item.type}</strong>
                        </div>
                        <p className="my-wallet-balance-text">Balance : ₹{item.balance}</p>
                        <p className="my-wallet-description">{item.description}</p>
                    </div>
                ))}
            </div>

            <div className="my-wallet-info-links">
                <div className="my-wallet-link">How to use Bewakoof Wallet ➜</div>
                <div className="my-wallet-link">Help & Support ➜</div>
            </div>

            <div className="my-wallet-benefits">
                <h3>Bewakoof wallet Benefits</h3>
                <div className="my-wallet-benefit-icons">
                    {walletBenefits.map((benefit, idx) => (
                        <div key={idx} className="my-wallet-benefit">
                            <div className="my-wallet-benefit-icon">{benefit.icon}</div>
                            <div>{benefit.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
