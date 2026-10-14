import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../../config";
import "./FakePayment.css";

function FakePaymentSkeleton() {
  return (
    <div
      className="fakepay-page fakepay-skeleton"
      aria-label="Loading checkout details"
      aria-busy="true"
    >
      <div className="fakepay-logo-header">
        <img
          src="/logo.png"
          alt="Redwood Cafe Logo"
          style={{
            width: "80px",
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>

      <div className="fakepay-single-card">
        {/* Amount */}
        <div className="fakepay-skeleton-amount">
          <div className="fp-skeleton-line fp-label fp-shimmer" />
          <div className="fp-skeleton-line fp-amount fp-shimmer" />
        </div>

        <div className="fakepay-tree-divider">
          <div className="fp-skeleton-dot fp-shimmer" />
        </div>

        {/* Gateway heading */}
        <div className="fakepay-skeleton-gateway">
          <div className="fp-skeleton-line fp-gateway-title fp-shimmer" />
          <div className="fp-skeleton-badge fp-shimmer" />
        </div>

        {/* UPI accordion */}
        <div className="fakepay-skeleton-accordion">
          <div className="fakepay-skeleton-copy">
            <div className="fp-skeleton-line fp-shimmer" />
            <div className="fp-skeleton-line fp-short fp-shimmer" />
          </div>
          <div className="fp-skeleton-chevron fp-shimmer" />
        </div>

        {/* UPI options */}
        <div className="fakepay-skeleton-options">
          <div className="fakepay-skeleton-option">
            <div className="fp-skeleton-radio fp-shimmer" />
            <div className="fakepay-skeleton-copy">
              <div className="fp-skeleton-line fp-option-title fp-shimmer" />
              <div className="fp-skeleton-line fp-short fp-shimmer" />
            </div>
          </div>

          <div className="fp-skeleton-input fp-shimmer" />

          <div className="fp-skeleton-or">
            <span />
            <div className="fp-skeleton-line fp-or-label fp-shimmer" />
            <span />
          </div>

          <div className="fakepay-skeleton-option">
            <div className="fp-skeleton-radio fp-shimmer" />
            <div className="fakepay-skeleton-copy">
              <div className="fp-skeleton-line fp-option-title fp-shimmer" />
              <div className="fp-skeleton-line fp-long fp-shimmer" />
              <div className="fp-skeleton-line fp-medium fp-shimmer" />
            </div>
          </div>
        </div>

        {/* Pay button */}
        <div className="fp-skeleton-button fp-shimmer" />
      </div>

      <div className="fakepay-secure-footer">
        <div className="fp-skeleton-footer-icon fp-shimmer" />
        <div className="fp-skeleton-line fp-footer-text fp-shimmer" />
      </div>
    </div>
  );
}

export default function FakePayment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  const [orderData, setOrderData] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!orderId) return;
    const token = localStorage.getItem("userToken");
    fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(resData => setOrderData(resData.data))
      .catch(console.error);
  }, [orderId]);

  const handlePay = () => {
    setStatus("processing");
    setTimeout(async () => {
      const token = localStorage.getItem("userToken");
      await fetch(`${API_BASE_URL}/api/payments/fake/confirm`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: "paid" }),
      });
      setStatus("success");
      setTimeout(() => navigate(`/order-status?orderId=${orderId}`), 1200);
    }, 2200);
  };

if (!orderData) return <FakePaymentSkeleton />;

  const items = orderData.items || [];
  const itemTotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharges = 40; 
  const subtotal = itemTotal;
  const taxes = Math.round(subtotal * 0.05);
  const totalAmount = orderData.total || (subtotal + taxes + deliveryCharges);

  return (
    <div className="fakepay-page">
      <div className="fakepay-logo-header">
        <img src="/logo.png" alt="Redwood Cafe Logo" style={{ width: "80px", height: "auto", display: "block", margin: "0 auto" }} />
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
                <span className="section-title">DEMO PAYMENT GATEWAY</span>
                <span className="section-secure" style={{ color: "#d97706", backgroundColor: "#fef3c7", padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
                  Simulation Only
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
        Simulation only. No real payment will be processed.
      </div>
    </div>
  );
}
