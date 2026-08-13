import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../../config";
import "./FakePayment.css";

export default function FakePayment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  const [orderData, setOrderData] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!orderId) return;
    fetch(`${API_BASE_URL}/api/orders/${orderId}`)
      .then(res => res.json())
      .then(resData => setOrderData(resData.data))
      .catch(console.error);
  }, [orderId]);

  const handlePay = () => {
    setStatus("processing");
    setTimeout(async () => {
      await fetch(`${API_BASE_URL}/api/payments/fake/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "paid" }),
      });
      setStatus("success");
      setTimeout(() => navigate(`/order-status?orderId=${orderId}`), 1200);
    }, 2200);
  };

  if (!orderData) return <div className="fakepay-loading">Loading secure checkout...</div>;

  const items = orderData.items || [];
  const itemTotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharges = 40; 
  const subtotal = itemTotal;
  const taxes = Math.round(subtotal * 0.05);
  const totalAmount = orderData.total || (subtotal + taxes + deliveryCharges);

  return (
    <div className="fakepay-page">
      <div className="fakepay-logo-header">
        <div className="fakepay-logo-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V6"/><path d="M7 16l5-3 5 3"/><path d="M8 13l4-3 4 3"/><path d="M9.5 10l2.5-2.5L14.5 10"/><path d="M11 7l1-1 1 1"/></svg>
        </div>
        <div className="fakepay-logo-text">
          <span className="logo-title">REDWOOD</span>
          <span className="logo-sub"><span className="line"></span>CAFE<span className="line"></span></span>
        </div>
      </div>

      <div className="fakepay-single-card">
        {status === "idle" ? (
          <>
            <div className="fakepay-amount-header">
              <p className="payable-label">Amount to Pay</p>
              <h2 className="payable-value">₹{totalAmount}</h2>
            </div>

            <div className="fakepay-tree-divider">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V6"/><path d="M7 16l5-3 5 3"/><path d="M8 13l4-3 4 3"/><path d="M9.5 10l2.5-2.5L14.5 10"/></svg>
            </div>

            <div className="fakepay-payment-section">
              <div className="payment-section-header">
                <span className="section-title">ONLINE PAYMENT</span>
                <span className="section-secure">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Secure & Encrypted
                </span>
              </div>

              <div className="payment-method-accordion">
                <div className="accordion-header">
                  <div className="accordion-title-group">
                    <strong>UPI</strong>
                    <p>Pay using any UPI app</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>

              <div className="upi-options-container">
                <label className="upi-radio-option">
                  <div className="radio-btn active">
                    <div className="radio-inner"></div>
                  </div>
                  <div className="upi-option-text">
                    <strong>Pay with UPI ID</strong>
                    <p>Enter your UPI ID to make payment</p>
                  </div>
                </label>
                
                <div className="upi-input-wrapper">
                  <input type="text" placeholder="yourname@upi" />
                </div>

                <div className="upi-or-divider">
                  <span>OR</span>
                </div>

                <label className="upi-radio-option disabled-option">
                  <div className="radio-btn"></div>
                  <div className="upi-option-text">
                    <strong>Scan & Pay</strong>
                    <p>Open any UPI app and scan the QR code to pay</p>
                  </div>
                </label>
              </div>
            </div>

            <button className="fakepay-submit-btn" onClick={handlePay}>
              Pay ₹{totalAmount}
            </button>
          </>
        ) : (
          <div className="fakepay-processing-state">
            {status === "processing" && (
              <>
                <div className="spinner-premium"></div>
                <h3>Processing Payment...</h3>
                <p>Please do not close this window.</p>
              </>
            )}
            {status === "success" && (
              <>
                <div className="success-icon-premium">✓</div>
                <h3>Payment Successful</h3>
                <p>Redirecting to your order status...</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="fakepay-secure-footer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        Your payment is secure and encrypted
      </div>
    </div>
  );
}
