-- ============================================
-- E-COMMERCE DATABASE SCHEMA
-- MySQL with Stored Procedures
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- ============================================
-- TABLES
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    gender ENUM('male', 'female', 'other') NULL,
    date_of_birth DATE NULL,
    role ENUM('user', 'seller', 'admin') DEFAULT 'user',
    auth_provider ENUM('email', 'google', 'facebook') DEFAULT 'email',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    landmark VARCHAR(255) NULL,
    address_type ENUM('home', 'office', 'other') DEFAULT 'home',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    parent_id INT NULL,
    gender ENUM('men', 'women', 'unisex') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_gender (gender),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sellers Table
CREATE TABLE IF NOT EXISTS sellers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gst_number VARCHAR(50) NULL,
    status ENUM('pending', 'approved', 'suspended') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NULL,
    category_id INT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_percent INT DEFAULT 0,
    gender ENUM('male', 'female', 'unisex') NOT NULL DEFAULT 'unisex',
    stock_quantity INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    avg_rating DECIMAL(2, 1) DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_gender (gender),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    size VARCHAR(20) NULL,
    color VARCHAR(50) NULL,
    color_hex VARCHAR(7) NULL,
    stock INT DEFAULT 0,
    price_modifier DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, product_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    address_id INT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    order_status ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'placed',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200) NULL,
    comment TEXT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Drop existing procedures
DROP PROCEDURE IF EXISTS sp_user_register;
DROP PROCEDURE IF EXISTS sp_user_login;
DROP PROCEDURE IF EXISTS sp_user_get_by_id;
DROP PROCEDURE IF EXISTS sp_user_get_by_email;
DROP PROCEDURE IF EXISTS sp_user_update_profile;

-- ============================================
-- USER PROCEDURES
-- ============================================

DELIMITER //

-- Register User
CREATE PROCEDURE sp_user_register(
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_name VARCHAR(100),
    IN p_auth_provider ENUM('email', 'google', 'facebook')
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_exists FROM users WHERE email = p_email;
    
    IF v_exists > 0 THEN
        SELECT 0 AS success, 'Email already exists' AS message, NULL AS user_id;
    ELSE
        INSERT INTO users (email, password_hash, name, auth_provider, created_at)
        VALUES (p_email, p_password_hash, p_name, COALESCE(p_auth_provider, 'email'), NOW());
        
        SET v_user_id = LAST_INSERT_ID();
        SELECT 1 AS success, 'Registration successful' AS message, v_user_id AS user_id;
    END IF;
END //

-- Login User
CREATE PROCEDURE sp_user_login(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT id, email, password_hash, name, phone, avatar_url, gender, 
           date_of_birth, role, auth_provider, is_verified, created_at
    FROM users 
    WHERE email = p_email;
END //

-- Get User By ID
CREATE PROCEDURE sp_user_get_by_id(
    IN p_user_id INT
)
BEGIN
    SELECT id, email, name, phone, avatar_url, gender, 
           date_of_birth, role, auth_provider, is_verified, created_at
    FROM users 
    WHERE id = p_user_id;
END //

-- Get User By Email
CREATE PROCEDURE sp_user_get_by_email(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT id, email, name, role FROM users WHERE email = p_email;
END //

-- Update User Profile
CREATE PROCEDURE sp_user_update_profile(
    IN p_user_id INT,
    IN p_name VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_gender ENUM('male', 'female', 'other'),
    IN p_date_of_birth DATE,
    IN p_avatar_url VARCHAR(500)
)
BEGIN
    UPDATE users SET
        name = COALESCE(p_name, name),
        phone = COALESCE(p_phone, phone),
        gender = COALESCE(p_gender, gender),
        date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
        avatar_url = COALESCE(p_avatar_url, avatar_url)
    WHERE id = p_user_id;
    
    SELECT 1 AS success;
END //

DELIMITER ;

-- ============================================
-- PRODUCT PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_products_get_all;
DROP PROCEDURE IF EXISTS sp_products_get_by_id;
DROP PROCEDURE IF EXISTS sp_products_get_featured;
DROP PROCEDURE IF EXISTS sp_products_search;
DROP PROCEDURE IF EXISTS sp_products_get_by_category;
DROP PROCEDURE IF EXISTS sp_products_create;
DROP PROCEDURE IF EXISTS sp_products_update;
DROP PROCEDURE IF EXISTS sp_products_delete;
DROP PROCEDURE IF EXISTS sp_products_add_image;
DROP PROCEDURE IF EXISTS sp_products_add_variant;

DELIMITER //

-- Get All Products
CREATE PROCEDURE sp_products_get_all(
    IN p_page INT,
    IN p_limit INT,
    IN p_gender VARCHAR(10),
    IN p_sort VARCHAR(20)
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_limit;
    
    SELECT 
        p.id, p.name, p.slug, p.price, p.original_price, 
        p.discount_percent, p.gender, p.avg_rating, p.review_count,
        p.is_featured, p.stock_quantity, p.created_at,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
        c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
        AND (p_gender = 'all' OR p.gender = p_gender OR p.gender = 'unisex')
    ORDER BY 
        CASE WHEN p_sort = 'newest' THEN p.created_at END DESC,
        CASE WHEN p_sort = 'price_low' THEN p.price END ASC,
        CASE WHEN p_sort = 'price_high' THEN p.price END DESC,
        CASE WHEN p_sort = 'popular' THEN p.review_count END DESC,
        p.created_at DESC
    LIMIT p_limit OFFSET v_offset;
    
    SELECT COUNT(*) AS total_count FROM products p
    WHERE p.is_active = 1
        AND (p_gender = 'all' OR p.gender = p_gender OR p.gender = 'unisex');
END //

-- Get Product By ID
CREATE PROCEDURE sp_products_get_by_id(
    IN p_product_id INT
)
BEGIN
    -- Get product details
    SELECT 
        p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = p_product_id;
    
    -- Get product images
    SELECT * FROM product_images WHERE product_id = p_product_id ORDER BY sort_order;
    
    -- Get product variants
    SELECT * FROM product_variants WHERE product_id = p_product_id;
END //

-- Get Featured Products
CREATE PROCEDURE sp_products_get_featured(
    IN p_limit INT,
    IN p_gender VARCHAR(10)
)
BEGIN
    SELECT 
        p.id, p.name, p.slug, p.price, p.original_price, 
        p.discount_percent, p.gender, p.avg_rating, p.review_count,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
        c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1 AND p.is_featured = 1
        AND (p_gender = 'all' OR p.gender = p_gender OR p.gender = 'unisex')
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END //

-- Search Products
CREATE PROCEDURE sp_products_search(
    IN p_keyword VARCHAR(255),
    IN p_page INT,
    IN p_limit INT,
    IN p_gender VARCHAR(10)
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_limit;
    
    SELECT 
        p.id, p.name, p.slug, p.price, p.original_price, 
        p.discount_percent, p.gender, p.avg_rating, p.review_count,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
        c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
        AND (p.name LIKE CONCAT('%', p_keyword, '%') OR p.description LIKE CONCAT('%', p_keyword, '%'))
        AND (p_gender = 'all' OR p.gender = p_gender OR p.gender = 'unisex')
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET v_offset;
    
    SELECT COUNT(*) AS total_count FROM products p
    WHERE p.is_active = 1
        AND (p.name LIKE CONCAT('%', p_keyword, '%') OR p.description LIKE CONCAT('%', p_keyword, '%'))
        AND (p_gender = 'all' OR p.gender = p_gender OR p.gender = 'unisex');
END //

-- Get Products By Category
CREATE PROCEDURE sp_products_get_by_category(
    IN p_category_id INT,
    IN p_page INT,
    IN p_limit INT,
    IN p_gender VARCHAR(10),
    IN p_sort VARCHAR(20)
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_limit;
    
    SELECT 
        p.id, p.name, p.slug, p.price, p.original_price, 
        p.discount_percent, p.gender, p.avg_rating, p.review_count,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
    FROM products p
    WHERE p.is_active = 1 AND p.category_id = p_category_id
        AND (p_gender = 'all' OR p.gender = p_gender OR p.gender = 'unisex')
    ORDER BY 
        CASE WHEN p_sort = 'newest' THEN p.created_at END DESC,
        CASE WHEN p_sort = 'price_low' THEN p.price END ASC,
        CASE WHEN p_sort = 'price_high' THEN p.price END DESC,
        p.created_at DESC
    LIMIT p_limit OFFSET v_offset;
    
    SELECT COUNT(*) AS total_count FROM products p
    WHERE p.is_active = 1 AND p.category_id = p_category_id
        AND (p_gender = 'all' OR p.gender = p_gender OR p.gender = 'unisex');
END //

-- Create Product
CREATE PROCEDURE sp_products_create(
    IN p_seller_id INT,
    IN p_category_id INT,
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_price DECIMAL(10,2),
    IN p_original_price DECIMAL(10,2),
    IN p_gender ENUM('male', 'female', 'unisex'),
    IN p_stock_quantity INT
)
BEGIN
    DECLARE v_slug VARCHAR(255);
    DECLARE v_discount INT;
    
    SET v_slug = LOWER(REPLACE(REPLACE(p_name, ' ', '-'), '.', ''));
    SET v_slug = CONCAT(v_slug, '-', UNIX_TIMESTAMP());
    SET v_discount = ROUND(((p_original_price - p_price) / p_original_price) * 100);
    
    INSERT INTO products (seller_id, category_id, name, slug, description, price, original_price, discount_percent, gender, stock_quantity)
    VALUES (p_seller_id, p_category_id, p_name, v_slug, p_description, p_price, p_original_price, v_discount, p_gender, p_stock_quantity);
    
    SELECT LAST_INSERT_ID() AS product_id;
END //

-- Update Product
CREATE PROCEDURE sp_products_update(
    IN p_product_id INT,
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_price DECIMAL(10,2),
    IN p_original_price DECIMAL(10,2),
    IN p_category_id INT,
    IN p_gender ENUM('male', 'female', 'unisex'),
    IN p_stock_quantity INT,
    IN p_is_active BOOLEAN,
    IN p_is_featured BOOLEAN
)
BEGIN
    DECLARE v_discount INT;
    SET v_discount = ROUND(((COALESCE(p_original_price, 0) - COALESCE(p_price, 0)) / COALESCE(p_original_price, 1)) * 100);
    
    UPDATE products SET
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        price = COALESCE(p_price, price),
        original_price = COALESCE(p_original_price, original_price),
        discount_percent = v_discount,
        category_id = COALESCE(p_category_id, category_id),
        gender = COALESCE(p_gender, gender),
        stock_quantity = COALESCE(p_stock_quantity, stock_quantity),
        is_active = COALESCE(p_is_active, is_active),
        is_featured = COALESCE(p_is_featured, is_featured)
    WHERE id = p_product_id;
    
    SELECT 1 AS success;
END //

-- Delete Product (Soft delete)
CREATE PROCEDURE sp_products_delete(
    IN p_product_id INT
)
BEGIN
    UPDATE products SET is_active = 0 WHERE id = p_product_id;
    SELECT 1 AS success;
END //

-- Add Product Image
CREATE PROCEDURE sp_products_add_image(
    IN p_product_id INT,
    IN p_image_url VARCHAR(500),
    IN p_is_primary BOOLEAN
)
BEGIN
    IF p_is_primary = 1 THEN
        UPDATE product_images SET is_primary = 0 WHERE product_id = p_product_id;
    END IF;
    
    INSERT INTO product_images (product_id, image_url, is_primary)
    VALUES (p_product_id, p_image_url, p_is_primary);
    
    SELECT LAST_INSERT_ID() AS image_id;
END //

-- Add Product Variant
CREATE PROCEDURE sp_products_add_variant(
    IN p_product_id INT,
    IN p_size VARCHAR(20),
    IN p_color VARCHAR(50),
    IN p_color_hex VARCHAR(7),
    IN p_stock INT
)
BEGIN
    INSERT INTO product_variants (product_id, size, color, color_hex, stock)
    VALUES (p_product_id, p_size, p_color, p_color_hex, p_stock);
    
    SELECT LAST_INSERT_ID() AS variant_id;
END //

DELIMITER ;

-- ============================================
-- CATEGORY PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_categories_get_all;
DROP PROCEDURE IF EXISTS sp_categories_get_by_slug;
DROP PROCEDURE IF EXISTS sp_categories_create;
DROP PROCEDURE IF EXISTS sp_categories_update;
DROP PROCEDURE IF EXISTS sp_categories_delete;

DELIMITER //

-- Get All Categories
CREATE PROCEDURE sp_categories_get_all(
    IN p_gender VARCHAR(10)
)
BEGIN
    SELECT * FROM categories 
    WHERE is_active = 1
        AND (p_gender = 'all' OR gender = p_gender OR gender = 'unisex')
    ORDER BY sort_order, name;
END //

-- Get Category By Slug
CREATE PROCEDURE sp_categories_get_by_slug(
    IN p_slug VARCHAR(100)
)
BEGIN
    SELECT * FROM categories WHERE slug = p_slug AND is_active = 1;
END //

-- Create Category
CREATE PROCEDURE sp_categories_create(
    IN p_name VARCHAR(100),
    IN p_slug VARCHAR(100),
    IN p_description TEXT,
    IN p_gender ENUM('men', 'women', 'unisex'),
    IN p_parent_id INT,
    IN p_image_url VARCHAR(500)
)
BEGIN
    INSERT INTO categories (name, slug, description, gender, parent_id, image_url)
    VALUES (p_name, p_slug, p_description, p_gender, p_parent_id, p_image_url);
    
    SELECT LAST_INSERT_ID() AS category_id;
END //

-- Update Category
CREATE PROCEDURE sp_categories_update(
    IN p_category_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_image_url VARCHAR(500),
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE categories SET
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        image_url = COALESCE(p_image_url, image_url),
        is_active = COALESCE(p_is_active, is_active)
    WHERE id = p_category_id;
    
    SELECT 1 AS success;
END //

-- Delete Category
CREATE PROCEDURE sp_categories_delete(
    IN p_category_id INT
)
BEGIN
    UPDATE categories SET is_active = 0 WHERE id = p_category_id;
    SELECT 1 AS success;
END //

DELIMITER ;

-- ============================================
-- CART PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_cart_get;
DROP PROCEDURE IF EXISTS sp_cart_add_item;
DROP PROCEDURE IF EXISTS sp_cart_update_quantity;
DROP PROCEDURE IF EXISTS sp_cart_remove_item;
DROP PROCEDURE IF EXISTS sp_cart_clear;
DROP PROCEDURE IF EXISTS sp_cart_get_count;

DELIMITER //

-- Get User Cart
CREATE PROCEDURE sp_cart_get(
    IN p_user_id INT
)
BEGIN
    SELECT 
        c.id AS cart_item_id, c.quantity, c.variant_id,
        p.id AS product_id, p.name, p.slug, p.price, p.original_price, p.discount_percent,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image,
        pv.size, pv.color, pv.color_hex
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    LEFT JOIN product_variants pv ON c.variant_id = pv.id
    WHERE c.user_id = p_user_id AND p.is_active = 1
    ORDER BY c.created_at DESC;
END //

-- Add To Cart
CREATE PROCEDURE sp_cart_add_item(
    IN p_user_id INT,
    IN p_product_id INT,
    IN p_variant_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_existing_id INT DEFAULT NULL;
    
    SELECT id INTO v_existing_id FROM cart_items 
    WHERE user_id = p_user_id 
        AND product_id = p_product_id 
        AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL))
    LIMIT 1;
    
    IF v_existing_id IS NOT NULL THEN
        UPDATE cart_items SET quantity = quantity + p_quantity WHERE id = v_existing_id;
        SELECT v_existing_id AS cart_item_id, 'updated' AS action;
    ELSE
        INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
        VALUES (p_user_id, p_product_id, p_variant_id, p_quantity);
        SELECT LAST_INSERT_ID() AS cart_item_id, 'added' AS action;
    END IF;
END //

-- Update Cart Quantity
CREATE PROCEDURE sp_cart_update_quantity(
    IN p_cart_item_id INT,
    IN p_quantity INT
)
BEGIN
    UPDATE cart_items SET quantity = p_quantity WHERE id = p_cart_item_id;
    SELECT 1 AS success;
END //

-- Remove From Cart
CREATE PROCEDURE sp_cart_remove_item(
    IN p_cart_item_id INT
)
BEGIN
    DELETE FROM cart_items WHERE id = p_cart_item_id;
    SELECT 1 AS success;
END //

-- Clear Cart
CREATE PROCEDURE sp_cart_clear(
    IN p_user_id INT
)
BEGIN
    DELETE FROM cart_items WHERE user_id = p_user_id;
    SELECT 1 AS success;
END //

-- Get Cart Count
CREATE PROCEDURE sp_cart_get_count(
    IN p_user_id INT
)
BEGIN
    SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE user_id = p_user_id;
END //

DELIMITER ;

-- ============================================
-- WISHLIST PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_wishlist_get;
DROP PROCEDURE IF EXISTS sp_wishlist_add;
DROP PROCEDURE IF EXISTS sp_wishlist_remove;
DROP PROCEDURE IF EXISTS sp_wishlist_check;

DELIMITER //

-- Get Wishlist
CREATE PROCEDURE sp_wishlist_get(
    IN p_user_id INT
)
BEGIN
    SELECT 
        w.id AS wishlist_id, w.created_at AS added_at,
        p.id AS product_id, p.name, p.slug, p.price, p.original_price, p.discount_percent,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = p_user_id AND p.is_active = 1
    ORDER BY w.created_at DESC;
END //

-- Add To Wishlist
CREATE PROCEDURE sp_wishlist_add(
    IN p_user_id INT,
    IN p_product_id INT
)
BEGIN
    INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (p_user_id, p_product_id);
    SELECT LAST_INSERT_ID() AS wishlist_id;
END //

-- Remove From Wishlist
CREATE PROCEDURE sp_wishlist_remove(
    IN p_user_id INT,
    IN p_product_id INT
)
BEGIN
    DELETE FROM wishlist WHERE user_id = p_user_id AND product_id = p_product_id;
    SELECT 1 AS success;
END //

-- Check Wishlist
CREATE PROCEDURE sp_wishlist_check(
    IN p_user_id INT,
    IN p_product_id INT
)
BEGIN
    SELECT IF(COUNT(*) > 0, 1, 0) AS `exists` 
    FROM wishlist 
    WHERE user_id = p_user_id AND product_id = p_product_id;
END //

DELIMITER ;

-- ============================================
-- ORDER PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_orders_create;
DROP PROCEDURE IF EXISTS sp_orders_add_item;
DROP PROCEDURE IF EXISTS sp_orders_get_by_user;
DROP PROCEDURE IF EXISTS sp_orders_get_by_id;
DROP PROCEDURE IF EXISTS sp_orders_update_status;
DROP PROCEDURE IF EXISTS sp_orders_cancel;

DELIMITER //

-- Create Order
CREATE PROCEDURE sp_orders_create(
    IN p_user_id INT,
    IN p_address_id INT,
    IN p_subtotal DECIMAL(10,2),
    IN p_shipping_fee DECIMAL(10,2),
    IN p_discount DECIMAL(10,2),
    IN p_total DECIMAL(10,2),
    IN p_notes TEXT
)
BEGIN
    DECLARE v_order_number VARCHAR(50);
    SET v_order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 100000), 5, '0'));
    
    INSERT INTO orders (order_number, user_id, address_id, subtotal, shipping_fee, discount, total, notes)
    VALUES (v_order_number, p_user_id, p_address_id, p_subtotal, p_shipping_fee, p_discount, p_total, p_notes);
    
    SELECT LAST_INSERT_ID() AS order_id, v_order_number AS order_number;
END //

-- Add Order Item
CREATE PROCEDURE sp_orders_add_item(
    IN p_order_id INT,
    IN p_product_id INT,
    IN p_variant_id INT,
    IN p_quantity INT,
    IN p_unit_price DECIMAL(10,2)
)
BEGIN
    INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, total_price)
    VALUES (p_order_id, p_product_id, p_variant_id, p_quantity, p_unit_price, p_quantity * p_unit_price);
    
    SELECT LAST_INSERT_ID() AS order_item_id;
END //

-- Get User Orders
CREATE PROCEDURE sp_orders_get_by_user(
    IN p_user_id INT,
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_limit;
    
    SELECT 
        o.id, o.order_number, o.total, o.payment_status, o.order_status, o.created_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
    FROM orders o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC
    LIMIT p_limit OFFSET v_offset;
    
    SELECT COUNT(*) AS total_count FROM orders WHERE user_id = p_user_id;
END //

-- Get Order By ID
CREATE PROCEDURE sp_orders_get_by_id(
    IN p_order_id INT
)
BEGIN
    SELECT o.*, a.full_name, a.phone, a.street, a.city, a.state, a.pincode
    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.id
    WHERE o.id = p_order_id;
    
    SELECT 
        oi.*, p.name AS product_name, p.slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image,
        pv.size, pv.color
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    WHERE oi.order_id = p_order_id;
END //

-- Update Order Status
CREATE PROCEDURE sp_orders_update_status(
    IN p_order_id INT,
    IN p_order_status ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    IN p_payment_status ENUM('pending', 'paid', 'failed', 'refunded')
)
BEGIN
    UPDATE orders SET
        order_status = COALESCE(p_order_status, order_status),
        payment_status = COALESCE(p_payment_status, payment_status)
    WHERE id = p_order_id;
    
    SELECT 1 AS success;
END //

-- Cancel Order
CREATE PROCEDURE sp_orders_cancel(
    IN p_order_id INT
)
BEGIN
    UPDATE orders SET order_status = 'cancelled' WHERE id = p_order_id;
    SELECT 1 AS success;
END //

DELIMITER ;

-- ============================================
-- ADDRESS PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_addresses_get;
DROP PROCEDURE IF EXISTS sp_addresses_add;
DROP PROCEDURE IF EXISTS sp_addresses_update;
DROP PROCEDURE IF EXISTS sp_addresses_delete;
DROP PROCEDURE IF EXISTS sp_addresses_set_default;

DELIMITER //

-- Get Addresses
CREATE PROCEDURE sp_addresses_get(
    IN p_user_id INT
)
BEGIN
    SELECT * FROM addresses WHERE user_id = p_user_id ORDER BY is_default DESC, created_at DESC;
END //

-- Add Address
CREATE PROCEDURE sp_addresses_add(
    IN p_user_id INT,
    IN p_full_name VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_street VARCHAR(255),
    IN p_city VARCHAR(100),
    IN p_state VARCHAR(100),
    IN p_pincode VARCHAR(10),
    IN p_country VARCHAR(50),
    IN p_landmark VARCHAR(255),
    IN p_address_type ENUM('home', 'office', 'other')
)
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM addresses WHERE user_id = p_user_id;
    
    INSERT INTO addresses (user_id, full_name, phone, street, city, state, pincode, country, landmark, address_type, is_default)
    VALUES (p_user_id, p_full_name, p_phone, p_street, p_city, p_state, p_pincode, COALESCE(p_country, 'India'), p_landmark, COALESCE(p_address_type, 'home'), IF(v_count = 0, 1, 0));
    
    SELECT LAST_INSERT_ID() AS address_id;
END //

-- Update Address
CREATE PROCEDURE sp_addresses_update(
    IN p_address_id INT,
    IN p_full_name VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_street VARCHAR(255),
    IN p_city VARCHAR(100),
    IN p_state VARCHAR(100),
    IN p_pincode VARCHAR(10),
    IN p_country VARCHAR(50),
    IN p_landmark VARCHAR(255),
    IN p_address_type ENUM('home', 'office', 'other')
)
BEGIN
    UPDATE addresses SET
        full_name = COALESCE(p_full_name, full_name),
        phone = COALESCE(p_phone, phone),
        street = COALESCE(p_street, street),
        city = COALESCE(p_city, city),
        state = COALESCE(p_state, state),
        pincode = COALESCE(p_pincode, pincode),
        country = COALESCE(p_country, country),
        landmark = COALESCE(p_landmark, landmark),
        address_type = COALESCE(p_address_type, address_type)
    WHERE id = p_address_id;
    
    SELECT 1 AS success;
END //

-- Delete Address
CREATE PROCEDURE sp_addresses_delete(
    IN p_address_id INT
)
BEGIN
    DELETE FROM addresses WHERE id = p_address_id;
    SELECT 1 AS success;
END //

-- Set Default Address
CREATE PROCEDURE sp_addresses_set_default(
    IN p_user_id INT,
    IN p_address_id INT
)
BEGIN
    UPDATE addresses SET is_default = 0 WHERE user_id = p_user_id;
    UPDATE addresses SET is_default = 1 WHERE id = p_address_id;
    SELECT 1 AS success;
END //

DELIMITER ;

-- ============================================
-- ADMIN PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_admin_get_dashboard_stats;
DROP PROCEDURE IF EXISTS sp_admin_get_users;
DROP PROCEDURE IF EXISTS sp_admin_get_orders;
DROP PROCEDURE IF EXISTS sp_admin_get_products;
DROP PROCEDURE IF EXISTS sp_admin_update_user_role;

DELIMITER //

-- Get Dashboard Stats
CREATE PROCEDURE sp_admin_get_dashboard_stats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM products WHERE is_active = 1) AS total_products,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid') AS total_revenue,
        (SELECT COUNT(*) FROM orders WHERE order_status = 'placed') AS pending_orders,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()) AS orders_today;
END //

-- Get All Users (Admin)
CREATE PROCEDURE sp_admin_get_users(
    IN p_page INT,
    IN p_limit INT,
    IN p_role VARCHAR(20)
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_limit;
    
    SELECT id, email, name, phone, role, is_verified, created_at
    FROM users
    WHERE (p_role IS NULL OR role = p_role)
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET v_offset;
    
    SELECT COUNT(*) AS total_count FROM users WHERE (p_role IS NULL OR role = p_role);
END //

-- Get All Orders (Admin)
CREATE PROCEDURE sp_admin_get_orders(
    IN p_status VARCHAR(20),
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_limit;
    
    SELECT o.*, u.name AS user_name, u.email AS user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE (p_status IS NULL OR o.order_status = p_status)
    ORDER BY o.created_at DESC
    LIMIT p_limit OFFSET v_offset;
    
    SELECT COUNT(*) AS total_count FROM orders WHERE (p_status IS NULL OR order_status = p_status);
END //

-- Get All Products (Admin)
CREATE PROCEDURE sp_admin_get_products(
    IN p_status VARCHAR(20),
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_limit;
    
    SELECT p.*, c.name AS category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE (p_status IS NULL OR (p_status = 'active' AND p.is_active = 1) OR (p_status = 'inactive' AND p.is_active = 0))
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET v_offset;
    
    SELECT COUNT(*) AS total_count FROM products 
    WHERE (p_status IS NULL OR (p_status = 'active' AND is_active = 1) OR (p_status = 'inactive' AND is_active = 0));
END //

-- Update User Role
CREATE PROCEDURE sp_admin_update_user_role(
    IN p_user_id INT,
    IN p_role ENUM('user', 'seller', 'admin')
)
BEGIN
    UPDATE users SET role = p_role WHERE id = p_user_id;
    SELECT 1 AS success;
END //

DELIMITER ;

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, is_verified) 
VALUES ('admin@ecommerce.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Admin User', 'admin', 1)
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample categories
INSERT INTO categories (name, slug, gender, description) VALUES
('T-Shirts', 't-shirts', 'unisex', 'Casual and comfortable t-shirts'),
('Jeans', 'jeans', 'unisex', 'Stylish denim jeans'),
('Dresses', 'dresses', 'women', 'Beautiful dresses for women'),
('Sneakers', 'sneakers', 'unisex', 'Trendy sneakers'),
('Jackets', 'jackets', 'unisex', 'Cool jackets for all seasons')
ON DUPLICATE KEY UPDATE name = name;

SELECT 'Database schema and stored procedures created successfully!' AS message;
