import Hero from "../components/Hero/Hero";
import PlaceSection from "../components/PlaceSection/PlaceSection";
import Categories from "../components/CategoriesSection/CategoriesSection";
import Popular from "../components/Popular/Popular";
import PreOrder from "../components/PreOrder/PreOrder";
import Footer from "../components/Footer/Footer";
import Testimonial from "../components/Testimonial/Testimonial";
export default function Home() {
  return (
    <>
      <Hero />
      <Popular />
      <PlaceSection />
      <Categories />
      <PreOrder />
      <Testimonial />
      <Footer />  
    </>
  );
}
