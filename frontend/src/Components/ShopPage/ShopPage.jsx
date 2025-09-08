
// import { Heart } from "lucide-react";
import "./ShopPage.css"; // Assuming you have a CSS file for styles

const products = [
  {
    id: 1,
    title: "Bewakoof X Marvel",
    description: "Men's Green Wakanda Forever Graphic Printed Oversized T-shirt",
    price: 599,
    originalPrice: 1449,
    discount: "58% off",
    imageUrl: "./product-image.png",
    rating: 4.5,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 2,
    title: "Bewakoof X Garfield",
    description: "Men's Grey Smiling Cat Graphic Printed Oversized T-shirt",
    price: 699,
    originalPrice: 1299,
    discount: "46% off",
    imageUrl: "./product-image.png",
    rating: 4.3,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 3,
    title: "Bewakoof",
    description: "Men's Grey Brain Wash Graphic Printed T-shirt",
    price: 349,
    originalPrice: 1499,
    discount: "76% off",
    imageUrl: "./product-image.png",
    rating: null,
    fabric: "100% Cotton",
  },
  {
    id: 4,
    title: "Bewakoof X Marvel",
    description: "Men's Green Wakanda Forever Graphic Printed Oversized T-shirt",
    price: 599,
    originalPrice: 1449,
    discount: "58% off",
    imageUrl: "./product-image.png",
    rating: 4.5,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 5,
    title: "Bewakoof X Garfield",
    description: "Men's Grey Smiling Cat Graphic Printed Oversized T-shirt",
    price: 699,
    originalPrice: 1299,
    discount: "46% off",
    imageUrl: "./product-image.png",
    rating: 4.3,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 6,
    title: "Bewakoof",
    description: "Men's Grey Brain Wash Graphic Printed T-shirt",
    price: 349,
    originalPrice: 1499,
    discount: "76% off",
    imageUrl: "./product-image.png",
    rating: null,
    fabric: "100% Cotton",
  },
  {
    id: 7,
    title: "Bewakoof X Marvel",
    description: "Men's Green Wakanda Forever Graphic Printed Oversized T-shirt",
    price: 599,
    originalPrice: 1449,
    discount: "58% off",
    imageUrl: "./product-image.png",
    rating: 4.5,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 8,
    title: "Bewakoof X Garfield",
    description: "Men's Grey Smiling Cat Graphic Printed Oversized T-shirt",
    price: 699,
    originalPrice: 1299,
    discount: "46% off",
    imageUrl: "./product-image.png",
    rating: 4.3,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 9,
    title: "Bewakoof",
    description: "Men's Grey Brain Wash Graphic Printed T-shirt",
    price: 349,
    originalPrice: 1499,
    discount: "76% off",
    imageUrl: "./product-image.png",
    rating: null,
    fabric: "100% Cotton",
  },
  {
    id: 11,
    title: "Bewakoof X Marvel",
    description: "Men's Green Wakanda Forever Graphic Printed Oversized T-shirt",
    price: 599,
    originalPrice: 1449,
    discount: "58% off",
    imageUrl: "./product-image.png",
    rating: 4.5,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 12,
    title: "Bewakoof X Garfield",
    description: "Men's Grey Smiling Cat Graphic Printed Oversized T-shirt",
    price: 699,
    originalPrice: 1299,
    discount: "46% off",
    imageUrl: "./product-image.png",
    rating: 4.3,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 13,
    title: "Bewakoof",
    description: "Men's Grey Brain Wash Graphic Printed T-shirt",
    price: 349,
    originalPrice: 1499,
    discount: "76% off",
    imageUrl: "./product-image.png",
    rating: null,
    fabric: "100% Cotton",
  },
  {
    id: 14,
    title: "Bewakoof X Marvel",
    description: "Men's Green Wakanda Forever Graphic Printed Oversized T-shirt",
    price: 599,
    originalPrice: 1449,
    discount: "58% off",
    imageUrl: "./product-image.png",
    rating: 4.5,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 15,
    title: "Bewakoof X Garfield",
    description: "Men's Grey Smiling Cat Graphic Printed Oversized T-shirt",
    price: 699,
    originalPrice: 1299,
    discount: "46% off",
    imageUrl: "./product-image.png",
    rating: 4.3,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 16,
    title: "Bewakoof",
    description: "Men's Grey Brain Wash Graphic Printed T-shirt",
    price: 349,
    originalPrice: 1499,
    discount: "76% off",
    imageUrl: "./product-image.png",
    rating: null,
    fabric: "100% Cotton",
  },
  {
    id: 17,
    title: "Bewakoof X Marvel",
    description: "Men's Green Wakanda Forever Graphic Printed Oversized T-shirt",
    price: 599,
    originalPrice: 1449,
    discount: "58% off",
    imageUrl: "./product-image.png",
    rating: 4.5,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 18,
    title: "Bewakoof X Garfield",
    description: "Men's Grey Smiling Cat Graphic Printed Oversized T-shirt",
    price: 699,
    originalPrice: 1299,
    discount: "46% off",
    imageUrl: "./product-image.png",
    rating: 4.3,
    fabric: "Premium Dense Fabric",
  },
  {
    id: 19,
    title: "Bewakoof",
    description: "Men's Grey Brain Wash Graphic Printed T-shirt",
    price: 349,
    originalPrice: 1499,
    discount: "76% off",
    imageUrl: "./product-image.png",
    rating: null,
    fabric: "100% Cotton",
  },


];

const ShopPage = () => {
  return (
    <div className="shop-container">
      {/* Sidebar Filters */}
      <aside className="sidebar">
        <div className="filter-category">
          <h3 className="filter-title">Category</h3>
          {['T-Shirt', 'Shirt', 'Joggers', 'Hoodies', 'Sweatshirt'].map(cat => (
            <div key={cat} className="checkbox-group">
              <input type="checkbox" id={cat} />
              <label htmlFor={cat}>{cat}</label>
            </div>
          ))}
        </div>
        <div className="filter-size">
          <h3 className="filter-title">Sizes</h3>
          {['XS', 'S', 'M', 'L', 'XL'].map(size => (
            <div key={size} className="checkbox-group">
              <input type="checkbox" id={size} />
              <label htmlFor={size}>{size}</label>
            </div>
          ))}
        </div>
        <div className="filter-brand">
          <h3 className="filter-title">Brand</h3>
          {['Bewakoof®', 'Bewakoof Air® 1.0'].map(brand => (
            <div key={brand} className="checkbox-group">
              <input type="checkbox" id={brand} />
              <label htmlFor={brand}>{brand}</label>
            </div>
          ))}
        </div>
      </aside>

      {/* Product Listing */}
      <main className="product-listing">
        <div className="product-header">
          <h2 className="product-title">Clothes for Men</h2>
          <div className="sort-by">
            <span>Sort by:</span>
            <select className="sort-select">
              <option>Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="product-grid">
          {products.map(product => (
            <section key={product.id} className="product-card">
              <img src={product.imageUrl} alt={product.title} className="product-image" />
              <div className="product-details">
                <div className="product-title">{product.title}</div>
                <p className="product-description">{product.description}</p>
                <div className="product-price">
                  <span className="price">₹{product.price}</span>
                  <span className="original-price">₹{product.originalPrice}</span>
                  <span className="discount">{product.discount}</span>
                </div>
                <p className="fabric-info">{product.fabric}</p>
              </div>
              {/* Assuming you have a Heart icon component */}
              <div className="heart-icon">❤️</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  
  )
};

export default ShopPage;
