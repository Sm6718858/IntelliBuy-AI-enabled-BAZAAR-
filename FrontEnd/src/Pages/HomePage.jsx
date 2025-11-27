import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Checkbox, Radio, Divider, Drawer } from "antd";
import { Prices } from "../Components/Prices";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../Context/Cart";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, X } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const productsRef = useRef(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  };


  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/get-category`
      );
      if (data?.success) setCategories(data?.categories);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch product count
  const getTotal = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/product-count`
      );
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch paginated products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/product-list/${page}`
      );
      setLoading(false);
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Load more products
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/product-list/${page}`
      );
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Handle filter
  const handleFilter = (value, id) => {
    let all = [...checked];
    value ? all.push(id) : (all = all.filter((c) => c !== id));
    setChecked(all);
  };

  // Apply filters
  const filterProduct = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/product-filters`,
        { checked, radio }
      );
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  // Reset products and filters
  const resetFilters = () => {
    setChecked([]);
    setRadio([]);
    setPage(1);
    getAllProducts();
    setMobileFilterOpen(false);
  };

  // Initial fetch
  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);

  // Load more on page change
  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  // Reset products if no filter
  useEffect(() => {
    if (!checked.length && !radio.length) {
      getAllProducts();
      setPage(1);
    }
  }, [checked.length, radio.length]);


  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  const FilterSidebarContent = ({ isMobile = false, closeDrawer }) => (
    <motion.aside
      initial={!isMobile ? "hidden" : false}
      whileInView={!isMobile ? "visible" : false}
      viewport={!isMobile ? { once: true } : {}}
      variants={!isMobile ? fadeInUp : {}}
      className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 ${!isMobile ? 'sticky top-5 h-fit' : 'h-full'}`}
    >
      <div className="flex justify-between items-center mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-indigo-800">
          Filter Products
        </h2>
        {isMobile && (
          <button onClick={closeDrawer} className="text-gray-500 hover:text-gray-900">
            <X size={25} />
          </button>
        )}
      </div>

      <Divider orientation="left" className="text-lg !font-bold !text-indigo-600">
        ** Categories **
      </Divider>
      <div className="flex flex-col gap-2 mb-6 max-h-40 overflow-y-auto pr-6 custom-scrollbar">
        {categories?.map((c) => (
          <Checkbox
            key={c._id}
            checked={checked.includes(c._id)}
            onChange={(e) => handleFilter(e.target.checked, c._id)}
            // style={{ borderRadius: '5px', borderColor: '#ee1476ff' }}
            className=" text-gray-700 hover:text-pink-600 transition-colors"
          >
            {c.name}
          </Checkbox>
        ))}
      </div>

      <Divider orientation="left" className="text-lg !font-bold !text-indigo-600">
       ** Price Range **
      </Divider>
      <Radio.Group
        onChange={(e) => setRadio(e.target.value)}
        value={radio}
        className="flex flex-col gap-2 mb-6"
      >
        {Prices?.map((p) => (
          <Radio
            key={p._id}
            value={p.array}
            className="text-gray-700 hover:text-indigo-600 transition-colors"
          >
            {p.name}
          </Radio>
        ))}
      </Radio.Group>

      <button
        onClick={resetFilters}
        style={{ borderRadius: '20px' ,marginLeft: isMobile ? '20%' : '0', marginTop: '10px'}}
        className="w-[200px] py-3 bg-pink-600 text-white font-bold rounded-lg shadow-md hover:bg-pink-800 transition-all transform hover:scale-[1.02]"
      >
        RESET FILTERS
      </button>
    </motion.aside>
  );
  // ---------------------------------------------------

  return (
    <div className="relative min-h-screen">

      <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover object-[50%_30%]"
          src="/hero-video.mp4"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 drop-shadow-2xl"
          >
            Curated Collections
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 max-w-3xl drop-shadow-md"
          >
            Explore our handpicked selection of top-quality products, tailored just for you.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
            style={{ borderRadius: '5px', width: '100px' }}
            className="mt-8 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold rounded-full shadow-xl transition-all hover:from-purple-700 hover:to-indigo-700 uppercase tracking-wider"
          >
            Start Shopping
          </motion.button>
        </div>
      </section>



      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-0 z-20 p-4 bg-white/95 shadow-lg flex justify-center">
        <button
          onClick={() => setMobileFilterOpen(true)}
          style={{ borderRadius: '5px', width: '100px' }}
          className="flex items-center gap-2 px-8 py-2 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Filter size={18} />
          Show Filters
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <Drawer
            title={null}
            placement="right"
            closable={false}
            onClose={() => setMobileFilterOpen(false)}
            open={mobileFilterOpen}
            width="85%"
            style={{ padding: 0 }}
            bodyStyle={{ padding: 0, backgroundColor: 'transparent' }}
          >
            <FilterSidebarContent isMobile={true} closeDrawer={() => setMobileFilterOpen(false)} />
          </Drawer>
        )}
      </AnimatePresence>

      {/* Products Container */}
      <div
        className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-8 px-4 md:px-12 py-10"
        style={{
          background: "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)",
        }}
      >
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block md:col-span-1">
          <FilterSidebarContent />
        </div>

        {/* Products */}
        <main ref={productsRef} className="md:col-span-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {products?.map((p, index) => (
                <motion.div
                  key={p._id}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: index < 4 ? index * 0.1 : 0 }}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-50 p-4">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/api/product-photo/${p._id}`}
                      alt={p.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x300?text=Product+Image";
                      }}
                    />
                    <div className="absolute top-2 right-2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      New
                    </div>
                  </div>
                  <div className="p-5 flex flex-col h-auto">
                    <h3 className="text-lg font-extrabold text-gray-900 truncate mb-1">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex-grow mb-3 line-clamp-2">
                      {p.description.substring(0, 50)}...
                    </p>
                    <p className="text-xl font-bold text-indigo-600 mb-4">
                      ₹ {p.price.toLocaleString("en-IN")}
                    </p>
                    <div className="flex gap-3 mt-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/product/${p.slug}`)}
                        className="flex-1 py-2 text-indigo-600 border border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all text-sm"
                      >
                        Details
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCart((prevCart) => [...prevCart, p]);
                          toast.success(`${p.name} added to cart!`);
                        }}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all text-sm"
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          <div className="flex justify-center mt-12 relative mt-3">
            {products && products.length < total && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.3 }}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
                disabled={loading}
                className="load-more flex items-center gap-3 px-11 py-3 bg-gradient-to-r from-pink-400 to-red-500 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Loading Products..." : "Load More"}</span>
                {!loading && <ChevronDown className="animate-bounce w-5 h-5" />}
              </motion.button>
            )}
            {products?.length > 0 && products.length === total && (
              <p className="text-center text-gray-500 font-medium py-4">
                You've seen all {total} products! 🎉
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;