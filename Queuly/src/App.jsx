import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Preloader from "./components/Preloader/Preloader";
import AuthModal from "./components/AuthModal/AuthModal";
import './App.css';

const Home = lazy(() => import("./pages/Home"));
const Menu = lazy(() => import("./pages/Menu/Menu"));
const Billing = lazy(() => import("./pages/Billing/Billing"));
const FakePayment = lazy(() => import("./pages/FakePayment/FakePayment"));
const OrderStatus = lazy(() => import("./pages/OrderStatus/OrderStatus"));
const OrderHistory = lazy(() => import("./pages/OrderHistory/OrderHistory"));
const Orders = lazy(() => import("./pages/Orders/Orders"));

const LoadingFallback = () => <Preloader />;

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);

  return (
    <>
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/pay" element={<FakePayment />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Suspense>
    </>
  );
}
