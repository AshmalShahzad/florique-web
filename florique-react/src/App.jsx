import "./index.css";
import { useEffect, useState } from "react";

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  /* AUTH STATES */
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [authMode, setAuthMode] = useState("login"); 
  const [authData, setAuthData] = useState({ username: "", password: "" });

  /* ORDER STATE */
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "" });

  /* FADE IN & REVEAL ON SCROLL */
  useEffect(() => {
    document.body.classList.add("loaded");
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addToCart = (name, price, img) => {
    setCart((prev) => [...prev, { name, price, img, qty: 1 }]);
    setCartOpen(true);
  };

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  /* AUTH LOGIC */
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (authMode === "login") {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        alert("Welcome back to Florique! 🌸");
      } else {
        alert("Account created! Now please Login.");
        setAuthMode("login");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    alert("Logged out successfully.");
  };

  /* ORDER LOGIC */
  const placeOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/orders/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ customer, items: cart, total }),
      });

      if (!response.ok) throw new Error("Order failed");
      alert("Your order has been placed! 🌸");
      setCart([]);
      setCheckoutOpen(false);
    } catch (error) {
      alert("Failed to place order.");
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <h1 className="logo">Florique</h1>
        <ul className="nav-links">
  <li><a href="#home">Home</a></li>
  <li><a href="#about">About</a></li>
  <li><a href="#products">Products</a></li>
  <li><a href="#contact">Contact</a></li>
  {isLoggedIn && (
  <li className="logout-item" onClick={handleLogout}>
    Logout
  </li>
)}
</ul>

        <div className="nav-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search gajras..."
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
            />
          </div>
          <div className="cart-icon" onClick={() => setCartOpen(!cartOpen)}>
            🛒 <span>{cart.length}</span>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="hero reveal">
        <h2>Welcome to Florique</h2>
        <p>Handcrafted gajras for timeless elegance</p>
      </section>

      {/* ABOUT */}
      <section id="about" className="about reveal">
        <h2>About Florique</h2>
        <p>
          Florique creates handcrafted floral jewelry inspired by tradition and elegance.
          Every gajra is designed with precision, premium flowers, and a love for timeless beauty.
        </p>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="products reveal">
        {PRODUCTS.filter((p) => p.name.toLowerCase().includes(search)).map((p, i) => (
          <div className={`product-card ${p.best ? "bestseller" : ""}`} key={i}>
            {p.best && <span className="badge">Best Seller</span>}
            <img src={p.img} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="price">Rs {p.price}</p>
            <button onClick={() => addToCart(p.name, p.price, p.img)}>Add to Cart</button>
          </div>
        ))}
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact reveal">
        <h2>Contact Us</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

      {/* CART */}
      <div className={`cart ${cartOpen ? "open" : ""}`}>
        <h2>Your Cart</h2>
        {cart.map((item, i) => (
          <div className="cart-item" key={i}>
            <img src={item.img} alt="" />
            <span>{item.name}</span>
            <button onClick={() => removeItem(i)}>✕</button>
          </div>
        ))}
        <p id="total">Total: Rs {total}</p>
        <button
          className="checkout-btn"
          onClick={() => (cart.length === 0 ? alert("Your cart is empty!") : setCheckoutOpen(true))}
        >
          Checkout
        </button>
        <button className="close-cart" onClick={() => setCartOpen(false)}>Close</button>
      </div>

      {/* AUTH & CHECKOUT MODAL */}
      {checkoutOpen && (
  <div className="checkout-overlay">
    <div className="checkout-modal">
      {!isLoggedIn ? (
        /* The 'key' here is the secret! When authMode changes, the animation restarts */
        <form onSubmit={handleAuth} className="form-fade" key={authMode}>
          <h2>{authMode === "login" ? "Welcome Back" : "Join Florique"}</h2>
          
          <input 
            type="text" 
            placeholder="Username" 
            required 
            onChange={(e) => setAuthData({ ...authData, username: e.target.value })} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            onChange={(e) => setAuthData({ ...authData, password: e.target.value })} 
          />
          
          <button type="submit">
            {authMode === "login" ? "Login" : "Register"}
          </button>
          
          <p className="auth-toggle-text" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
            {authMode === "login" ? "New? Register here" : "Have an account? Login"}
          </p>
          
          <button type="button" className="cancel-btn" onClick={() => setCheckoutOpen(false)}>
            Close
          </button>
        </form>
      ) : (
        /* Adding a key here too for the transition to the delivery form */
        <form onSubmit={placeOrder} className="form-fade" key="delivery">
          <h2>Delivery Details</h2>
          <input 
            type="text" 
            placeholder="Full Name *" 
            required 
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })} 
          />
          <input 
            type="text" 
            placeholder="Phone Number *" 
            required 
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} 
          />
          <textarea 
            placeholder="Delivery Address *" 
            required 
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })} 
          />
          
          <p className="checkout-total" style={{textAlign: 'center', margin: '15px 0'}}>
            Total: Rs {total}
          </p>
          
          <button type="submit">Place Order</button>
          <button type="button" className="cancel-btn" onClick={() => setCheckoutOpen(false)}>
            Back
          </button>
        </form>
      )}
    </div>
  </div>
)}
    </>
  );
}

/* ALL PRODUCTS */
const PRODUCTS = [
  { name: "Mulberry Mist", price: 600, desc: "Mulberry chrysanthemums with baby's breath", img: "/Images/rn-image_picker_lib_temp_0e73d95d-6ec8-49a9-bf7d-0b6b65007704.jpeg", best: true },
  { name: "Sunlit Pearl", price: 500, desc: "White & yellow chrysanthemums", img: "/Images/rn-image_picker_lib_temp_c8623d8d-d1c8-494b-9067-cf08b5351ffe.jpg" },
  { name: "Marigold Halo", price: 500, desc: "White & yellow with maroon centers", img: "/Images/rn-image_picker_lib_temp_fc2edbd2-a9ae-4ade-adb8-60c976e9e68d.jpg" },
  { name: "Rosy Bloom", price: 400, desc: "Pink gajra with elegant baby's breath", img: "/Images/rn-image_picker_lib_temp_a14caee3-7f9e-4258-a595-e781ee207a63.jpg" },
  { name: "Blush Velvet", price: 400, desc: "Soft baby pink & white viral gajra", img: "/Images/rn-image_picker_lib_temp_313131cb-7023-4ecb-b9a0-3b25504d1f32.jpeg" },
  { name: "Royal Sapphire", price: 350, desc: "Navy blue & golden gajra", img: "/Images/rn-image_picker_lib_temp_016f6e2e-a1de-4e9e-91e2-9dc53eac23fc.jpg" },
  { name: "Coral Kiss", price: 400, desc: "Orangish coral pink gajra", img: "/Images/rn-image_picker_lib_temp_5f17cd21-9ae8-4f1f-9479-450c6c7e1c4b.jpg" },
  { name: "Peach Whisper", price: 450, desc: "Light peach & white gajra", img: "/Images/rn-image_picker_lib_temp_6b0f0d29-13da-4e34-8352-e1a1227a6114.jpg" },
  { name: "Ruby Gleam", price: 350, desc: "Maroon & golden gajra", img: "/Images/rn-image_picker_lib_temp_5c45e602-70a0-465c-a9c9-6d46f5342b40.jpg" },
  { name: "Pink Delight", price: 600, desc: "Dark & light pink & breath", img: "/Images/rn-image_picker_lib_temp_3ec1324b-3d7b-49eb-87f4-6986a221851b.jpeg", best: true },
  { name: "Peony Charm", price: 550, desc: "Variant (Pink Delight)", img: "/Images/rn-image_picker_lib_temp_d8ef4ae6-69a5-415a-b996-6ef1ed172707.jpg" },
  { name: "Rose Glow", price: 400, desc: "Variant (Pink Delight)", img: "/Images/rn-image_picker_lib_temp_9fccd452-c93a-48fa-b365-e5e1ff13f84c.jpg" },
  { name: "Blushing Rose", price: 500, desc: "Rose & baby's breath", img: "/Images/rn-image_picker_lib_temp_b1dcc8e0-90e8-4a8e-8dac-1b71ae1c8361.jpeg", best: true },
  { name: "Soft Whisper", price: 450, desc: "Light pink & white", img: "/Images/rn-image_picker_lib_temp_01350b73-93f6-4a7b-aa6e-60537e2b44e7.jpg" },
  { name: "Snow Petals", price: 600, desc: "White roses & baby's breath", img: "/Images/rn-image_picker_lib_temp_0c76de7f-edd2-4c2f-ae64-cbb57508e679.jpeg" },
  { name: "Sunset Pop", price: 500, desc: "Pink & yellow gajra", img: "/Images/rn-image_picker_lib_temp_1c0be4e8-778f-43bc-9c9c-da85362009cd.jpg" },
  { name: "Snow Blossom", price: 650, desc: "White roses & baby's breath", img: "/Images/rn-image_picker_lib_temp_8fdfea86-83f3-4371-9e59-a3fd23580403.jpg", best: true },
  { name: "Lilac Dream", price: 400, desc: "Lilac & white gajra", img: "/Images/rn-image_picker_lib_temp_9485eca7-6881-4867-a953-e632a6700708.jpg" },
  { name: "Golden Glow", price: 400, desc: "Yellow roses gajra", img: "/Images/rn-image_picker_lib_temp_7b078af9-947d-4011-8c59-b3efde0d014f.jpg" },
  { name: "Peach & Bloom", price: 400, desc: "Orange & pink", img: "/Images/rn-image_picker_lib_temp_1ffeb833-731a-4f36-a76d-013c7f717b23.jpg" },
  { name: "Purple Harmony", price: 350, desc: "Purple & yellow gajra", img: "/Images/rn-image_picker_lib_temp_a0146fed-0022-4324-9fbe-deeb41e97058.jpg" },
  { name: "Crimson Petals", price: 400, desc: "Red roses & baby's breath", img: "/Images/rn-image_picker_lib_temp_0c650757-4786-432d-a5ec-817f7acd97ce.jpg" },
  { name: "Ivory Charm", price: 550, desc: "White roses & baby's breath", img: "/Images/rn-image_picker_lib_temp_c46859ef-537d-4894-a7ec-1be88029212d.jpg" },
  { name: "Pink Whisper", price: 550, desc: "Pink roses & breath", img: "/Images/rn-image_picker_lib_temp_249824de-b974-4e72-81e2-d6280fc2776d.jpg" }
];

export default App;