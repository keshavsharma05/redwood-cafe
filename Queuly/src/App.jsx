import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import AuthModal from "./components/AuthModal/AuthModal";
import "./App.css";

const Home = lazy(() => import("./pages/Home"));
const Menu = lazy(() => import("./pages/Menu/Menu"));
const Billing = lazy(() => import("./pages/Billing/Billing"));
const FakePayment = lazy(() => import("./pages/FakePayment/FakePayment"));
const OrderStatus = lazy(() => import("./pages/OrderStatus/OrderStatus"));
const OrderHistory = lazy(() => import("./pages/OrderHistory/OrderHistory"));
const Orders = lazy(() => import("./pages/Orders/Orders"));

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);

  return (
    <>
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/menu"
          element={<Menu onOpenAuth={() => setIsAuthOpen(true)} />}
        />
        <Route path="/billing" element={<Billing />} />
        <Route path="/pay" element={<FakePayment />} />
        <Route path="/order-status" element={<OrderStatus />} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </>
  );
}